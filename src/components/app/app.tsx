import React, { useCallback, useState } from 'react';

import { Input } from '@root/components/input/input';
import { tokenProcessor } from '@root/engine/tokenizer';

import './app.css';

export const App = () => {
  const [currSnapshot, setCurrSnapshot] = useState(null);

  const process = useCallback(
    async (raw: string) => {
      const snapshot = await tokenProcessor(raw);
      setCurrSnapshot(snapshot);
    },
    [setCurrSnapshot]
  );

  return (
    <div className="app">
      <Input snapshot={currSnapshot} onChange={process} />
    </div>
  );
};
