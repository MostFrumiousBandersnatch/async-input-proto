import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@widget/components/input/input';
import { InputContext, InputContextType } from '@widget/components/input/ctx';

import { AsyncTokenizer } from '@widget/engine/types';

export interface AsyncInputProps {
  processor: AsyncTokenizer;
  ctx: InputContextType;
}

export const AsyncInput: React.FC<AsyncInputProps> = ({ processor, ctx }) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);

  //ugly trick to decouple underlying input from processor's instance
  const processorRef = useRef(processor);

  useEffect(() => {
    processorRef.current = processor;
  }, [processor]);

  const process = useCallback(
    async (raw: string) => {
      const snapshot = await processorRef.current(raw);
      setCurrSnapshot(snapshot);
    },
    [processorRef, setCurrSnapshot]
  );

  return (
    <InputContext.Provider value={ctx}>
      <Input snapshot={currSnapshot} onChange={process} />
    </InputContext.Provider>
  );
};