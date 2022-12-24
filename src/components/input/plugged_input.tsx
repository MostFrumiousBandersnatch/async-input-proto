import React, { useCallback, useState } from 'react';

import { Input } from '@root/components/input/input';
import { AsyncTokenizer } from '@root/engine/types';

export interface PluggedInputProps {
  processor: AsyncTokenizer;
}

export const PluggedInput = ({ processor }: PluggedInputProps) => {
  const [currSnapshot, setCurrSnapshot] = useState(null);
  const process = useCallback(
    async (raw: string) => {
      const snapshot = await processor(raw);
      setCurrSnapshot(snapshot);
    },
    [processor, setCurrSnapshot]
  );

  return <Input snapshot={currSnapshot} onChange={process} />;
};
