// All four algorithms take a grid (2D array of node objects), a start node,
// and an end node, and return the list of nodes in the order they were
// visited. Each mutates the node objects it's given (isVisited, distance,
// previousNode, ...) — callers should pass in a fresh copy per run.

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) for (const node of row) nodes.push(node);
  return nodes;
}

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

export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === endNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(closestNode, grid)) {
      const newDistance = closestNode.distance + 1;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = closestNode;
      }
    }
  }
  return visitedNodesInOrder;
}

export function astar(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.totalDistance = manhattanDistance(startNode, endNode);
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => a.totalDistance - b.totalDistance);
    const closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) continue;
    if (closestNode.totalDistance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === endNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(closestNode, grid)) {
      const newDistance = closestNode.distance + 1;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.totalDistance = newDistance + manhattanDistance(neighbor, endNode);
        neighbor.previousNode = closestNode;
      }
    }
  }
  return visitedNodesInOrder;
}
