import {kpiOrchContext} from 'engine/ctx';
import {KPIData} from 'engine/interpreter';
import React, {useContext, useEffect, useState} from 'react';

export const Preview = () => {
  const ctx = useContext(kpiOrchContext);

  const [data, setData] = useState<KPIData>()

  useEffect(() => {
    if (ctx) {
      ctx.feedbackStream.subscribe({next: ({data: currData}) => {setData(currData)}})
    }
  }, [ctx]);

  return <div className="preview">
    {data && <h3>{data.title}</h3>}
  </div>
}