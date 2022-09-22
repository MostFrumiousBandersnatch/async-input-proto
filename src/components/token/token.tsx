import { InputContext } from '@root/components/input/input';
import { ParsedToken } from '@root/engine/types';
import { repeat } from '@root/utils/misc';
import React, { useContext } from 'react';

import './token.scss';

export type TokenProps = ParsedToken;

export const Token = ({ content, color, role, spaceBefore }: TokenProps) => {
  const { debug } = useContext(InputContext);
  return (
    <>
      {spaceBefore > 0 && (
        <span className="gap">{repeat(' ', spaceBefore).join('')}</span>
      )}

      <span
        className="token"
        data-role={role}
        style={{ backgroundColor: color, color: debug ? 'inherit' : color }}
      >
        {content}
      </span>
    </>
  );
};
