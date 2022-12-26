import { ParsedToken, Token, TokenWithSuggestions } from '@root/engine/types';

import identity from 'lodash/identity';

const COLORS = ['#9edcd0', '#9ac9ed', '#6980e5', '#c79df2'];

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const pickColor = (token: Token): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const zipTokens = (
  source: ParsedToken[],
  pattern: TokenWithSuggestions[]
): TokenWithSuggestions[] =>
  pattern.map((stub, n) => ({
    ...stub,
    ...(n < source.length && source[n].content.length > 0 ? source[n] : {}),
  }));

export const checkTokens = (
  source: ParsedToken[],
  pattern: TokenWithSuggestions[]
): boolean =>
  pattern
    .map((specimen, n) => {
      const token = source[n];
      if (specimen.ghost) {
        switch (true) {
          case !token:
            return true;
          case n === source.length - 1:
            return specimen.variants.some(v => v.startsWith(token.content));
          default:
            return specimen.variants.some(v => v === token.content);
        }
      } else {
        return token?.content === specimen.content;
      }
    })
    .every(identity);
