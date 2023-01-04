import {
  checkTokens,
  colorizeSnapshot,
  embelisher,
  withTokenInjectors,
  zipTokens,
} from '@root/components/app/dummy/lib';
import { tokenProcessor } from '@root/engine/tokenizer';
import {
  AsyncTokenizer,
  ParsedSnapshot,
  StreamTokenizer,
  TokenWithSuggestions,
} from '@root/engine/types';
import { delay } from '@root/utils/async';
import { Observable } from 'rxjs';

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
          role: '$$$',
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
      color:
        'linear-gradient(132deg, rgb(241, 242, 11) 0.00%, rgb(248, 161, 27) 100.00%)',
      ghost: false,
    },
    {
      content: '    ',
      id: 'stub-action',
      spaceBefore: 1,
      start: 5,
      end: 9,
      role: 'action',
      color:
        'linear-gradient(132deg, rgb(113, 143, 175) 0.00%, rgb(69, 92, 114) 100.00%)',
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
      color:
        'linear-gradient(132deg, rgb(221, 2, 3) 0.00%, rgb(251, 137, 2) 20.00%, rgb(248, 235, 5) 40.00%, rgb(0, 127, 38) 60.00%, rgb(5, 75, 249) 80.00%, rgb(114, 6, 130) 100.00%)',
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

const withAsterisks = embelisher('*');
const withSharps = embelisher('#');

export const dummyTokenProcessor =
  (options: FakeTokenProcessorOptions): AsyncTokenizer =>
  async raw => {
    const vanilla = tokenProcessor(raw);
    const smart = snapshotInjectors(vanilla);

    const del = Math.random() * 1000;
    await delay(del * options.slowFactor);

    if (smart === vanilla) {
      return withTokenInjectors(tokenInjectors)(
        withSharps(colorizeSnapshot(vanilla))
      );
    } else {
      return smart;
    }
  };

export const dummyTokenStreamProcessor =
  (options: FakeTokenProcessorOptions): StreamTokenizer =>
  raw =>
    new Observable(subscriber => {
      const state = { cancel: false };
      const vanilla = tokenProcessor(raw);
      const smart = snapshotInjectors(vanilla);

      const del = Math.random() * options.slowFactor;

      delay(del * 200).then(() => {
        const twoSteps = smart !== vanilla;

        subscriber.next(
          withTokenInjectors(tokenInjectors)(
            (twoSteps ? withAsterisks : withSharps)(colorizeSnapshot(vanilla))
          )
        );

        if (twoSteps) {
          delay(del * 1000).then(() => {
            if (!state.cancel) {
              subscriber.next(smart);
            }
            subscriber.complete();
          });
        } else {
          subscriber.complete();
        }
      });
      return () => {
        state.cancel = true;
      };
    });
