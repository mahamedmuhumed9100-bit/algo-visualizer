import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getBubbleSortAnimations,
  getSelectionSortAnimations,
  getInsertionSortAnimations,
  getMergeSortAnimations,
  getQuickSortAnimations,
  getHeapSortAnimations,
} from '../algorithms/sortingAlgorithms';
import './SortingVisualizer.css';

const ALGORITHMS = {
  bubble: { label: 'Bubble Sort', fn: getBubbleSortAnimations, complexity: 'O(n²)' },
  selection: { label: 'Selection Sort', fn: getSelectionSortAnimations, complexity: 'O(n²)' },
  insertion: { label: 'Insertion Sort', fn: getInsertionSortAnimations, complexity: 'O(n²)' },
  merge: { label: 'Merge Sort', fn: getMergeSortAnimations, complexity: 'O(n log n)' },
  quick: { label: 'Quick Sort', fn: getQuickSortAnimations, complexity: 'O(n log n) avg' },
  heap: { label: 'Heap Sort', fn: getHeapSortAnimations, complexity: 'O(n log n)' },
};

function generateArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 380) + 20);
}

export default function SortingVisualizer() {
  const [size, setSize] = useState(50);
  const [array, setArray] = useState(() => generateArray(50));
  const [algorithm, setAlgorithm] = useState('bubble');
  const [speed, setSpeed] = useState(60);
  const [isSorting, setIsSorting] = useState(false);
  const [compare, setCompare] = useState([]);
  const [swap, setSwap] = useState([]);
  const [sorted, setSorted] = useState(new Set());
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearTimeouts(), []);

  const resetArray = useCallback((newSize) => {
    clearTimeouts();
    setIsSorting(false);
    setCompare([]);
    setSwap([]);
    setSorted(new Set());
    setArray(generateArray(newSize ?? size));
  }, [size]);

  const handleSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setSize(newSize);
    resetArray(newSize);
  };

  const runSort = () => {
    if (isSorting) return;
    const animations = ALGORITHMS[algorithm].fn(array);
    const workingArray = [...array];
    const delay = Math.max(210 - speed * 2, 2);

    setIsSorting(true);
    setSorted(new Set());

    animations.forEach((step, i) => {
      const id = setTimeout(() => {
        if (step.type === 'compare') {
          setCompare(step.indices);
          setSwap([]);
        } else if (step.type === 'swap') {
          setSwap(step.indices);
          const [a, b] = step.indices;
          [workingArray[a], workingArray[b]] = [workingArray[b], workingArray[a]];
          setArray([...workingArray]);
        } else if (step.type === 'overwrite') {
          workingArray[step.index] = step.value;
          setArray([...workingArray]);
        } else if (step.type === 'sorted') {
          setSorted((prev) => {
            const next = new Set(prev);
            next.add(step.index);
            return next;
          });
        }
        if (i === animations.length - 1) {
          setIsSorting(false);
          setCompare([]);
          setSwap([]);
        }
      }, i * delay);
      timeoutsRef.current.push(id);
    });
  };

  const barColor = (index) => {
    if (sorted.has(index)) return 'var(--sorted)';
    if (swap.includes(index)) return 'var(--swap)';
    if (compare.includes(index)) return 'var(--compare)';
    return 'var(--accent)';
  };

  return (
    <div className="visualizer">
      <div className="visualizer-controls">
        <label className="control">
          Algorithm
          <select value={algorithm} disabled={isSorting} onChange={(e) => setAlgorithm(e.target.value)}>
            {Object.entries(ALGORITHMS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        <span className="complexity-badge">{ALGORITHMS[algorithm].complexity}</span>

        <label className="control">
          Size: {size}
          <input type="range" min="10" max="150" value={size} disabled={isSorting} onChange={handleSizeChange} />
        </label>
        <label className="control">
          Speed
          <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>

        <button className="btn btn-secondary" disabled={isSorting} onClick={() => resetArray()}>
          Randomize
        </button>
        <button className="btn btn-primary" disabled={isSorting} onClick={runSort}>
          {isSorting ? 'Sorting…' : 'Sort'}
        </button>
      </div>

      <div className="bars">
        {array.map((value, index) => (
          <div
            key={index}
            className="bar"
            style={{
              height: `${value}px`,
              width: `${Math.max(100 / array.length, 0.4)}%`,
              background: barColor(index),
            }}
          />
        ))}
      </div>
    </div>
  );
}
