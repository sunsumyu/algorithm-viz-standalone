/**
 * Class 026: 手写加强堆结构与反向索引表 (HeapGreater / Indexed Heap) - 步进编译器
 * 左程云算法通关课入门篇 Class 026
 */

import { StepBase } from '../../../core/step-visualizer';

export interface HeapGreaterStep extends StepBase {
  stepIndex?: number;
  heap: Array<{ id: string; val: number }>;
  indexMap: Record<string, number>;
  activeId: string | null;
  operation: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const HEAP_GREATER_026_CODES = {
  java: `public class HeapGreater<T> {
    private ArrayList<T> heap;
    private HashMap<T, Integer> indexMap; // 反向索引表
    private int heapSize;
    private Comparator<? super T> comp;

    public void push(T obj) {
        heap.add(obj);
        indexMap.put(obj, heapSize);
        heapInsert(heapSize++);
    }

    public void resign(T obj) {
        // 对象内部属性修改后，O(log N) 重新调整恢复堆序
        Integer index = indexMap.get(obj);
        if (index != null) {
            heapInsert(index);
            heapify(index);
        }
    }

    public void remove(T obj) {
        T replace = heap.get(heapSize - 1);
        int index = indexMap.get(obj);
        indexMap.remove(obj);
        heap.remove(--heapSize);
        if (obj != replace) {
            heap.set(index, replace);
            indexMap.put(replace, index);
            resign(replace);
        }
    }

    private void swap(int i, int j) {
        T o1 = heap.get(i);
        T o2 = heap.get(j);
        heap.set(i, o2); heap.set(j, o1);
        indexMap.put(o2, i); indexMap.put(o1, j); // 同步反向索引
    }
}`,
  cpp: `template<typename T>
class HeapGreater {
    vector<T> heap;
    unordered_map<T, int> indexMap;
public:
    void push(const T& obj) {
        heap.push_back(obj);
        indexMap[obj] = (int)heap.size() - 1;
        heapInsert((int)heap.size() - 1);
    }

    void resign(const T& obj) {
        if (indexMap.count(obj)) {
            int idx = indexMap[obj];
            heapInsert(idx);
            heapify(idx);
        }
    }

    void remove(const T& obj) {
        if (!indexMap.count(obj)) return;
        T replace = heap.back();
        int idx = indexMap[obj];
        indexMap.erase(obj);
        heap.pop_back();
        if (obj != replace) {
            heap[idx] = replace;
            indexMap[replace] = idx;
            resign(replace);
        }
    }
};`,
  python: `class HeapGreater:
    def __init__(self):
        self.heap = []
        self.index_map = {} # 反向索引

    def push(self, obj):
        self.heap.append(obj)
        idx = len(self.heap) - 1
        self.index_map[obj] = idx
        self._heap_insert(idx)

    def resign(self, obj):
        if obj in self.index_map:
            idx = self.index_map[obj]
            self._heap_insert(idx)
            self._heapify(idx)

    def remove(self, obj):
        if obj not in self.index_map: return
        idx = self.index_map.pop(obj)
        replace = self.heap.pop()
        if obj != replace:
            self.heap[idx] = replace
            self.index_map[replace] = idx
            self.resign(replace)`,
  typescript: `export class HeapGreater<T extends { id: string; val: number }> {
  private heap: T[] = [];
  private indexMap: Map<string, number> = new Map();

  push(obj: T): void {
    this.heap.push(obj);
    const idx = this.heap.length - 1;
    this.indexMap.set(obj.id, idx);
    this.heapInsert(idx);
  }

  resign(obj: T): void {
    const idx = this.indexMap.get(obj.id);
    if (idx !== undefined) {
      this.heapInsert(idx);
      this.heapify(idx);
    }
  }

  remove(id: string): void {
    const idx = this.indexMap.get(id);
    if (idx === undefined) return;
    const replace = this.heap.pop()!;
    this.indexMap.delete(id);
    if (idx < this.heap.length) {
      this.heap[idx] = replace;
      this.indexMap.set(replace.id, idx);
      this.resign(replace);
    }
  }

  private heapInsert(i: number): void {
    while (this.heap[i].val > this.heap[Math.floor((i - 1) / 2)].val) {
      this.swap(i, Math.floor((i - 1) / 2));
      i = Math.floor((i - 1) / 2);
    }
  }

  private heapify(i: number): void {
    let l = i * 2 + 1;
    while (l < this.heap.length) {
      let best = l + 1 < this.heap.length && this.heap[l + 1].val > this.heap[l].val ? l + 1 : l;
      best = this.heap[best].val > this.heap[i].val ? best : i;
      if (best === i) break;
      this.swap(i, best);
      i = best;
      l = i * 2 + 1;
    }
  }

  private swap(i: number, j: number): void {
    const o1 = this.heap[i], o2 = this.heap[j];
    this.heap[i] = o2; this.heap[j] = o1;
    this.indexMap.set(o1.id, j); this.indexMap.set(o2.id, i);
  }
}`
};

export const HEAP_GREATER_026_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3, typescript: 2 },
  pushAppend: { java: 8, cpp: 7, python: 8, typescript: 6 },
  pushHeapInsert: { java: 10, cpp: 9, python: 10, typescript: 9 },
  resignFind: { java: 15, cpp: 13, python: 14, typescript: 13 },
  resignDone: { java: 18, cpp: 16, python: 17, typescript: 16 },
  removePop: { java: 24, cpp: 23, python: 21, typescript: 22 },
  removeDone: { java: 30, cpp: 28, python: 25, typescript: 28 },
};

export function generateHeapGreaterSteps(
  actions: Array<{ type: 'push' | 'resign' | 'remove'; id: string; val?: number }>
): HeapGreaterStep[] {
  const steps: HeapGreaterStep[] = [];
  const heap: Array<{ id: string; val: number }> = [];
  const indexMap: Record<string, number> = {};
  let stepIdx = 0;

  const swap = (i: number, j: number) => {
    const temp = heap[i];
    heap[i] = heap[j];
    heap[j] = temp;
    indexMap[heap[i].id] = i;
    indexMap[heap[j].id] = j;
  };

  const heapInsert = (startIdx: number) => {
    let i = startIdx;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[i].val > heap[parent].val) {
        swap(i, parent);
        i = parent;
      } else {
        break;
      }
    }
  };

  const heapify = (startIdx: number) => {
    let i = startIdx;
    let l = i * 2 + 1;
    while (l < heap.length) {
      let best = l + 1 < heap.length && heap[l + 1].val > heap[l].val ? l + 1 : l;
      best = heap[best].val > heap[i].val ? best : i;
      if (best === i) break;
      swap(i, best);
      i = best;
      l = i * 2 + 1;
    }
  };

  steps.push({
    stepIndex: stepIdx++,
    heap: heap.map(item => ({ ...item })),
    indexMap: { ...indexMap },
    activeId: null,
    operation: '初始化加强堆 (HeapGreater)',
    decision: '加强堆初始化完毕，创建底层堆数组 heap 与动态反向索引表 indexMap',
    message: '堆就绪',
    log: 'HeapGreater 初始化',
    codeLine: HEAP_GREATER_026_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (const act of actions) {
    if (act.type === 'push') {
      const item = { id: act.id, val: act.val! };
      heap.push(item);
      const idx = heap.length - 1;
      indexMap[item.id] = idx;

      steps.push({
        stepIndex: stepIdx++,
        heap: heap.map(x => ({ ...x })),
        indexMap: { ...indexMap },
        activeId: item.id,
        operation: `push('${item.id}', ${item.val})`,
        decision: `元素 [${item.id}: ${item.val}] 追加至堆末下标 ${idx}，并建立反向索引 indexMap['${item.id}'] = ${idx}`,
        message: `插入元素 ${item.id}`,
        log: `push -> ${item.id}, 下标 ${idx}`,
        codeLine: HEAP_GREATER_026_CODE_LINES.pushAppend,
        statusBadge: { text: `插入 ${item.id}`, type: 'info' }
      });

      heapInsert(idx);

      steps.push({
        stepIndex: stepIdx++,
        heap: heap.map(x => ({ ...x })),
        indexMap: { ...indexMap },
        activeId: item.id,
        operation: `heapInsert('${item.id}') 调整恢复堆序`,
        decision: `元素 [${item.id}] 通过 heapInsert 上浮调整完毕，当前位于下标 ${indexMap[item.id]}`,
        message: `上浮就绪: ${item.id}`,
        log: `上浮就绪 -> ${item.id}`,
        codeLine: HEAP_GREATER_026_CODE_LINES.pushHeapInsert,
        statusBadge: { text: '上浮完成', type: 'success' }
      });
    } else if (act.type === 'resign') {
      const idx = indexMap[act.id];
      if (idx !== undefined) {
        const oldVal = heap[idx].val;
        heap[idx].val = act.val !== undefined ? act.val : oldVal;

        steps.push({
          stepIndex: stepIdx++,
          heap: heap.map(x => ({ ...x })),
          indexMap: { ...indexMap },
          activeId: act.id,
          operation: `resign('${act.id}': ${oldVal} -> ${heap[idx].val})`,
          decision: `通过反向索引 O(1) 瞬时定位到 '${act.id}' 位于下标 ${idx}，更新权值并启动 O(log N) 重新堆化`,
          message: `定位并重构 ${act.id}`,
          log: `resign -> ${act.id}, 下标 ${idx}`,
          codeLine: HEAP_GREATER_026_CODE_LINES.resignFind,
          statusBadge: { text: `更新 ${act.id}`, type: 'warning' }
        });

        heapInsert(idx);
        heapify(indexMap[act.id]);

        steps.push({
          stepIndex: stepIdx++,
          heap: heap.map(x => ({ ...x })),
          indexMap: { ...indexMap },
          activeId: act.id,
          operation: `resign('${act.id}') 堆序调整完成`,
          decision: `元素 [${act.id}] 重新堆化完毕，当前位于下标 ${indexMap[act.id]}`,
          message: `调整完毕: ${act.id}`,
          log: `调整完成 -> ${act.id}`,
          codeLine: HEAP_GREATER_026_CODE_LINES.resignDone,
          statusBadge: { text: '重构完成', type: 'success' }
        });
      }
    } else if (act.type === 'remove') {
      const idx = indexMap[act.id];
      if (idx !== undefined) {
        const replaceItem = heap[heap.length - 1];
        delete indexMap[act.id];
        heap.pop();

        steps.push({
          stepIndex: stepIdx++,
          heap: heap.map(x => ({ ...x })),
          indexMap: { ...indexMap },
          activeId: act.id,
          operation: `remove('${act.id}')`,
          decision: `通过反向索引定位 '${act.id}' 位于下标 ${idx}，从堆末取出替补元素 [${replaceItem.id}] 填补空位`,
          message: `删除元素 ${act.id}`,
          log: `remove -> ${act.id}`,
          codeLine: HEAP_GREATER_026_CODE_LINES.removePop,
          statusBadge: { text: `删除 ${act.id}`, type: 'danger' }
        });

        if (idx < heap.length) {
          heap[idx] = replaceItem;
          indexMap[replaceItem.id] = idx;
          heapInsert(idx);
          heapify(indexMap[replaceItem.id]);

          steps.push({
            stepIndex: stepIdx++,
            heap: heap.map(x => ({ ...x })),
            indexMap: { ...indexMap },
            activeId: replaceItem.id,
            operation: `替补元素 [${replaceItem.id}] 重新堆化`,
            decision: `替补元素重构堆序完毕，当前位于下标 ${indexMap[replaceItem.id]}，整个删除操作在 O(log N) 内完成！`,
            message: '替换调整完毕',
            log: `替补完毕: ${replaceItem.id}`,
            codeLine: HEAP_GREATER_026_CODE_LINES.removeDone,
            statusBadge: { text: '删除调整完成', type: 'success' }
          });
        }
      }
    }
  }

  return steps;
}
