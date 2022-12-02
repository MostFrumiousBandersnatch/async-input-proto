import { genTokenId, tokenProcessor } from '@root/engine/tokenizer';
import {
  ParsedSnapshot,
  ParsedToken,
  Token,
  TokenWithSuggestions,
} from '@root/engine/types';
import { delay } from '@root/utils/async';

interface FakeTokenProcessorOptions {
  slowFactor: number;
}

const COLORS = ['lightblue', 'lightgreen', 'cadetblue'];

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const pickColor = (token: Token): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

type Injector<T> = (input: T) => T;

const withInjectors =
  <T>(injectors: Array<Injector<T>>) =>
  (value: T): T =>
    injectors.reduce((acc, inj) => inj(acc), value);

const tokenInjectors = withInjectors<TokenWithSuggestions>([
  token =>
    token.content === 'ip'
      ? {
          ...token,
          variants: ['ipa', 'ipsum'],
          role: '***',
        }
      : token,
]);

const zipTokens = (
  source: ParsedToken[],
  pattern: TokenWithSuggestions[]
): TokenWithSuggestions[] =>
  pattern.map((stub, n) => ({
    ...stub,
    ...(n < source.length ? source[n] : {}),
  }));

const snapshotInjectors = withInjectors<ParsedSnapshot>([
  snap => {
    switch (true) {
      case snap.parsed.length >= 1 && snap.parsed[0].content === 'beer':
        return {
          ...snap,
          parsed: [
            { ...snap.parsed[0], role: 'div' },
            ...zipTokens(snap.parsed.slice(1), [
              {
                content: '    ',
                id: 'stub-action',
                spaceBefore: 1,
                start: 5,
                end: 9,
                role: 'action',
                variants: ['grab', 'find'],
                ghost: true,
              },
              {
                content: '    ',
                id: 'stub-kind',
                spaceBefore: 1,
                start: 10,
                end: 17,
                role: 'kind',
                variants: ['lager', 'porter', 'ale', 'blanche'],
                ghost: true,
              },
            ]),
          ],
        };
      default:
        return snap;
    }
  },
]);

export const dummyTokenProcessor = async (
  raw: string,
  options: FakeTokenProcessorOptions
): Promise<ParsedSnapshot> => {
  const res = snapshotInjectors(tokenProcessor(raw));
  res.parsed = res.parsed
    .map(token => ({
      ...token,
      color: pickColor(token),
      ...(token.role
        ? {}
        : {
            role:
              token.content.length > 2 ? `len(${token.content.length})` : '',
          }),
    }))
    .map(tokenInjectors);

  const del = Math.random() * 1000;
  await delay(del * options.slowFactor);
  return res;
};
