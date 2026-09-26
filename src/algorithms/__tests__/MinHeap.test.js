import { describe, it, expect } from 'vitest';
import { MinHeap } from '../MinHeap';

function drain(heap) {
  const out = [];
  while (!heap.isEmpty()) out.push(heap.pop());
  return out;
}

describe('MinHeap', () => {
  it('starts empty and pop() returns undefined', () => {
    const heap = new MinHeap();
    expect(heap.isEmpty()).toBe(true);
    expect(heap.size).toBe(0);
    expect(heap.pop()).toBeUndefined();
  });

  it('pops values in ascending priority order', () => {
    const heap = new MinHeap();
    for (const p of [5, 3, 8, 1, 9, 2, 7]) heap.push(`v${p}`, p);
    expect(drain(heap).map((e) => e.priority)).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it('breaks ties in insertion order', () => {
    const heap = new MinHeap();
    heap.push('first', 1);
    heap.push('second', 1);
    heap.push('zero', 0);
    heap.push('third', 1);
    expect(drain(heap).map((e) => e.value)).toEqual(['zero', 'first', 'second', 'third']);
  });

  it('handles Infinity priorities', () => {
    const heap = new MinHeap();
    heap.push('far', Infinity);
    heap.push('near', 2);
    expect(heap.pop().value).toBe('near');
    expect(heap.pop().value).toBe('far');
  });

  it('matches a sorted array on 1,000 random priorities', () => {
    const heap = new MinHeap();
    const priorities = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100));
    priorities.forEach((p, i) => heap.push(i, p));
    expect(heap.size).toBe(1000);
    expect(drain(heap).map((e) => e.priority)).toEqual([...priorities].sort((a, b) => a - b));
  });
});

describe('MinHeap tie-breaker', () => {
  it('uses the second key when priorities are equal', () => {
    const heap = new MinHeap();
    heap.push('far', 10, 5);
    heap.push('near', 10, 1);
    heap.push('best', 9, 99);
    expect(drain(heap).map((e) => e.value)).toEqual(['best', 'near', 'far']);
  });
});
