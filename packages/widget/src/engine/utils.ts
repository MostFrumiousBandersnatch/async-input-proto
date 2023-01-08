import {
  ParsedSnapshot,
  ParsedToken,
  TokenWithSuggestions,
} from '@widget/engine/types';

const getGhostTokens = (snp: ParsedSnapshot): ParsedToken[] =>
  snp.parsed.filter(token => token.ghost);

export const isEdgeToken = (snp: ParsedSnapshot, token: ParsedToken): boolean =>
  getGhostTokens(snp)[0]?.id === token.id;

export const getActualVariants = (token: TokenWithSuggestions): string[] => {
  const variants = token.variants || [];
  return token.ghost
    ? variants
    : variants.filter(text => text.startsWith(token.content) && text !== token.content);
};
