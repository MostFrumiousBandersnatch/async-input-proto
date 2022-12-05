import {
  checkTokens,
  pickColor,
  zipTokens,
} from '@root/components/app/dummy/lib';
import { tokenProcessor } from '@root/engine/tokenizer';
import { ParsedSnapshot, TokenWithSuggestions } from '@root/engine/types';
import { delay } from '@root/utils/async';

import { withInjectors } from './injectors';

interface FakeTokenProcessorOptions {
  slowFactor: number;
}

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

const SNAP_PATTERNS: TokenWithSuggestions[][] = [
  [
    {
      content: 'beer',
      id: 'stub-action',
      spaceBefore: 0,
      start: 0,
      end: 4,
      role: 'key',
      ghost: false,
    },
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
      content: '      ',
      id: 'stub-kind',
      spaceBefore: 1,
      start: 10,
      end: 17,
      role: 'kind',
      variants: ['lager', 'porter', 'ale', 'blanche'],
      ghost: true,
    },
  ],
];

const snapshotInjectors = withInjectors<ParsedSnapshot>(
  SNAP_PATTERNS.map(pattern => snap => {
    if (checkTokens(snap.parsed, pattern)) {
      return {
        ...snap,
        parsed: zipTokens(snap.parsed, pattern),
      };
    } else return snap;
  })
);

export const dummyTokenProcessor = async (
  raw: string,
  options: FakeTokenProcessorOptions
): Promise<ParsedSnapshot> => {
  const snap = tokenProcessor(raw);
  const res = snapshotInjectors(snap);

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
