import React from 'react';
import { Observable, Observer } from 'rxjs';

import { MultipleResponse, ParsedSnapshot } from '@widget/engine/types';

export interface OrchestratorContextType {
  inputStream: Observer<string>;
  intepreterStream: Observable<MultipleResponse>;
  alternativesStream: Observer<string>;
  feedbackStream: Observable<ParsedSnapshot>;
}

export const OrchestratorContext =
  React.createContext<OrchestratorContextType>(null);
