import React, { useContext, useEffect, useState } from 'react';
import { OrchestratorContextAware } from '@widget/components/orchestrator/ctx';
import { Interpretation } from '@widget/../../types/dist';

export interface AlternativesSelectorProps<T> {
  options: T[];
  selected?: T;
  onChange: (_: T) => void;
}

interface SelectorWrapperProps<D> extends OrchestratorContextAware<D> {
  selectorComp: React.FC<AlternativesSelectorProps<Interpretation<D>['name']>>;
}

export function SelectorWrapper<D>({
  selectorComp,
  contextInstance,
}: SelectorWrapperProps<D>) {
  const ctx = useContext(contextInstance);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState<Interpretation<D>['name']>();

  useEffect(() => {
    if (ctx) {
      ctx.intepreterStream.subscribe({
        next: response => {
          setOptions(response.alternatives.map(({ name }) => name));
        },
      });
    }
  }, [ctx]);

  useEffect(() => {
    if (!options.includes(selected)) {
      setSelected(options[0]);
    }
  }, [options, selected]);

  useEffect(() => {
    if (ctx && selected) {
      ctx.alternativesStream.next(selected);
    }
  }, [selected, ctx]);

  return selectorComp({ options, onChange: setSelected, selected });
}
