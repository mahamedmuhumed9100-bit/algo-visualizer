# Algorithm Visualizer

[![Deploy to GitHub Pages](https://github.com/mahamedmuhumed9100-bit/algo-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/mahamedmuhumed9100-bit/algo-visualizer/actions/workflows/deploy.yml)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vitest](https://img.shields.io/badge/tests-68%20passing-brightgreen)

An interactive sorting and pathfinding algorithm visualizer, built to demonstrate
core data structures & algorithms concepts from my Computer Science degree.

**Live:** https://mahamedmuhumed9100-bit.github.io/algo-visualizer/

## What it does

**Sorting** — watch Bubble, Selection, Insertion, Merge, Quick, and Heap sort
run on a randomized array of bars, with adjustable array size and speed.
Comparisons, swaps, and finalized positions are all color-coded.

**Pathfinding** — draw walls on a grid, drag the start/end nodes anywhere, and
watch Breadth-First Search, Depth-First Search, Dijkstra's Algorithm, or A*
Search explore the grid and trace the shortest path it finds.

## Why these algorithms

Every algorithm is implemented from scratch (no library does the actual
sorting/searching) — `src/algorithms/sortingAlgorithms.js` and
`src/algorithms/pathfindingAlgorithms.js` contain the real implementations,
each returning a list of animation steps that the UI replays. That's the part
of this project that's actually about the CS degree; the React app around it
is just what makes it watchable.

## Complexity

| Sorting | Best | Average | Worst | Extra space | Stable? |
|---|---|---|---|---|---|
| Bubble | O(n²)¹ | O(n²) | O(n²) | O(1) | ✅ |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick | O(n log n) | O(n log n) | O(n²)² | O(log n) | ❌ |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |

¹ this version always runs every pass; stopping early after a pass with no
swaps would make the best case (already sorted) O(n). ² worst case on already-sorted
input, because the pivot is the last element; a random or median-of-three pivot
would make that case unlikely.

| Pathfinding | Weighted? | Shortest path guaranteed? | Notes |
|---|---|---|---|
| BFS | ❌ | ✅ (unweighted grid) | O(V + E) |
| DFS | ❌ | ❌ | O(V + E); finds *a* path, often a winding one |
| Dijkstra | ✅ | ✅ | explores outward evenly in every direction |
| A* | ✅ | ✅ | Manhattan-distance heuristic (admissible on a 4-way grid), so it heads towards the target and usually visits far fewer nodes than Dijkstra |

Dijkstra and A* keep their frontier in an array that is re-sorted every step,
which is simple to animate but costs O(V² log V). Swapping in a binary-heap
priority queue would bring them down to the textbook O((V + E) log V).

## Tech stack

- React 19 + Vite
- Plain CSS (custom properties for theming, no framework)
- Vitest for unit tests
- GitHub Actions → GitHub Pages for CI/CD

## Running locally

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

68 tests cover every sorting algorithm against edge cases (empty array, single
element, duplicates, already-sorted, reverse-sorted, random) and every
pathfinding algorithm against open grids, walls that force a detour, and grids
where the end node is fully boxed in.

## Deployment

Every push to `master` runs the test suite, builds the app, and deploys it to
GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
