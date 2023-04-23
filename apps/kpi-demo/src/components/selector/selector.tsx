import React from 'react';
import classNames from 'classnames';

import { AlternativesSelectorProps } from '@async-input/widget';

import './selector.scss';

export const Selector: React.FC<AlternativesSelectorProps<string>> = ({
  alternatives,
  onChange,
  selected = 0,
}) => {
  return (
    <ul className={classNames('selector', {empty: alternatives.length <= 1})}>
      {alternatives.length > 1 &&
        alternatives.map((value, n) => (
          <li
            key="value"
            className={classNames({
              alternative: true,
              selected: n === selected,
            })}
            onClick={() => {
              onChange(n);
            }}
          >
            {value}
          </li>
        ))}
    </ul>
  );
};
