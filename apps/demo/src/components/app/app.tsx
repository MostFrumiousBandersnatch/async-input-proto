import React, { useMemo, useReducer, useState } from 'react';

import {
  AsyncInput,
  AsyncTokenizer,
  InputContextType,
  StreamInput,
  StreamTokenizer,
} from '@async-input/widget';

import {
  dummyTokenProcessor,
  dummyTokenStreamProcessor,
} from './dummy/processor';

//TODO: fix import of styles
import '@async-input/widget/dist/output.css';
import './app.scss';

export const App = () => {
  const [debug, toggleDebug] = useReducer(x => !x, true);
  const [slowFactor, setSlowFactor] = useState(1);
  const [throttleFactor, setThrottleFactor] = useState(0);
  const [engine, setEngine] = useState<'async' | 'stream'>('async');

  const processor = useMemo(
    () =>
      (engine === 'async' ? dummyTokenProcessor : dummyTokenStreamProcessor)({
        slowFactor,
      }),
    [slowFactor, engine]
  );

  const ctx = useMemo<InputContextType>(
    () => ({
      debug,
      placeholder: 'start here...',
      hint: engine,
      debounceTime: throttleFactor * 100
    }),
    [debug, engine, throttleFactor]
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
            <td rowSpan={2}>
              <fieldset>
                <legend>Engine:</legend>
                <div>
                  <input
                    type="radio"
                    name="engine"
                    value="async"
                    id="eng_async"
                    checked={engine === 'async'}
                    onChange={evt => {
                      setEngine(evt.target.value as 'async');
                    }}
                  />
                  <label htmlFor="eng_async">Async</label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="engine"
                    value="stream"
                    id="eng_stream"
                    checked={engine === 'stream'}
                    onChange={evt => {
                      setEngine(evt.target.value as 'stream');
                    }}
                  />
                  <label htmlFor="eng_stream">Streamed</label>
                </div>
              </fieldset>
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
          <tr>
            <td>
              <label htmlFor="throttle">Throttle factor</label>
            </td>
            <td>
              <input
                type="range"
                min="0"
                max="5"
                id="slow"
                value={throttleFactor}
                onChange={evt => {
                  setThrottleFactor(evt.target.valueAsNumber);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      {engine === 'async' && (
        <AsyncInput processor={processor as AsyncTokenizer} ctx={ctx} />
      )}
      {engine === 'stream' && (
        <StreamInput processor={processor as StreamTokenizer} ctx={ctx} />
      )}
    </div>
  );
};
