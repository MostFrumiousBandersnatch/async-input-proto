import React from 'react';
import { Observable, Observer } from 'rxjs';

import {
  Interpretation,
  MultipleResponse,
  ParsedSnapshot,
} from '@widget/engine/types';
import { omit } from 'lodash';

interface ProcessedInterptretation<D>
  extends Omit<Interpretation<D>, 'tokens'> {
  snapshot: ParsedSnapshot;
}

export const processIterpretation = <D>(
  source: string,
  int: Interpretation<D>
): ProcessedInterptretation<D> => ({
  ...omit(int, 'tokens'),
  snapshot: {
    raw: source,
    parsed: int.tokens,
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
