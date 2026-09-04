// Each function returns a flat list of "animation steps" describing how to get
// from the input array to a fully sorted one. A step is one of:
//   { type: 'compare',   indices: [i, j] }        - highlight two values being compared
//   { type: 'swap',      indices: [i, j] }         - swap the values at i and j
//   { type: 'overwrite', index: i, value }         - directly set a value (used by merge sort)
//   { type: 'sorted',    index: i }                - mark a position as finalized
//
// The visualizer replays these steps with a delay to animate the sort. None of
// these functions mutate the array passed in.

export function getBubbleSortAnimations(input) {
  const animations = [];
  const array = [...input];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push({ type: 'compare', indices: [j, j + 1] });
      if (array[j] > array[j + 1]) {
        animations.push({ type: 'swap', indices: [j, j + 1] });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
    animations.push({ type: 'sorted', index: n - 1 - i });
  }
  animations.push({ type: 'sorted', index: 0 });
  return animations;
}

export function getSelectionSortAnimations(input) {
  const animations = [];
  const array = [...input];
  const n = array.length;

  for (let i = 0; i < n; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      animations.push({ type: 'compare', indices: [minIndex, j] });
      if (array[j] < array[minIndex]) minIndex = j;
    }
    if (minIndex !== i) {
      animations.push({ type: 'swap', indices: [i, minIndex] });
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
    animations.push({ type: 'sorted', index: i });
  }
  return animations;
}

export function getInsertionSortAnimations(input) {
  const animations = [];
  const array = [...input];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      animations.push({ type: 'compare', indices: [j - 1, j] });
      if (array[j - 1] > array[j]) {
        animations.push({ type: 'swap', indices: [j - 1, j] });
        [array[j - 1], array[j]] = [array[j], array[j - 1]];
        j--;
      } else {
        break;
      }
    }
  }
  for (let i = 0; i < n; i++) animations.push({ type: 'sorted', index: i });
  return animations;
}

export function getMergeSortAnimations(input) {
  const animations = [];
  const array = [...input];
  const aux = [...input];
  mergeSortHelper(array, 0, array.length - 1, aux, animations);
  for (let i = 0; i < array.length; i++) animations.push({ type: 'sorted', index: i });
  return animations;
}

// "Ping-pong" merge sort: main/aux swap roles at every recursive level, so the
// merge step always reads two already-sorted halves out of `aux` and writes
// the merged result into `main` — no extra copy-back pass needed.
function mergeSortHelper(main, lo, hi, aux, animations) {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSortHelper(aux, lo, mid, main, animations);
  mergeSortHelper(aux, mid + 1, hi, main, animations);
  merge(main, lo, mid, hi, aux, animations);
}

function merge(main, lo, mid, hi, aux, animations) {
  let i = lo;
  let j = mid + 1;
  for (let k = lo; k <= hi; k++) {
    if (i > mid) {
      animations.push({ type: 'compare', indices: [j, j] });
      animations.push({ type: 'overwrite', index: k, value: aux[j] });
      main[k] = aux[j++];
    } else if (j > hi) {
      animations.push({ type: 'compare', indices: [i, i] });
      animations.push({ type: 'overwrite', index: k, value: aux[i] });
      main[k] = aux[i++];
    } else {
      animations.push({ type: 'compare', indices: [i, j] });
      if (aux[i] <= aux[j]) {
        animations.push({ type: 'overwrite', index: k, value: aux[i] });
        main[k] = aux[i++];
      } else {
        animations.push({ type: 'overwrite', index: k, value: aux[j] });
        main[k] = aux[j++];
      }
    }
  }
}

export function getQuickSortAnimations(input) {
  const animations = [];
  const array = [...input];
  quickSortHelper(array, 0, array.length - 1, animations);
  return animations;
}

function quickSortHelper(array, lo, hi, animations) {
  if (lo > hi) return;
  if (lo === hi) {
    animations.push({ type: 'sorted', index: lo });
    return;
  }
  const p = partition(array, lo, hi, animations);
  animations.push({ type: 'sorted', index: p });
  quickSortHelper(array, lo, p - 1, animations);
  quickSortHelper(array, p + 1, hi, animations);
}

// Lomuto partition scheme, pivot = last element.
function partition(array, lo, hi, animations) {
  const pivot = array[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    animations.push({ type: 'compare', indices: [j, hi] });
    if (array[j] < pivot) {
      i++;
      if (i !== j) {
        animations.push({ type: 'swap', indices: [i, j] });
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  }
  if (i + 1 !== hi) {
    animations.push({ type: 'swap', indices: [i + 1, hi] });
    [array[i + 1], array[hi]] = [array[hi], array[i + 1]];
  }
  return i + 1;
}

export function getHeapSortAnimations(input) {
  const animations = [];
  const array = [...input];
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(array, n, i, animations);

  for (let i = n - 1; i > 0; i--) {
    animations.push({ type: 'swap', indices: [0, i] });
    [array[0], array[i]] = [array[i], array[0]];
    animations.push({ type: 'sorted', index: i });
    heapify(array, i, 0, animations);
  }
  animations.push({ type: 'sorted', index: 0 });
  return animations;
}

function heapify(array, n, i, animations) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    animations.push({ type: 'compare', indices: [left, largest] });
    if (array[left] > array[largest]) largest = left;
  }
  if (right < n) {
    animations.push({ type: 'compare', indices: [right, largest] });
    if (array[right] > array[largest]) largest = right;
  }
  if (largest !== i) {
    animations.push({ type: 'swap', indices: [i, largest] });
    [array[i], array[largest]] = [array[largest], array[i]];
    heapify(array, n, largest, animations);
  }
}
