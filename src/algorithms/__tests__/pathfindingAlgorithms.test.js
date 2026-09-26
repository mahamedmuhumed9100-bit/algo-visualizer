import { describe, it, expect } from 'vitest';
import { bfs, dfs, dijkstra, astar, getNodesInShortestPathOrder } from '../pathfindingAlgorithms';

function createGrid(rows, cols) {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const line = [];
    for (let col = 0; col < cols; col++) {
      line.push({
        row,
        col,
        isStart: false,
        isEnd: false,
        isWall: false,
        distance: Infinity,
        totalDistance: Infinity,
        isVisited: false,
        previousNode: null,
      });
    }
    grid.push(line);
  }
  return grid;
}

const SHORTEST_PATH_ALGORITHMS = { bfs, dijkstra, astar };
const ALL_ALGORITHMS = { bfs, dfs, dijkstra, astar };

describe.each(Object.entries(SHORTEST_PATH_ALGORITHMS))('%s finds the shortest path', (name, fn) => {
  it('on an open grid, path length matches Manhattan distance', () => {
    const grid = createGrid(10, 10);
    const start = grid[0][0];
    const end = grid[9][9];
    fn(grid, start, end);
    const path = getNodesInShortestPathOrder(end);
    expect(path.length - 1).toBe(18); // Manhattan distance, no walls in the way
  });

  it('routes around a wall instead of failing', () => {
    const grid = createGrid(5, 5);
    // Wall off column 2 except one gap at row 4 — forces a detour.
    for (let row = 0; row < 4; row++) grid[row][2].isWall = true;
    const start = grid[0][0];
    const end = grid[0][4];
    fn(grid, start, end);
    const path = getNodesInShortestPathOrder(end);
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toBe(end);
    for (const node of path) expect(node.isWall).toBe(false);
  });
});

describe.each(Object.entries(ALL_ALGORITHMS))('%s', (name, fn) => {
  it('reports no path when the end node is fully walled in', () => {
    const grid = createGrid(5, 5);
    const end = grid[2][2];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      grid[2 + dr][2 + dc].isWall = true;
    }
    const start = grid[0][0];
    fn(grid, start, end);
    expect(getNodesInShortestPathOrder(end)).toEqual([]);
  });

  it('visits the start node first', () => {
    const grid = createGrid(6, 6);
    const start = grid[0][0];
    const end = grid[5][5];
    const visited = fn(grid, start, end);
    expect(visited[0]).toBe(start);
  });
});

// BFS is guaranteed to find the shortest path on an unweighted grid, so it's
// a reference answer: the heap-based Dijkstra and A* must always agree with it.
describe('heap-based Dijkstra and A* agree with BFS on random grids', () => {
  function randomWalls(grid, density, seed) {
    // Small deterministic PRNG so a failure is reproducible.
    let state = seed;
    const random = () => ((state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (const row of grid) for (const node of row) node.isWall = random() < density;
  }

  function shortestPathLength(fn, seed) {
    const grid = createGrid(15, 20);
    randomWalls(grid, 0.3, seed);
    const start = grid[0][0];
    const end = grid[14][19];
    start.isWall = false;
    end.isWall = false;
    fn(grid, start, end);
    return getNodesInShortestPathOrder(end).length;
  }

  for (let seed = 1; seed <= 25; seed++) {
    it(`seed ${seed}`, () => {
      const expected = shortestPathLength(bfs, seed);
      expect(shortestPathLength(dijkstra, seed)).toBe(expected);
      expect(shortestPathLength(astar, seed)).toBe(expected);
    });
  }
});

describe('A* visits fewer nodes than Dijkstra', () => {
  it('on an open grid, thanks to its heuristic', () => {
    const dGrid = createGrid(20, 20);
    const aGrid = createGrid(20, 20);
    const dVisited = dijkstra(dGrid, dGrid[0][0], dGrid[19][19]).length;
    const aVisited = astar(aGrid, aGrid[0][0], aGrid[19][19]).length;
    expect(aVisited).toBeLessThan(dVisited);
  });
});
