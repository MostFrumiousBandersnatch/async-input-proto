import type { Observable } from 'rxjs';

interface BareToken {
  content: string;
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
export interface ParsedToken extends BareToken {
  start: number;
  end: number;
  spaceBefore: number;
}

export interface TemplateToken
  extends Identified, WithSuggestions,
    RoleAware,
    Partial<Colored> {
      optional: boolean;
    }

export interface InterpretedToken
  extends ParsedToken,
    Identified,
    Partial<WithSuggestions>,
    Partial<RoleAware>,
    Partial<Colored> {
      ghost: boolean;
    }
export interface ParsedSnapshot {
  raw: string;
  parsed: ParsedToken[];
}

export interface InterpretedSnapshot extends Pick<ParsedSnapshot, 'raw'> {
  interpreted: InterpretedToken[];
}

export type Tokenizer = (raw: string) => ParsedSnapshot;

export type Interpreter = (snap: ParsedSnapshot) => InterpretedSnapshot;

export type AsyncProcessor = (
  raw: string
) => Promise<InterpretedSnapshot>;

export type StreamProcessor = (
  raw: string
) => Observable<InterpretedSnapshot>;
export interface Interpretation<D> {
  name: string;
  tokens: InterpretedToken[];
  data: D | null;
}

export interface MultipleResponse<D> {
  raw: string;
  alternatives: Interpretation<D>[];
}

export type MultiInterpreter<D> = (snap: ParsedSnapshot) => MultipleResponse<D>;
export type StreamMultiProcessor<D> = (
  raw: string
) => Observable<MultipleResponse<D>>;
