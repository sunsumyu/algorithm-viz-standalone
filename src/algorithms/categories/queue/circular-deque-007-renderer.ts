/**
 * Class 007: 循环双端队列设计 (Circular Deque Design)
 * 左程云算法通关课入门篇 Class 007 / LeetCode 641
 * 静态数组 + 环形指针模型：彻底消解动态扩容与数据搬移，双端 O(1) 插入与弹出
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
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
    codeLine: 5,
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
          codeLine: 11,
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
          codeLine: 16,
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
          codeLine: 24,
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
          codeLine: 29,
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
          codeLine: 35,
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
          codeLine: 37,
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
          codeLine: 42,
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
          codeLine: 44,
          statusBadge: { text: `弹出 ${removedVal}`, type: 'warning' }
        });
      }
    }
  }

  return steps;
}

export function renderCircularDequeCanvas(container: HTMLElement, step: CircularDequeStep) {
  const { buffer, head, tail, size, capacity, operation, resultStatus } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前执行操作</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">容量状态 (Size / Cap)</div>
          <div style="font-size: 14px; font-weight: bold; color: ${size === capacity ? '#ef4444' : size === 0 ? '#64748b' : '#10b981'};">
            ${size} / ${capacity} (${size === capacity ? 'FULL' : size === 0 ? 'EMPTY' : 'NORMAL'})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">头指针 Head</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            下标 ${head}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">尾指针 Tail</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            下标 ${tail}
          </div>
        </div>
      </div>

      <!-- 环形缓冲区槽位 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${buffer.map((val, idx) => {
            const isHead = size > 0 && idx === head;
            const isTail = size > 0 && idx === tail;
            const hasVal = val !== null;

            let bgColor = 'rgba(51, 65, 85, 0.3)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isHead && isTail) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isHead) {
              bgColor = 'rgba(245, 158, 11, 0.35)';
              borderColor = '#f59e0b';
            } else if (isTail) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (hasVal) {
              bgColor = 'rgba(56, 189, 248, 0.2)';
              borderColor = '#38bdf8';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isHead && isTail ? '#ec4899' : isHead ? '#f59e0b' : isTail ? '#10b981' : '#64748b'}; font-weight: bold;">
                  ${isHead && isTail ? 'HEAD=TAIL' : isHead ? 'HEAD' : isTail ? 'TAIL' : ''}
                </div>
                <div style="
                  width: 52px;
                  height: 52px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: ${hasVal ? '#f8fafc' : '#64748b'};
                  box-shadow: ${isHead || isTail ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${hasVal ? val : 'ø'}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 环形指针与空间利用核心卡片 -->
      ${renderFormulaCard(
        '环形双端指针移动与取模公理',
        'head 前移: (head == 0 ? cap - 1 : head - 1)；tail 后移: (tail == cap - 1 ? 0 : tail + 1)。完全避免数组数据整体搬移，双端所有操作严格 O(1)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const circularDeque007Visualizer = registerDeclarativeAlgorithm<CircularDequeStep>({
  id: 'circular-deque-007',
  name: 'Class 007: 循环双端队列设计 (Circular Deque)',
  category: 'queue',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握静态连续数组构建环形双端队列 (Deque) 的环形指针取模与双端 O(1) 存取设计技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 007 / LeetCode 641)</h3>
      <p>设计实现双端队列。你的实现需要支持以下操作：</p>
      <ul>
        <li><code>insertFront()</code>：将一个元素添加到双端队列头部。 若操作成功返回 true。</li>
        <li><code>insertLast()</code>：将一个元素添加到双端队列尾部。若操作成功返回 true。</li>
        <li><code>deleteFront()</code>：从双端队列头部删除一个元素。 若操作成功返回 true。</li>
        <li><code>deleteLast()</code>：从双端队列尾部删除一个元素。若操作成功返回 true。</li>
        <li><strong>核心价值</strong>：彻底避免普通数组插入时 $O(N)$ 的搬移开销，通过首尾环形指针达成 $O(1)$ 常数级响应。</li>
      </ul>
    </div>
  `,
  codeLanguages: CIRCULAR_DEQUE_007_CODES,
  inputs: [
    {
      id: 'capacity',
      label: '队列容量 (Capacity)',
      type: 'number',
      defaultValue: 5,
    },
  ],
  generateSteps: (input) => {
    const k = Number(input.capacity) || 5;
    const ops: Array<{ op: 'insertFront' | 'insertLast' | 'deleteFront' | 'deleteLast'; val?: number }> = [
      { op: 'insertLast', val: 1 },
      { op: 'insertLast', val: 2 },
      { op: 'insertFront', val: 3 },
      { op: 'insertFront', val: 4 },
      { op: 'deleteLast' },
      { op: 'insertFront', val: 5 },
      { op: 'insertLast', val: 6 },
      { op: 'deleteFront' }
    ];
    return generateCircularDequeSteps(k, ops);
  },
  renderCanvas: (container, step) => {
    renderCircularDequeCanvas(container, step);
  },
});
