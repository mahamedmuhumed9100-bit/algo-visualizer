# Algorithm Visualizer

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
