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
import { Preview } from 'components/preview/preview';
import { kpiOrchContext } from 'engine/ctx';

export const App = () => {
  const inputCtx = useMemo<InputContextType>(
    () => ({ debug: false, placeholder: '...' }),
    []
  );

  return (
    <div className="app">
      <Orchestrator
        interpreter={KPIInterpreter}
        contextInstance={kpiOrchContext}
      >
        <InputContext.Provider value={inputCtx}>
          <InputWrapper contextInstance={kpiOrchContext} />
          <SelectorWrapper
            selectorComp={Selector}
            contextInstance={kpiOrchContext}
          />
          <Preview />
        </InputContext.Provider>
      </Orchestrator>
    </div>
  );
};