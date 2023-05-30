import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@widget/components/input/input';
import { InputContext, InputContextType } from '@widget/components/input/ctx';

import type { AsyncTokenizer, ParsedSnapshot } from '@async-input/types';
import debounce from 'lodash.debounce';

export interface AsyncInputProps {
  processor: AsyncTokenizer;
  ctx: InputContextType;
}

const buildProcessor = (
  innerProcessor: AsyncTokenizer,
  onChange: (snap: ParsedSnapshot) => void,
  setLoading: (_: boolean) => void,
  ctx: InputContextType
): ((raw: string) => Promise<void>) => {
  const process = async (raw: string) => {
    setLoading(true);
    const snapshot = await innerProcessor(raw);
    onChange(snapshot);
    setLoading(false);
  };

  if (ctx.debounceTime > 0) {
    return debounce(process, ctx.debounceTime, { trailing: true });
  } else {
    return process;
  }
};

export const AsyncInput: React.FC<AsyncInputProps> = ({ processor, ctx }) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  //ugly trick to decouple underlying input from processor's instance
  const processorRef = useRef(processor);

  useEffect(() => {
    processorRef.current = processor;
  }, [processor]);

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const process = useCallback(
    buildProcessor(
      processorRef.current,
      setCurrSnapshot,
      setLoading,
      ctx
    ),
    [processorRef, setCurrSnapshot, ctx]
  );

  return (
    <InputContext.Provider value={ctx}>
      <Input snapshot={currSnapshot} onChange={process} loading={loading} />
    </InputContext.Provider>
  );
};