// A binary min-heap priority queue, used by Dijkstra and A* to pick the
// closest unvisited node in O(log n) instead of re-sorting every step.
//
// Stored as a flat array where the children of index i are at 2i+1 and 2i+2,
// so the smallest priority is always at index 0.
//
// Ties on priority are broken by an optional second key (smaller first), then
// by insertion order (first in, first out), so runs are deterministic: the
// same grid always animates the same way.
export class MinHeap {
  #items = [];
  #counter = 0;

  get size() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  push(value, priority, tieBreaker = 0) {
    this.#items.push({ value, priority, tieBreaker, order: this.#counter++ });
    this.#siftUp(this.#items.length - 1);
  }

  // Removes and returns { value, priority } with the smallest priority,
  // or undefined if the heap is empty.
  pop() {
    const items = this.#items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return { value: top.value, priority: top.priority };
  }

  #less(i, j) {
    const a = this.#items[i];
    const b = this.#items[j];
    if (a.priority !== b.priority) return a.priority < b.priority;
    if (a.tieBreaker !== b.tieBreaker) return a.tieBreaker < b.tieBreaker;
    return a.order < b.order;
  }

  #swap(i, j) {
    const items = this.#items;
    [items[i], items[j]] = [items[j], items[i]];
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.#less(i, parent)) return;
      this.#swap(i, parent);
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.#items.length;
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && this.#less(left, smallest)) smallest = left;
      if (right < n && this.#less(right, smallest)) smallest = right;
      if (smallest === i) return;
      this.#swap(i, smallest);
      i = smallest;
    }
  }
}
