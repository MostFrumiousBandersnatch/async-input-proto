import { OrchestratorContextAware } from '@widget/components/orchestrator/ctx';
import React, { useContext, useEffect, useState } from 'react';

export interface AlternativesSelectorProps<T> {
  alternatives: T[];
  selected?: number;
  onChange: (_: number) => void;
}

interface SelectorWrapperProps<T, D> extends OrchestratorContextAware<D> {
  selectorComp: React.FC<AlternativesSelectorProps<T>>;
}

export function SelectorWrapper<D>({
  selectorComp,
  contextInstance,
}: SelectorWrapperProps<string, D>) {
  const ctx = useContext(contextInstance);
  const [alternatives, setAlternatives] = useState([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (ctx) {
      ctx.intepreterStream.subscribe({
        next: response => {
          setAlternatives(response.alternatives.map(({ name }) => name));
        },
      });
    }
  }, [ctx]);

  useEffect(() => {
    setSelected(0);
  }, [alternatives]);

  useEffect(() => {
    if (ctx) {
      ctx.alternativesStream.next(alternatives[selected]);
    }
  }, [alternatives, selected, ctx]);

  return selectorComp({ alternatives, onChange: setSelected, selected });
}
