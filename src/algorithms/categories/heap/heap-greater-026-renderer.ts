/**
 * Class 026: 手写加强堆结构与反向索引表 (HeapGreater / Indexed Heap)
 * 左程云算法通关课入门篇 Class 026
 * 解决原生 PriorityQueue 无法在 O(log N) 内更新/删除指定对象的致命缺陷
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface HeapGreaterStep extends StepBase {
  stepIndex?: number;
  heap: Array<{ id: string; val: number }>;
  indexMap: Record<string, number>;
  activeId: string | null;
  operation: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
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
    codeLine: 4,
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
        codeLine: 9,
        statusBadge: { text: `插入 ${item.id}`, type: 'info' }
      });

      heapInsert(idx);

      steps.push({
        stepIndex: stepIdx++,
        heap: heap.map(x => ({ ...x })),
        indexMap: { ...indexMap },
        activeId: item.id,
        operation: `heapInsert 上浮恢复大根堆`,
        decision: `元素 [${item.id}] 上浮完毕，当前位于下标 ${indexMap[item.id]}，大根堆性质成立`,
        message: '上浮调整完成',
        log: `heapInsert 完毕，新下标 ${indexMap[item.id]}`,
        codeLine: 11,
        statusBadge: { text: '上浮调整', type: 'success' }
      });
    } else if (act.type === 'resign') {
      const idx = indexMap[act.id];
      if (idx !== undefined) {
        heap[idx].val = act.val!;
        steps.push({
          stepIndex: stepIdx++,
          heap: heap.map(x => ({ ...x })),
          indexMap: { ...indexMap },
          activeId: act.id,
          operation: `resign('${act.id}', 新值 ${act.val})`,
          decision: `元素 [${act.id}] 的属性改变为 ${act.val}！凭借反向索引 O(1) 定位至堆下标 ${idx}，准备在 O(log N) 内重构堆序`,
          message: `属性变更: ${act.id}`,
          log: `resign 命中下标 ${idx}`,
          codeLine: 16,
          statusBadge: { text: `值变动 ${act.val}`, type: 'warning' }
        });

        heapInsert(idx);
        heapify(indexMap[act.id]);

        steps.push({
          stepIndex: stepIdx++,
          heap: heap.map(x => ({ ...x })),
          indexMap: { ...indexMap },
          activeId: act.id,
          operation: `resign 调整完成`,
          decision: `通过 heapInsert 与 heapify 双向调整，[${act.id}] 在 O(log N) 内重塑大根堆性质，当前位置下标 ${indexMap[act.id]}`,
          message: '重构堆序完成',
          log: `resign 完成，当前下标 ${indexMap[act.id]}`,
          codeLine: 19,
          statusBadge: { text: 'resign 成功', type: 'success' }
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
          decision: `删除指定对象 [${act.id}]：从反向索引抹除该对象，取出堆末尾元素 [${replaceItem.id}] 填补至下标 ${idx}`,
          message: `删除目标 ${act.id}`,
          log: `remove 移除 ${act.id}`,
          codeLine: 25,
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
            codeLine: 31,
            statusBadge: { text: '删除调整完成', type: 'success' }
          });
        }
      }
    }
  }

  return steps;
}

export function renderHeapGreaterCanvas(container: HTMLElement, step: HeapGreaterStep) {
  const { heap, indexMap, activeId, operation } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前执行指令</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">活动对象 ID</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${activeId ? activeId : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">堆中元素总数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${heap.length}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">反向索引项数</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${Object.keys(indexMap).length}
          </div>
        </div>
      </div>

      <!-- 堆数组展示条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">堆底层数组 (Heap Array)：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${heap.map((item, idx) => {
            const isAct = item.id === activeId;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isAct ? '#38bdf8' : '#64748b'}; font-weight: bold;">
                  ${isAct ? 'ACTIVE' : ''}
                </div>
                <div style="
                  width: 54px;
                  height: 54px;
                  background: ${isAct ? 'rgba(56, 189, 248, 0.35)' : 'rgba(51, 65, 85, 0.4)'};
                  border: 2px solid ${isAct ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isAct ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  <div>${item.id}</div>
                  <div style="font-size: 14px; color: #f59e0b;">${item.val}</div>
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 反向索引表视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">反向索引哈希表 (indexMap):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${Object.entries(indexMap).map(([id, idx]) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #f8fafc;">
              '${id}' ➔ 索引 [${idx}]
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '手写加强堆核心反向索引定理',
        '任何元素在堆中交换时，必须同步维护 indexMap.put(obj, newIndex)。使 resign(obj) 和 remove(obj) 无需 O(N) 线性查找，直接在 O(log N) 内完成任意元素的修改与剔除',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const heapGreater026Visualizer = registerDeclarativeAlgorithm<HeapGreaterStep>({
  id: 'heap-greater-026',
  name: 'Class 026: 手写加强堆结构 (HeapGreater)',
  category: 'heap',
  icon: '🏗️',
  difficulty: 3,
  levelOrder: 26,
  learningGoal: '掌握手写加强堆结构与反向索引映射表 (indexMap)，克服原生堆结构无法 O(log N) 修改或删除指定元素的缺陷',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 026)</h3>
      <p>在所有语言（Java PriorityQueue / C++ priority_queue / Python heapq）自带的堆中，存在一个致命缺陷：</p>
      <ul>
        <li><strong>缺陷痛点</strong>：如果堆中的某个对象属性发生了改变，或者需要从堆中删除某一个非堆顶对象，系统必须花费 $O(N)$ 遍历整个数组。</li>
        <li><strong>手写加强堆 (HeapGreater)</strong>：额外维护一张哈希表 <code>indexMap</code>，记录每一个对象当前在堆数组中的具体下标。</li>
        <li><strong>极速操作</strong>：当对象属性改变时调用 <code>resign(obj)</code>，反向索引在 $O(1)$ 命中位置，随后执行 $O(\\log N)$ 的上浮与下沉调整。</li>
      </ul>
    </div>
  `,
  codeLanguages: HEAP_GREATER_026_CODES,
  inputs: [
    {
      id: 'demoScenario',
      label: '演示场景',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准流程: 插入 -> resign更新 -> 删除', value: 'standard' },
      ],
    },
  ],
  generateSteps: () => {
    const actions: Array<{ type: 'push' | 'resign' | 'remove'; id: string; val?: number }> = [
      { type: 'push', id: 'TaskA', val: 30 },
      { type: 'push', id: 'TaskB', val: 70 },
      { type: 'push', id: 'TaskC', val: 50 },
      { type: 'push', id: 'TaskD', val: 90 },
      { type: 'push', id: 'TaskE', val: 20 },
      { type: 'resign', id: 'TaskA', val: 100 }, // A 的权重激增，上浮至堆顶
      { type: 'remove', id: 'TaskB' },           // 任意删除 TaskB
    ];
    return generateHeapGreaterSteps(actions);
  },
  renderCanvas: (container, step) => {
    renderHeapGreaterCanvas(container, step);
  },
});
