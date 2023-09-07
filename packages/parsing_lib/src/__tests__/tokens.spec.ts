import {
  InterpretationResult,
  NestedTemplateToken,
  ParsedToken,
  TemplateToken,
} from '@async-input/types';
import { evaluate, invertNestedTemplate } from 'token-tools';

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
      id: 'content_7',
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
      id: 'def_7',
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
      id: 'ps__abc',
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

describe('inversion', () => {
  const pattern: NestedTemplateToken = {
    id: 'some_id',
    role: 'some_role',
    variants: ['abc', 'def'],
    branches: {
      ['def']: {
        id: 'another_id',
        role: 'another_role',
        variants: ['foo1', 'foo2'],
        branches: {
          ['foo1']: {
            id: 'yet_another_id',
            role: 'yet_another_role',
            variants: ['bar1', 'bar2'],
            branches: {},
          },
        },
      },
    },
  };

  it('should be inverted correctly', () => {
    const inverted = invertNestedTemplate(pattern);

    expect(inverted).toEqual([
      pattern,
      {
        branches: {
          __default: {
            branches: undefined,
            id: 'some_id',
            role: 'some_role',
            variants: ['def'],
          },
        },
        id: 'another_id',
        role: 'another_role',
        variants: ['foo1', 'foo2'],
      },
      {
        branches: {
          __default: {
            branches: {
              __default: {
                branches: undefined,
                id: 'some_id',
                role: 'some_role',
                variants: ['def'],
              },
            },
            id: 'another_id',
            role: 'another_role',
            variants: ['foo1'],
          },
        },
        id: 'yet_another_id',
        role: 'yet_another_role',
        variants: ['bar1', 'bar2'],
      },
    ]);
  });
});
