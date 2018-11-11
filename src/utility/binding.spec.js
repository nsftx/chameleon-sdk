/* eslint no-template-curly-in-string:"off" */
import binding from './binding';

describe('binding utility', () => {
  it('should set expression', () => {
    const expression = binding.setExpression('${x}');
    expect(expression).toBeInstanceOf(Function);
  });

  it('should resolve expression', () => {
    const expression = binding.setExpression('${x + y}');
    const context = { x: 'a', y: 'b' };
    const value = binding.resolveExpression(expression, context, 'c');
    expect(value).toBe('ab');
  });

  it('should resolve erroneous expression', () => {
    const expression = binding.setExpression('${x}');
    const context = {};
    const value = binding.resolveExpression(expression, context, 'c');
    expect(value).toBe('c');
  });
});
