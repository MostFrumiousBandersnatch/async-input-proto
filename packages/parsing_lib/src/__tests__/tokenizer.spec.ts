import {toTokens} from '../tokenizer';

describe('tokenizer', () => {
  const raw = 'lorem ipsum';
  const rawV2 = 'lorem   ipsum';

  it('should keep snapshot', () => {
    expect(toTokens(raw).raw).toBe(raw);
  });

  it('should parse into tokens', () => {
    const result = toTokens(raw);

    expect(result.parsed).toHaveLength(2);

    result.parsed.forEach(token => {
      expect(token).toHaveProperty('id');
      expect(token).toHaveProperty('content');
      expect(token).toHaveProperty('start');
      expect(token).toHaveProperty('end');
      expect(token).toHaveProperty('spaceBefore');
    });
  });

  it('should actually tokenize', () => {
    const result = toTokens(raw);

    expect(result.parsed[0].content).toBe('lorem');
    expect(result.parsed[1].content).toBe('ipsum');
  });

  it('should not be fooled by extra space', () => {
    const result = toTokens(rawV2);

    expect(result.parsed[0].content).toBe('lorem');
    expect(result.parsed[1].content).toBe('ipsum');
  });
});