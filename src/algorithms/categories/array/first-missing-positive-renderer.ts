/**
 * Hard 22: 缺失的第一个正数 (First Missing Positive)
 * LeetCode 41 (Hard) / 大厂压轴原地哈希 (In-place Hash) 奠基母题
 * 核心原语：鸽巢原理 + 原地置换，将数字 x 归位至下标 x - 1，O(N) 时间严格 O(1) 空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface MissingPositiveStep extends StepBase {
  stepIndex?: number;
  nums: number[];
  currentIndex: number;
  swappedPair?: [number, number]; // [i, targetIdx]
  inPlaceStatus: boolean[]; // 每个槽位 nums[i] === i + 1 是否成立
  missingResult: number | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MISSING_POSITIVE_CODES = {
  java: `public class FirstMissingPositive {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        // 1. 原地哈希置换：将数值 x 归位至下标 x - 1
        for (int i = 0; i < n; i++) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums, i, nums[i] - 1);
            }
        }

        // 2. 遍历找出第一个未匹配槽位
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1; // 1~n 全满，缺失 n + 1
    }

    private void swap(int[] arr, int i, int j) {
        int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
}`,
  cpp: `class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; ++i) {
            while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }
        for (int i = 0; i < n; ++i) {
            if (nums[i] != i + 1) return i + 1;
        }
        return n + 1;
    }
};`,
  python: `class Solution:
    def firstMissingPositive(self, nums: list[int]) -> int:
        n = len(nums)
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                target = nums[i] - 1
                nums[i], nums[target] = nums[target], nums[i]

        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1`,
  typescript: `function firstMissingPositive(nums: number[]): number {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
            const target = nums[i] - 1;
            const temp = nums[i];
            nums[i] = nums[target];
            nums[target] = temp;
        }
    }
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) return i + 1;
    }
    return n + 1;
}`
};

export function generateMissingPositiveSteps(inputNums: number[] = [3, 4, -1, 1]): MissingPositiveStep[] {
  const steps: MissingPositiveStep[] = [];
  const nums = [...inputNums];
  const n = nums.length;

  const lines = {
    entry: 3,
    loop1: 5,
    whileSwap: 6,
    loop2: 12,
    foundMismatch: 14,
    returnAllFit: 17,
  };

  const getStatus = () => nums.map((v, i) => v === i + 1);

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    currentIndex: 0,
    inPlaceStatus: getStatus(),
    missingResult: null,
    decision: `启动缺失正数检测：数组规模 N = ${n}，目标答案必在 [1, ${n + 1}] 范围内`,
    message: '鸽巢原理：若 1~N 均出现，则缺失 N+1；否则必在 [1, N] 内存在空缺槽位',
    log: `Init firstMissingPositive with nums=[${nums.join(', ')}]`,
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
  });

  // 第一轮：原地置换归位
  for (let i = 0; i < n; i++) {
    steps.push({
      nums: [...nums],
      currentIndex: i,
      inPlaceStatus: getStatus(),
      missingResult: null,
      decision: `扫描槽位 [${i}] ➔ 当前数值 nums[${i}] = ${nums[i]}`,
      message: `判断是否属于合法正数范围 [1, ${n}] 且尚未归位`,
      log: `Scan i=${i}, val=${nums[i]}`,
      codeLine: lines.loop1,
      statusBadge: { text: `扫描 #${i}`, type: 'info' },
    });

    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const targetIdx = nums[i] - 1;
      const val = nums[i];

      const temp = nums[i];
      nums[i] = nums[targetIdx];
      nums[targetIdx] = temp;

      steps.push({
        nums: [...nums],
        currentIndex: i,
        swappedPair: [i, targetIdx],
        inPlaceStatus: getStatus(),
        missingResult: null,
        decision: `原地置换：将数值 ${val} 与槽位 [${targetIdx}] 的元素进行交换`,
        message: `使数值 ${val} 成功归位至其理想槽位下标 ${targetIdx} (即 nums[${targetIdx}] = ${val})`,
        log: `Swap nums[${i}] and nums[${targetIdx}] -> [${nums.join(', ')}]`,
        codeLine: lines.whileSwap,
        statusBadge: { text: `归位数值 ${val}`, type: 'warning' },
      });
    }
  }

  // 第二轮：查找首个失配位置
  let ans = n + 1;
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) {
      ans = i + 1;
      steps.push({
        nums: [...nums],
        currentIndex: i,
        inPlaceStatus: getStatus(),
        missingResult: ans,
        decision: `🎉 发现首个失配槽位 [${i}]！该位置预期值为 ${i + 1}，实际为 ${nums[i]}`,
        message: `最小缺失正数已锁定：答案 = ${ans}`,
        log: `First mismatch at i=${i} -> answer=${ans}`,
        codeLine: lines.foundMismatch,
        statusBadge: { text: `答案: ${ans}`, type: 'success' },
      });
      return steps;
    }
  }

  steps.push({
    nums: [...nums],
    currentIndex: n - 1,
    inPlaceStatus: getStatus(),
    missingResult: ans,
    decision: `🎉 1~${n} 全部完美归位！最小缺失正数为 N + 1 = ${ans}`,
    message: '全序列密集连续无断层',
    log: `All 1..${n} fit -> answer=${ans}`,
    codeLine: lines.returnAllFit,
    statusBadge: { text: `答案: ${ans}`, type: 'success' },
  });

  return steps;
}

export function renderMissingPositiveCanvas(container: HTMLElement, step: MissingPositiveStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">最小缺失正数结果 (Answer)</div>
          <div style="font-size: 24px; font-weight: bold; color: ${step.missingResult !== null ? '#34d399' : '#38bdf8'}; margin-top: 4px;">
            ${step.missingResult !== null ? step.missingResult : '置换扫描中...'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前检查槽位 (Index)</div>
          <div style="font-size: 20px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            下标 [ ${step.currentIndex} ] (预期值 ${step.currentIndex + 1})
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">已正确归位槽位数</div>
          <div style="font-size: 20px; font-weight: bold; color: #a855f7; margin-top: 4px;">
            ${step.inPlaceStatus.filter(Boolean).length} / ${step.nums.length} 个
          </div>
        </div>
      </div>

      <!-- 原地置换桶沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 14px;">
          数组物理槽位归位状态 (绿色=nums[i] === i+1 完美归位)
        </div>

        <div style="display: flex; gap: 8px; overflow-x: auto; padding: 6px 0;">
          ${step.nums.map((val, idx) => {
            const isFit = step.inPlaceStatus[idx];
            const isCurrent = idx === step.currentIndex;
            const isSwapped = step.swappedPair && step.swappedPair.includes(idx);

            return `
              <div style="
                min-width: 52px;
                height: 56px;
                background: ${isFit ? '#065f46' : isCurrent ? '#0369a1' : '#1e293b'};
                border: ${isSwapped ? '2px solid #fbbf24' : isFit ? '2px solid #34d399' : isCurrent ? '2px solid #38bdf8' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isFit ? '0 0 10px rgba(52,211,153,0.4)' : isSwapped ? '0 0 10px rgba(251,191,36,0.6)' : 'none'};
              ">
                <div style="font-size: 16px; font-weight: bold; color: #fff;">${val}</div>
                <div style="font-size: 9px; color: #94a3b8;">槽位 #${idx} (应为${idx + 1})</div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
          置换法则：只要 nums[i] 在 [1, N] 范围内且尚未归位，就将其与目标槽位 nums[nums[i]-1] 交换，直至当前槽位无法再置换。
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '原地哈希 (In-place Hash) 空间压缩公理',
        '长度为 N 的数组中，最小缺失正数必在 [1, N+1] 之间。无需开辟额外哈希表，直接利用数组自身的下标作为隐式哈希桶！每个合法数字最多被置换一次即可到达其正确位置，总交换次数不超过 N 次，达成时间严格 O(N) 且空间严格 O(1) 的极限性能！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const firstMissingPositiveVisualizer = registerDeclarativeAlgorithm<MissingPositiveStep>({
  id: 'first-missing-positive',
  name: 'Hard 22: 缺失的第一个正数 (First Missing Positive)',
  category: 'array',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 41,
  learningGoal: '掌握原地哈希桶排序置换技巧，深刻理解鸽巢原理在常数级额外空间 O(1) 检索中的精妙应用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 41 - Hard)</h3>
      <p>给你一个未排序的整数数组 <code>nums</code> ，请你找出其中没有出现的最小的正整数。</p>
      <ul>
        <li><strong>时空要求</strong>：请你实现时间复杂度为 $O(N)$ 并且只使用常数级别额外空间 $O(1)$ 的解决方案。</li>
        <li><strong>核心思想</strong>：鸽巢原理 + 原地置换。将数值 $x$ 交换至下标 $x - 1$ 位置，最后扫描首个失配槽位。</li>
      </ul>
    </div>
  `,
  codeLanguages: MISSING_POSITIVE_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准用例: [3, 4, -1, 1] ➔ 答案 2', value: 'standard' },
        { label: '连续用例: [1, 2, 0] ➔ 答案 3', value: 'continuous' },
        { label: '负数断层: [7, 8, 9, 11, 12] ➔ 答案 1', value: 'large_positive' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'standard';
    let arr = [3, 4, -1, 1];
    if (sc === 'continuous') arr = [1, 2, 0];
    else if (sc === 'large_positive') arr = [7, 8, 9, 11, 12];
    return generateMissingPositiveSteps(arr);
  },
  renderCanvas: (container, step) => {
    renderMissingPositiveCanvas(container, step);
  },
});
