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

const getStubLength = (pattern: TemplateToken) =>
  Math.ceil(pattern.role.length * 1.2);

const getStubContent = (pattern: TemplateToken) =>
  repeat(' ', getStubLength(pattern)).join('');

export const checkToken = (
  pattern: TemplateToken,
  token: ParsedToken
): InterpretationResult => {
  switch (true) {
    case !token.content:
      return InterpretationResult.suggested;
    case pattern.variants.includes(token.content):
      return InterpretationResult.matched;
    case pattern.variants.some(v => v.startsWith(token.content)):
      return InterpretationResult.partiallyMatched;
    default:
      return InterpretationResult.misMatched;
  }
};

const scoreMap: Record<InterpretationResult, number> = {
  [InterpretationResult.matched]: 1,
  [InterpretationResult.misMatched]: 0.25,
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
  pattern: TemplateToken,
  token: ParsedToken
): InterpretedToken => {
  const status = checkToken(pattern, token);
  const content =
    status === InterpretationResult.suggested
      ? getStubContent(pattern)
      : token.content;
  const position = token.start;

  let variants: string[];

  switch (status) {
    case InterpretationResult.misMatched:
    case InterpretationResult.suggested:
      variants = [...pattern.variants];
      break;
    case InterpretationResult.partiallyMatched:
      variants = pattern.variants?.filter(
        text => text.startsWith(content) && text !== content
      );
      break;
    default:
      variants = [];
  }

  return {
    role: pattern.role,
    color: pattern.color,
    variants,
    id: token.id,
    content,
    spaceBefore: token.spaceBefore,
    start: position,
    end: position + content.length,
    status,
  };
};

export const invertNestedTemplate = (
  pattern: NestedTemplateToken,
  base?: NestedTemplateToken
): NestedTemplateToken[] => [
  base ?
    { ...pattern, branches: { [DEFAULT_BRANCH]: base } }
    : pattern,
  ...Object.entries(pattern.branches || {}).flatMap(
    ([branch, subpattern]) =>
      invertNestedTemplate(
        subpattern, {
          ...pattern,
          variants: [branch],
          branches: base ? { [DEFAULT_BRANCH]: base } : undefined,
        }
      )
  ),
];