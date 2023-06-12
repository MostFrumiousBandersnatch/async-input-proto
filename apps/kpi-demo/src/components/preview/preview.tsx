import { kpiOrchContext } from 'engine/ctx';
import { KPIData } from 'engine/interpreter';
import React, { useContext, useEffect, useState } from 'react';

export const Preview = () => {
  const ctx = useContext(kpiOrchContext);

  const [data, setData] = useState<KPIData>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (ctx) {
      ctx.feedbackStream.subscribe({
        next: item => {
          setData(item?.data);
          setIsEmpty(item?.snapshot.raw.length === 0);
        },
      });
    }
  }, [ctx]);
  return (
    <div className="preview">
      {data && <h3>{data.title}</h3>}
      {!isEmpty && !data && <pre>not recognized :(</pre>}
    </div>
  );
};
