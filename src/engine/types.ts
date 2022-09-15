export interface Token {
  content: string;
  start: number;
  end: number;
  spaceBefore: number;
}

interface Colored {
  color: string;
}

interface RoleAware {
  role?: string;
}

export interface ParsedToken extends Token, Colored, RoleAware {}

export interface ParsedSnapshot {
  raw: string;
  parsed: ParsedToken[];
}
