/**
 * MinHeap-based Priority Queue for Huffman tree construction.
 * Nodes with lower frequency have higher priority.
 */
export class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  /** Insert a node into the queue. */
  enqueue(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  /** Remove and return the node with the lowest frequency. */
  dequeue() {
    if (this.size === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.size > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].freq <= this.heap[i].freq) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.size;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].freq < this.heap[smallest].freq) smallest = left;
      if (right < n && this.heap[right].freq < this.heap[smallest].freq) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}
