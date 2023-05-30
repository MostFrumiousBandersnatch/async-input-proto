import {
  ParsedSnapshot,
  ParsedToken,
  TokenWithSuggestions,
} from '@async-input/types';

const getGhostTokens = (snp: ParsedSnapshot): ParsedToken[] =>
  snp.parsed.filter(token => token.ghost);

/**
 * Checks wether given token is the first one among the ghost tokens of given snapshot
 * @param snp {ParsedSnapshot} parsed snapshot to inspect
 * @param token {ParsedToken} token to check
 * @returns Boolean
 */
export const isEdgeToken = (snp: ParsedSnapshot, token: ParsedToken): boolean =>
  getGhostTokens(snp)[0]?.id === token.id;

export const getActualVariants = (token: TokenWithSuggestions): string[] => {
  const variants = token.variants || [];
  return token.ghost
    ? variants
    : variants.filter(
        text => text.startsWith(token.content) && text !== token.content
      );
};
