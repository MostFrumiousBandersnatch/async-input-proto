import { Input } from '@widget/components/input/input';
import { OrchestratorContext } from '@widget/components/orchestrator/ctx';
import { ParsedSnapshot } from '@widget/engine/types';
import React, { useCallback, useContext, useEffect, useState } from 'react';

export const InputWrapper: React.FC = () => {
  const ctx = useContext(OrchestratorContext);
  const [snapshot, setSnapshot] = useState<ParsedSnapshot>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ctx) {
    ctx.feedbackStream.subscribe({
      next: snap => {
        setLoading(false);
        setSnapshot(snap);
      },
    });
    }
  }, [ctx]);

  const onChange = useCallback(
    (raw: string) => {
      ctx.inputStream.next(raw);
      setLoading(true);
    },
    [ctx.inputStream]
  );

  return <Input snapshot={snapshot} onChange={onChange} loading={loading} />;
};