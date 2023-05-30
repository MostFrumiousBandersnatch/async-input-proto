import type { Observable } from 'rxjs';

export interface Token {
  content: string;
  start: number;
  end: number;
  spaceBefore: number;
  ghost: boolean;
}

interface Identified {
  id: string;
}

interface Colored {
  color: string;
}

interface RoleAware {
  role: string;
}

interface WithSuggestions {
  variants: string[];
}

export interface ParsedToken
  extends Token,
    Identified,
    Partial<Colored>,
    Partial<RoleAware> {}

export interface TokenWithSuggestions
  extends ParsedToken,
    Partial<WithSuggestions> {}

export interface ParsedSnapshot {
  raw: string;
  parsed: TokenWithSuggestions[];
}

export type Tokenizer = (raw: string) => ParsedSnapshot;
export type AsyncTokenizer = (raw: string) => Promise<ParsedSnapshot>;
export type StreamTokenizer = (raw: string) => Observable<ParsedSnapshot>;

export interface Interpretation<D> {
  name: string;
  tokens: TokenWithSuggestions[];
  data: D | null;
}

export interface MultipleResponse<D> {
  raw: string;
  alternatives: Interpretation<D>[];
}

export type Interpreter<D> = (raw: string) => MultipleResponse<D>;
export type StreamedInterpreter<D> = (
  raw: string
) => Observable<MultipleResponse<D>>;