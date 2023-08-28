import { Observable, of } from 'rxjs';

import type {
  Interpretation,
  InterpretedSnapshot,
  InterpretedToken,
  MultipleResponse,
  NestedTemplateToken,
  ParsedToken,
  TemplateToken,
} from '@async-input/types';

import { DEFAULT_BRANCH } from '@async-input/types';

import { repeat } from 'utils/misc';

export type Injector<T> = (input: T) => T;

export const withInjectors =
  <T>(injectors: Array<Injector<T>>) =>
  (value: T): T =>
    injectors.reduce((acc, inj) => inj(acc), value);

export const withTokenInjector =
  (tokenInjector: Injector<InterpretedToken>): Injector<InterpretedSnapshot> =>
  snap => ({
    ...snap,
    interpreted: snap.interpreted.map(tokenInjector),
  });

export const colorizeToken =
  (colorize: (_: InterpretedToken) => string): Injector<InterpretedToken> =>
  token => ({
    color: colorize(token),
    ...token,
  });

export const colorizeSnapshot = (
  colorize: (_: InterpretedToken) => string
): Injector<InterpretedSnapshot> => withTokenInjector(colorizeToken(colorize));

export const embelisher = (char: string): Injector<InterpretedSnapshot> =>
  withTokenInjector(token => ({
    ...token,
    ...(token.role
      ? {}
      : {
          role: repeat(char.charAt(0), token.content.length > 2 ? 3 : 1).join(
            ''
          ),
        }),
  }));

const getStubLength = (specimen: TemplateToken) =>
  Math.ceil(specimen.role.length * 1.2);

const getStubContent = (specimen: TemplateToken) =>
  repeat(' ', getStubLength(specimen)).join('');

const makeGhostToken = (
  specimen: TemplateToken,
  position: number
): InterpretedToken => {
  const content = getStubContent(specimen);

  return {
    ...specimen,
    content,
    spaceBefore: 1,
    start: position,
    end: position + content.length,
    ghost: true,
  };
};

const makeMaterializedToken = (
  specimen: TemplateToken,
  token: ParsedToken
): InterpretedToken => {
  return {
    ...specimen,
    ...token,
    ghost: false,
  };
};

export const zipTokens = (
  source: ParsedToken[],
  pattern: TemplateToken[]
): InterpretedToken[] =>
  pattern.reduce((acc, specimen, n) => {
    const parsed = source[n];
    const token = parsed
      ? makeMaterializedToken(specimen, parsed)
      : makeGhostToken(specimen, (acc.at(-1)?.end || 0) + 1);
    acc.push(token);
    return acc;
  }, []);

const checkToken = (
  token: ParsedToken,
  specimen: TemplateToken,
  isTailingToken: boolean
): boolean => {
  if (specimen.optional) {
    switch (true) {
      case !token:
        return true;
      case isTailingToken:
        return specimen.variants.some(v => v.startsWith(token.content));
      default:
        return specimen.variants.some(v => v === token.content);
    }
  } else {
    return specimen.variants.includes(token?.content);
  }
};

const checkTokens = (
  source: ParsedToken[],
  pattern: TemplateToken[]
): boolean =>
  pattern.length >= source.length &&
  pattern
    .map((specimen, n) =>
      checkToken(source[n], specimen, n === source.length - 1)
    )
    .every(Boolean);

const shiftPattern = (
  pattern: NestedTemplateToken,
  clue?: ParsedToken
): NestedTemplateToken | null => {
  switch (true) {
    case DEFAULT_BRANCH in pattern.branches:
      return pattern.branches[DEFAULT_BRANCH];
    case clue?.content in pattern.branches:
      return pattern.branches[clue.content];
    default:
      return null;
  }
};

export const makeInjectorOutOfSnapshotPattern =
  (pattern: TemplateToken[]): Injector<InterpretedSnapshot> =>
  snap => {
    if (checkTokens(snap.interpreted, pattern)) {
      return {
        ...snap,
        interpreted: zipTokens(snap.interpreted, pattern),
      };
    } else return snap;
  };

export const makeInjectorOutOfNestedTemplate =
  (pattern: NestedTemplateToken): Injector<InterpretedSnapshot> =>
  snap => {
    const interpreted: InterpretedToken[] = [];

    const lastParsedNum = snap.interpreted.length - 1;
    let currParsedNum = 0;
    let specimen = pattern;

    while (specimen) {
      const token = snap.interpreted[currParsedNum];
      if (!checkToken(token, specimen, currParsedNum === lastParsedNum)) {
        return snap;
      } else {
        const prevToken = interpreted.at(-1);
        interpreted.push(
          token
            ? makeMaterializedToken(specimen, token)
            : makeGhostToken(specimen, (prevToken?.end || 0) + 1) //TODO: adjust to multiple spaces
        );
        specimen = shiftPattern(specimen, token);
        currParsedNum += 1;
      }
    }

    return {
      raw: snap.raw,
      interpreted,
    };
  };

export interface AltGenerator<D> {
  name: string;
  pattern: TemplateToken[] | NestedTemplateToken;
  getData: (snap: InterpretedSnapshot) => D;
}

export const makeMulitpleResponseGenerator = <D>(
  origins: AltGenerator<D>[],
  postProcessor?: Injector<InterpretedSnapshot>
): ((snap: InterpretedSnapshot) => Observable <MultipleResponse<D>>) => {
  const wrappedOrigins = origins.map(origin => ({
    ...origin,
    injector: Array.isArray(origin.pattern)
      ? makeInjectorOutOfSnapshotPattern(origin.pattern)
      : makeInjectorOutOfNestedTemplate(origin.pattern),
  }));

  return snap => {
    const alternatives = wrappedOrigins.reduce<Interpretation<D>[]>(
      (acc, origin) => {
        const altSnap = origin.injector(snap);

        if (altSnap !== snap) {
          acc.push({
            name: origin.name,
            tokens: (postProcessor ? postProcessor(altSnap) : altSnap)
              .interpreted,
            data: origin.getData(snap),
          });
        }

        return acc;
      },
      []
    );

    return of({ raw: snap.raw, alternatives });
  };
};