import { Observable, Subscriber } from 'rxjs';

import type {
  AsyncProcessor,
  StreamProcessor,
  InterpretedToken,
  TemplateToken,
  InterpretedSnapshot
} from '@async-input/types';

import {
  colorizeSnapshot,
  embelisher,
  makeInjectorOutOfSnapshotPattern,
  withInjectors,
  withTokenInjector,
  parse, interpret
} from '@async-input/parsing_lib';

import { delay } from '@root/utils/async';

interface FakeTokenProcessorOptions {
  slowFactor: number;
}

const COLORS = ['#9edcd0', '#9ac9ed', '#6980e5', '#c79df2'];

const colorInjector = colorizeSnapshot(
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  (token: InterpretedToken): string => COLORS[Math.floor(Math.random() * COLORS.length)]
);

const tokenInjectors = withInjectors<InterpretedToken>([
  token =>
    token.content === 'ip'
      ? {
          ...token,
          variants: ['ipa', 'ipsum'],
          role: '$$$',
        }
      : token,
  token =>
    token.content === 'bee'
      ? {
          ...token,
          color:
            'repeating-linear-gradient(-45deg, gold 0 10px, grey 10px 20px)',
          role: 'z-z-z',
        }
      : token,
]);

const SNAP_PATTERNS: TemplateToken[][] = [
  [
    {

      id: 'trigger',
      role: 'key',
      color:
        'linear-gradient(132deg, rgb(241, 242, 11) 0.00%, rgb(248, 161, 27) 100.00%)',
      variants: ['beer'],
      optional: false
    },
    {
      id: 'stub-action',
      role: 'action',
      color:
        'linear-gradient(132deg, rgb(113, 143, 175) 0.00%, rgb(69, 92, 114) 100.00%)',
      variants: ['grab', 'find'],
      optional: true,
    },
    {
      id: 'stub-kind',
      role: 'kind',
      color:
        'linear-gradient(132deg, rgb(221, 2, 3) 0.00%, rgb(251, 137, 2) 20.00%, rgb(248, 235, 5) 40.00%, rgb(0, 127, 38) 60.00%, rgb(5, 75, 249) 80.00%, rgb(114, 6, 130) 100.00%)',
      variants: ['lager', 'porter', 'ale', 'blanche'],
      optional: true,
    },
  ],
];

const snapshotInjectors = withInjectors<InterpretedSnapshot>(
  SNAP_PATTERNS.map(makeInjectorOutOfSnapshotPattern)
);

const withAsterisks = embelisher('*');
const withSharps = embelisher('#');

export const dummyTokenProcessor =
  (options: FakeTokenProcessorOptions): AsyncProcessor =>
  async raw => {
    const vanilla = interpret(parse(raw));
    const smart = snapshotInjectors(vanilla);

    const del = Math.random() * 1000;
    await delay(del * options.slowFactor);

    if (smart === vanilla) {
      return withTokenInjector(tokenInjectors)(
        withSharps(colorInjector(vanilla))
      );
    } else {
      return smart;
    }
  };

interface StreamState {
  cancel: boolean;
}

const pushToStream = (
  subscriber: Subscriber<InterpretedSnapshot>,
  state: StreamState,
  snapshot: InterpretedSnapshot
): void => {
  if (state.cancel || subscriber.closed) {
    subscriber.complete();
  } else {
    subscriber.next(snapshot);
  }
};

export const dummyTokenStreamProcessor =
  (options: FakeTokenProcessorOptions): StreamProcessor =>
  raw =>
    new Observable(subscriber => {
      const state: StreamState = { cancel: false };
      const vanilla = interpret(parse(raw));
      const smart = snapshotInjectors(vanilla);

      const del = Math.random() * options.slowFactor;

      delay(del * 200).then(() => {
        const twoSteps = smart !== vanilla;

        pushToStream(
          subscriber,
          state,
          withTokenInjector(tokenInjectors)(
            (twoSteps ? withAsterisks : withSharps)(colorInjector(vanilla))
          )
        );

        if (twoSteps) {
          delay(del * 1000).then(() => {
            pushToStream(subscriber, state, smart);
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
