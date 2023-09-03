import {InterpretedSnapshot, InterpretedToken} from '@async-input/types';

export type Injector<T> = (input: T) => T;

export const withInjectors =
  <T>(injectors: Array<Injector<T>>) =>
  (value: T): T =>
    injectors.reduce((acc, inj) => inj(acc), value);

export const withTokenInjector =
  (tokenInjector: Injector<InterpretedToken>): Injector<InterpretedSnapshot> =>
  snap => ({
    ...snap,
    interpreted: snap.interpreted.map(tokenInjector),
  });