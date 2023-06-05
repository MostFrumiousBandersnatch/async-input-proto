
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
          setLoading(false);
          setSnapshot(alternative.snapshot);
        },
      });
    }
  }, [ctx]);

  const onChange = useCallback(
    (raw: string) => {
      if (ctx) {
        ctx.inputStream.next(raw);
        setLoading(true);
      }
    },
    [ctx]
  );

  return <Input snapshot={snapshot} onChange={onChange} loading={loading} />;
}