// All four algorithms take a grid (2D array of node objects), a start node,
// and an end node, and return the list of nodes in the order they were
// visited. Each mutates the node objects it's given (isVisited, distance,
// previousNode, ...) — callers should pass in a fresh copy per run.

import { MinHeap } from './MinHeap.js';

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isVisited && !n.isWall);
}

function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Walks the previousNode chain back from the end node. Returns [] if the
// end node was never reached.
export function getNodesInShortestPathOrder(finishNode) {
  const path = [];
  let current = finishNode;
  if (!current.isVisited && current.previousNode === null) return path;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}

export function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.isVisited = true;
  const queue = [startNode];

  while (queue.length) {
    const node = queue.shift();
    visitedNodesInOrder.push(node);
    if (node === endNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(node, grid)) {
      neighbor.isVisited = true;
      neighbor.previousNode = node;
      queue.push(neighbor);
    }
  }
  return visitedNodesInOrder;
}

export function dfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];

  while (stack.length) {
    const node = stack.pop();
    if (node.isVisited) continue;
    node.isVisited = true;
    visitedNodesInOrder.push(node);
    if (node === endNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(node, grid)) {
      neighbor.previousNode = node;
      stack.push(neighbor);
    }
  }
  return visitedNodesInOrder;
}

// Dijkstra and A* share this loop; they differ only in the priority used to
// pick the next node. The frontier is a binary min-heap, so each pick is
// O(log n) rather than re-sorting every node on every step.
//
// A node can be pushed more than once if a shorter route to it is found
// later ("lazy deletion"): stale heap entries are skipped when popped, which
// is simpler than implementing decrease-key and has the same complexity.
function bestFirstSearch(grid, startNode, endNode, priorityOf, tieBreakerOf = () => 0) {
  const visitedNodesInOrder = [];
  if (startNode.isWall) return visitedNodesInOrder;
  startNode.distance = 0;
  const frontier = new MinHeap();
  frontier.push(startNode, priorityOf(startNode), tieBreakerOf(startNode));

  while (!frontier.isEmpty()) {
    const { value: node, priority } = frontier.pop();
    if (node.isVisited || priority > priorityOf(node)) continue; // stale entry

    node.isVisited = true;
    visitedNodesInOrder.push(node);
    if (node === endNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(node, grid)) {
      const newDistance = node.distance + 1;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = node;
        frontier.push(neighbor, priorityOf(neighbor), tieBreakerOf(neighbor));
      }
    }
  }
  return visitedNodesInOrder; // frontier exhausted: end node unreachable
}

export function dijkstra(grid, startNode, endNode) {
  return bestFirstSearch(grid, startNode, endNode, (node) => node.distance);
}

// A* = Dijkstra plus a heuristic: priority is distance so far + Manhattan
// distance to the end. Manhattan distance never overestimates on a 4-way
// grid (it's "admissible"), so the path found is still the shortest.
//
// Ties matter a lot here: on an open grid every node between start and end
// has the same total, so A* would explore them all like BFS. Breaking ties
// towards the node with the smaller heuristic (closer to the end) makes it
// head straight for the target instead.
export function astar(grid, startNode, endNode) {
  return bestFirstSearch(
    grid,
    startNode,
    endNode,
    (node) => {
      node.totalDistance = node.distance + manhattanDistance(node, endNode);
      return node.totalDistance;
    },
    (node) => manhattanDistance(node, endNode),
  );
}
