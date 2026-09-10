/**
 * Class 025: 大根堆、小根堆与堆排序 (Heap & HeapSort)
 * 左程云算法通关课入门篇 Class 025
 * 深入解析完全二叉树的数组映射、heapInsert (上浮)、heapify (下沉) 与原地堆排序
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface HeapSortStep extends StepBase {
  stepIndex?: number;
  arr: number[];
  heapSize: number;
  currentIndex: number;
  targetIndex?: number;
  operation: 'heapInsert' | 'heapify' | 'swap-max' | 'sorted';
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const HEAP_AND_HEAPSORT_025_CODES = {
  java: `public class HeapSort025 {
    public static void heapSort(int[] arr) {
        if (arr == null || arr.length < 2) return;
        // 1. 从底向上建大根堆 O(N)
        for (int i = arr.length - 1; i >= 0; i--) {
            heapify(arr, i, arr.length);
        }
        // 2. 堆顶与末尾交换并下沉 O(N log N)
        int heapSize = arr.length;
        swap(arr, 0, --heapSize);
        while (heapSize > 0) {
            heapify(arr, 0, heapSize);
            swap(arr, 0, --heapSize);
        }
    }

    public static void heapify(int[] arr, int index, int heapSize) {
        int left = index * 2 + 1;
        while (left < heapSize) {
            int largest = left + 1 < heapSize && arr[left + 1] > arr[left] ? left + 1 : left;
            largest = arr[largest] > arr[index] ? largest : index;
            if (largest == index) break;
            swap(arr, largest, index);
            index = largest;
            left = index * 2 + 1;
        }
    }
    static void swap(int[] arr, int i, int j) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}`,
  cpp: `class HeapSort025 {
public:
    static void heapSort(vector<int>& arr) {
        int n = arr.size();
        if (n < 2) return;
        for (int i = n - 1; i >= 0; i--) {
            heapify(arr, i, n);
        }
        int heapSize = n;
        swap(arr[0], arr[--heapSize]);
        while (heapSize > 0) {
            heapify(arr, 0, heapSize);
            swap(arr[0], arr[--heapSize]);
        }
    }

    static void heapify(vector<int>& arr, int index, int heapSize) {
        int left = index * 2 + 1;
        while (left < heapSize) {
            int largest = (left + 1 < heapSize && arr[left + 1] > arr[left]) ? left + 1 : left;
            largest = arr[largest] > arr[index] ? largest : index;
            if (largest == index) break;
            swap(arr[largest], arr[index]);
            index = largest;
            left = index * 2 + 1;
        }
    }
};`,
  python: `class HeapSort025:
    @staticmethod
    def heap_sort(arr: list[int]):
        n = len(arr)
        if n < 2: return
        for i in range(n - 1, -1, -1):
            HeapSort025.heapify(arr, i, n)
        heap_size = n
        heap_size -= 1
        arr[0], arr[heap_size] = arr[heap_size], arr[0]
        while heap_size > 0:
            HeapSort025.heapify(arr, 0, heap_size)
            heap_size -= 1
            arr[0], arr[heap_size] = arr[heap_size], arr[0]

    @staticmethod
    def heapify(arr: list[int], index: int, heap_size: int):
        left = index * 2 + 1
        while left < heap_size:
            largest = left + 1 if left + 1 < heap_size and arr[left + 1] > arr[left] else left
            largest = largest if arr[largest] > arr[index] else index
            if largest == index: break
            arr[largest], arr[index] = arr[index], arr[largest]
            index = largest
            left = index * 2 + 1`,
  typescript: `export class HeapSort025 {
  static heapSort(arr: number[]): void {
    const n = arr.length;
    if (n < 2) return;
    for (let i = n - 1; i >= 0; i--) {
      this.heapify(arr, i, n);
    }
    let heapSize = n;
    [arr[0], arr[--heapSize]] = [arr[heapSize], arr[0]];
    while (heapSize > 0) {
      this.heapify(arr, 0, heapSize);
      [arr[0], arr[--heapSize]] = [arr[heapSize], arr[0]];
    }
  }

  static heapify(arr: number[], index: number, heapSize: number): void {
    let left = index * 2 + 1;
    while (left < heapSize) {
      let largest = left + 1 < heapSize && arr[left + 1] > arr[left] ? left + 1 : left;
      largest = arr[largest] > arr[index] ? largest : index;
      if (largest === index) break;
      [arr[largest], arr[index]] = [arr[index], arr[largest]];
      index = largest;
      left = index * 2 + 1;
    }
  }
}`
};

export function generateHeapSortSteps(inputNums: number[]): HeapSortStep[] {
  const arr = [...inputNums];
  const steps: HeapSortStep[] = [];
  const n = arr.length;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    heapSize: n,
    currentIndex: -1,
    operation: 'heapify',
    decision: '算法启动：首先将整个数组自底向上构建为大根堆 (Heapify 建堆法，复杂度 O(N))',
    message: '准备建堆',
    log: '开始堆排序',
    codeLine: 5,
    statusBadge: { text: '建堆就绪', type: 'info' }
  });

  // 建堆
  for (let i = Math.floor((n - 1) / 2); i >= 0; i--) {
    let idx = i;
    let left = idx * 2 + 1;
    while (left < n) {
      let largest = left + 1 < n && arr[left + 1] > arr[left] ? left + 1 : left;
      largest = arr[largest] > arr[idx] ? largest : idx;
      if (largest === idx) break;

      const temp = arr[idx];
      arr[idx] = arr[largest];
      arr[largest] = temp;

      steps.push({
        stepIndex: stepIdx++,
        arr: [...arr],
        heapSize: n,
        currentIndex: idx,
        targetIndex: largest,
        operation: 'heapify',
        decision: `建堆下沉：节点 arr[${idx}] 与较大子节点 arr[${largest}] 交换，恢复大根堆性质`,
        message: `arr[${idx}] 与 arr[${largest}] 交换`,
        log: `建堆交换 (${idx}, ${largest})`,
        codeLine: 19,
        statusBadge: { text: '堆化调整', type: 'warning' }
      });

      idx = largest;
      left = idx * 2 + 1;
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    heapSize: n,
    currentIndex: 0,
    operation: 'heapify',
    decision: `大根堆构建完成！堆顶元素 ${arr[0]} 为当前堆内最大值`,
    message: '大根堆已就绪',
    log: '大根堆构建成功',
    codeLine: 8,
    statusBadge: { text: '大根堆就绪', type: 'success' }
  });

  // 堆排序
  let heapSize = n;
  while (heapSize > 1) {
    heapSize--;
    const maxVal = arr[0];
    const temp = arr[0];
    arr[0] = arr[heapSize];
    arr[heapSize] = temp;

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      heapSize,
      currentIndex: 0,
      targetIndex: heapSize,
      operation: 'swap-max',
      decision: `将堆顶最大值 ${maxVal} 交换至当前有效堆末尾 arr[${heapSize}]，锁定最终位置，有效堆大小缩小至 ${heapSize}`,
      message: `锁定最大值 ${maxVal}`,
      log: `最大值 ${maxVal} 归位`,
      codeLine: 11,
      statusBadge: { text: '元素锁定', type: 'danger' }
    });

    // 堆顶下沉
    let idx = 0;
    let left = idx * 2 + 1;
    while (left < heapSize) {
      let largest = left + 1 < heapSize && arr[left + 1] > arr[left] ? left + 1 : left;
      largest = arr[largest] > arr[idx] ? largest : idx;
      if (largest === idx) break;

      const swapTemp = arr[idx];
      arr[idx] = arr[largest];
      arr[largest] = swapTemp;

      steps.push({
        stepIndex: stepIdx++,
        arr: [...arr],
        heapSize,
        currentIndex: idx,
        targetIndex: largest,
        operation: 'heapify',
        decision: `堆顶下沉恢复大根堆：节点 arr[${idx}] 与较大子节点 arr[${largest}] 交换`,
        message: `堆顶下沉至 ${largest}`,
        log: `下沉 (${idx} <-> ${largest})`,
        codeLine: 20,
        statusBadge: { text: '堆顶下沉', type: 'warning' }
      });

      idx = largest;
      left = idx * 2 + 1;
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    heapSize: 0,
    currentIndex: -1,
    operation: 'sorted',
    decision: '堆排序全流程完成，数组已达到完全升序！',
    message: '排序完全结束',
    log: '堆排序成功',
    codeLine: 14,
    statusBadge: { text: '完全升序', type: 'success' }
  });

  return steps;
}

export function renderHeapSortCanvas(container: HTMLElement, step: HeapSortStep) {
  const { arr, heapSize, currentIndex, targetIndex, operation } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前操作</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation === 'heapify' ? '堆化下沉 (Heapify)' : operation === 'swap-max' ? '堆顶与末尾交换' : '排序完成'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">有效堆容量 (heapSize)</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${heapSize} / ${arr.length}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">活动节点下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${currentIndex >= 0 ? `${currentIndex} (值:${arr[currentIndex]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">交换目标下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${targetIndex !== undefined && targetIndex >= 0 ? `${targetIndex} (值:${arr[targetIndex]})` : '无'}
          </div>
        </div>
      </div>

      <!-- 堆数组渲染条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const isCur = idx === currentIndex;
            const isTarget = idx === targetIndex;
            const isLocked = idx >= heapSize;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isCur) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (isTarget) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isLocked) {
              bgColor = 'rgba(168, 85, 247, 0.2)';
              borderColor = '#a855f7';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isLocked ? '#a855f7' : isCur ? '#10b981' : isTarget ? '#ec4899' : '#64748b'}; font-weight: bold;">
                  ${isLocked ? '已锁定' : isCur ? 'CUR' : isTarget ? 'SWAP' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur ? '0 0 12px rgba(16, 185, 129, 0.4)' : isTarget ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${val}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 堆结构核心数学原理 -->
      ${renderFormulaCard(
        '堆完全二叉树父子索引关系与堆排序时空复杂度',
        '节点 i 的父节点: (i-1)/2；左孩子: 2*i+1；右孩子: 2*i+2。建堆 O(N)，下沉排序 O(N log N)，原地排序额外空间复杂度 O(1)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const heapAndHeapsort025Visualizer = registerDeclarativeAlgorithm<HeapSortStep>({
  id: 'heap-and-heapsort-025',
  name: 'Class 025: 大根堆与原地堆排序 (HeapSort)',
  category: 'heap',
  icon: '⛰️',
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '透彻理解完全二叉树的连续数组映射、大根堆性质、heapify 下沉操作与 O(1) 额外空间的原地堆排序算法',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 025)</h3>
      <p>堆 (Heap) 是一种基于<strong>完全二叉树</strong>的高效数据结构，在连续内存（数组）中具有极致的缓存局部性：</p>
      <ul>
        <li><strong>完全二叉树数组化</strong>：下标 <code>i</code> 的左孩子为 <code>2*i + 1</code>，右孩子为 <code>2*i + 2</code>，父节点为 <code>(i - 1) / 2</code>。</li>
        <li><strong>heapify (下沉)</strong>：左右子节点挑最大者与自身对比，不满足大根堆性质则交换并继续下沉。</li>
        <li><strong>原地堆排序</strong>：先用 $O(N)$ 自底向上建堆，随后每次把堆顶最大值放到末尾并减小 <code>heapSize</code>，全程无需额外辅助数组。</li>
      </ul>
    </div>
  `,
  codeLanguages: HEAP_AND_HEAPSORT_025_CODES,
  inputs: [
    {
      id: 'nums',
      label: '数组序列 (以逗号分隔)',
      type: 'text',
      defaultValue: '4, 10, 3, 5, 1, 8, 2',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '4, 10, 3, 5, 1, 8, 2');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateHeapSortSteps(nums.length > 0 ? nums : [4, 10, 3, 5, 1, 8, 2]);
  },
  renderCanvas: (container, step) => {
    renderHeapSortCanvas(container, step);
  },
});
