import { ParsedToken } from '@root/engine/types';
import { repeat } from '@root/utils/misc';
import React from 'react';

import './token.scss';

export type TokenProps = ParsedToken;

export const Token = ({ content, color, role, spaceBefore }: TokenProps) => (
  <>
    {spaceBefore > 0 && (
        <span className="gap">{repeat(' ', spaceBefore).join('')}</span>
    )}

    <span className="token" data-role={role} style={{ backgroundColor: color }}>
      {content}
    </span>
  </>
);
