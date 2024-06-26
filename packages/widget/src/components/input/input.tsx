import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';

import { Token } from '@widget/components/token/token';

import { ParsedSnapshot, TokenWithSuggestions } from '@widget/engine/types';

import './input.scss';
import { cyclicShift } from '@widget/utils/misc';
import { getActualVariants, isEdgeToken } from '@widget/engine/utils';
import { InputContext } from '@widget/components/input/ctx';

interface InputProps {
  snapshot: ParsedSnapshot | null;
  onChange: (value: string) => void;
  loading: boolean;
}

export const Input = React.memo(function Input({
  snapshot,
  onChange,
  loading,
}: InputProps) {
  const [tokens, setTokens] = useState([]);
  const inputRef = useRef();
  const [selection, setSelection] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const input = inputRef.current as HTMLInputElement;

    if (snapshot?.raw === input.value) {
      setTokens(snapshot.parsed);
    }
  }, [snapshot]);

  const onInput = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const raw = evt.target.value;
      onChange(raw);
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

  const append = useCallback(
    (str: string) => {
      //TODO: decouple from currVariant
      const isAtEdge = isEdgeToken(snapshot, currToken);
      const input = inputRef.current as HTMLInputElement;

      input.setRangeText(
        str + (isAtEdge ? ' ' : ''),
        currToken.start,
        currToken.end,
        'end'
      );

      onChange(input.value);

      input.focus();
    },
    [snapshot, currToken, onChange]
  );

  const onKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      if (inputRef.current && currVariants?.length > 0 && evt.key === evt.code) {
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
            append(currVariants[currVariant]);
          }
        }
      }
    },
    [
      currVariants,
      setCurrVariant,
      inputRef,
      currVariant,
      append
    ]
  );

  const { debug, hint, placeholder } = useContext(InputContext);

  return (
    <div
      className={classNames(['async-input', { loading }])}
      {...(debug ? { 'data-testid': 'asyncInputRoot' } : {})}
    >
      <div className="layer tags">
        {tokens.map(token => (
          <Token
            {...token}
            variants={currVariants}
            key={token.id}
            highlighted={token.id === currToken?.id}
            currVariant={currVariant}
            applyVariant={append}
          />
        ))}
      </div>
      <input
        type="text"
        className="layer"
        spellCheck="false"
        placeholder={placeholder}
        ref={inputRef}
        onChange={onInput}
        onKeyDown={onKeyDown}
        onSelect={onSelectionChange}
      />
      <div
        className="hint"
        style={{ visibility: debug ? 'visible' : 'hidden' }}
      >
        {hint}
      </div>
    </div>
  );
});