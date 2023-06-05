import React from 'react';
import omit from 'lodash.omit';

import type { Observable, Observer } from 'rxjs';
import type {
  Interpretation,
  MultipleResponse,
  InterpretedSnapshot,
} from '@async-input/types';

interface ProcessedInterptretation<D>
  extends Omit<Interpretation<D>, 'tokens'> {
  snapshot: InterpretedSnapshot;
}

export const processIterpretation = <D>(
  source: string,
  int: Interpretation<D>
): ProcessedInterptretation<D> => ({
  ...omit(int, 'tokens'),
  snapshot: {
    raw: source,
    interpreted: int.tokens,
  },
});

export interface OrchestratorContextType<D> {
  inputStream: Observer<string>;
  intepreterStream: Observable<MultipleResponse<D>>;
  alternativesStream: Observer<string>;
  feedbackStream: Observable<ProcessedInterptretation<D>>;
}

export interface OrchestratorContextAware<D> {
  contextInstance: React.Context<OrchestratorContextType<D>>;
}