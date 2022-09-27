import { tokenProcessor } from './tokenizer';

describe('tokenizer', () => {
  it('should keep snapshot', () => {
    const raw = 'lorem ipsum';

    expect(tokenProcessor(raw).raw).toBe(raw);
  });
});
