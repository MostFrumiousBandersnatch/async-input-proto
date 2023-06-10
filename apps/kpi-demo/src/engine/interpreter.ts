import type {
  InterpretedSnapshot,
  StreamMultiProcessor,
} from '@async-input/types';

import {
  defaultInterpret,
  colorizeSnapshot,
  makeMulitpleResponseGenerator,
} from '@async-input/parsing_lib';

import { of } from 'rxjs';

export interface KPIData {
  title: string;
  description?: string;
}

const getData = (name: string) => (snap: InterpretedSnapshot) => ({
  title: `${name} of ${snap.interpreted[0].content}`,
});

const generator = makeMulitpleResponseGenerator(
  [
    {
      name: 'description',
      pattern: [
        {
          id: 'trigger',
          role: 'key',
          variants: ['roas', 'roi', 'cpm', 'cpc'],
          optional: false,
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
          optional: false,
        },
      ],
      getData: getData('chart'),
    },

    {
      name: 'formula',
      pattern: [
        {
          id: 'trigger',
          role: 'key',
          variants: ['roas', 'roi', 'cpm', 'cpc'],
          optional: false,
        },
        {
          id: 'ds-stub',
          role: 'data source',
          variants: ['google', 'big-query'],
          optional: true,
        },
      ],
      getData: getData('formula'),
    },
  ],
  colorizeSnapshot(() => 'lightgrey')
);

export const KPIInterpreter: StreamMultiProcessor<KPIData> = raw => {
  const snap = defaultInterpret(raw);

  const resp = generator(snap);
  if (resp.alternatives.length > 0) {
    return of(resp);
  } else {
    return of({
      raw: snap.raw,
      alternatives: [
        {
          name: '???',
          tokens: snap.interpreted,
          data: null,
        },
      ],
    });
  }
};
