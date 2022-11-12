import React, { useCallback, useReducer, useState } from 'react';

import { Input, InputContext } from '@root/components/input/input';

import './app.css';
import { dummyTokenProcessor } from './dummyProcessor';

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
      <table id="settings">
        <tbody>
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
        </tbody>
      </table>
      <InputContext.Provider value={{ debug }}>
        <Input snapshot={currSnapshot} onChange={process} />
      </InputContext.Provider>
    </div>
  );
};
