import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Input } from '@widget/components/input/input';
import { OrchestratorContextAware } from '@widget/components/orchestrator/ctx';
import type { InterpretedSnapshot } from '@async-input/types';

type InputWrapperProps<D> = OrchestratorContextAware<D>;

export function InputWrapper<D>({ contextInstance }: InputWrapperProps<D>) {
  const ctx = useContext(contextInstance);
  const [snapshot, setSnapshot] = useState<InterpretedSnapshot>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ctx) {
      ctx.feedbackStream.subscribe({
        next: alternative => {
          setSnapshot(alternative?.snapshot);
          setLoading(false);
        },
      });
    }
  }, [ctx]);

  const onChange = useCallback(
    (raw: string) => {
      if (ctx) {
        setLoading(true);
        ctx.inputStream.next(raw);
      }
    },
    [ctx]
  );

  return <Input snapshot={snapshot} onChange={onChange} loading={loading} />;
}