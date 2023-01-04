import React, { useMemo, useReducer, useState } from 'react';

import { InputContextType } from '@root/components/input/input';

import { dummyTokenStreamProcessor } from './dummy/processor';
import {StreamInput} from '@root/components/input/stream_input';

import './app.scss';

export const App = () => {
  const [debug, toggleDebug] = useReducer(x => !x, true);
  const [slowFactor, setSlowFactor] = useState(1);

  const processor = useMemo(
    () => dummyTokenStreamProcessor({ slowFactor }),
    [slowFactor]
  );

  const ctx = useMemo<InputContextType>(() => ({ debug }), [debug]);

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
      <StreamInput processor={processor} ctx={ctx} />
    </div>
  );
};
