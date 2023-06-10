import {
  InterpretedSnapshot,
  Interpreter,
  ParsedSnapshot,
  ParsedToken,
  Tokenizer,
} from '@async-input/types';

export const breakString = (raw: string): string[] =>
  raw.split(/\s+/).filter(token => token.length > 0);

export const genTokenId = (token: ParsedToken): string =>
  `${token.content}_${token.start}`;

export const parse: Tokenizer = raw => {
  const tokens = breakString(raw).reduce<ParsedToken[]>((parsed, rawPart) => {
    const prev = parsed.at(-1);
    const start = raw.indexOf(rawPart, prev?.end || 0);

    parsed.push({
      content: rawPart,
      start: start,
      end: start + rawPart.length,
      spaceBefore: prev ? start - prev.end : start,
    });

    return parsed;
  }, []);

  return {
    raw,
    parsed: tokens,
  };
};

//default interpretation
export const interpret: Interpreter = (snap: ParsedSnapshot) => ({
  ...snap,
  interpreted: snap.parsed.map(token => ({
    ...token,
    id: genTokenId(token),
    ghost: false,
  })),
});

export const defaultInterpret = (raw: string): InterpretedSnapshot =>
  interpret(parse(raw));
