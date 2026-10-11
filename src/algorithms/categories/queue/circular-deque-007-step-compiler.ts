/**
 * Class 007: 循环双端队列设计 (Circular Deque Design) - 步进编译器
 * 左程云算法通关课入门篇 Class 007 / LeetCode 641
 */

import { StepBase } from '../../../core/step-visualizer';

export interface CircularDequeStep extends StepBase {
  stepIndex?: number;
  buffer: (number | null)[];
  head: number;
  tail: number;
  size: number;
  capacity: number;
  operation: string;
  resultStatus: boolean | number | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const CIRCULAR_DEQUE_007_CODES = {
  java: `public class MyCircularDeque {
    private int[] elements;
    private int head, tail, size, capacity;

    public MyCircularDeque(int k) {
        elements = new int[k];
        capacity = k;
        head = 0; tail = 0; size = 0;
    }

    public boolean insertFront(int value) {
        if (isFull()) return false;
        if (isEmpty()) {
            head = tail = 0;
            elements[0] = value;
        } else {
            head = (head == 0) ? capacity - 1 : head - 1;
            elements[head] = value;
        }
        size++;
        return true;
    }

    public boolean insertLast(int value) {
        if (isFull()) return false;
        if (isEmpty()) {
            head = tail = 0;
            elements[0] = value;
        } else {
            tail = (tail == capacity - 1) ? 0 : tail + 1;
            elements[tail] = value;
        }
        size++;
        return true;
    }

    public boolean deleteFront() {
        if (isEmpty()) return false;
        head = (head == capacity - 1) ? 0 : head + 1;
        size--;
        return true;
    }

    public boolean deleteLast() {
        if (isEmpty()) return false;
        tail = (tail == 0) ? capacity - 1 : tail - 1;
        size--;
        return true;
    }
    public boolean isEmpty() { return size == 0; }
    public boolean isFull() { return size == capacity; }
}`,
  cpp: `class MyCircularDeque {
private:
    vector<int> elements;
    int head, tail, size, capacity;
public:
    MyCircularDeque(int k) : elements(k), head(0), tail(0), size(0), capacity(k) {}

    bool insertFront(int value) {
        if (isFull()) return false;
        if (isEmpty()) head = tail = 0, elements[0] = value;
        else {
            head = (head == 0) ? capacity - 1 : head - 1;
            elements[head] = value;
        }
        size++; return true;
    }

    bool insertLast(int value) {
        if (isFull()) return false;
        if (isEmpty()) head = tail = 0, elements[0] = value;
        else {
            tail = (tail == capacity - 1) ? 0 : tail + 1;
            elements[tail] = value;
        }
        size++; return true;
    }

    bool deleteFront() {
        if (isEmpty()) return false;
        head = (head == capacity - 1) ? 0 : head + 1;
        size--; return true;
    }

    bool deleteLast() {
        if (isEmpty()) return false;
        tail = (tail == 0) ? capacity - 1 : tail - 1;
        size--; return true;
    }
    bool isEmpty() { return size == 0; }
    bool isFull() { return size == capacity; }
};`,
  python: `class MyCircularDeque:
    def __init__(self, k: int):
        self.elements = [None] * k
        self.capacity = k
        self.head = 0
        self.tail = 0
        self.size = 0

    def insertFront(self, value: int) -> bool:
        if self.isFull(): return False
        if self.isEmpty():
            self.head = self.tail = 0
            self.elements[0] = value
        else:
            self.head = self.capacity - 1 if self.head == 0 else self.head - 1
            self.elements[self.head] = value
        self.size += 1
        return True

    def insertLast(self, value: int) -> bool:
        if self.isFull(): return False
        if self.isEmpty():
            self.head = self.tail = 0
            self.elements[0] = value
        else:
            self.tail = 0 if self.tail == self.capacity - 1 else self.tail + 1
            self.elements[self.tail] = value
        self.size += 1
        return True

    def deleteFront(self) -> bool:
        if self.isEmpty(): return False
        self.head = 0 if self.head == self.capacity - 1 else self.head + 1
        self.size -= 1
        return True

    def deleteLast(self) -> bool:
        if self.isEmpty(): return False
        self.tail = self.capacity - 1 if self.tail == 0 else self.tail - 1
        self.size -= 1
        return True

    def isEmpty(self) -> bool: return self.size == 0
    def isFull(self) -> bool: return self.size == self.capacity`,
  typescript: `export class MyCircularDeque {
  private elements: (number | null)[];
  private head = 0;
  private tail = 0;
  private size = 0;
  private capacity: number;

  constructor(k: number) {
    this.capacity = k;
    this.elements = new Array(k).fill(null);
  }

  insertFront(value: number): boolean {
    if (this.isFull()) return false;
    if (this.isEmpty()) {
      this.head = this.tail = 0;
      this.elements[0] = value;
    } else {
      this.head = this.head === 0 ? this.capacity - 1 : this.head - 1;
      this.elements[this.head] = value;
    }
    this.size++;
    return true;
  }

  insertLast(value: number): boolean {
    if (this.isFull()) return false;
    if (this.isEmpty()) {
      this.head = this.tail = 0;
      this.elements[0] = value;
    } else {
      this.tail = this.tail === this.capacity - 1 ? 0 : this.tail + 1;
      this.elements[this.tail] = value;
    }
    this.size++;
    return true;
  }

  deleteFront(): boolean {
    if (this.isEmpty()) return false;
    this.elements[this.head] = null;
    this.head = this.head === this.capacity - 1 ? 0 : this.head + 1;
    this.size--;
    return true;
  }

  deleteLast(): boolean {
    if (this.isEmpty()) return false;
    this.elements[this.tail] = null;
    this.tail = this.tail === 0 ? this.capacity - 1 : this.tail - 1;
    this.size--;
    return true;
  }

  isEmpty(): boolean { return this.size === 0; }
  isFull(): boolean { return this.size === this.capacity; }
}`
};

export const CIRCULAR_DEQUE_007_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 5, cpp: 6, python: 2, typescript: 9 },
  insertFrontFail: { java: 12, cpp: 9, python: 10, typescript: 14 },
  insertFrontOk: { java: 18, cpp: 14, python: 16, typescript: 20 },
  insertLastFail: { java: 25, cpp: 19, python: 22, typescript: 27 },
  insertLastOk: { java: 31, cpp: 24, python: 28, typescript: 33 },
  deleteFrontFail: { java: 38, cpp: 29, python: 33, typescript: 40 },
  deleteFrontOk: { java: 40, cpp: 31, python: 35, typescript: 43 },
  deleteLastFail: { java: 45, cpp: 35, python: 39, typescript: 48 },
  deleteLastOk: { java: 47, cpp: 37, python: 41, typescript: 51 },
};

export function generateCircularDequeSteps(
  capacity: number,
  operations: Array<{ op: 'insertFront' | 'insertLast' | 'deleteFront' | 'deleteLast'; val?: number }>
): CircularDequeStep[] {
  const steps: CircularDequeStep[] = [];
  const buffer: (number | null)[] = new Array(capacity).fill(null);
  let head = 0;
  let tail = 0;
  let size = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    buffer: [...buffer],
    head,
    tail,
    size,
    capacity,
    operation: `初始化循环队列 (容量 k = ${capacity})`,
    resultStatus: null,
    decision: `创建容量为 ${capacity} 的循环双端队列，初始 head=0, tail=0, size=0`,
    message: `容量 ${capacity} 初始化完毕`,
    log: `Init CircularDeque(capacity=${capacity})`,
    codeLine: CIRCULAR_DEQUE_007_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (const { op, val } of operations) {
    if (op === 'insertFront') {
      const isFull = size === capacity;
      if (isFull) {
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: `insertFront(${val})`,
          resultStatus: false,
          decision: `队列已满 (size=${size} == capacity)，无法执行头部插入，返回 false`,
          message: '队列已满',
          log: `insertFront(${val}) -> 队列满，失败`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.insertFrontFail,
          statusBadge: { text: '插入失败(满)', type: 'danger' }
        });
      } else {
        if (size === 0) {
          head = tail = 0;
          buffer[0] = val!;
        } else {
          head = head === 0 ? capacity - 1 : head - 1;
          buffer[head] = val!;
        }
        size++;
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: `insertFront(${val})`,
          resultStatus: true,
          decision: `头部插入值 ${val}：head 左移至下标 ${head} 并存入元素，当前 size=${size}`,
          message: `头部插入成功: ${val}`,
          log: `insertFront(${val}) -> head=${head}, size=${size}`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.insertFrontOk,
          statusBadge: { text: `成功插入 ${val}`, type: 'success' }
        });
      }
    } else if (op === 'insertLast') {
      const isFull = size === capacity;
      if (isFull) {
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: `insertLast(${val})`,
          resultStatus: false,
          decision: `队列已满 (size=${size} == capacity)，无法执行尾部插入，返回 false`,
          message: '队列已满',
          log: `insertLast(${val}) -> 队列满，失败`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.insertLastFail,
          statusBadge: { text: '插入失败(满)', type: 'danger' }
        });
      } else {
        if (size === 0) {
          head = tail = 0;
          buffer[0] = val!;
        } else {
          tail = tail === capacity - 1 ? 0 : tail + 1;
          buffer[tail] = val!;
        }
        size++;
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: `insertLast(${val})`,
          resultStatus: true,
          decision: `尾部插入值 ${val}：tail 右移至下标 ${tail} 并存入元素，当前 size=${size}`,
          message: `尾部插入成功: ${val}`,
          log: `insertLast(${val}) -> tail=${tail}, size=${size}`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.insertLastOk,
          statusBadge: { text: `成功插入 ${val}`, type: 'success' }
        });
      }
    } else if (op === 'deleteFront') {
      if (size === 0) {
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: 'deleteFront()',
          resultStatus: false,
          decision: '队列为空，无法执行头部弹出，返回 false',
          message: '队列为空',
          log: 'deleteFront() -> 空队列',
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.deleteFrontFail,
          statusBadge: { text: '删除失败(空)', type: 'danger' }
        });
      } else {
        const removedVal = buffer[head];
        buffer[head] = null;
        head = head === capacity - 1 ? 0 : head + 1;
        size--;
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: 'deleteFront()',
          resultStatus: true,
          decision: `头部弹出元素 ${removedVal}：head 右移至下标 ${head}，当前 size=${size}`,
          message: `头部弹出: ${removedVal}`,
          log: `deleteFront() -> 弹出 ${removedVal}, size=${size}`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.deleteFrontOk,
          statusBadge: { text: `弹出 ${removedVal}`, type: 'warning' }
        });
      }
    } else if (op === 'deleteLast') {
      if (size === 0) {
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: 'deleteLast()',
          resultStatus: false,
          decision: '队列为空，无法执行尾部弹出，返回 false',
          message: '队列为空',
          log: 'deleteLast() -> 空队列',
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.deleteLastFail,
          statusBadge: { text: '删除失败(空)', type: 'danger' }
        });
      } else {
        const removedVal = buffer[tail];
        buffer[tail] = null;
        tail = tail === 0 ? capacity - 1 : tail - 1;
        size--;
        steps.push({
          stepIndex: stepIdx++,
          buffer: [...buffer],
          head,
          tail,
          size,
          capacity,
          operation: 'deleteLast()',
          resultStatus: true,
          decision: `尾部弹出元素 ${removedVal}：tail 左移至下标 ${tail}，当前 size=${size}`,
          message: `尾部弹出: ${removedVal}`,
          log: `deleteLast() -> 弹出 ${removedVal}, size=${size}`,
          codeLine: CIRCULAR_DEQUE_007_CODE_LINES.deleteLastOk,
          statusBadge: { text: `弹出 ${removedVal}`, type: 'warning' }
        });
      }
    }
  }

  return steps;
}
