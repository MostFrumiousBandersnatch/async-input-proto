import { Input } from '@widget/components/input/input';
import { OrchestratorContextAware } from '@widget/components/orchestrator/ctx';
import { ParsedSnapshot } from '@widget/engine/types';
import React, { useCallback, useContext, useEffect, useState } from 'react';

type InputWrapperProps<D> = OrchestratorContextAware<D>;

export function InputWrapper<D>({ contextInstance }: InputWrapperProps<D>) {
  const ctx = useContext(contextInstance);
  const [snapshot, setSnapshot] = useState<ParsedSnapshot>();
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
