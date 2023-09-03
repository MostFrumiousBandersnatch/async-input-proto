import { Observable } from 'rxjs';

import {
  AltGenerator,
  Injector,
  makeInjectorOutOfNestedTemplates,
  cloneSnapshot
} from '@async-input/parsing_lib';
import {
  InterpretedSnapshot,
  MultipleResponse,
} from '@async-input/types';
import { delay } from 'utils/async';

export const makeMulitpleResponseSequentialGenerator = <D>(
  origins: AltGenerator<D>[],
  postProcessor?: Injector<InterpretedSnapshot>,
  interpretationDelay = 1000
): ((snap: InterpretedSnapshot) => Observable<MultipleResponse<D>>) => {
  const wrappedOrigins = origins.map(origin => ({
    ...origin,
    injector: makeInjectorOutOfNestedTemplates(origin.pattern),
  }));

  return snap =>
    new Observable(subscriber => {
      const runState = { stop: false };

      (async () => {
        const alternatives = [];
        for (const origin of wrappedOrigins) {
          if (runState.stop) {
            break;
          }

          const snapCopy = cloneSnapshot(snap);

          const altSnap = origin.injector(snapCopy);
          if (altSnap !== snapCopy) {
            alternatives.push({
              name: origin.name,
              tokens: (postProcessor ? postProcessor(altSnap) : altSnap)
                .interpreted,
              data: origin.getData(snap),
            });
            subscriber.next({ raw: snap.raw, alternatives });

            await delay(interpretationDelay);
          }
        }

        if (alternatives.length === 0) {
          subscriber.next({
            raw: snap.raw,
            alternatives: [
              {
                name: '???',
                tokens: snap.interpreted,
                data: null,
              },
            ],
          });
        }

        subscriber.complete();
      })();

      return () => {
        runState.stop = true;
      };
    });
};