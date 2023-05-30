import {
  ParsedSnapshot,
  ParsedToken,
  Token,
  TokenWithSuggestions,
} from '@async-input/types';
import { repeat } from 'utils/misc';

type Injector<T> = (input: T) => T;

export const withInjectors =
  <T>(injectors: Array<Injector<T>>) =>
  (value: T): T =>
    injectors.reduce((acc, inj) => inj(acc), value);

export const withTokenInjector =
  (tokenInjector: Injector<TokenWithSuggestions>): Injector<ParsedSnapshot> =>
  snap => ({
    ...snap,
    parsed: snap.parsed.map(tokenInjector),
  });

export const colorizeSnapshot =
  (colorize: (_: Token) => string): Injector<ParsedSnapshot> =>
  snap => ({
    ...snap,
    parsed: snap.parsed.map(token => ({
      color: colorize(token),
      ...token,
    })),
  });

export const embelisher =
  (char: string): Injector<ParsedSnapshot> =>
  snap => ({
    ...snap,
    parsed: snap.parsed.map(token => ({
      ...token,
      ...(token.role
        ? {}
        : {
            role: repeat(char.charAt(0), token.content.length > 2 ? 3 : 1).join(
              ''
            ),
          }),
    })),
  });

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
    .every(Boolean);

export const makeInjectorOutOfSnapshotPattern =
  (pattern: TokenWithSuggestions[]): Injector<ParsedSnapshot> =>
  snap => {
    if (checkTokens(snap.parsed, pattern)) {
      return {
        ...snap,
        parsed: zipTokens(snap.parsed, pattern),
      };
    } else return snap;
  };
