import React, { useMemo, useState } from 'react';
import {
  combineLatestWith,
  filter,
  map,
  mergeMap,
  Observable,
  Observer,
  Subject,
} from 'rxjs';

import type { MultipleResponse, StreamedInterpreter } from '@async-input/types';
import {
  OrchestratorContextAware,
  OrchestratorContextType,
  processIterpretation,
} from '@widget/components/orchestrator/ctx';

interface OrchestratorProps<D> extends OrchestratorContextAware<D> {
  interpreter: StreamedInterpreter<D>;
  children: React.ReactElement;
}

export function Orchestrator<D>({
  interpreter,
  children,
  contextInstance,
}: OrchestratorProps<D>) {
  const [inputStream, setInputStream] = useState<Observer<string>>(null);
  const [alternativesStream, setAlternativesStream] =
    useState<Observer<string>>(null);

  const intepreterStream = useMemo<Observable<MultipleResponse<D>>>(() => {
    const stream = new Subject();
    setInputStream(stream);
    return stream.pipe(mergeMap(interpreter));
  }, [interpreter]);

  const feedbackStream = useMemo(() => {
    const stream = new Subject<string>();
    setAlternativesStream(stream);

    return intepreterStream.pipe(combineLatestWith(stream)).pipe(
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