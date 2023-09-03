import {
  TemplateToken,
  ParsedToken,
  InterpretedToken,
  NestedTemplateToken,
  InterpretationResult,
} from '@async-input/types';
import type { Injector } from 'injector';

import { DEFAULT_BRANCH } from '@async-input/types';
import { repeat } from 'utils/misc';

export const colorizeToken =
  (colorize: (_: InterpretedToken) => string): Injector<InterpretedToken> =>
  token => ({
    color: colorize(token),
    ...token,
  });

const getStubLength = (specimen: TemplateToken) =>
  Math.ceil(specimen.role.length * 1.2);

const getStubContent = (specimen: TemplateToken) =>
  repeat(' ', getStubLength(specimen)).join('');

// export const makeGhostToken = (
//   specimen: TemplateToken,
//   position: number
// ): InterpretedToken => {
//   const content = getStubContent(specimen);

//   return {
//     ...specimen,
//     content,
//     spaceBefore: 1,
//     start: position,
//     end: position + content.length,
//     ghost: true,
//   };
// };

// export const makeMaterializedToken = (
//   specimen: TemplateToken,
//   token: ParsedToken
// ): InterpretedToken => {
//   return {
//     ...specimen,
//     ...token,
//     ghost: false,
//   };
// };

// export const zipTokens = (
//   source: ParsedToken[],
//   pattern: TemplateToken[]
// ): InterpretedToken[] =>
//   pattern.reduce((acc, specimen, n) => {
//     const parsed = source[n];
//     const token = parsed
//       ? makeMaterializedToken(specimen, parsed)
//       : makeGhostToken(specimen, (acc.at(-1)?.end || 0) + 1);
//     acc.push(token);
//     return acc;
//   }, []);

export const checkToken = (
  specimen: TemplateToken,
  token: ParsedToken
): InterpretationResult => {
  switch (true) {
    case !token.content:
      return InterpretationResult.suggested;
    case specimen.variants.includes(token.content):
      return InterpretationResult.matched;
    case specimen.variants.some(v => v.startsWith(token.content)):
      return InterpretationResult.partiallyMatched;
    default:
      return InterpretationResult.misMatched;
  }
};

const scoreMap: Record<InterpretationResult, number> = {
  [InterpretationResult.matched]: 1,
  [InterpretationResult.misMatched]: -0.5,
  [InterpretationResult.partiallyMatched]: 0.5,
  [InterpretationResult.suggested]: 0.1,
  [InterpretationResult.notRecognized]: 0,
};

export const estimateToken = (token: InterpretedToken): number => {
  return scoreMap[token.status];
};

export const shiftPattern = (
  pattern: NestedTemplateToken,
  clue?: ParsedToken
): NestedTemplateToken | null => {
  switch (true) {
    case pattern.branches && clue?.content in pattern.branches:
      return pattern.branches[clue.content];
    case pattern.branches && DEFAULT_BRANCH in pattern.branches:
      return pattern.branches[DEFAULT_BRANCH];
    default:
      return null;
  }
};

export const genPostfix = (token?: ParsedToken): ParsedToken =>
  token
    ? {
        id: `${token.id}__ps`,
        content: '',
        spaceBefore: 1,
        start: token.end + 1,
        end: token.end + 1,
      }
    : {
        id: '__ps',
        content: '',
        spaceBefore: 1,
        start: 0,
        end: 0,
      };

export const evaluate = (
  specimen: TemplateToken,
  token: ParsedToken
): InterpretedToken => {
  const status = checkToken(specimen, token);
  const content =
    status === InterpretationResult.suggested
      ? getStubContent(specimen)
      : token.content;
  const position = token.start;

  let variants =
    (status === InterpretationResult.suggested || specimen.variants?.length > 1)
      ? specimen.variants
      : [];

  if (status === InterpretationResult.partiallyMatched) {
    variants = variants?.filter(
      text => text.startsWith(content) && text !== content
    );
  }

  return {
    role: specimen.role,
    color:
      status === InterpretationResult.misMatched ? undefined : specimen.color,
    variants,
    id: token.id,
    content,
    spaceBefore: token.spaceBefore,
    start: position,
    end: position + content.length,
    status,
  };
};

export const getDefualtSuggestion = (pattern: TemplateToken) =>
  evaluate(pattern, genPostfix());
