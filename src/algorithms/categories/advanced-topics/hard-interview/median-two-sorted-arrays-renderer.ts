/**
 * Hard 20: 寻找两个正序数组的中位数 (Median of Two Sorted Arrays)
 * LeetCode 4 (Hard) / 大厂压轴终极二分题
 * 核心原语：短数组二分虚拟切分，交叉不等式检验 (L1 <= R2 && L2 <= R1)，O(log(min(M, N))) 极速定位
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MedianStep extends StepBase {
  stepIndex?: number;
  nums1: number[];
  nums2: number[];
  cut1: number; // i
  cut2: number; // j
  l1: number;
  r1: number;
  l2: number;
  r2: number;
  low: number;
  high: number;
  isPerfectCut: boolean;
  medianResult: number | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MEDIAN_CODES = {
  java: `public class MedianTwoSortedArrays {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // 保证 nums1 是较短的数组，将二分复杂度降至 O(log(min(m, n)))
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.length, n = nums2.length;
        int low = 0, high = m;

        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;

            int l1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int r1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int l2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int r2 = (j == n) ? Integer.MAX_VALUE : nums2[j];

            if (l1 <= r2 && l2 <= r1) {
                // 完美切分
                if ((m + n) % 2 == 1) {
                    return Math.max(l1, l2);
                } else {
                    return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
                }
            } else if (l1 > r2) {
                high = i - 1; // nums1 切分点太靠右，左移
            } else {
                low = i + 1;  // nums1 切分点太靠左，右移
            }
        }
        return 0.0;
    }
}`,
  cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int low = 0, high = m;
        while (low <= high) {
            int i = (low + high) / 2;
            int j = (m + n + 1) / 2 - i;
            int l1 = (i == 0) ? INT_MIN : nums1[i - 1];
            int r1 = (i == m) ? INT_MAX : nums1[i];
            int l2 = (j == 0) ? INT_MIN : nums2[j - 1];
            int r2 = (j == n) ? INT_MAX : nums2[j];
            if (l1 <= r2 && l2 <= r1) {
                if ((m + n) % 2 == 1) return max(l1, l2);
                return (max(l1, l2) + min(r1, r2)) / 2.0;
            } else if (l1 > r2) {
                high = i - 1;
            } else {
                low = i + 1;
            }
        }
        return 0.0;
    }
};`,
  python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        m, n = len(nums1), len(nums2)
        low, high = 0, m

        while low <= high:
            i = (low + high) // 2
            j = (m + n + 1) // 2 - i

            l1 = float('-inf') if i == 0 else nums1[i - 1]
            r1 = float('inf') if i == m else nums1[i]
            l2 = float('-inf') if j == 0 else nums2[j - 1]
            r2 = float('inf') if j == n else nums2[j]

            if l1 <= r2 and l2 <= r1:
                if (m + n) % 2 == 1:
                    return max(l1, l2)
                return (max(l1, l2) + min(r1, r2)) / 2.0
            elif l1 > r2:
                high = i - 1
            else:
                low = i + 1
        return 0.0`,
  typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    const m = nums1.length, n = nums2.length;
    let low = 0, high = m;

    while (low <= high) {
        const i = Math.floor((low + high) / 2);
        const j = Math.floor((m + n + 1) / 2) - i;

        const l1 = i === 0 ? -Infinity : nums1[i - 1];
        const r1 = i === m ? Infinity : nums1[i];
        const l2 = j === 0 ? -Infinity : nums2[j - 1];
        const r2 = j === n ? Infinity : nums2[j];

        if (l1 <= r2 && l2 <= r1) {
            if ((m + n) % 2 === 1) return Math.max(l1, l2);
            return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
        } else if (l1 > r2) {
            high = i - 1;
        } else {
            low = i + 1;
        }
    }
    return 0.0;
}`
};

export function generateMedianSteps(inputNums1: number[], inputNums2: number[]): MedianStep[] {
  const steps: MedianStep[] = [];
  let a = [...inputNums1];
  let b = [...inputNums2];

  if (a.length > b.length) {
    const tmp = a; a = b; b = tmp;
  }

  const m = a.length;
  const n = b.length;
  let low = 0;
  let high = m;

  const lines = {
    entry: 3,
    checkLen: 5,
    whileLoop: 11,
    calcCuts: 12,
    extractBounds: 15,
    checkPerfect: 20,
    calcOddMedian: 23,
    calcEvenMedian: 25,
    adjustHigh: 28,
    adjustLow: 30,
  };

  // Step 0: 入口
  steps.push({
    nums1: a,
    nums2: b,
    cut1: 0,
    cut2: 0,
    l1: -Infinity,
    r1: Infinity,
    l2: -Infinity,
    r2: Infinity,
    low: 0,
    high: m,
    isPerfectCut: false,
    medianResult: null,
    decision: `启动双正序数组中位数求解：nums1 规模 m=${m}, nums2 规模 n=${n}`,
    message: '二分切分核心：将两数组分别切为两半，使左半部分总长度严格等于 (m+n+1)/2',
    log: `Init binary search cuts for m=${m}, n=${n}`,
    codeLine: lines.entry,
    statusBadge: { text: '二分就绪', type: 'info' },
  });

  while (low <= high) {
    const i = Math.floor((low + high) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;

    const l1 = i === 0 ? -Infinity : a[i - 1];
    const r1 = i === m ? Infinity : a[i];
    const l2 = j === 0 ? -Infinity : b[j - 1];
    const r2 = j === n ? Infinity : b[j];

    const l1Display = l1 === -Infinity ? '-∞' : l1;
    const r1Display = r1 === Infinity ? '+∞' : r1;
    const l2Display = l2 === -Infinity ? '-∞' : l2;
    const r2Display = r2 === Infinity ? '+∞' : r2;

    if (l1 <= r2 && l2 <= r1) {
      // 完美切分
      let median = 0;
      if ((m + n) % 2 === 1) {
        median = Math.max(l1, l2);
      } else {
        median = (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
      }

      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: true,
        medianResult: median,
        decision: `🎉 达成完美切分！nums1 切于 [${i}]，nums2 切于 [${j}]`,
        message: `交叉检验全部成立：L1(${l1Display}) <= R2(${r2Display}) 且 L2(${l2Display}) <= R1(${r1Display})。中位数 = ${median}`,
        log: `Perfect cut found at i=${i}, j=${j}. Median=${median}`,
        codeLine: (m + n) % 2 === 1 ? lines.calcOddMedian : lines.calcEvenMedian,
        statusBadge: { text: `中位数: ${median}`, type: 'success' },
      });
      break;
    } else if (l1 > r2) {
      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: false,
        medianResult: null,
        decision: `切分失衡：L1(${l1Display}) > R2(${r2Display}) ➔ nums1 左侧元素过大，切分点太靠右`,
        message: `收缩右边界：high = ${i - 1}，将切分点向左收拢`,
        log: `Cut too far right: l1=${l1} > r2=${r2}. Set high=${i - 1}`,
        codeLine: lines.adjustHigh,
        statusBadge: { text: '向左调整', type: 'warning' },
      });
      high = i - 1;
    } else {
      steps.push({
        nums1: a,
        nums2: b,
        cut1: i,
        cut2: j,
        l1, r1, l2, r2,
        low, high,
        isPerfectCut: false,
        medianResult: null,
        decision: `切分失衡：L2(${l2Display}) > R1(${r1Display}) ➔ nums2 左侧元素过大，nums1 切分点太靠左`,
        message: `收缩左边界：low = ${i + 1}，将切分点向右推进`,
        log: `Cut too far left: l2=${l2} > r1=${r1}. Set low=${i + 1}`,
        codeLine: lines.adjustLow,
        statusBadge: { text: '向右调整', type: 'warning' },
      });
      low = i + 1;
    }
  }

  return steps;
}

export function renderMedianCanvas(container: HTMLElement, step: MedianStep): void {
  const l1Str = step.l1 === -Infinity ? '-∞' : String(step.l1);
  const r1Str = step.r1 === Infinity ? '+∞' : String(step.r1);
  const l2Str = step.l2 === -Infinity ? '-∞' : String(step.l2);
  const r2Str = step.r2 === Infinity ? '+∞' : String(step.r2);

  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">中位数求解结果 (Median)</div>
          <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.medianResult !== null ? step.medianResult : '二分探查中...'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">切分位置 (Cut1 & Cut2)</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            nums1[${step.cut1}] · nums2[${step.cut2}]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">二分搜索区间 [low, high]</div>
          <div style="font-size: 16px; font-family: monospace; color: #fbbf24; margin-top: 6px;">
            [ ${step.low} , ${step.high} ]
          </div>
        </div>
      </div>

      <!-- 双数组切分标尺沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 14px;">
          双数组虚拟切分标尺 (红虚线为当前切分位置)
        </div>

        <!-- nums1 标尺 -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">较短数组 nums1 (长度 ${step.nums1.length})</div>
          <div style="display: flex; gap: 6px; align-items: center; position: relative;">
            ${step.nums1.map((val, idx) => `
              <div style="display: flex; align-items: center;">
                ${idx === step.cut1 ? '<div style="width: 3px; height: 38px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 6px #ef4444;"></div>' : ''}
                <div style="
                  width: 38px;
                  height: 38px;
                  background: ${idx < step.cut1 ? 'rgba(56, 189, 248, 0.2)' : '#1e293b'};
                  border: ${idx === step.cut1 - 1 ? '2px solid #38bdf8' : idx === step.cut1 ? '2px solid #fbbf24' : '1px solid #475569'};
                  color: #fff;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 13px;
                  font-weight: bold;
                ">${val}</div>
              </div>
            `).join('')}
            ${step.cut1 === step.nums1.length ? '<div style="width: 3px; height: 38px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 6px #ef4444;"></div>' : ''}
          </div>
        </div>

        <!-- nums2 标尺 -->
        <div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">较长数组 nums2 (长度 ${step.nums2.length})</div>
          <div style="display: flex; gap: 6px; align-items: center; position: relative;">
            ${step.nums2.map((val, idx) => `
              <div style="display: flex; align-items: center;">
                ${idx === step.cut2 ? '<div style="width: 3px; height: 38px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 6px #ef4444;"></div>' : ''}
                <div style="
                  width: 38px;
                  height: 38px;
                  background: ${idx < step.cut2 ? 'rgba(52, 211, 153, 0.2)' : '#1e293b'};
                  border: ${idx === step.cut2 - 1 ? '2px solid #34d399' : idx === step.cut2 ? '2px solid #a855f7' : '1px solid #475569'};
                  color: #fff;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 13px;
                  font-weight: bold;
                ">${val}</div>
              </div>
            `).join('')}
            ${step.cut2 === step.nums2.length ? '<div style="width: 3px; height: 38px; background: #ef4444; border-radius: 2px; margin: 0 4px; box-shadow: 0 0 6px #ef4444;"></div>' : ''}
          </div>
        </div>
      </div>

      <!-- 交叉不等式校验卡片 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">交叉不等式比对看板</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="padding: 10px; background: rgba(30, 41, 59, 0.5); border-radius: 6px; border: 1px solid ${step.l1 <= step.r2 ? 'rgba(52,211,153,0.3)' : '#ef4444'};">
            <span style="color: #94a3b8;">条件 1: L1 ≤ R2 ➔</span>
            <span style="color: #38bdf8; font-weight: bold;"> ${l1Str}</span> ≤ <span style="color: #a855f7; font-weight: bold;">${r2Str}</span>
            <span style="float: right; color: ${step.l1 <= step.r2 ? '#34d399' : '#ef4444'}; font-weight: bold;">
              ${step.l1 <= step.r2 ? '✓ 满足' : '✗ 违背'}
            </span>
          </div>

          <div style="padding: 10px; background: rgba(30, 41, 59, 0.5); border-radius: 6px; border: 1px solid ${step.l2 <= step.r1 ? 'rgba(52,211,153,0.3)' : '#ef4444'};">
            <span style="color: #94a3b8;">条件 2: L2 ≤ R1 ➔</span>
            <span style="color: #34d399; font-weight: bold;"> ${l2Str}</span> ≤ <span style="color: #fbbf24; font-weight: bold;">${r1Str}</span>
            <span style="float: right; color: ${step.l2 <= step.r1 ? '#34d399' : '#ef4444'}; font-weight: bold;">
              ${step.l2 <= step.r1 ? '✓ 满足' : '✗ 违背'}
            </span>
          </div>
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '双有序数组虚拟切分定理',
        '令较短数组切分点为 i，长数组切分点 j = (m+n+1)/2 - i。当满足 L1 <= R2 且 L2 <= R1 时，所有左半部分均小于等于所有右半部分！总时间复杂度仅需 O(log(min(M, N)))，无需任何空间拷贝即可秒算中位数！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const medianTwoSortedArraysVisualizer = registerDeclarativeAlgorithm<MedianStep>({
  id: 'median-two-sorted-arrays',
  name: 'Hard 20: 寻找两个正序数组的中位数 (Median of Two Sorted Arrays)',
  category: 'search',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 20,
  learningGoal: '掌握双数组虚拟二分切分与交叉不等式收敛原理，体会 O(log(min(M, N))) 极速分治模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 4 - Hard)</h3>
      <p>给定两个大小分别为 $m$ 和 $n$ 的正序（从小到大）数组 <code>nums1</code> 和 <code>nums2</code>。请你找出并返回这两个正序数组的<strong>中位数</strong>。</p>
      <p>算法的总时间复杂度应该为 $O(\log(m + n))$。</p>
      <ul>
        <li><strong>最优切分解</strong>：在较短的数组上做二分查找，根据左右元素交叉不等式 $L1 \le R2$ 与 $L2 \le R1$ 调整切分边界。</li>
        <li><strong>复杂度</strong>：时间复杂度仅为 $O(\log(\min(m, n)))$，空间复杂度 $O(1)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MEDIAN_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'odd_total',
      options: [
        { label: '奇数总长用例: [1, 3, 8, 9, 15] 与 [7, 11, 18, 19, 21, 25]', value: 'odd_total' },
        { label: '偶数总长用例: [1, 2] 与 [3, 4]', value: 'even_total' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'odd_total';
    let a: number[], b: number[];
    if (sc === 'even_total') {
      a = [1, 2];
      b = [3, 4];
    } else {
      a = [1, 3, 8, 9, 15];
      b = [7, 11, 18, 19, 21, 25];
    }
    return generateMedianSteps(a, b);
  },
  renderCanvas: (container, step) => {
    renderMedianCanvas(container, step);
  },
});
