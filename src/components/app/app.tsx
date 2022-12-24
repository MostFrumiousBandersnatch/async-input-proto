import React, { useMemo, useReducer, useState } from 'react';

import { InputContext } from '@root/components/input/input';

import { dummyTokenProcessor } from './dummy/processor';

import './app.css';
import {PluggedInput} from '@root/components/input/plugged_input';

export const App = () => {

  const [debug, toggleDebug] = useReducer(x => !x, true);
  const [slowFactor, setSlowFactor] = useState(1);

  const processor = useMemo(() => dummyTokenProcessor({slowFactor}), [slowFactor]);

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
        <PluggedInput processor={processor} />
      </InputContext.Provider>
    </div>
  );
};
