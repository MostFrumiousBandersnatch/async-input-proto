import { delay } from '@root/utils/async';
import { ParsedSnapshot, Token, TokenWithSuggestions } from '@root/engine/types';
import { tokenProcessor } from '@root/engine/tokenizer';


interface FakeTokenProcessorOptions {
  slowFactor: number;
}

type Injector = (raw: string) => Partial<TokenWithSuggestions>;

const COLORS = ['lightblue', 'lightgreen', 'cadetblue'];

export const pickColor = (token: Token): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];


const injectors: Injector[] = [
  raw => raw === 'ip'
  ? {
    variants: ['ipa', 'ipsum'],
    role: '***'
  } : {}
]

export const dummyTokenProcessor = async (
  raw: string,
  options: FakeTokenProcessorOptions
): Promise<ParsedSnapshot> => {
  const res = tokenProcessor(raw);
  res.parsed = res.parsed.map(token => ({
    ...token,
    color: pickColor(token),
    role: token.content.length > 2 ? `len(${token.content.length})` : '',
    ...(
        injectors.map(
          inj => inj(token.content)
        ).reduce(
          Object.assign, {}
        )
    )
  }));

  const del = Math.random() * 1000;
  await delay(del * options.slowFactor);
  return res;
};