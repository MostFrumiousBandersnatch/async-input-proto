import { ParsedSnapshot } from '@root/engine/types';
import { delay } from '@root/utils/async';

const COLORS = ['lightblue', 'lightgreen', 'cadetblue'];

const pickColor = (content: string): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const breakString = (raw: string): string[] =>
  raw.split(/\s+/).filter(token => token.length > 0);

export interface TokenProcessorOptions {
  slowFactor: number;
}

export const tokenProcessor = async (raw: string, options: TokenProcessorOptions): Promise<ParsedSnapshot> => {
  const tokens = breakString(raw).reduce((parsed, token) => {
    const prev = parsed.at(-1);
    const start = raw.indexOf(token, prev?.end || 0);
    return [
      ...parsed,
      {
        content: token,
        start: start,
        end: start + token.length,
        color: pickColor(token),
        spaceBefore: prev ? start - prev.end : start,
        role: token.length > 2 ? `len(${token.length})` : '',
      },
    ];
  }, []);

  const del = Math.random() * 1000;
  await delay(del * options.slowFactor);

  return {
    raw,
    parsed: tokens,
  };
};
