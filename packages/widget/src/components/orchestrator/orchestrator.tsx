import React, { useEffect, useMemo, useState } from 'react';
import {
  combineLatestWith,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  Observer,
  Subject,
  switchMap,
} from 'rxjs';

import type {
  MultipleResponse,
  StreamMultiProcessor,
} from '@async-input/types';
import {
  OrchestratorContextAware,
  OrchestratorContextType,
  processIterpretation,
} from '@widget/components/orchestrator/ctx';

interface OrchestratorProps<D> extends OrchestratorContextAware<D> {
  interpreter: StreamMultiProcessor<D>;
  children: React.ReactElement;
}

export function Orchestrator<D>({
  interpreter,
  children,
  contextInstance,
}: OrchestratorProps<D>) {
  const [inputStream, setInputStream] = useState<Subject<string>>(null);
  const [alternativesStream, setAlternativesStream] =
    useState<Observer<string>>(null);

  const intepreterStream = useMemo<Observable<MultipleResponse<D>>>(() => {
    if (inputStream && interpreter) {
      return (
        inputStream
          .pipe(
            distinctUntilChanged(),
            switchMap(interpreter)
          )
      );
    } else {
      return EMPTY;
    }
  }, [inputStream, interpreter]);

  useEffect(() => {
    const stream = new Subject<string>();
    setInputStream(stream);
  }, [setInputStream]);

  const feedbackStream = useMemo(() => {
    const stream = new Subject<string>();
    setAlternativesStream(stream);

    return intepreterStream.pipe(
      combineLatestWith(stream.pipe(distinctUntilChanged())),
      map(([response, chosenAlternative]) => {
        const int = response.alternatives.find(
          ({ name }) => name === chosenAlternative
        );

        return int ? processIterpretation(response.raw, int) : undefined;
      }),
      filter(Boolean)
    );
  }, [intepreterStream]);

  const ctxValue = useMemo<OrchestratorContextType<D>>(
    () => ({
      inputStream,
      intepreterStream,
      alternativesStream,
      feedbackStream,
    }),
    [inputStream, intepreterStream, alternativesStream, feedbackStream]
  );
  const CtxComp = contextInstance;

  return (
    ctxValue && <CtxComp.Provider value={ctxValue}>{children}</CtxComp.Provider>
  );
}
