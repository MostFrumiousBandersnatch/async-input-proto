import { Observable, of } from 'rxjs';

import {
  Interpretation,
  InterpretationResult,
  InterpretedSnapshot,
  InterpretedToken,
  MultipleResponse,
  NestedTemplateToken,
} from '@async-input/types';

import type { Injector } from './injector';

import { repeat } from 'utils/misc';

import { withTokenInjector } from './injector';
import {
  colorizeToken,
  estimateToken,
  evaluate,
  genPostfix,
  shiftPattern,
} from 'token-tools';

export * from './injector';
export * from './token-tools';

export const colorizeSnapshot = (
  colorize: (_: InterpretedToken) => string
): Injector<InterpretedSnapshot> => withTokenInjector(colorizeToken(colorize));

export const embelisher = (char: string): Injector<InterpretedSnapshot> =>
  withTokenInjector(token => ({
    ...token,
    ...(token.role
      ? {}
      : {
          role: repeat(char.charAt(0), token.content.length > 2 ? 3 : 1).join(
            ''
          ),
        }),
  }));

export interface AltGenerator<D> {
  name: string;
  pattern: NestedTemplateToken[];
  getData: (snap: InterpretedSnapshot) => D;
}

export const makeMulitpleResponseGenerator = <D>(
  origins: AltGenerator<D>[],
  postProcessor?: Injector<InterpretedSnapshot>
): ((snap: InterpretedSnapshot) => Observable<MultipleResponse<D>>) => {
  const wrappedOrigins = origins.map(origin => ({
    ...origin,
    injector: makeInjectorOutOfNestedTemplates(origin.pattern),
  }));

  return snap => {
    const alternatives = wrappedOrigins.reduce<Interpretation<D>[]>(
      (acc, origin) => {
        const altSnap = origin.injector(snap);

        if (altSnap !== snap) {
          acc.push({
            name: origin.name,
            tokens: (postProcessor ? postProcessor(altSnap) : altSnap)
              .interpreted,
            data: origin.getData(snap),
          });
        }

        return acc;
      },
      []
    );

    return of({ raw: snap.raw, alternatives });
  };
};

export const estimateInterpretation = (
  interpreted: InterpretedToken[]
): number =>
  interpreted.length === 0
    ? 0
    : interpreted.reduce<number>(
        (acc, token) => acc + estimateToken(token),
        0
      ) / interpreted.length;

export const getDepth = (pattern: NestedTemplateToken): number =>
  1 + Math.max(0, ...Object.values(pattern.branches || {}).map(getDepth));

interface InterimResult {
  pattern: NestedTemplateToken;
  result: [number, InterpretedToken][];
  score: number;
  terminate: boolean;
}

//TODO: count on size and distance
const estimateInterimResult = (variant: InterimResult): number => variant.score;

export const evaluateNestedTemplate = (
  pattern: NestedTemplateToken,
  snap: InterpretedSnapshot
): InterimResult => {
  const active: InterimResult[] = [
    {
      pattern,
      result: [],
      score: 0,
      terminate: false,
    },
  ];

  const output: InterimResult[] = [];

  snap.interpreted.forEach((token, num) => {
    active.forEach(variant => {
      const currMatch = evaluate(variant.pattern, token);
      const terminate = currMatch.status !== InterpretationResult.matched;

      const newVariant: InterimResult = {
        pattern: terminate
          ? variant.pattern
          : shiftPattern(variant.pattern, currMatch),
        result: [...variant.result, [num, currMatch]],
        score: variant.score + estimateToken(currMatch),
        terminate,
      };

      if (!terminate) {
        if (newVariant.pattern === null) {
          output.push(newVariant);
        } else {
          active.push(newVariant);
        }
      } else if (newVariant.score > 0) {
        output.push(newVariant);
      }
    });
  });

  let bestVariant: InterimResult = active[0];
  let bestScore = estimateInterimResult(bestVariant);
  active
    .slice(1)
    .concat(output)
    .forEach(variant => {
      const currScore = estimateInterimResult(variant);
      if (currScore > bestScore) {
        bestScore = currScore;
        bestVariant = variant;
      }
    });

  return bestVariant;
};

export const makeInjectorOutOfNestedTemplates =
  (templates: NestedTemplateToken[]): Injector<InterpretedSnapshot> =>
  snap => {
    // Fetching and prioritizing variants
    const interim = templates
      .map(tmpl => evaluateNestedTemplate(tmpl, snap))
      .filter(({ score }) => score >= 0)
      .sort(
        (resA, resB) =>
          estimateInterimResult(resB) - estimateInterimResult(resA)
      );

    if (interim[0].score <= 0.25) {
      //No good variants
      return snap;
    }

    //Merging them together according the priorities
    const coverageMap: Record<string, number> = {};
    const interpreted = interim.reduce((acc, res, i) => {
      for (let entry of res.result) {
        let [pos, candidate] = entry;
        const present = acc[pos];

        if (present.status === InterpretationResult.notRecognized) {
          acc.splice(pos, 1, candidate);
          coverageMap[candidate.role] = i;
        } else {
          break;
        }
      }

      return acc;
    }, snap.interpreted);

    let i = 0;

    // Making suggestions for those who cares
    while (i < interim.length) {
      const res = interim[i];
      if (res.pattern) {
        const present = coverageMap[res.pattern.role];
        if (present === undefined || (!res.terminate && present === i)) {
          const tail = genPostfix(interpreted.at(-1));
          interpreted.push(evaluate(res.pattern, tail));
          break;
        }
      }

      i += 1;
    }

    return {
      ...snap,
      interpreted,
    };
  };

export const cloneSnapshot = (
  snap: InterpretedSnapshot
): InterpretedSnapshot => ({
  ...snap,
  interpreted: [...snap.interpreted],
});
