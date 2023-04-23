export const delay = <T>(ms: number, res?: T): Promise<T | void> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(res);
    }, ms);
  });
