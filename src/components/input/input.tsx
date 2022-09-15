import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames  from 'classnames';

import { Token } from '@root/components/token/token';

import { ParsedSnapshot } from '@root/engine/types';

import './input.scss';

interface InputProps {
  snapshot: ParsedSnapshot | null;
  onChange: (value: string) => void;
}

export const Input = ({ snapshot, onChange }: InputProps) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (snapshot?.raw === (inputRef.current as HTMLInputElement)?.value) {
      setTokens(snapshot.parsed);
      setLoading(false);
    }
  }, [snapshot]);

  const onInput = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const raw = evt.target.value;

      onChange(raw);
      setLoading(true);
    },
    [onChange]
  );

  return (
    <div className={classNames(['async-input', {loading}])}>
      <div className="layer tags">
        {tokens.map((token, n) => (
          <Token {...token} key={`${n}_${token.content}`} />
        ))}
      </div>
      <input
        type="text"
        className="layer"
        spellCheck="false"
        ref={inputRef}
        onInput={onInput}
      />
      <div className="spinner" />
    </div>
  );
};
