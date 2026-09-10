/**
 * Class 004: 选择、冒泡、插入三大简单排序对比 (Basic Sorting)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface Sort004Step extends StepBase {
  nums: number[];
  algorithm: 'selection' | 'bubble' | 'insertion';
  i: number;
  j: number;
  minIdx?: number;
  swapped: boolean;
  compared: boolean;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const SORT_004_CODES = {
  java: `public class BasicSorts {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int tmp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = tmp;
        }
    }
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
                }
            }
        }
    }
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            for (int j = i - 1; j >= 0 && arr[j] > arr[j + 1]; j--) {
                int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
            }
        }
    }
}`,
  cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
        }
    }
}
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        for (int j = i - 1; j >= 0 && arr[j] > arr[j + 1]; j--) {
            swap(arr[j], arr[j + 1]);
        }
    }
}`,
  python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]: min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]

def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]: arr[j], arr[j + 1] = arr[j + 1], arr[j]

def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        j = i - 1
        while j >= 0 and arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
            j -= 1`,
  typescript: `export function selectionSort(arr: number[]): void {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
}
export function bubbleSort(arr: number[]): void {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
    }
}
export function insertionSort(arr: number[]): void {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        for (let j = i - 1; j >= 0 && arr[j] > arr[j + 1]; j--) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
    }
}`
};

export function buildSort004Steps(
  rawNums: number[],
  algorithm: 'selection' | 'bubble' | 'insertion' = 'selection'
): Sort004Step[] {
  const steps: Sort004Step[] = [];
  const a = [...rawNums];
  const n = a.length;

  steps.push({
    nums: [...a],
    algorithm,
    i: -1,
    j: -1,
    swapped: false,
    compared: false,
    decision: `主函数入口：开始执行【${algorithm === 'selection' ? '选择排序' : algorithm === 'bubble' ? '冒泡排序' : '插入排序'}】，待排序序列 [${a.join(', ')}]`,
    message: '三大基础排序时间复杂度均为 O(N^2)，插入排序在几乎有序场景下最优达 O(N)',
    log: `enter ${algorithm}Sort(n=${n})`,
    codeLine: 1,
    statusBadge: { text: '准备排序', type: 'info' },
  });

  if (algorithm === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({
        nums: [...a],
        algorithm,
        i,
        j: i,
        minIdx,
        swapped: false,
        compared: false,
        decision: `外层第 ${i + 1} 趟开始：假定当前位置 i=${i} 的元素 ${a[i]} 为当前未排序区最小值`,
        message: '准备扫描区间 [i+1 .. n-1] 寻找绝对最小值并与 a[i] 交换',
        log: `i=${i}, minIdx=${minIdx}`,
        codeLine: 4,
        statusBadge: { text: `锁定基准 i=${i}`, type: 'warning' },
      });

      for (let j = i + 1; j < n; j++) {
        const isSmaller = a[j] < a[minIdx];
        if (isSmaller) minIdx = j;
        steps.push({
          nums: [...a],
          algorithm,
          i,
          j,
          minIdx,
          swapped: false,
          compared: true,
          decision: `比较 a[j=${j}]=${a[j]} 与当前最小值 a[minIdx=${minIdx}]=${a[minIdx]}`,
          message: isSmaller ? `🎉 发现更小值！minIdx 更新为 ${j}` : `未超过当前最小值，继续向右扫描`,
          log: `compare a[${j}]=${a[j]} with a[${minIdx}]`,
          codeLine: 6,
          statusBadge: isSmaller ? { text: `刷新最小值 ${a[j]}`, type: 'success' } : { text: '比较继续', type: 'info' },
        });
      }

      if (minIdx !== i) {
        const tmp = a[i]; a[i] = a[minIdx]; a[minIdx] = tmp;
        steps.push({
          nums: [...a],
          algorithm,
          i,
          j: minIdx,
          minIdx,
          swapped: true,
          compared: false,
          decision: `交换 a[i=${i}](${tmp}) 与 a[minIdx=${minIdx}](${a[i]})，位置 ${i} 元素确定就位`,
          message: `前缀区间 [0 .. ${i}] 已局部有序`,
          log: `swap(a[${i}], a[${minIdx}])`,
          codeLine: 8,
          statusBadge: { text: `交换归位`, type: 'success' },
        });
      }
    }
  } else if (algorithm === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        const willSwap = a[j] > a[j + 1];
        steps.push({
          nums: [...a],
          algorithm,
          i,
          j,
          swapped: false,
          compared: true,
          decision: `相邻比对：a[${j}]=${a[j]} 与 a[${j + 1}]=${a[j + 1]}`,
          message: willSwap ? `左侧大于右侧，产生逆序，触发气泡上浮交换` : `已有序，无需交换`,
          log: `compare(${a[j]}, ${a[j + 1]})`,
          codeLine: 16,
          statusBadge: willSwap ? { text: '发现逆序', type: 'warning' } : { text: '顺序正常', type: 'info' },
        });
        if (willSwap) {
          const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
          steps.push({
            nums: [...a],
            algorithm,
            i,
            j,
            swapped: true,
            compared: false,
            decision: `交换完成：元素 ${a[j + 1]} 向右冒泡一步`,
            message: `当前序列变为 [${a.join(', ')}]`,
            log: `swapped(${a[j]}, ${a[j + 1]})`,
            codeLine: 17,
            statusBadge: { text: '冒泡交换', type: 'success' },
          });
        }
      }
    }
  } else {
    for (let i = 1; i < n; i++) {
      for (let j = i - 1; j >= 0 && a[j] > a[j + 1]; j--) {
        steps.push({
          nums: [...a],
          algorithm,
          i,
          j,
          swapped: false,
          compared: true,
          decision: `扑克牌插入检测：新摸牌 a[${j + 1}]=${a[j + 1]} 与左邻 a[${j}]=${a[j]} 比对`,
          message: `摸牌小于前驱，向前倒序移动并交换`,
          log: `insertion step j=${j}`,
          codeLine: 25,
          statusBadge: { text: '摸牌插入中', type: 'warning' },
        });
        const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
        steps.push({
          nums: [...a],
          algorithm,
          i,
          j,
          swapped: true,
          compared: false,
          decision: `插入向前交换一步：当前序列变为 [${a.join(', ')}]`,
          message: `手牌区间 [0 .. ${i}] 维持严格单调递增`,
          log: `swapped to [${a.join(',')}]`,
          codeLine: 26,
          statusBadge: { text: '前移插入', type: 'success' },
        });
      }
    }
  }

  steps.push({
    nums: [...a],
    algorithm,
    i: n,
    j: n,
    swapped: false,
    compared: false,
    decision: `🎉 排序圆满完成！最终升序序列为: [${a.join(', ')}]`,
    message: '全序列已严格满足单调不减性质',
    log: `sort done: [${a.join(',')}]`,
    codeLine: 30,
    statusBadge: { text: '排序完成', type: 'success' },
  });

  return steps;
}

export const sortBasics004Visualizer = registerDeclarativeAlgorithm<Sort004Step>({
  id: 'sort-basics-004',
  name: '三大简单排序与复杂度对比 (Class 004)',
  category: 'sort',
  icon: '📶',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握选择排序、冒泡排序、插入排序的核心指针演化与大 O 复杂度最坏/最好情形分析',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目与原理概述</h3>
      <p>选择排序、冒泡排序、插入排序是计算机科学中最经典的入门级基于比较的排序算法，时间复杂度均为 <code>O(N²)</code>，额外空间复杂度 <code>O(1)</code>。</p>
      <ul>
        <li><strong>选择排序：</strong>每轮寻找未排序区最小值，与未排序区首位交换。不稳定。</li>
        <li><strong>冒泡排序：</strong>相邻两两比对，大者向后冒泡，每轮固化最右最大值。稳定。</li>
        <li><strong>插入排序：</strong>类似摸扑克牌，新元素在有序区内自右向左滑动插入。稳定且对常数级别有序序列最优 (最好 O(N))。</li>
      </ul>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔正整数)',
      type: 'text',
      defaultValue: '7, 3, 9, 1, 5, 2',
      placeholder: '例如: 7, 3, 9, 1, 5, 2',
    },
    {
      id: 'algorithm',
      label: '排序算法',
      type: 'select',
      defaultValue: 'selection',
      options: [
        { label: '选择排序 (Selection Sort)', value: 'selection' },
        { label: '冒泡排序 (Bubble Sort)', value: 'bubble' },
        { label: '插入排序 (Insertion Sort)', value: 'insertion' },
      ],
    },
  ],
  codeLanguages: SORT_004_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '7, 3, 9, 1, 5, 2');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const algo = (inputs.algorithm || 'selection') as 'selection' | 'bubble' | 'insertion';
    return buildSort004Steps(nums.length > 0 ? nums : [7, 3, 9, 1, 5, 2], algo);
  },
  renderCanvas: (container, step) => {
    const maxVal = Math.max(...step.nums, 10);
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前算法</div>
            <div style="font-size: 15px; font-weight: 700; color: #0284c7; margin-top: 4px;">
              ${step.algorithm === 'selection' ? '选择排序' : step.algorithm === 'bubble' ? '冒泡排序' : '插入排序'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">外层指针 i</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.i >= 0 ? step.i : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">扫描指针 j</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.j >= 0 ? step.j : '-'}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">当前最小值/基准</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.minIdx !== undefined ? `下标 [${step.minIdx}]` : '-'}</div>
          </div>
        </div>

        <!-- 柱状图阵列可视化 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 12px;">📊 数组序列柱状图状态</div>
          <div style="display: flex; gap: 12px; align-items: flex-end; height: 160px; justify-content: center; padding-bottom: 10px;">
            ${step.nums.map((val, idx) => {
              const height = Math.max(20, Math.floor((val / maxVal) * 130));
              const isActiveI = idx === step.i;
              const isActiveJ = idx === step.j;
              const isMin = idx === step.minIdx;
              let bg = '#3b82f6';
              if (isMin) bg = '#e11d48';
              else if (isActiveJ) bg = '#f59e0b';
              else if (isActiveI) bg = '#8b5cf6';

              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 700; color: #1e293b;">${val}</span>
                  <div style="width: 36px; height: ${height}px; background: ${bg}; border-radius: 6px 6px 0 0; transition: all 0.3s ease;"></div>
                  <span style="font-size: 10px; color: #64748b; font-family: monospace;">[${idx}]</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '排序状态与决策推导',
          `时间复杂度 O(N²) | 额外空间 O(1) | 当前操作: ${step.swapped ? '发生交换' : step.compared ? '数值比较' : '步进迭代'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
