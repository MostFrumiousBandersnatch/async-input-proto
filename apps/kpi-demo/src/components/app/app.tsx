import React, { useMemo } from 'react';

import {
  Orchestrator,
  SelectorWrapper,
  InputWrapper,
  InputContextType,
  InputContext,
} from '@async-input/widget';
import { Selector } from 'components/selector/selector';
import { KPIInterpreter } from 'engine/interpreter';

import './app.scss';
import '@async-input/widget/dist/output.css';

export const App = () => {
  const inputCtx = useMemo<InputContextType>(
    () => ({ debug: false, placeholder: '...' }),
    []
  );

  return (
    <div className="app">
      <Orchestrator interpreter={KPIInterpreter}>
        <InputContext.Provider value={inputCtx}>
          <InputWrapper />
          <SelectorWrapper selectorComp={Selector} />
        </InputContext.Provider>
      </Orchestrator>
    </div>
  );
};
