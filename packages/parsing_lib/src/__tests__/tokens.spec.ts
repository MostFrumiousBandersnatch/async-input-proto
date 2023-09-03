import {
  InterpretationResult,
  ParsedToken,
  TemplateToken,
} from '@async-input/types';
import { evaluate } from 'token-tools';

describe('Token utils', () => {
  const pattern: TemplateToken = {
    id: 'some_id',
    role: 'some_role',
    variants: ['abc'],
  };

  test('evluation (match)', () => {
    const token: ParsedToken = {
      content: 'abc',
      spaceBefore: 3,
      start: 7,
      end: 10,
      id: 'content_7'
    };

    const interpreted = evaluate(pattern, token);
    expect(interpreted).toMatchObject({
      status: InterpretationResult.matched,
      content: 'abc',
      spaceBefore: 3,
      start: 7,
      end: 10,
      role: 'some_role',
    });
  });

  test('evluation (failure)', () => {
    const token: ParsedToken = {
      content: 'def',
      spaceBefore: 3,
      start: 7,
      end: 10,
      id: 'def_7'
    };

    const interpreted = evaluate(pattern, token);
    expect(interpreted).toMatchObject({
      status: InterpretationResult.misMatched,
      content: 'def',
      spaceBefore: 3,
      start: 7,
      end: 10,
      role: 'some_role',
    });
  });

  test('evluation (suggestion)', () => {
    const token: ParsedToken = {
      content: '',
      spaceBefore: 3,
      start: 7,
      end: 7,
      id: 'ps__abc'
    };

    const interpreted = evaluate(pattern, token);
    expect(interpreted).toMatchObject({
      status: InterpretationResult.suggested,
      content: '           ',
      spaceBefore: 3,
      start: 7,
      end: 18,
      role: 'some_role',
    });
  });
});