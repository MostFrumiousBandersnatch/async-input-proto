import { InputContext } from '@widget/components/input/ctx';
import { InterpretationResult, InterpretedToken } from '@async-input/types';
import { repeat } from '@widget/utils/misc';
import React, { useContext } from 'react';

import './token.scss';

const getRoleWidth = (role: string): number => 6 * role.length + 4;

const genClipPath = (role = ''): string => {
  const roleWidth = getRoleWidth(role);
  return `polygon(0 12px, calc(100% - ${roleWidth}px) 12px, calc(100% - ${roleWidth}px) 0, 100% 0, 100% 100%, 0 100%)`;
};

export interface TokenProps extends InterpretedToken {
  highlighted: boolean;
  trailing: boolean;
  currVariant: number;
  applyVariant: (_: string) => void;
}

export const Token = ({
  content,
  color,
  role,
  status,
  spaceBefore,
  highlighted,
  variants = [],
  currVariant,
  applyVariant,
}: TokenProps) => {
  const { debug } = useContext(InputContext);

  const ghost = status === InterpretationResult.suggested;

  return (
    <>
      {spaceBefore > 0 && (
        <span className="gap">{repeat(' ', spaceBefore).join('')}</span>
      )}

      <span
        className={`token ${debug ? 'debug' : ''} ${
          highlighted ? 'focused' : ''
        }`}
      >
        <span
          className="token-inner"
          data-role={role}
          style={{
            background: color,
            color: debug ? 'inherit' : 'transparent',
            clipPath: genClipPath(role),
            //to show role correctly
            ...(!ghost && role ? { minWidth: `${role.length * 7 + 5}px` } : {}),
          }}
        >
          {content}
        </span>
        {variants?.length > 0 && (
          <ul className="variants">
            {variants.map((text, n) => (
              <li
                key={text}
                className={currVariant === n ? 'current' : ''}
                onClick={evt => {
                  evt.preventDefault();
                  evt.stopPropagation();

                  applyVariant(text);
                }}
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </span>
    </>
  );
};