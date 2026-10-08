import { formatAmount, formatStroops, isPositiveAmount, normalizeAmount, toStroops } from '@/domain/amounts';

describe('amounts', () => {
  it.each([
    ['1', 10_000_000n],
    ['0.0000001', 1n],
    ['123.4500000', 1_234_500_000n],
    ['922337203685.4775807', 9_223_372_036_854_775_807n],
  ])('converts %s to stroops', (amount, stroops) => {
    expect(toStroops(amount)).toBe(stroops);
  });

  it('formats stroops with grouping and no trailing zeros', () => {
    expect(formatStroops(12_345_670_000_000n)).toBe('1,234,567');
    expect(formatStroops(15_000_000n)).toBe('1.5');
    expect(formatStroops(-1n)).toBe('-0.0000001');
    expect(formatAmount('2.5000000')).toBe('2.5');
  });

  it.each([
    ['1', true],
    ['0.0000001', true],
    ['0', false],
    ['0.00000001', false],
    ['1.', false],
    ['-1', false],
    ['1e3', false],
    [' 1', false],
  ])('isPositiveAmount(%j) is %s', (amount, valid) => {
    expect(isPositiveAmount(amount)).toBe(valid);
  });

  it('accepts comma decimals as typed in Spanish or Portuguese', () => {
    expect(normalizeAmount('2,5')).toBe('2.5');
    expect(normalizeAmount('1.234,5')).toBe('1234.5');
    expect(normalizeAmount(' 3.25 ')).toBe('3.25');
  });
});
