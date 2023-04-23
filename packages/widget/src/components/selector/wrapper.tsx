import React, { useContext, useEffect, useState } from 'react';

import { OrchestratorContext } from '@widget/components/orchestrator/ctx';

export interface AlternativesSelectorProps<T> {
  alternatives: T[];
  selected?: number;
  onChange: (_: number) => void;
}

interface SelectorWrapperProps<T> {
  selectorComp: React.FC<AlternativesSelectorProps<T>>;
}

export const SelectorWrapper = ({
  selectorComp,
}: SelectorWrapperProps<string>) => {
  const ctx = useContext(OrchestratorContext);
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
    if (ctx.alternativesStream) {
      ctx.alternativesStream.next(alternatives[selected]);
    }
  }, [alternatives, selected, ctx]);

  return selectorComp({ alternatives, onChange: setSelected, selected });
};
