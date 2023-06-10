import type {
  InterpretedSnapshot,
  StreamMultiProcessor,
  TemplateToken,
} from '@async-input/types';

import {
  makeInjectorOutOfSnapshotPattern,
  parse,
  interpret,
  withInjectors,
  colorizeToken,
} from '@async-input/parsing_lib';

import { of } from 'rxjs';

export interface KPIData {
  title: string;
  description?: string;
}

const DESCR_SNAP_PATTERNS: TemplateToken[] = [
  {
    id: 'trigger',
    role: 'key',
    variants: ['roas', 'roi', 'cpm', 'cpc'],
    optional: false,
  },
];

const FRML_SNAP_PATTERNS: TemplateToken[] = [
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
];

const descSnapshotInjectors = withInjectors<InterpretedSnapshot>([
  makeInjectorOutOfSnapshotPattern(DESCR_SNAP_PATTERNS),
]);

const frmlSnapshotInjectors = withInjectors<InterpretedSnapshot>([
  makeInjectorOutOfSnapshotPattern(FRML_SNAP_PATTERNS),
]);

const colorize = colorizeToken(() => 'lightgrey');

export const KPIInterpreter: StreamMultiProcessor<KPIData> = raw => {
  const snap = interpret(parse(raw));
  const leadingToken = snap.interpreted[0];

  const alternatives = [];

  const withDescr = descSnapshotInjectors(snap);
  if (withDescr !== snap) {
    alternatives.push({
      name: 'description',
      tokens: withDescr.interpreted.map(colorize),
      data: { title: `description of ${leadingToken.content}` },
    });
  }

  const withFormula = frmlSnapshotInjectors(snap);

  if (withFormula !== snap) {
    alternatives.push({
      name: 'formula',
      tokens: withFormula.interpreted.map(colorize),
      data: { title: `formula of ${leadingToken.content}` },
    });
  }

  if (alternatives.length > 0) {
    return of({
      raw: snap.raw,
      alternatives,
    });
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
