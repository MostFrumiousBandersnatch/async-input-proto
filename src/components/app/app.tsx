import React, { useCallback, useReducer, useState } from 'react';

import { Input, InputContext } from '@root/components/input/input';

import { delay } from '@root/utils/async';
import { ParsedSnapshot } from '@root/engine/types';
import { tokenProcessor } from '@root/engine/tokenizer';

import './app.css';

interface FakeTokenProcessorOptions {
  slowFactor: number;
}

const dummyTokenProcessor = async (
  raw: string,
  options: FakeTokenProcessorOptions
): Promise<ParsedSnapshot> => {
  const res = tokenProcessor(raw);
  const del = Math.random() * 1000;
  await delay(del * options.slowFactor);
  return res;
};

export const App = () => {
  const [currSnapshot, setCurrSnapshot] = useState(null);

  const [debug, toggleDebug] = useReducer(x => !x, false);
  const [slowFactor, setSlowFactor] = useState(1);

  const process = useCallback(
    async (raw: string) => {
      const snapshot = await dummyTokenProcessor(raw, { slowFactor });
      setCurrSnapshot(snapshot);
    },
    [setCurrSnapshot, slowFactor]
  );

  return (
    <div className="app">
      <InputContext.Provider value={{ debug }}>
        <Input snapshot={currSnapshot} onChange={process} />
      </InputContext.Provider>
      <table id="settings">
        <tr>
          <td>
            <label htmlFor="debug-toggle">Debug mode</label>
          </td>
          <td>
            <input
              type="checkbox"
              id="debug-toggle"
              name="debug-mode"
              checked={debug}
              onChange={toggleDebug}
            />
          </td>
        </tr>
        <tr>
          <td>
            <label htmlFor="slow">Slow factor</label>
          </td>
          <td>
            <input
              type="range"
              min="0"
              max="5"
              id="slow"
              value={slowFactor}
              onChange={evt => {
                setSlowFactor(evt.target.valueAsNumber);
              }}
            />
          </td>
        </tr>
      </table>
    </div>
  );
};
