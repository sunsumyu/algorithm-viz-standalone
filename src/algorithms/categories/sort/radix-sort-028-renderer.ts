/**
 * Class 028: 基数排序深入与按位分桶 (Radix Sort)
 * 左程云算法通关课入门篇 Class 028
 * 非比较型线性排序：个十百位进位计数前缀表划分，实现真正的 O(N * d) 线性时间排序
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface RadixSortStep extends StepBase {
  stepIndex?: number;
  arr: number[];
  help: number[];
  currentDigit: number; // 当前处理的位 (1: 个位, 2: 十位, 3: 百位...)
  digitExp: number;     // 1, 10, 100...
  counts: number[];     // 0..9 计数数组
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const RADIX_SORT_028_CODES = {
  java: `public class RadixSort028 {
    public static void radixSort(int[] arr) {
        if (arr == null || arr.length < 2) return;
        int max = Integer.MIN_VALUE;
        for (int v : arr) max = Math.max(max, v);
        int bits = maxBits(max);
        radixSort(arr, 0, arr.length - 1, bits);
    }

    private static void radixSort(int[] arr, int l, int r, int bits) {
        final int radix = 10;
        int[] help = new int[r - l + 1];
        for (int d = 1; d <= bits; d++) {
            int[] count = new int[radix];
            for (int i = l; i <= r; i++) {
                int digit = getDigit(arr[i], d);
                count[digit]++;
            }
            // 转化为前缀累加和表，指示 <= 该位数字的最大出桶下标
            for (int i = 1; i < radix; i++) count[i] += count[i - 1];
            // 从右向左遍历保证排序稳定性
            for (int i = r; i >= l; i--) {
                int digit = getDigit(arr[i], d);
                help[--count[digit]] = arr[i];
            }
            for (int i = l, j = 0; i <= r; i++, j++) arr[i] = help[j];
        }
    }
    private static int getDigit(int x, int d) {
        return (x / (int)Math.pow(10, d - 1)) % 10;
    }
}`,
  cpp: `class RadixSort028 {
public:
    static void radixSort(vector<int>& arr) {
        if (arr.size() < 2) return;
        int maxVal = *max_element(arr.begin(), arr.end());
        int bits = 0;
        while (maxVal > 0) { bits++; maxVal /= 10; }

        int n = arr.size();
        vector<int> help(n);
        int offset = 1;

        for (int d = 1; d <= bits; ++d) {
            vector<int> count(10, 0);
            for (int x : arr) count[(x / offset) % 10]++;
            for (int i = 1; i < 10; ++i) count[i] += count[i - 1];
            for (int i = n - 1; i >= 0; --i) {
                int digit = (arr[i] / offset) % 10;
                help[--count[digit]] = arr[i];
            }
            arr = help;
            offset *= 10;
        }
    }
};`,
  python: `class RadixSort028:
    @staticmethod
    def radix_sort(arr: list[int]):
        if len(arr) < 2: return
        max_val = max(arr)
        offset = 1
        d = 1
        while max_val // offset > 0:
            count = [0] * 10
            for x in arr:
                digit = (x // offset) % 10
                count[digit] += 1
            for i in range(1, 10):
                count[i] += count[i - 1]
            help_arr = [0] * len(arr)
            for x in reversed(arr):
                digit = (x // offset) % 10
                count[digit] -= 1
                help_arr[count[digit]] = x
            arr[:] = help_arr
            offset *= 10
            d += 1`,
  typescript: `export class RadixSort028 {
  static radixSort(arr: number[]): void {
    if (arr.length < 2) return;
    const max = Math.max(...arr);
    let offset = 1;

    while (Math.floor(max / offset) > 0) {
      const count = new Array(10).fill(0);
      for (const x of arr) {
        const digit = Math.floor(x / offset) % 10;
        count[digit]++;
      }
      for (let i = 1; i < 10; i++) count[i] += count[i - 1];

      const help = new Array(arr.length);
      for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / offset) % 10;
        help[--count[digit]] = arr[i];
      }
      for (let i = 0; i < arr.length; i++) arr[i] = help[i];
      offset *= 10;
    }
  }
}`
};

export function generateRadixSortSteps(inputNums: number[]): RadixSortStep[] {
  const arr = [...inputNums];
  const steps: RadixSortStep[] = [];
  const n = arr.length;

  if (n < 2) {
    steps.push({
      stepIndex: 0,
      arr: [...arr],
      help: [...arr],
      currentDigit: 1,
      digitExp: 1,
      counts: new Array(10).fill(0),
      decision: '数组长度小于 2，无需执行基数排序',
      message: '无需排序',
      log: '数组已有序',
      codeLine: 4,
      statusBadge: { text: '无需排序', type: 'info' }
    });
    return steps;
  }

  const maxVal = Math.max(...arr);
  let bits = 0;
  let tmp = maxVal;
  while (tmp > 0) {
    bits++;
    tmp = Math.floor(tmp / 10);
  }
  bits = Math.max(bits, 1);

  let stepIdx = 0;
  let offset = 1;

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    help: new Array(n).fill(0),
    currentDigit: 1,
    digitExp: 1,
    counts: new Array(10).fill(0),
    decision: `基数排序初始化：数组最大值 ${maxVal}，共需处理 ${bits} 个十进制位`,
    message: '算法初始化',
    log: `最大值 ${maxVal}, 总位数 ${bits}`,
    codeLine: 6,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (let d = 1; d <= bits; d++) {
    const digitName = d === 1 ? '个位' : d === 2 ? '十位' : d === 3 ? '百位' : `第 ${d} 位`;
    const count = new Array(10).fill(0);

    for (const x of arr) {
      const digit = Math.floor(x / offset) % 10;
      count[digit]++;
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: new Array(n).fill(0),
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `处理【${digitName} (权值 ${offset})】：完成 0~9 数字频次统计`,
      message: `${digitName} 频次统计完成`,
      log: `${digitName} 计数完成`,
      codeLine: 16,
      statusBadge: { text: `${digitName} 计数`, type: 'info' }
    });

    // 前缀和
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: new Array(n).fill(0),
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `计算【${digitName}】前缀累加和表 count：count[i] 表示当前位 <= i 的元素最终应分配的最大出桶位置`,
      message: '前缀和表就绪',
      log: `${digitName} 前缀和计算完成`,
      codeLine: 20,
      statusBadge: { text: '前缀和转换', type: 'warning' }
    });

    const help = new Array(n);
    // 从右往左出桶以保证稳定性
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / offset) % 10;
      help[--count[digit]] = arr[i];
    }

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: [...help],
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `从右向左遍历原数组，依据 count 表将元素稳定放回辅助数组 help`,
      message: '稳定出桶分配完成',
      log: `${digitName} 出桶完成`,
      codeLine: 24,
      statusBadge: { text: '稳定出桶', type: 'warning' }
    });

    for (let i = 0; i < n; i++) arr[i] = help[i];

    steps.push({
      stepIndex: stepIdx++,
      arr: [...arr],
      help: [...help],
      currentDigit: d,
      digitExp: offset,
      counts: [...count],
      decision: `【${digitName}】排序回合结束！原数组已按照当前低位保持相对有序`,
      message: `${digitName} 回合结束`,
      log: `${digitName} 排序完成: [${arr.join(', ')}]`,
      codeLine: 26,
      statusBadge: { text: `${digitName} 有序`, type: 'success' }
    });

    offset *= 10;
  }

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    help: [...arr],
    currentDigit: bits,
    digitExp: offset,
    counts: new Array(10).fill(0),
    decision: '基数排序全流程执行完毕！所有数位扫描完成，数组达到完全升序',
    message: '排序完全结束',
    log: '基数排序成功',
    codeLine: 28,
    statusBadge: { text: '完全升序', type: 'success' }
  });

  return steps;
}

export function renderRadixSortCanvas(container: HTMLElement, step: RadixSortStep) {
  const { arr, help, currentDigit, digitExp, counts } = step;
  const digitName = currentDigit === 1 ? '个位' : currentDigit === 2 ? '十位' : currentDigit === 3 ? '百位' : `第 ${currentDigit} 位`;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前排序位</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${digitName} (权值: ${digitExp})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">最大元素</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${Math.max(...arr)}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">元素总个数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${arr.length}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">当前数组元素状态：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const currentDigitVal = Math.floor(val / digitExp) % 10;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: #38bdf8; font-weight: bold;">
                  位:${currentDigitVal}
                </div>
                <div style="
                  width: 52px;
                  height: 48px;
                  background: rgba(51, 65, 85, 0.4);
                  border: 2px solid rgba(56, 189, 248, 0.4);
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
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

      <!-- 0~9 计数桶前缀视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">0~9 计数前缀桶状态 (count):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">
          ${counts.map((c, i) => `
            <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #f8fafc; text-align: center;">
              数字 ${i}: <b>${c}</b>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '非比较基数排序核心前缀出桶原理',
        'count[d] 从频次表转化为前缀和表后，直接标识该数位 <= d 的元素在 help 数组中的最右落点。必须【从右向左】倒序遍历原数组，确保相同的数相对顺序不变 (稳定性保持)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const radixSort028Visualizer = registerDeclarativeAlgorithm<RadixSortStep>({
  id: 'radix-sort-028',
  name: 'Class 028: 基数排序深入与按位分桶 (Radix Sort)',
  category: 'sort',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 28,
  learningGoal: '透彻理解非基于比较的基数排序算法，掌握前缀累加和表划分与从右向左保持稳定性的数学设计',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 028)</h3>
      <p>基数排序 (Radix Sort) 是一种经典的不基于大小比较的线性时间排序算法：</p>
      <ul>
        <li><strong>排序原理</strong>：由低位（个位）向高位（百位、千位...），依次进行稳定的“出桶入桶”。</li>
        <li><strong>空间优化（无真实桶方案）</strong>：用大小为 10 的 <code>count</code> 数组完成前缀和统计，避免创建 10 个真实链表队列。</li>
        <li><strong>稳定性至关重要</strong>：从右向左将元素放入 <code>help</code> 数组，保证低位排好的先后顺序在高位相同时不被破坏。</li>
      </ul>
    </div>
  `,
  codeLanguages: RADIX_SORT_028_CODES,
  inputs: [
    {
      id: 'nums',
      label: '待排序正整数数组 (以逗号分隔)',
      type: 'text',
      defaultValue: '17, 13, 25, 100, 72, 36, 54',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '17, 13, 25, 100, 72, 36, 54');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n >= 0);
    return generateRadixSortSteps(nums.length > 0 ? nums : [17, 13, 25, 100, 72, 36, 54]);
  },
  renderCanvas: (container, step) => {
    renderRadixSortCanvas(container, step);
  },
});
