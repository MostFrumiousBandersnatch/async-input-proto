import { ParsedSnapshot, Token } from '@root/engine/types';


export const breakString = (raw: string): string[] =>
  raw.split(/\s+/).filter(token => token.length > 0);

export const genTokenId = (token: Token): string => `${token.content}_${token.start}`;

export const tokenProcessor = (raw: string): ParsedSnapshot => {
  const tokens = breakString(raw).reduce((parsed, rawPart) => {
    const prev = parsed.at(-1);
    const start = raw.indexOf(rawPart, prev?.end || 0);

    const token: Token = {
      content: rawPart,
      start: start,
      end: start + rawPart.length,
      spaceBefore: prev ? start - prev.end : start,
      ghost: false
    };

    return [
      ...parsed,
      {
        ...token,
       id: genTokenId(token)
      },
    ];
  }, []);

  return {
    raw,
    parsed: tokens,
  };
};

