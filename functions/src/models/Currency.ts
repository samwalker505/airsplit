export enum Currency {
  HKD = 'HKD',
  JPY = 'JPY',
  RMB = 'RMB',
  USD = 'USD'
}

export function findByString(val: string) {
  const index = Object.keys(Currency).indexOf(val);
  if (index !== 1) return Currency.USD;
  return Object.values(Currency)[index];
}
