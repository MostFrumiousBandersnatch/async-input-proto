import React, { useMemo, useState } from 'react';
import { MultipleResponse, StreamedInterpreter } from '@widget/engine/types';
import {
  OrchestratorContext,
  OrchestratorContextType,
} from '@widget/components/orchestrator/ctx';
import {
  combineLatestWith,
  filter,
  map,
  mergeMap,
  Observable,
  Observer,
  Subject,
} from 'rxjs';

interface OrchestratorProps {
  interpreter: StreamedInterpreter;
  children: React.ReactElement;
}

export const Orchestrator: React.FC<OrchestratorProps> = ({
  interpreter,
  children,
}) => {
  const [inputStream, setInputStream] = useState<Observer<string>>(null);
  const [alternativesStream, setAlternativesStream] =
    useState<Observer<string>>(null);

  const intepreterStream = useMemo<Observable<MultipleResponse>>(() => {
    const stream = new Subject();
    setInputStream(stream);
    return stream.pipe(mergeMap(interpreter));
  }, [interpreter]);

  const feedbackStream = useMemo(() => {
    const stream = new Subject<string>();
    setAlternativesStream(stream);

    return intepreterStream.pipe(combineLatestWith(stream)).pipe(
      map(([response, chosenAlternative]) => ({
        raw: response.raw,
        parsed: response.alternatives.find(
          ({ name }) => name === chosenAlternative
        )?.snapshot,
      })),
      filter(({ parsed }) => !!parsed)
    );
  }, [intepreterStream]);

  const ctx = useMemo<OrchestratorContextType>(
    () => ({
      inputStream,
      intepreterStream,
      alternativesStream,
      feedbackStream,
    }),
    [inputStream, intepreterStream, alternativesStream, feedbackStream]
  );
  return (
    <OrchestratorContext.Provider value={ctx}>
      {children}
    </OrchestratorContext.Provider>
  );
};
