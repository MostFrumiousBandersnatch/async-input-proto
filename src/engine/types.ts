export interface Token {
  content: string;
  start: number;
  end: number;
  spaceBefore: number;
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

export interface ParsedToken extends Token, Identified, Partial<Colored>, Partial<RoleAware> {}

export interface TokenWithSuggestions extends ParsedToken, Partial<WithSuggestions> {}
export interface ParsedSnapshot {
  raw: string;
  append?: string;
  parsed: TokenWithSuggestions[];
}
