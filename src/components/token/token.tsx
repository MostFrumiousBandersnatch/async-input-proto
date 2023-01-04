import { InputContext } from '@root/components/input/input';
import { TokenWithSuggestions } from '@root/engine/types';
import { repeat } from '@root/utils/misc';
import React, { useContext } from 'react';

import './token.scss';

export interface TokenProps extends TokenWithSuggestions {
  highlighted: boolean;
  currVariant: number;
}

export const Token = ({
  content,
  color,
  role,
  spaceBefore,
  highlighted,
  variants = [],
  currVariant,
}: TokenProps) => {
  const { debug } = useContext(InputContext);

  return (
    <>
      {spaceBefore > 0 && (
        <span className="gap">{repeat(' ', spaceBefore).join('')}</span>
      )}

      <span
        className={`token ${debug ? 'debug' : ''} ${
          highlighted ? 'focused' : ''
        }`}
        data-role={role}
        style={{
          background: color,
          color: debug ? 'inherit' : color,
        }}
      >
        {content}
        {variants?.length > 0 && (
          <ul className="variants">
            {variants.map((text, n) => (
              <li key={text} className={currVariant === n ? 'current' : ''}>
                {text}
              </li>
            ))}
          </ul>
        )}
      </span>
    </>
  );
};
