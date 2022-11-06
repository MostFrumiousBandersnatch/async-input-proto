import { delay } from '@root/utils/async';
import { ParsedSnapshot, Token } from '@root/engine/types';
import { tokenProcessor } from '@root/engine/tokenizer';


interface FakeTokenProcessorOptions {
  slowFactor: number;
}

const COLORS = ['lightblue', 'lightgreen', 'cadetblue'];

export const pickColor = (token: Token): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

export const dummyTokenProcessor = async (
  raw: string,
  options: FakeTokenProcessorOptions
): Promise<ParsedSnapshot> => {
  const res = tokenProcessor(raw);
  res.parsed = res.parsed.map(token => ({
    ...token,
    color: pickColor(token),
    role: token.content.length > 2 ? `len(${token.content.length})` : '',
    variants: token.content === 'ip' ? ['ipa', 'ipsum'] : token.variants,
  }));

  const del = Math.random() * 1000;
  await delay(del * options.slowFactor);
  return res;
};