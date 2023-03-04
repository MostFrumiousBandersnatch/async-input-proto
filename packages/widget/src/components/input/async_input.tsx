import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@widget/components/input/input';
import { InputContext, InputContextType } from '@widget/components/input/ctx';

import { AsyncTokenizer, ParsedSnapshot } from '@widget/engine/types';
import { debounce } from 'lodash';

export interface AsyncInputProps {
  processor: AsyncTokenizer;
  ctx: InputContextType;
}

const buildProcessor = (
  innerProcessor: AsyncTokenizer,
  onChange: (snap: ParsedSnapshot) => void,
  ctx: InputContextType
): ((raw: string) => Promise<void>) => {
  const process = async (raw: string) => {
    const snapshot = await innerProcessor(raw);
    onChange(snapshot);
  };

  if (ctx.debounceTime > 0) {
    return debounce(process, ctx.debounceTime, { trailing: true });
  } else {
    return process;
  }
};

export const AsyncInput: React.FC<AsyncInputProps> = ({ processor, ctx }) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);

  //ugly trick to decouple underlying input from processor's instance
  const processorRef = useRef(processor);

  useEffect(() => {
    processorRef.current = processor;
  }, [processor]);

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const process = useCallback(
    buildProcessor(processorRef.current, setCurrSnapshot, ctx),
    [processorRef, setCurrSnapshot, ctx]
  );

  return (
    <InputContext.Provider value={ctx}>
      <Input snapshot={currSnapshot} onChange={process} />
    </InputContext.Provider>
  );
};
