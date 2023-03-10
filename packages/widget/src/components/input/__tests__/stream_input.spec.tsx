import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { InputContextType } from '@widget/components/input/ctx';
import { StreamInput } from '@widget/components/input/stream_input';
import { of } from 'rxjs';
import { StreamTokenizer } from '@widget/engine/types';
import { tokenProcessor } from '@widget/engine/tokenizer';

const PLACEHOLDER = '...';

const baseCtx: InputContextType = {
  debug: true,
  placeholder: PLACEHOLDER,
};

const dummyProcessor: StreamTokenizer = (raw: string) =>
  of(tokenProcessor(raw));

describe('stream input', () => {
  test('continous input', async () => {
    render(<StreamInput ctx={baseCtx} processor={dummyProcessor} />);

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'lorem');

    expect(screen.queryByText('lorem').className).toBe('token-inner');

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'ipsum');

    expect(screen.queryByText('lorem')).not.toBeInTheDocument();
    expect(screen.queryByText('ipsum')).not.toBeInTheDocument();
    expect(screen.queryByText('loremipsum').className).toBe('token-inner');
  });

  test('space-interleaved input', async () => {
    render(<StreamInput ctx={baseCtx} processor={dummyProcessor} />);

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'lorem');

    expect(screen.queryByText('lorem').className).toBe('token-inner');

    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), ' ipsum');

    expect(screen.queryByText('lorem ipsum')).not.toBeInTheDocument();
    expect(screen.queryByText('lorem').className).toBe('token-inner');
    expect(screen.queryByText('ipsum').className).toBe('token-inner');
  });

});
