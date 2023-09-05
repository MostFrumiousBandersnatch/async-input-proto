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
interface Scored {
  score: number;
}

interface WithSuggestions {
  variants: string[];
}
export interface ParsedToken extends BareToken, Identified {
  start: number;
  end: number;
  spaceBefore: number;
}

export interface TemplateToken
  extends Identified,
    WithSuggestions,
    RoleAware,
    Partial<Colored> {}

export interface NestedTemplateToken extends TemplateToken {
  branches?: Record<string, NestedTemplateToken>;
}

export const DEFAULT_BRANCH = '__default';

export enum InterpretationResult {
  notRecognized = 0,
  matched = 4,
  misMatched = 1,
  partiallyMatched = 3,
  suggested = 2,
}

export interface InterpretedToken
  extends ParsedToken,
    Partial<WithSuggestions>,
    Partial<RoleAware>,
    Partial<Colored>,
    Partial<Scored> {
  status: InterpretationResult;
  matchRate?: number;
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

export type AsyncProcessor = (raw: string) => Promise<InterpretedSnapshot>;

export type StreamProcessor = (raw: string) => Observable<InterpretedSnapshot>;
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