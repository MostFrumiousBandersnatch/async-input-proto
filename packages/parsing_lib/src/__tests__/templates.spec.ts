import { DEFAULT_BRANCH, InterpretationResult, NestedTemplateToken } from '@async-input/types';
import { defaultInterpret } from 'tokenizer';
import {
  evaluateNestedTemplate,
  getDepth,
  makeInjectorOutOfNestedTemplates,
} from '../snapshot-tools';

describe('template tools', () => {
  test('getDepth', () => {
    const template: NestedTemplateToken = {
      id: 'trigger',
      role: 'key',
      variants: ['roas', 'roi', 'cpm', 'cpc'],
      branches: {
        [DEFAULT_BRANCH]: {
          id: 'ds-stub',
          role: 'data source',
          variants: ['google', 'big-query'],
          branches: {
            google: {
              id: 'trg-stub',
              role: 'target',
              variants: ['sheets', 'looker'],
              branches: {},
            },
          },
        },
      },
    };

    expect(getDepth(template)).toBe(3);
  });
});

describe('non-linear analysis', () => {
  const templates: NestedTemplateToken[] = [
    {
      id: 'trigger-1',
      role: 'key',
      variants: ['roas', 'roi', 'cpm'],
      branches: {},
    },
    {
      id: 'trigger-2',
      role: 'data source',
      variants: ['google', 'big-query'],
      branches: {
        google: {
          id: 'trg-stub',
          role: 'target',
          variants: ['sheets', 'looker'],
          branches: {},
        },
      },
    },
  ];

  const injector = makeInjectorOutOfNestedTemplates(templates);

  it('evaluates first', () => {
    const snap = defaultInterpret('cpm google');

    const interim = evaluateNestedTemplate(templates[0], snap);

    expect(interim.shift).toBe(0);
  });

  it('evaluates second', () => {
    const snap = defaultInterpret('cpm google');

    const interim = evaluateNestedTemplate(templates[1], snap);

    expect(interim.shift).toBe(1);
  });

  it('evaluates first standing second', () => {
    const snap = defaultInterpret('fff roi');
    const interim = evaluateNestedTemplate(templates[0], snap);
    expect(interim.shift).toBe(1);
  });

  it('recognizes first', () => {
    const snap = injector(defaultInterpret('roi'));

    expect(snap.interpreted[0]).toMatchObject({
      role: 'key',
      id: 'roi_0',
      content: 'roi',
      status: InterpretationResult.matched,
      spaceBefore: 0,
      start: 0,
      end: 3,
    });
  });

  it('recognizes second', () => {
    const snap = injector(defaultInterpret('google'));

    expect(snap.interpreted[0]).toMatchObject({
      role: 'data source',
      id: 'google_0',
      content: 'google',
      status: InterpretationResult.matched,
      spaceBefore: 0,
      start: 0,
      end: 6,
    });
  });

  it('recognizes both', () => {
    const snap = injector(defaultInterpret('cpm google'));

    expect(snap.interpreted[0]).toMatchObject({
      role: 'key',
      content: 'cpm',
      id: 'cpm_0',
      status: InterpretationResult.matched,
      spaceBefore: 0,
      start: 0,
      end: 3,
    });
    expect(snap.interpreted[1]).toMatchObject({
      role: 'data source',
      content: 'google',
      id: 'google_4',
      status: InterpretationResult.matched,
      spaceBefore: 1,
      start: 4,
      end: 10,
    });
    expect(snap.interpreted[2]).toMatchObject({
      role: 'target',
      content: '        ',
      status: InterpretationResult.suggested,
      spaceBefore: 1,
      start: 11,
      end: 19,
    });

  });

  it('recognizes both reversed', () => {
    const snap = injector(defaultInterpret('google cpm'));

    expect(snap.interpreted[0]).toMatchObject({
      role: 'data source',
      content: 'google',
      status: InterpretationResult.matched,
      spaceBefore: 0,
      start: 0,
      end: 6,
    });

    expect(snap.interpreted[1]).toMatchObject({
      role: 'key',
      content: 'cpm',
      status: InterpretationResult.matched,
      spaceBefore: 1,
      start: 7,
      end: 10,
    });
  });

  it('recognizes both reversed with optionals', () => {
    let snap = defaultInterpret('google looker cpm');
    snap = injector(snap);

    expect(snap.interpreted[0]).toMatchObject({
      role: 'data source',
      content: 'google',
      id: 'google_0',
      status: InterpretationResult.matched,
      spaceBefore: 0,
      start: 0,
      end: 6,
    });

    expect(snap.interpreted[1]).toMatchObject({
      role: 'target',
      content: 'looker',
      status: InterpretationResult.matched,
      spaceBefore: 1,
      start: 7,
      end: 13,
    });

    expect(snap.interpreted[2]).toMatchObject({
      role: 'key',
      content: 'cpm',
      status: InterpretationResult.matched,
      spaceBefore: 1,
      start: 14,
      end: 17,
    });
  });

  it('recognizes both reversed with partial match', () => {
    const snap = injector(defaultInterpret('goo cpm'));

    expect(snap.interpreted[0]).toMatchObject({
      role: 'data source',
      content: 'goo',
      status: InterpretationResult.partiallyMatched,
      spaceBefore: 0,
      start: 0,
      end: 3,
    });

    expect(snap.interpreted[1]).toMatchObject({
      role: 'key',
      content: 'cpm',
      status: InterpretationResult.matched,
      spaceBefore: 1,
      start: 4,
      end: 7,
    });
  });

});