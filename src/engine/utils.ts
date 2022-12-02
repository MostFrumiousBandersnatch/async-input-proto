import { ParsedSnapshot, ParsedToken } from '@root/engine/types';

const getGhostTokens = (snp: ParsedSnapshot): ParsedToken[] => snp.parsed.filter(token => token.ghost);

export const isEdgeToken = (snp: ParsedSnapshot, token: ParsedToken): boolean =>
  getGhostTokens(snp)[0]?.id === token.id;
