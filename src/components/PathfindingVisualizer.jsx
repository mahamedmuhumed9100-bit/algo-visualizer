import { useCallback, useEffect, useRef, useState } from 'react';
import { bfs, dfs, dijkstra, astar, getNodesInShortestPathOrder } from '../algorithms/pathfindingAlgorithms';
import './PathfindingVisualizer.css';

const ROWS = 15;
const COLS = 30;
const INITIAL_START = { row: 7, col: 5 };
const INITIAL_END = { row: 7, col: 24 };

const ALGORITHMS = {
  astar: { label: 'A* Search', fn: astar },
  dijkstra: { label: "Dijkstra's Algorithm", fn: dijkstra },
  bfs: { label: 'Breadth-First Search', fn: bfs },
  dfs: { label: 'Depth-First Search', fn: dfs },
};

function createNode(row, col, startPos, endPos) {
  return {
    row,
    col,
    isStart: row === startPos.row && col === startPos.col,
    isEnd: row === endPos.row && col === endPos.col,
    isWall: false,
    distance: Infinity,
    totalDistance: Infinity,
    isVisited: false,
    previousNode: null,
  };
}

function createGrid(startPos, endPos) {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) currentRow.push(createNode(row, col, startPos, endPos));
    grid.push(currentRow);
  }
  return grid;
}

export default function PathfindingVisualizer() {
  const [startPos, setStartPos] = useState(INITIAL_START);
  const [endPos, setEndPos] = useState(INITIAL_END);
  const [grid, setGrid] = useState(() => createGrid(INITIAL_START, INITIAL_END));
  const [algorithm, setAlgorithm] = useState('astar');
  const [speed, setSpeed] = useState(70);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [status, setStatus] = useState('');

  const mousePressed = useRef(false);
  const draggingNode = useRef(null); // 'start' | 'end' | null
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearTimeouts(), []);

  useEffect(() => {
    const onUp = () => {
      mousePressed.current = false;
      draggingNode.current = null;
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  const paintNodeClass = (row, col, extraClass) => {
    const el = document.getElementById(`node-${row}-${col}`);
    if (el) el.className = extraClass ? `node ${extraClass}` : 'node';
  };

  const repaintStaticGrid = useCallback((sourceGrid) => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const node = sourceGrid[row][col];
        let cls = '';
        if (node.isStart) cls = 'node-start';
        else if (node.isEnd) cls = 'node-end';
        else if (node.isWall) cls = 'node-wall';
        paintNodeClass(row, col, cls);
      }
    }
  }, []);

  const resetRun = useCallback(() => {
    clearTimeouts();
    setIsVisualizing(false);
    setStatus('');
    setGrid((prev) => {
      const next = prev.map((r) => r.map((n) => ({ ...n, isVisited: false, distance: Infinity, totalDistance: Infinity, previousNode: null })));
      repaintStaticGrid(next);
      return next;
    });
  }, [repaintStaticGrid]);

  const clearWalls = () => {
    clearTimeouts();
    setIsVisualizing(false);
    setStatus('');
    const next = createGrid(startPos, endPos);
    setGrid(next);
    repaintStaticGrid(next);
  };

  const randomWalls = () => {
    if (isVisualizing) return;
    clearTimeouts();
    setStatus('');
    setGrid((prev) => {
      const next = prev.map((row) =>
        row.map((node) => {
          if (node.isStart || node.isEnd) return { ...node, isWall: false };
          return { ...node, isWall: Math.random() < 0.28, isVisited: false, previousNode: null, distance: Infinity, totalDistance: Infinity };
        })
      );
      repaintStaticGrid(next);
      return next;
    });
  };

  const toggleWall = (row, col) => {
    setGrid((prev) => {
      const node = prev[row][col];
      if (node.isStart || node.isEnd) return prev;
      const next = prev.map((r) => r.slice());
      next[row][col] = { ...node, isWall: !node.isWall };
      paintNodeClass(row, col, next[row][col].isWall ? 'node-wall' : '');
      return next;
    });
  };

  const moveSpecialNode = (row, col, which) => {
    setGrid((prev) => {
      const target = prev[row][col];
      if (target.isWall) return prev;
      const next = prev.map((r) => r.slice());
      const oldPos = which === 'start' ? startPos : endPos;
      if (oldPos.row === row && oldPos.col === col) return prev;

      next[oldPos.row][oldPos.col] = {
        ...next[oldPos.row][oldPos.col],
        isStart: which === 'start' ? false : next[oldPos.row][oldPos.col].isStart,
        isEnd: which === 'end' ? false : next[oldPos.row][oldPos.col].isEnd,
      };
      next[row][col] = {
        ...next[row][col],
        isStart: which === 'start' ? true : next[row][col].isStart,
        isEnd: which === 'end' ? true : next[row][col].isEnd,
      };

      paintNodeClass(oldPos.row, oldPos.col, '');
      paintNodeClass(row, col, which === 'start' ? 'node-start' : 'node-end');

      if (which === 'start') setStartPos({ row, col });
      else setEndPos({ row, col });

      return next;
    });
  };

  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    const node = grid[row][col];
    if (node.isStart) {
      draggingNode.current = 'start';
      return;
    }
    if (node.isEnd) {
      draggingNode.current = 'end';
      return;
    }
    mousePressed.current = true;
    toggleWall(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isVisualizing) return;
    if (draggingNode.current) {
      moveSpecialNode(row, col, draggingNode.current);
      return;
    }
    if (mousePressed.current) toggleWall(row, col);
  };

  const animatePath = (nodesInShortestPathOrder) => {
    if (nodesInShortestPathOrder.length === 0) {
      setStatus('No path found — that wall layout boxed the end node in.');
      setIsVisualizing(false);
      return;
    }
    nodesInShortestPathOrder.forEach((node, i) => {
      const id = setTimeout(() => {
        if (!node.isStart && !node.isEnd) paintNodeClass(node.row, node.col, 'node-path');
        if (i === nodesInShortestPathOrder.length - 1) {
          setStatus(`Shortest path found — ${nodesInShortestPathOrder.length - 1} steps.`);
          setIsVisualizing(false);
        }
      }, i * 25);
      timeoutsRef.current.push(id);
    });
  };

  const visualize = () => {
    // Deliberately reads `grid` from the closure and calls setGrid once with a
    // plain value (never a setGrid(prev => ...) updater) — React 18 StrictMode
    // invokes updater functions twice in dev, which would double-schedule every
    // timeout below and run the animation twice at once.
    if (isVisualizing) return;
    clearTimeouts();
    setStatus('');
    setIsVisualizing(true);

    const gridCopy = grid.map((row) => row.map((node) => ({ ...node, isVisited: false, distance: Infinity, totalDistance: Infinity, previousNode: null })));
    repaintStaticGrid(gridCopy);

    const startNode = gridCopy[startPos.row][startPos.col];
    const endNode = gridCopy[endPos.row][endPos.col];
    const visitedNodesInOrder = ALGORITHMS[algorithm].fn(gridCopy, startNode, endNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
    const delay = Math.max(210 - speed * 2, 2);

    if (visitedNodesInOrder.length === 0) {
      animatePath(nodesInShortestPathOrder);
    } else {
      visitedNodesInOrder.forEach((node, i) => {
        const id = setTimeout(() => {
          if (!node.isStart && !node.isEnd) paintNodeClass(node.row, node.col, 'node-visited');
          if (i === visitedNodesInOrder.length - 1) animatePath(nodesInShortestPathOrder);
        }, i * delay);
        timeoutsRef.current.push(id);
      });
    }

    setGrid(
      gridCopy.map((row) => row.map((node) => ({ ...node, isVisited: false, distance: Infinity, totalDistance: Infinity, previousNode: null })))
    );
  };

  return (
    <div className="visualizer">
      <div className="visualizer-controls">
        <label className="control">
          Algorithm
          <select value={algorithm} disabled={isVisualizing} onChange={(e) => setAlgorithm(e.target.value)}>
            {Object.entries(ALGORITHMS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        <label className="control">
          Speed
          <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>

        <button className="btn btn-secondary" disabled={isVisualizing} onClick={randomWalls}>
          Random Walls
        </button>
        <button className="btn btn-secondary" disabled={isVisualizing} onClick={clearWalls}>
          Clear Board
        </button>
        <button className="btn btn-secondary" disabled={isVisualizing} onClick={resetRun}>
          Clear Path
        </button>
        <button className="btn btn-primary" disabled={isVisualizing} onClick={visualize}>
          {isVisualizing ? 'Visualizing…' : 'Visualize'}
        </button>
      </div>

      <p className="hint">Drag the green/red squares to move start &amp; end. Click and drag on empty cells to draw walls.</p>
      {status && <p className="status">{status}</p>}

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        onMouseLeave={() => {
          mousePressed.current = false;
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((node, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              id={`node-${rowIdx}-${colIdx}`}
              className={`node ${node.isStart ? 'node-start' : node.isEnd ? 'node-end' : node.isWall ? 'node-wall' : ''}`}
              onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
              onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
            />
          ))
        )}
      </div>

      <div className="legend">
        <span><i className="swatch swatch-start" /> Start</span>
        <span><i className="swatch swatch-end" /> End</span>
        <span><i className="swatch swatch-wall" /> Wall</span>
        <span><i className="swatch swatch-visited" /> Visited</span>
        <span><i className="swatch swatch-path" /> Shortest path</span>
      </div>
    </div>
  );
}
