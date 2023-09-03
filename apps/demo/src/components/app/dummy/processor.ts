import { Observable, Subscriber } from 'rxjs';

import {
  AsyncProcessor,
  StreamProcessor,
  InterpretedToken,
  InterpretedSnapshot,
  NestedTemplateToken,
  InterpretationResult,
} from '@async-input/types';

import { DEFAULT_BRANCH } from '@async-input/types';

import {
  colorizeSnapshot,
  embelisher,
  makeInjectorOutOfNestedTemplates,
  withTokenInjector,
  parse,
  interpret,
  withInjectors,
} from '@async-input/parsing_lib';

import { delay } from '@root/utils/async';

interface FakeTokenProcessorOptions {
  slowFactor: number;
}

const COLORS = ['#9edcd0', '#9ac9ed', '#6980e5', '#c79df2'];

const colorInjector = colorizeSnapshot(
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  (token: InterpretedToken): string =>
    COLORS[Math.floor(Math.random() * COLORS.length)]
);

const SNAP_PATTERNS: NestedTemplateToken[] = [
  {
    id: 'buzz',
    variants: ['bee', 'wasp'],
    color: 'repeating-linear-gradient(-45deg, gold 0 10px, grey 10px 20px)',
    role: 'z-z-z',
  },
  {
    id: 'ip',
    role: '$$$',
    variants: ['ipa', 'ipsum'],
  },
  {
    id: 'beer-trigger',
    role: 'key',
    color:
      'linear-gradient(132deg, rgb(241, 242, 11) 0.00%, rgb(248, 161, 27) 100.00%)',
    variants: ['beer'],
    branches: {
      [DEFAULT_BRANCH]: {
        id: 'stub-action',
        role: 'action',
        color:
          'linear-gradient(132deg, rgb(113, 143, 175) 0.00%, rgb(69, 92, 114) 100.00%)',
        variants: ['grab', 'find'],
        branches: {
          [DEFAULT_BRANCH]: {
            id: 'stub-kind',
            role: 'kind',
            color:
              'linear-gradient(132deg, rgb(221, 2, 3) 0.00%, rgb(251, 137, 2) 20.00%, rgb(248, 235, 5) 40.00%, rgb(0, 127, 38) 60.00%, rgb(5, 75, 249) 80.00%, rgb(114, 6, 130) 100.00%)',
            variants: ['lager', 'porter', 'ale', 'blanche'],
          },
        },
      },
    },
  },
];

const snapshotInjectors = makeInjectorOutOfNestedTemplates(SNAP_PATTERNS);

const withAsterisks = embelisher('*');
const withSharps = embelisher('#');

const markMismatched = withTokenInjector(token =>
  token.status === InterpretationResult.misMatched
    ? {
        ...token,
        color: 'lightcoral',
      }
    : token
);

const markNotRecognized = withTokenInjector(token =>
  token.status === InterpretationResult.notRecognized
    ? {
        ...token,
        color: 'lightgrey',
        role: '???',
      }
    : token
);

const postProcessor = withInjectors([markMismatched, markNotRecognized]);

export const dummyTokenProcessor =
  (options: FakeTokenProcessorOptions): AsyncProcessor =>
  async raw => {
    const vanilla = interpret(parse(raw));
    let smart = snapshotInjectors(vanilla);
    smart = postProcessor(smart);

    const del = Math.random() * 1000;
    await delay(del * options.slowFactor);

    return smart;
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
          (twoSteps ? withAsterisks : withSharps)(colorInjector(vanilla))
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