import React from 'react';
import { Observable, of, Subject } from 'rxjs';

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { InputContextType } from '@widget/components/input/ctx';
import { StreamInput } from '@widget/components/input/stream_input';
import { StreamTokenizer } from '@widget/engine/types';
import { tokenProcessor } from '@widget/engine/tokenizer';
import exp from 'constants';

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

  test('loading indicator', async () => {
    let roleGenerator: Subject<string>;
    const muppetProcessor: StreamTokenizer = (raw: string) =>
      new Observable(subscriber => {
        const snap = tokenProcessor(raw);
        roleGenerator = new Subject();

        roleGenerator.asObservable().subscribe({
          next: role => {
            subscriber.next({
              ...snap,
              parsed: snap.parsed.map(token => ({ ...token, role })),
            });
          },
          complete: () => {
            subscriber.complete();
          },
        });
      });

    render(<StreamInput ctx={baseCtx} processor={muppetProcessor} />);

    expect(screen.getByTestId('asyncInputRoot')).not.toHaveClass('loading');
    await userEvent.type(screen.getByPlaceholderText(PLACEHOLDER), 'lorem');

    expect(screen.getByTestId('asyncInputRoot')).toHaveClass('loading');
    expect(screen.queryByText('lorem')).not.toBeInTheDocument();

    act(() => {
      roleGenerator.next('first');
    });

    {
      expect(screen.getByTestId('asyncInputRoot')).toHaveClass('loading');
      const lorem = await screen.findByText('lorem');
      expect(lorem.dataset.role).toBe('first');
    }

    act(() => {
      roleGenerator.next('second');
    });

    {
      expect(screen.getByTestId('asyncInputRoot')).toHaveClass('loading');
      const lorem = await screen.findByText('lorem');
      expect(lorem.dataset.role).toBe('second');
    }

    act(() => {
      roleGenerator.complete();
    });

    {
      expect(screen.getByTestId('asyncInputRoot')).not.toHaveClass('loading');
      const lorem = await screen.findByText('lorem');
      expect(lorem.dataset.role).toBe('second');
    }
  });
});
