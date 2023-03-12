import React, { useEffect, useRef, useState } from 'react';
import {
  debounceTime,
  finalize,
  identity,
  Observable,
  Subscriber,
  switchMap,
} from 'rxjs';

import { StreamTokenizer } from '@widget/engine/types';

import { Input } from '@widget/components/input/input';
import { InputContext, InputContextType } from '@widget/components/input/ctx';

export interface StreamInputProps {
  processor: StreamTokenizer;
  ctx: InputContextType;
}

const withLoading =
  (
    processor: StreamTokenizer,
    setLoading: (_: boolean) => void
  ): StreamTokenizer =>
  (raw: string) => {
    setLoading(true);

    return processor(raw).pipe(
      finalize(() => {
        setLoading(false);
      })
    );
  };

export const StreamInput: React.FC<StreamInputProps> = ({ processor, ctx }) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);
  const sourceRef = useRef<Subscriber<string>>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    new Observable<string>(subscriber => {
      sourceRef.current = subscriber;
    })
      .pipe(
        ctx.debounceTime > 0 ? debounceTime(ctx.debounceTime) : identity,
        switchMap(withLoading(processor, setLoading))
      )
      .subscribe(setCurrSnapshot);
  }, [setCurrSnapshot, processor, ctx]);

  const onChange = (raw: string) => {
    if (sourceRef.current) {
      sourceRef.current.next(raw);
    }
  };

  return (
    <InputContext.Provider value={ctx}>
      <Input snapshot={currSnapshot} onChange={onChange} loading={loading} />
    </InputContext.Provider>
  );
};
