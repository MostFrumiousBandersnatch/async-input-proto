import {
  InterpretationResult,
  InterpretedSnapshot,
  StreamMultiProcessor,
} from '@async-input/types';

import {
  defaultInterpret,
  withTokenInjector,
  withInjectors,
} from '@async-input/parsing_lib';

import { makeMulitpleResponseSequentialGenerator } from 'engine/generator';
import { InterpretedToken } from '@async-input/types';

export interface KPIData {
  title: string;
  description?: string;
}

const getData =
  (name: string) =>
  (snap: InterpretedSnapshot): KPIData => {
    const key = snap.interpreted.find(
      (token: InterpretedToken): boolean =>
        token.role === 'key' && token.status === InterpretationResult.matched
    )?.content;

    return { title: key ? `${name} of ${key}` : `some ${name}` };
  };

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

const partMatched = withTokenInjector(token =>
  token.status === InterpretationResult.partiallyMatched
    ? {
        ...token,
        color: 'lightblue',
      }
    : token
);
const generator = makeMulitpleResponseSequentialGenerator(
  [
    {
      name: 'formula',
      pattern: [
        {
          id: 'trigger',
          role: 'key',
          variants: ['roas', 'roi', 'cpm', 'cpc'],
        },
        {
          id: 'ds-stub',
          role: 'data source',
          variants: ['google', 'big-query'],
          branches: {
            google: {
              id: 'trg-stub',
              role: 'target',
              variants: ['sheets', 'looker'],
              branches: {},
            },
          },
        },
      ],

      getData: getData('formula'),
    },
    {
      name: 'description',
      pattern: [
        {
          id: 'trigger',
          role: 'key',
          variants: ['roas', 'roi', 'cpm', 'cpc'],
        },
      ],
      getData: getData('description'),
    },
    {
      name: 'chart',
      pattern: [
        {
          id: 'trigger',
          role: 'key',
          variants: ['roas', 'roi', 'cpm', 'cpc'],
        },
      ],
      getData: getData('chart'),
    },
  ],
  withInjectors([markMismatched, markNotRecognized, partMatched])
);

export const KPIInterpreter: StreamMultiProcessor<KPIData> = raw => {
  const snap = defaultInterpret(raw);

  return generator(snap);
};