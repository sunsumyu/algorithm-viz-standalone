/**
 * Class 022: 归并排序与小和问题 (MergeSort Small Sum)
 * 左程云算法通关课入门篇 Class 022
 * 分治合并单调性加速：利用归并合并阶段的左右有序性，在 O(N log N) 内求出全局小和
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface SmallSumStep extends StepBase {
  stepIndex?: number;
  arr: number[];
  left: number;
  mid: number;
  right: number;
  p1: number;
  p2: number;
  totalSmallSum: number;
  currentAddedSum: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MERGE_SORT_SMALL_SUM_CODES = {
  java: `public class SmallSum022 {
    public static long smallSum(int[] arr) {
        if (arr == null || arr.length < 2) return 0;
        return process(arr, 0, arr.length - 1);
    }

    private static long process(int[] arr, int l, int r) {
        if (l == r) return 0;
        int mid = l + ((r - l) >> 1);
        return process(arr, l, mid) + process(arr, mid + 1, r) + merge(arr, l, mid, r);
    }

    private static long merge(int[] arr, int l, int m, int r) {
        int[] help = new int[r - l + 1];
        int i = 0, p1 = l, p2 = m + 1;
        long res = 0;

        while (p1 <= m && p2 <= r) {
            // 当左组小于右组时，右组从 p2 到 r 全都大于 arr[p1]
            res += arr[p1] < arr[p2] ? (long) (r - p2 + 1) * arr[p1] : 0;
            help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
        }
        while (p1 <= m) help[i++] = arr[p1++];
        while (p2 <= r) help[i++] = arr[p2++];
        for (i = 0; i < help.length; i++) arr[l + i] = help[i];
        return res;
    }
}`,
  cpp: `class SmallSum022 {
public:
    static long long smallSum(vector<int>& arr) {
        if (arr.size() < 2) return 0;
        return process(arr, 0, (int)arr.size() - 1);
    }

    static long long process(vector<int>& arr, int l, int r) {
        if (l == r) return 0;
        int mid = l + ((r - l) >> 1);
        return process(arr, l, mid) + process(arr, mid + 1, r) + merge(arr, l, mid, r);
    }

    static long long merge(vector<int>& arr, int l, int m, int r) {
        vector<int> help(r - l + 1);
        int i = 0, p1 = l, p2 = m + 1;
        long long res = 0;

        while (p1 <= m && p2 <= r) {
            res += arr[p1] < arr[p2] ? (long long)(r - p2 + 1) * arr[p1] : 0;
            help[i++] = arr[p1] < arr[p2] ? arr[p1++] : arr[p2++];
        }
        while (p1 <= m) help[i++] = arr[p1++];
        while (p2 <= r) help[i++] = arr[p2++];
        for (i = 0; i < (int)help.length; i++) arr[l + i] = help[i];
        return res;
    }
};`,
  python: `class SmallSum022:
    @staticmethod
    def small_sum(arr: list[int]) -> int:
        if len(arr) < 2: return 0

        def process(l: int, r: int) -> int:
            if l == r: return 0
            mid = l + ((r - l) >> 1)
            return process(l, mid) + process(mid + 1, r) + merge(l, mid, r)

        def merge(l: int, m: int, r: int) -> int:
            help_arr = []
            p1, p2 = l, m + 1
            res = 0
            while p1 <= m and p2 <= r:
                if arr[p1] < arr[p2]:
                    res += (r - p2 + 1) * arr[p1]
                    help_arr.append(arr[p1])
                    p1 += 1
                else:
                    help_arr.append(arr[p2])
                    p2 += 1
            help_arr.extend(arr[p1:m + 1])
            help_arr.extend(arr[p2:r + 1])
            arr[l:r + 1] = help_arr
            return res

        return process(0, len(arr) - 1)`,
  typescript: `export class SmallSum022 {
  static smallSum(arr: number[]): number {
    if (arr.length < 2) return 0;

    const process = (l: number, r: number): number => {
      if (l === r) return 0;
      const mid = l + ((r - l) >> 1);
      return process(l, mid) + process(mid + 1, r) + merge(l, mid, r);
    };

    const merge = (l: number, m: number, r: number): number => {
      const help: number[] = [];
      let p1 = l, p2 = m + 1;
      let res = 0;

      while (p1 <= m && p2 <= r) {
        if (arr[p1] < arr[p2]) {
          res += (r - p2 + 1) * arr[p1];
          help.push(arr[p1++]);
        } else {
          help.push(arr[p2++]);
        }
      }
      while (p1 <= m) help.push(arr[p1++]);
      while (p2 <= r) help.push(arr[p2++]);
      for (let i = 0; i < help.length; i++) arr[l + i] = help[i];
      return res;
    };

    return process(0, arr.length - 1);
  }
}`
};

export function generateSmallSumSteps(inputNums: number[]): SmallSumStep[] {
  const arr = [...inputNums];
  const steps: SmallSumStep[] = [];
  const n = arr.length;
  let totalSmallSum = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    left: 0,
    mid: -1,
    right: n - 1,
    p1: -1,
    p2: -1,
    totalSmallSum: 0,
    currentAddedSum: 0,
    decision: '开始归并小和计算：分治递归切分数组，在 merge 阶段跨区间统计',
    message: '算法启动',
    log: '初始化 SmallSum',
    codeLine: 4,
    statusBadge: { text: '算法启动', type: 'info' }
  });

  function mergeSort(l: number, r: number) {
    if (l >= r) return;
    const mid = l + ((r - l) >> 1);
    mergeSort(l, mid);
    mergeSort(mid + 1, r);

    // 录制当前 merge 过程
    const help: number[] = [];
    let p1 = l;
    let p2 = mid + 1;

    while (p1 <= mid && p2 <= r) {
      if (arr[p1] < arr[p2]) {
        const count = r - p2 + 1;
        const add = count * arr[p1];
        totalSmallSum += add;

        steps.push({
          stepIndex: stepIdx++,
          arr: [...arr],
          left: l,
          mid,
          right: r,
          p1,
          p2,
          totalSmallSum,
          currentAddedSum: add,
          decision: `左组 arr[${p1}]=${arr[p1]} < 右组 arr[${p2}]=${arr[p2]}！右组从下标 ${p2} 到 ${r} 共 ${count} 个数均大于 ${arr[p1]}，产生小和贡献 ${arr[p1]} * ${count} = ${add}。当前累计小和 = ${totalSmallSum}`,
          message: `贡献小和 +${add}`,
          log: `[${l}..${r}] 贡献: ${arr[p1]} * ${count} = ${add}`,
          codeLine: 18,
          statusBadge: { text: `小和 +${add}`, type: 'success' }
        });

        help.push(arr[p1++]);
      } else {
        steps.push({
          stepIndex: stepIdx++,
          arr: [...arr],
          left: l,
          mid,
          right: r,
          p1,
          p2,
          totalSmallSum,
          currentAddedSum: 0,
          decision: `左组 arr[${p1}]=${arr[p1]} >= 右组 arr[${p2}]=${arr[p2]}，不产生小和贡献，拷贝右组元素 ${arr[p2]}`,
          message: `拷贝右组 ${arr[p2]}`,
          log: `[${l}..${r}] 右组较小或相等，无小和`,
          codeLine: 19,
          statusBadge: { text: '右组移动', type: 'warning' }
        });
        help.push(arr[p2++]);
      }
    }

    while (p1 <= mid) help.push(arr[p1++]);
    while (p2 <= r) help.push(arr[p2++]);
    for (let i = 0; i < help.length; i++) {
      arr[l + i] = help[i];
    }
  }

  mergeSort(0, n - 1);

  steps.push({
    stepIndex: stepIdx++,
    arr: [...arr],
    left: 0,
    mid: Math.floor((n - 1) / 2),
    right: n - 1,
    p1: -1,
    p2: -1,
    totalSmallSum,
    currentAddedSum: 0,
    decision: `归并排序与小和计算全流程完毕！全局小和累加和为 ${totalSmallSum}，数组最终有序`,
    message: `最终小和: ${totalSmallSum}`,
    log: `归并小和计算完毕: ${totalSmallSum}`,
    codeLine: 25,
    statusBadge: { text: `小和总计: ${totalSmallSum}`, type: 'success' }
  });

  return steps;
}

export function renderSmallSumCanvas(container: HTMLElement, step: SmallSumStep) {
  const { arr, left, mid, right, p1, p2, totalSmallSum, currentAddedSum } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">归并区间 [L, Mid, R]</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            [${left}, ${mid}, ${right}]
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">左指针 p1 (值)</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${p1 >= 0 ? `${p1} (值:${arr[p1]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">右指针 p2 (值)</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${p2 >= 0 ? `${p2} (值:${arr[p2]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">本步新增小和</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            +${currentAddedSum}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">累计小和总计</div>
          <div style="font-size: 14px; font-weight: bold; color: #a855f7;">
            ${totalSmallSum}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const isP1 = idx === p1;
            const isP2 = idx === p2;
            const inLeftGroup = idx >= left && idx <= mid;
            const inRightGroup = idx > mid && idx <= right;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isP1) {
              bgColor = 'rgba(245, 158, 11, 0.35)';
              borderColor = '#f59e0b';
            } else if (isP2) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (inLeftGroup) {
              bgColor = 'rgba(56, 189, 248, 0.15)';
              borderColor = 'rgba(56, 189, 248, 0.4)';
            } else if (inRightGroup) {
              bgColor = 'rgba(168, 85, 247, 0.15)';
              borderColor = 'rgba(168, 85, 247, 0.4)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isP1 ? '#f59e0b' : isP2 ? '#ec4899' : inLeftGroup ? '#38bdf8' : inRightGroup ? '#a855f7' : '#64748b'}; font-weight: bold;">
                  ${isP1 ? 'P1' : isP2 ? 'P2' : ''}
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
                  box-shadow: ${isP1 || isP2 ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none'};
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

      <!-- 小和与归并精髓核心卡片 -->
      ${renderFormulaCard(
        '归并分治小和转化精髓 (MergeSort Small Sum Invariant)',
        '求左边比它小的累加和 等价于 求右边比它大的数量。当 arr[p1] < arr[p2] 时，右组中从 p2 到 r 全部大于 arr[p1]，产生 arr[p1] * (r - p2 + 1) 的贡献',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const mergeSortSmallSum022Visualizer = registerDeclarativeAlgorithm<SmallSumStep>({
  id: 'merge-sort-small-sum-022',
  name: 'Class 022: 归并排序与小和问题 (Small Sum)',
  category: 'sort',
  icon: '➕',
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '深刻理解归并排序 Merge 阶段跨组单调性在统计小和与逆序对中的降维加速威力',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 022)</h3>
      <p>在数组中，每一个数左边比当前数小的数累加起来，叫做这个数组的小和：</p>
      <ul>
        <li><strong>暴力解法</strong>：对每个数向左扫描累加，时间复杂度 $O(N^2)$。</li>
        <li><strong>逆向思维</strong>：一只数左边比它小，等价于这只数右边有多少个数比它大！</li>
        <li><strong>归并加速</strong>：在左右两部分已有序的归并阶段，只要 <code>arr[p1] &lt; arr[p2]</code>，就可以瞬间推断出右组剩下 <code>r - p2 + 1</code> 个数全部比 <code>arr[p1]</code> 大，将复杂度压缩至 $O(N \\log N)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MERGE_SORT_SMALL_SUM_CODES,
  inputs: [
    {
      id: 'nums',
      label: '输入数组 (以逗号分隔)',
      type: 'text',
      defaultValue: '1, 3, 4, 2, 5',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '1, 3, 4, 2, 5');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateSmallSumSteps(nums.length > 0 ? nums : [1, 3, 4, 2, 5]);
  },
  renderCanvas: (container, step) => {
    renderSmallSumCanvas(container, step);
  },
});
