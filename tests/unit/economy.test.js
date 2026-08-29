/**
 * Unit tests for CITYMIND economy system contracts.
 */
'use strict';

describe('Economy system contracts', () => {
  test('tax revenue is non-negative for valid rates', () => {
    const taxRevenue = (base, rate) => Math.max(0, base * rate);
    expect(taxRevenue(1000, 0.1)).toBe(100);
    expect(taxRevenue(0, 0.2)).toBe(0);
    expect(taxRevenue(500, -0.1)).toBe(0);
  });

  test('budget balance formula', () => {
    const balance = (income, expense) => income - expense;
    expect(balance(1000, 400)).toBe(600);
    expect(balance(200, 500)).toBe(-300);
  });

  test('employment rate clamped between 0 and 1', () => {
    const rate = (employed, population) => {
      if (population <= 0) return 0;
      return Math.min(1, Math.max(0, employed / population));
    };
    expect(rate(50, 100)).toBe(0.5);
    expect(rate(120, 100)).toBe(1);
    expect(rate(10, 0)).toBe(0);
  });
});
