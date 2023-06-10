import {
  InterpretedSnapshot,
  InterpretedToken,
  ParsedToken,
  TemplateToken,
} from '@async-input/types';
import { repeat } from 'utils/misc';

type Injector<T> = (input: T) => T;

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

const makeGhostToken = (
  specimen: TemplateToken,
  position: number
): InterpretedToken => {
  const stubLength = specimen.role.length + 2;

  return {
    ...specimen,
    content: repeat(' ', stubLength).join(''),
    spaceBefore: 1,
    start: position,
    end: position + stubLength,
    ghost: true,
  };
};

const makeMaterializedToken = (
  specimen: TemplateToken,
  token: ParsedToken
): InterpretedToken => ({
  ...specimen,
  ...token,
  ghost: false,
});

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

export const checkTokens = (
  source: ParsedToken[],
  pattern: TemplateToken[]
): boolean =>
  pattern.length >= source.length &&
  pattern
    .map((specimen, n) => {
      const token = source[n];
      if (specimen.optional) {
        switch (true) {
          case !token:
            return true;
          case n === source.length - 1:
            return specimen.variants.some(v => v.startsWith(token.content));
          default:
            return specimen.variants.some(v => v === token.content);
        }
      } else {
        return specimen.variants.includes(token?.content);
      }
    })
    .every(Boolean);

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
