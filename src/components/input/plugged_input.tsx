import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Input,
  InputContext,
  InputContextType,
} from '@root/components/input/input';
import { AsyncTokenizer } from '@root/engine/types';

export interface PluggedInputProps {
  processor: AsyncTokenizer;
  ctx: InputContextType;
}

export const PluggedInput = ({ processor, ctx }: PluggedInputProps) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);

  //ugly trick to decouple underlying input from processor instance
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
