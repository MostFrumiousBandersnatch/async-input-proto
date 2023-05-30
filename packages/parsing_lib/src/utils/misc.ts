export const repeat = <T>(item: T, times: number): T[] =>
  [...Array(times)].map(() => item);

export const cyclicShift = (value: number, dir: 1 | -1, base: number): number => (value + dir + base) % base;
