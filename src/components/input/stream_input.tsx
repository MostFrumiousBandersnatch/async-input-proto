import React, { useEffect, useRef, useState } from 'react';

import {
  Input,
  InputContext,
  InputContextType,
} from '@root/components/input/input';
import { StreamTokenizer } from '@root/engine/types';
import { mergeMap, Observable, Subscriber } from 'rxjs';

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
      .pipe(mergeMap(processor))
      .subscribe(setCurrSnapshot);
  }, [setCurrSnapshot, processor]);

  const onChange=((raw: string) => {
    if (sourceRef.current && raw) {
      sourceRef.current.next(raw);
    }
  });

  return (
    <InputContext.Provider value={ctx}>
      <Input snapshot={currSnapshot} onChange={onChange} />
    </InputContext.Provider>
  );
};
