import React, { useEffect, useRef, useState } from 'react';
import { debounceTime, identity, mergeMap, Observable, Subscriber } from 'rxjs';

import { StreamTokenizer } from '@widget/engine/types';

import { Input } from '@widget/components/input/input';
import { InputContext, InputContextType } from '@widget/components/input/ctx';

export interface StreamInputProps {
  processor: StreamTokenizer;
  ctx: InputContextType;
}

export const StreamInput: React.FC<StreamInputProps> = ({ processor, ctx }) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);
  const sourceRef = useRef<Subscriber<string>>();

  useEffect(() => {
    new Observable<string>(subscriber => {
      sourceRef.current = subscriber;
    })
      .pipe(
        ctx.debounceTime > 0 ? debounceTime(ctx.debounceTime) : identity,
        mergeMap(processor)
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
      <Input snapshot={currSnapshot} onChange={onChange} />
    </InputContext.Provider>
  );
};
