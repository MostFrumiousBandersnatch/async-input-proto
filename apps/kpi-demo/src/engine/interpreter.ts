import { StreamedInterpreter, toTokens } from '@async-input/widget';
import { of } from 'rxjs';

export const KPIInterpreter: StreamedInterpreter = raw => {
  const snap = toTokens(raw);
  const leadingToken = snap.parsed[0];

  if (['roas', 'roi', 'cpm', 'cpc'].includes(leadingToken?.content)) {
    return of({
      raw: snap.raw,
      alternatives: [
        {
          name: 'description',
          snapshot: snap.parsed.map((token, i) => ({
            ...token,
            color: 'lightgrey',
            role: i === 0 ? 'key' : '***',
          })),
        },
        {
          name: 'formula',
           snapshot: snap.parsed.map((token, i) => ({
            ...token,
            color: 'lightblue',
            role: i === 0 ? 'key' : '***',
          })),
        },
      ],
    });
  } else {
    return of({
      raw: snap.raw,
      alternatives: [
        {
          name: '???',
          snapshot: snap.parsed,
        },
      ],
    });
  }
};
