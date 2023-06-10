import React from 'react';
import classNames from 'classnames';

import { AlternativesSelectorProps } from '@async-input/widget';

import './selector.scss';

export const Selector: React.FC<AlternativesSelectorProps<string>> = ({
  options,
  onChange,
  selected,
}) => {
  return (
    <ul className={classNames('selector', { empty: options.length <= 1 })}>
      {options.length > 1 &&
        options.map(value => (
          <li
            key={value}
            className={classNames({
              alternative: true,
              selected: value === selected,
            })}
            onClick={() => {
              onChange(value);
            }}
          >
            {value}
          </li>
        ))}
    </ul>
  );
};
