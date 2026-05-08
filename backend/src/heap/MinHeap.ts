/**
 * =============================================================
 * MinHeap — Custom Min-Heap Implementation for Priority Queue
 * =============================================================
 *
 * A generic Min-Heap implementation used to maintain the top N
 * highest-priority notifications efficiently.
 *
 * STRATEGY:
 * We use a MIN-heap (not max-heap) to keep the top N items.
 * The root always holds the LOWEST priority item in the heap.
 * When a new item arrives:
 *   - If heap is not full → insert normally
 *   - If new item's priority > root's priority → remove root, insert new item
 *   - If new item's priority <= root's priority → discard it
 *
 * This ensures we always have the top N highest-priority items.
 *
 * TIME COMPLEXITY:
 *   - Insert: O(log n)
 *   - Extract min: O(log n)
 *   - Peek min: O(1)
 *   - Get all sorted: O(n log n)
 *
 * SPACE COMPLEXITY: O(n) where n = capacity
 *
 * NO EXTERNAL ALGORITHM LIBRARIES USED.
 */

import type { PrioritizedNotification } from "../types/notification";

export class MinHeap {
  private heap: PrioritizedNotification[];
  private capacity: number;

  /**
   * Creates a new MinHeap with the specified capacity.
   *
   * @param capacity - Maximum number of items to keep (top N)
   */
  constructor(capacity: number = 100) {
    this.heap = [];
    this.capacity = capacity;
  }

  // ─── Public API ─────────────────────────────────────────

  /**
   * Returns the current number of items in the heap.
   */
  get size(): number {
    return this.heap.length;
  }

  /**
   * Returns the heap capacity (max items).
   */
  get maxCapacity(): number {
    return this.capacity;
  }

  /**
   * Checks if the heap is empty.
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Checks if the heap is at full capacity.
   */
  isFull(): boolean {
    return this.heap.length >= this.capacity;
  }

  /**
   * Returns the minimum priority item without removing it.
   * This is the item with the LOWEST priority score (root of min-heap).
   *
   * Time: O(1)
   */
  peek(): PrioritizedNotification | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Inserts a notification into the heap.
   *
   * If the heap is full and the new item has higher priority than
   * the current minimum, it replaces the minimum.
   *
   * Time: O(log n)
   *
   * @param notification - The prioritized notification to insert
   * @returns true if the item was inserted, false if discarded
   */
  insert(notification: PrioritizedNotification): boolean {
    // If heap is not full, simply add the item
    if (!this.isFull()) {
      this.heap.push(notification);
      this.bubbleUp(this.heap.length - 1);
      return true;
    }

    // Heap is full — check if new item beats the current minimum
    const min = this.peek();
    if (min && notification.priorityScore > min.priorityScore) {
      // Replace the root (minimum) with the new item
      this.heap[0] = notification;
      this.bubbleDown(0);
      return true;
    }

    // New item's priority is too low — discard it
    return false;
  }

  /**
   * Removes and returns the minimum priority item (root).
   *
   * Time: O(log n)
   */
  extractMin(): PrioritizedNotification | null {
    if (this.isEmpty()) return null;

    const min = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  /**
   * Returns all items sorted by priority (highest first).
   * Does NOT modify the heap.
   *
   * Time: O(n log n) for the sort
   */
  getTopN(): PrioritizedNotification[] {
    // Return a copy sorted by priority score descending
    return [...this.heap].sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Returns all items sorted by priority, limited to n items.
   *
   * @param n - Maximum number of items to return
   */
  getTopNLimited(n: number): PrioritizedNotification[] {
    return this.getTopN().slice(0, n);
  }

  /**
   * Clears the entire heap.
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Updates the capacity of the heap.
   * If new capacity is smaller, removes excess items.
   *
   * @param newCapacity - The new maximum capacity
   */
  setCapacity(newCapacity: number): void {
    this.capacity = newCapacity;

    // Trim excess items if necessary
    while (this.heap.length > this.capacity) {
      this.extractMin();
    }
  }

  /**
   * Checks if a notification with the given ID exists in the heap.
   *
   * Time: O(n)
   *
   * @param id - The notification ID to search for
   */
  contains(id: string): boolean {
    return this.heap.some((item) => item.id === id);
  }

  /**
   * Returns a snapshot of the heap for debugging.
   */
  toArray(): PrioritizedNotification[] {
    return [...this.heap];
  }

  // ─── Private Heap Operations ────────────────────────────

  /**
   * Moves an item up the heap to maintain the min-heap property.
   * Called after insertion.
   *
   * @param index - The index of the item to bubble up
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      // If parent's priority is <= current's priority, heap is valid
      if (this.heap[parentIndex].priorityScore <= this.heap[index].priorityScore) {
        break;
      }

      // Swap with parent
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Moves an item down the heap to maintain the min-heap property.
   * Called after extraction or replacement.
   *
   * @param index - The index of the item to bubble down
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      // Check if left child has smaller priority
      if (
        leftChild < length &&
        this.heap[leftChild].priorityScore < this.heap[smallest].priorityScore
      ) {
        smallest = leftChild;
      }

      // Check if right child has smaller priority
      if (
        rightChild < length &&
        this.heap[rightChild].priorityScore < this.heap[smallest].priorityScore
      ) {
        smallest = rightChild;
      }

      // If smallest is still the current index, heap is valid
      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * Swaps two items in the heap array.
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
