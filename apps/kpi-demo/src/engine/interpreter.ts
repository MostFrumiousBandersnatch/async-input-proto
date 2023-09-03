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

export interface KPIData {
  title: string;
  description?: string;
}

const getData = (name: string) => (snap: InterpretedSnapshot) => ({
  title: `${name} of ${snap.interpreted[0].content}`,
});

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
  withInjectors([markMismatched, markNotRecognized])
);

export const KPIInterpreter: StreamMultiProcessor<KPIData> = raw => {
  const snap = defaultInterpret(raw);

  return generator(snap);
};
