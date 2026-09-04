import { describe, it, expect } from 'vitest';
import {
  getBubbleSortAnimations,
  getSelectionSortAnimations,
  getInsertionSortAnimations,
  getMergeSortAnimations,
  getQuickSortAnimations,
  getHeapSortAnimations,
} from '../sortingAlgorithms';

// Replays the animation steps the same way the UI does (swap/overwrite are
// the only steps that change values) and returns the resulting array — this
// checks the algorithms are actually correct, not just that they run.
function applyAnimations(input, animations) {
  const array = [...input];
  for (const step of animations) {
    if (step.type === 'swap') {
      const [a, b] = step.indices;
      [array[a], array[b]] = [array[b], array[a]];
    } else if (step.type === 'overwrite') {
      array[step.index] = step.value;
    }
  }
  return array;
}

const ALGORITHMS = {
  'bubble sort': getBubbleSortAnimations,
  'selection sort': getSelectionSortAnimations,
  'insertion sort': getInsertionSortAnimations,
  'merge sort': getMergeSortAnimations,
  'quick sort': getQuickSortAnimations,
  'heap sort': getHeapSortAnimations,
};

const CASES = [
  [],
  [1],
  [2, 1],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
  [3, 3, 3, 3],
  [8, 3, 3, 1, 9, 2, 7, 7, 0, 5, -4, 12],
];

describe.each(Object.entries(ALGORITHMS))('%s', (name, sortFn) => {
  // Each case must be wrapped in its own array — it.each spreads an array
  // row into positional arguments, so passing CASES directly would unpack
  // e.g. [2, 1] into two separate single-number test runs instead of one.
  it.each(CASES.map((c) => [c]))('sorts %j correctly', (input) => {
    const expected = [...input].sort((a, b) => a - b);
    const animations = sortFn(input);
    const result = applyAnimations(input, animations);
    expect(result).toEqual(expected);
  });

  it('does not mutate the input array', () => {
    const input = [5, 3, 8, 1];
    const copy = [...input];
    sortFn(input);
    expect(input).toEqual(copy);
  });

  it('sorts a larger random array', () => {
    const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 500));
    const expected = [...input].sort((a, b) => a - b);
    const animations = sortFn(input);
    expect(applyAnimations(input, animations)).toEqual(expected);
  });
});
