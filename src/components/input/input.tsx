import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import { Token } from '@root/components/token/token';

import { ParsedSnapshot, TokenWithSuggestions } from '@root/engine/types';

import './input.scss';
import { cyclicShift } from '@root/utils/misc';
import { getActualVariants, isEdgeToken } from '@root/engine/utils';

interface InputContextType {
  debug: boolean;
}

export const InputContext = React.createContext<InputContextType | null>(null);

interface InputProps {
  snapshot: ParsedSnapshot | null;
  onChange: (value: string) => void;
}

export const Input = ({ snapshot, onChange }: InputProps) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const [selection, setSelection] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const input = inputRef.current as HTMLInputElement;

    if (snapshot?.raw === input.value) {
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

  const onSelectionChange = useCallback(() => {
    if (inputRef.current) {
      setSelection([
        inputRef.current &&
          (inputRef.current as HTMLInputElement).selectionStart,
        inputRef.current && (inputRef.current as HTMLInputElement).selectionEnd,
      ]);
    }
  }, [inputRef]);

  const currToken = useMemo<TokenWithSuggestions | undefined>(() => {
    if (snapshot && selection[0] === selection[1]) {
      return snapshot.parsed.find(
        ({ start, end }) => selection[0] >= start && selection[0] <= end
      );
    }
  }, [snapshot, selection]);

  const currVariants = useMemo(
    () => currToken && getActualVariants(currToken),
    [currToken]
  );
  const [currVariant, setCurrVariant] = useState(0);

  useEffect(() => {
    setCurrVariant(0);
  }, [currVariants]);

  const onKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      if (inputRef.current && currVariants?.length > 0) {
        switch (evt.code) {
          case 'ArrowUp':
            evt.preventDefault();
            setCurrVariant(value =>
              cyclicShift(value, -1, currVariants.length)
            );
            break;

          case 'ArrowDown':
            evt.preventDefault();
            setCurrVariant(value => cyclicShift(value, 1, currVariants.length));
            break;

          case 'Tab':
          case 'Enter': {
            evt.preventDefault();
            //TODO: decouple from currVariant
            const isAtEdge = isEdgeToken(snapshot, currToken);
            const input = inputRef.current as HTMLInputElement;

            input.setRangeText(
              currVariants[currVariant] + (isAtEdge ? ' ' : ''),
              currToken.start,
              currToken.end,
              'end'
            );

            onChange(input.value);
          }
        }
      }
    },
    [
      snapshot,
      currToken,
      currVariants,
      setCurrVariant,
      inputRef,
      currVariant,
      onChange,
    ]
  );

  return (
    <div className={classNames(['async-input', { loading }])}>
      <div className="layer tags">
        {tokens.map(token => (
          <Token
            {...token}
            variants={currVariants}
            key={token.id}
            highlighted={token.id === currToken?.id}
            currVariant={currVariant}
          />
        ))}
      </div>
      <input
        type="text"
        className="layer"
        spellCheck="false"
        ref={inputRef}
        onChange={onInput}
        onKeyDown={onKeyDown}
        onSelect={onSelectionChange}
      />
      <div className="spinner" />
    </div>
  );
};
