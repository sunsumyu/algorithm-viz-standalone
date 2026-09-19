/**
 * Hard 22: 缺失的第一个正数 (First Missing Positive)
 * LeetCode 41 (Hard) / 大厂压轴原地哈希 (In-place Hash) 奠基母题
 * 核心原语：鸽巢原理 + 原地置换，将数字 x 归位至下标 x - 1，O(N) 时间严格 O(1) 空间
 * 遵循顶层 4-Card 黄金规约，纯净物理沙盘与声明式指标驱动
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
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
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics: Record<string, string | number>;
  ans?: string;
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

export const FIRST_MISSING_POSITIVE_CODE_LINES: Record<string, Record<string, number>> = {
  entry: { java: 3, cpp: 4, python: 3, typescript: 2 },
  loop1: { java: 5, cpp: 5, python: 4, typescript: 3 },
  whileSwap: { java: 6, cpp: 6, python: 5, typescript: 4 },
  loop2: { java: 12, cpp: 10, python: 9, typescript: 11 },
  foundMismatch: { java: 14, cpp: 11, python: 11, typescript: 12 },
  returnAllFit: { java: 17, cpp: 13, python: 12, typescript: 14 },
};

export function generateMissingPositiveSteps(inputNums: number[] = [3, 4, -1, 1]): MissingPositiveStep[] {
  const steps: MissingPositiveStep[] = [];
  const nums = [...inputNums];
  const n = nums.length;

  const lines = FIRST_MISSING_POSITIVE_CODE_LINES;

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
    metrics: {
      'min-missing': '置换扫描中...',
      'cur-index': `下标 [ 0 ] (预期 1)`,
      'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
      'array-scale': `N = ${n}`,
    },
  });

  // 第一阶段：原地置换归位
  for (let i = 0; i < n; i++) {
    steps.push({
      nums: [...nums],
      currentIndex: i,
      inPlaceStatus: getStatus(),
      missingResult: null,
      decision: `考查槽位 i = ${i}，当前数值为 ${nums[i]} (目标归位槽位下标应为 ${nums[i] - 1})`,
      message: `进入外层循环：检查 nums[${i}] 是否满足 1 <= x <= ${n} 且尚未归位`,
      log: `Outer loop check i=${i}, val=${nums[i]}`,
      codeLine: lines.loop1,
      metrics: {
        'min-missing': '置换扫描中...',
        'cur-index': `下标 [ ${i} ] (值 ${nums[i]})`,
        'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
        'array-scale': `N = ${n}`,
      },
    });

    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const targetIdx = nums[i] - 1;
      const valI = nums[i];
      const valTarget = nums[targetIdx];

      steps.push({
        nums: [...nums],
        currentIndex: i,
        swappedPair: [i, targetIdx],
        inPlaceStatus: getStatus(),
        missingResult: null,
        decision: `⚡ 满足置换条件：将 nums[${i}]=${valI} 交换至正确槽位下标 ${targetIdx} (当前槽值 ${valTarget})`,
        message: `置换中：把 ${valI} 放置到 nums[${targetIdx}]，将原占据该位置的 ${valTarget} 换回当前槽位重新裁决`,
        log: `Swap nums[${i}]=${valI} <-> nums[${targetIdx}]=${valTarget}`,
        codeLine: lines.whileSwap,
        statusBadge: { text: `交换 ${valI} ↔ ${valTarget}`, type: 'warning' },
        metrics: {
          'min-missing': '置换扫描中...',
          'cur-index': `置换 ${i} ↔ ${targetIdx}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
        },
      });

      // 实际交换
      const temp = nums[i];
      nums[i] = nums[targetIdx];
      nums[targetIdx] = temp;

      steps.push({
        nums: [...nums],
        currentIndex: i,
        swappedPair: [i, targetIdx],
        inPlaceStatus: getStatus(),
        missingResult: null,
        decision: `交换完成：数字 ${temp} 已成功归位至下标 ${targetIdx}！当前槽位换入新数值 ${nums[i]}，继续循环判定`,
        message: `持续原地置换：直到当前槽位的数字无法归位（超出 [1, N] 或已重复）`,
        log: `After swap: nums[${targetIdx}]=${temp}, current nums[${i}]=${nums[i]}`,
        codeLine: lines.whileSwap,
        metrics: {
          'min-missing': '置换扫描中...',
          'cur-index': `已置换 ${temp}➔#${targetIdx}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
        },
      });
    }
  }

  // 第二阶段：线性扫描寻找首个失配槽位
  let found = false;
  for (let i = 0; i < n; i++) {
    const expected = i + 1;
    const actual = nums[i];
    const isMismatch = actual !== expected;

    steps.push({
      nums: [...nums],
      currentIndex: i,
      inPlaceStatus: getStatus(),
      missingResult: isMismatch ? expected : null,
      decision: isMismatch
        ? `🚨 发现首个失配槽位！下标 i = ${i} 处数值为 ${actual}，缺失预期正数 ${expected}`
        : `槽位 i = ${i} 匹配成功：数值为 ${actual}，符合预期`,
      message: `核对槽位下标 i = ${i} 与数值 ${actual}`,
      log: `Scan slot i=${i}: actual=${actual}, expected=${expected} (${isMismatch ? 'MISMATCH' : 'MATCH'})`,
      codeLine: isMismatch ? lines.foundMismatch : lines.loop2,
      statusBadge: isMismatch
        ? { text: `首个缺失正数: ${expected}`, type: 'danger' }
        : { text: `槽位 ${i} 正常`, type: 'info' },
      metrics: {
        'min-missing': isMismatch ? expected : '扫描核对中...',
        'cur-index': `检查槽位 #${i}`,
        'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
        'array-scale': `N = ${n}`,
      },
    });

    if (isMismatch) {
      found = true;
      const ans = expected;
      steps.push({
        nums: [...nums],
        currentIndex: i,
        inPlaceStatus: getStatus(),
        missingResult: ans,
        decision: `🎉 算法求解完成！首个缺失的正整数即为 ${ans}`,
        message: `根据鸽巢原理，最小正整数为 ${ans}`,
        log: `Return first missing positive: ${ans}`,
        codeLine: lines.foundMismatch,
        statusBadge: { text: `最终结果: ${ans}`, type: 'success' },
        ans: String(ans),
        metrics: {
          'min-missing': ans,
          'cur-index': `首个失配 #${i}`,
          'in-place-count': `${getStatus().filter(Boolean).length} / ${n} 槽`,
          'array-scale': `N = ${n}`,
          'metric-ans': ans,
        },
      });
      break;
    }
  }

  if (!found) {
    const ans = n + 1;
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
      ans: String(ans),
      metrics: {
        'min-missing': ans,
        'cur-index': '全序列连续',
        'in-place-count': `${n} / ${n} 槽`,
        'array-scale': `N = ${n}`,
        'metric-ans': ans,
      },
    });
  }

  return steps;
}

export function renderMissingPositiveCanvas(container: HTMLElement, step: MissingPositiveStep): void {
  container.innerHTML = `
    <div style="padding: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; gap: 14px;">
      <!-- 原地置换桶沙盘 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            <span>📦 数组物理槽位归位状态 (原地隐式哈希桶)</span>
          </div>
          <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px;">
            有效区间 [1, ${step.nums.length}]
          </span>
        </div>

        <div style="display: flex; gap: 10px; overflow-x: auto; padding: 10px 4px;">
          ${step.nums.map((val, idx) => {
            const isFit = step.inPlaceStatus[idx];
            const isCurrent = idx === step.currentIndex;
            const isSwapped = step.swappedPair && step.swappedPair.includes(idx);

            let bg = '#f8fafc';
            let border = '#cbd5e1';
            let textColor = '#0f172a';
            let badgeBg = '#e2e8f0';
            let badgeText = '#475569';
            let shadow = 'none';

            if (isSwapped) {
              bg = '#fffbeb';
              border = '#f59e0b';
              textColor = '#b45309';
              badgeBg = '#fef3c7';
              badgeText = '#92400e';
              shadow = '0 0 10px rgba(245, 158, 11, 0.4)';
            } else if (isFit) {
              bg = '#f0fdf4';
              border = '#22c55e';
              textColor = '#15803d';
              badgeBg = '#dcfce7';
              badgeText = '#166534';
              shadow = '0 0 8px rgba(34, 197, 94, 0.25)';
            } else if (isCurrent) {
              bg = '#eff6ff';
              border = '#3b82f6';
              textColor = '#1d4ed8';
              badgeBg = '#dbeafe';
              badgeText = '#1e40af';
              shadow = '0 0 8px rgba(59, 130, 246, 0.25)';
            }

            return `
              <div style="
                flex: 1;
                min-width: 68px;
                max-width: 110px;
                height: 76px;
                background: ${bg};
                border: 2px solid ${border};
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${shadow};
                transition: all 0.2s ease;
                position: relative;
              ">
                <div style="font-size: 18px; font-weight: 800; color: ${textColor}; font-family: monospace;">${val}</div>
                <div style="font-size: 10px; color: ${badgeText}; background: ${badgeBg}; padding: 1px 6px; border-radius: 4px; margin-top: 4px; font-weight: 600;">
                  槽 #${idx} (应 ${idx + 1})
                </div>
                ${isFit ? '<span style="position: absolute; top: 4px; right: 6px; font-size: 10px; color: #16a34a; font-weight: bold;">✓</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 11px; color: #64748b; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
          <span>📌 <strong>置换法则</strong>：只要 nums[i] ∈ [1, N] 且 nums[nums[i]-1] ≠ nums[i]，立即交换至目标槽位。</span>
          <span>当前已归位: <strong style="color: #16a34a;">${step.inPlaceStatus.filter(Boolean).length} / ${step.nums.length}</strong></span>
        </div>
      </div>
    </div>
  `;
}

export const firstMissingPositiveVisualizer = registerDeclarativeAlgorithm<MissingPositiveStep>({
  id: 'first-missing-positive',
  name: 'Hard 22: 缺失的第一个正数 (First Missing Positive)',
  category: 'array',
  icon: '🎯',
  badge: {
    mode: '原地置换哈希',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 原地哈希置换沙盘 (In-Place Hash)',
  card2Title: '🧭 鸽巢原理与状态空间监视器',
  card2Desc: '物理槽位归位情况、当前置换决策与数学公理验证',
  legend: [
    { label: '已完美归位 nums[i]=i+1', color: '#22c55e' },
    { label: '当前检查槽位 i', color: '#3b82f6' },
    { label: '正在置换对 (Swap)', color: '#f59e0b' },
    { label: '未归位槽位', color: '#64748b' },
  ],
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
  metrics: [
    { id: 'min-missing', label: '最小缺失正数', color: '#0d9488' },
    { id: 'cur-index', label: '当前检查槽位', color: '#2563eb' },
    { id: 'in-place-count', label: '已正确归位槽数', color: '#8b5cf6' },
    { id: 'array-scale', label: '数组物理规模', color: '#d97706' },
  ],
  auxiliaryVisual: {
    title: '🧭 鸽巢原理与状态空间监视器',
    desc: '当前置换决策与原地哈希公理验证',
    render: (container, step) => {
      const isDone = step.missingResult !== null;
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <span style="font-size: 11.5px; font-weight: 600; color: #475569;">当前置换决策:</span>
            <strong style="font-size: 12px; color: ${isDone ? '#16a34a' : '#2563eb'};">${step.decision}</strong>
          </div>
          ${renderFormulaCard(
            '原地哈希空间压缩公理',
            '对于长度为 N 的数组，最小缺失正数必在 [1, N+1] 之间。利用下标 x-1 作为数值 x 的唯一隐式归位槽！',
            '无需额外开辟哈希表，每个数字最多被置换一次进入正确位置，总时间严格 O(N)，额外空间严格 O(1)。',
            step.statusBadge
          )}
        </div>
      `;
    },
  },
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
