import { Observable, of } from 'rxjs';

import {
  Interpretation,
  InterpretationResult,
  InterpretedSnapshot,
  InterpretedToken,
  MultipleResponse,
  NestedTemplateToken,
  TemplateToken,
} from '@async-input/types';

import type { Injector } from './injector';

import { repeat } from 'utils/misc';

import { withTokenInjector } from './injector';
import {
  colorizeToken,
  estimateToken,
  evaluate,
  genPostfix,
  getDefualtSuggestion,
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

// export const makeInjectorOutOfSnapshotPattern =
//   (pattern: TemplateToken[]): Injector<InterpretedSnapshot> =>
//   snap => {
//     if (checkTokens(snap.interpreted, pattern)) {
//       return {
//         ...snap,
//         interpreted: zipTokens(snap.interpreted, pattern),
//       };
//     } else return snap;
//   };

// export const makeInjectorOutOfNestedTemplate =
//   (pattern: NestedTemplateToken): Injector<InterpretedSnapshot> =>
//   snap => {
//     const interpreted: InterpretedToken[] = [];

//     const lastParsedNum = snap.interpreted.length - 1;
//     let currParsedNum = 0;
//     let specimen = pattern;

//     while (specimen) {
//       const token = snap.interpreted[currParsedNum];
//       if (!checkToken(token, specimen, currParsedNum === lastParsedNum)) {
//         return snap;
//       } else {
//         const prevToken = interpreted.at(-1);
//         interpreted.push(
//           token
//             ? makeMaterializedToken(specimen, token)
//             : makeGhostToken(specimen, (prevToken?.end || 0) + 1) //TODO: adjust to multiple spaces
//         );
//         specimen = shiftPattern(specimen, token);
//         currParsedNum += 1;
//       }
//     }

//     return {
//       raw: snap.raw,
//       interpreted,
//     };
//   };

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
  origin: NestedTemplateToken;
  bestMatchPattern: NestedTemplateToken;

  interpreted: InterpretedToken[];
  score: number;
  shift: number;
  size: number;
}

const MAX_INTERPRETATION_DEPTH = 10;

export const evaluateNestedTemplate = (
  pattern: NestedTemplateToken,
  snap: InterpretedSnapshot
): InterimResult => {
  const patternDepth = getDepth(pattern); //TODO: use memoization
  const combCount = Math.min(MAX_INTERPRETATION_DEPTH, snap.interpreted.length);
  let bestShift;
  let bestMinSize;
  let bestScore = 0;
  let bestInterpretation: InterpretedToken[] = [];
  let bestPattern = pattern;

  for (let shift = 0; shift < combCount; shift += 1) {
    const tokens = snap.interpreted.slice(shift, shift + patternDepth);
    const interpreted: InterpretedToken[] = [];
    let currParsedNum = 0;
    let specimen = pattern;

    while (specimen) {
      const token = tokens[currParsedNum] || genPostfix(interpreted.at(-1));
      //console.log('~', tokens, currParsedNum, specimen);

      const result = evaluate(specimen, token);

      if (result.status !== InterpretationResult.suggested) {
        interpreted.push(result);

        if (result.status !== InterpretationResult.misMatched) {
          specimen = shiftPattern(specimen, token);
          currParsedNum += 1;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    const score = estimateInterpretation(interpreted) / (shift + 1);

    //console.log('@', shift, interpreted, score);

    if (score > bestScore) {
      bestScore = score;
      bestShift = shift;
      bestMinSize = currParsedNum;
      bestInterpretation = interpreted;
      bestPattern = specimen;
    }
  }

  return {
    origin: pattern,
    bestMatchPattern: bestPattern,
    interpreted: bestInterpretation,
    size: bestMinSize,
    score: bestScore,
    shift: bestShift,
  };
};

export const makeInjectorOutOfNestedTemplates =
  (templates: NestedTemplateToken[]): Injector<InterpretedSnapshot> =>
  snap => {
    const interim = templates
      .map(tmpl => evaluateNestedTemplate(tmpl, snap))
      .filter(({ score }) => score >= 0)
      .sort(({ score: scoreA }, { score: scoreB }) => scoreB - scoreA);

    const toBeSuggestedFirst: TemplateToken[] = [];
    const toBeSuggestedSecond: TemplateToken[] = [];

    const interpreted =
      interim[0].score === 0
        ? []
        : interim.reduce((acc, res) => {
            if (
              acc
                .slice(res.shift, res.size)
                .every(({ status }) => status !== InterpretationResult.matched) //TODO: compare scores for edge cases
            ) {
              acc.splice(
                res.shift,
                res.size,
                ...res.interpreted.slice(0, res.size)
              );

              if (res.bestMatchPattern) {
                toBeSuggestedFirst.push(res.bestMatchPattern);
              }
            } else {
              toBeSuggestedSecond.push(res.origin);
            }

            return acc;
          }, snap.interpreted);

    if (interpreted.length === 0) {
      return snap;
    } else {
      toBeSuggestedFirst.concat(toBeSuggestedSecond).forEach(pattern => {
        const tail = genPostfix(interpreted.at(-1));
        interpreted.push(evaluate(pattern, tail));
      });

      return {
        ...snap,
        interpreted,
      };
    }
  };

export const cloneSnapshot = (
  snap: InterpretedSnapshot
): InterpretedSnapshot => ({
  ...snap,
  interpreted: [...snap.interpreted],
});
