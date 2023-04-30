import { StreamedInterpreter, toTokens } from '@async-input/widget';
import { of } from 'rxjs';

export interface KPIData {
  title: string;
  description?: string;
}

export const KPIInterpreter: StreamedInterpreter<KPIData> = raw => {
  const snap = toTokens(raw);
  const leadingToken = snap.parsed[0];

  if (['roas', 'roi', 'cpm', 'cpc'].includes(leadingToken?.content)) {
    return of({
      raw: snap.raw,
      alternatives: [
        {
          name: 'description',
          tokens: snap.parsed.map((token, i) => ({
            ...token,
            color: 'lightgrey',
            role: i === 0 ? 'key' : '***',
          })),
          data: { title: `description of ${leadingToken.content}` },
        },
        {
          name: 'formula',
          tokens: snap.parsed.map((token, i) => ({
            ...token,
            color: 'lightblue',
            role: i === 0 ? 'key' : '***',
          })),
          data: { title: `formula of ${leadingToken.content}` },
        },
      ],
    });
  } else {
    return of({
      raw: snap.raw,
      alternatives: [
        {
          name: '???',
          tokens: snap.parsed,
          data: null,
        },
      ],
    });
  }
};
