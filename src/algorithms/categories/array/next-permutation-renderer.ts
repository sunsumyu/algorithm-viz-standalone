/**
 * 下一个排列 (Next Permutation)
 * LeetCode 31 (Medium / 大厂高频字典序与数组双指针经典)
 * 核心原语:
 *  寻找按字典序排列的下一个更大的全排列。若已经是最大排列，则重排为升序最小排列。
 *  经典三步法则：
 *   1. 从后向前找第一个【相邻升序对】 (i, i+1)，满足 nums[i] < nums[i+1]。
 *      （说明 [i+1 .. n-1] 处于严格降序，已无更大排列可能）
 *   2. 若找到了这样的 i，在降序后缀 [i+1 .. n-1] 中从后向前找第一个【大于 nums[i]】的元素 j，交换 nums[i] 与 nums[j]。
 *   3. 将区间 [i+1 .. n-1] 原地反转，使其由降序变为升序，从而保证增幅最小！
 *  时间复杂度 O(N)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface NextPermutationStep extends StepBase {
  nums: number[];
  i: number;
  j: number;
  phase: 'init' | 'find-i' | 'find-j' | 'swap' | 'reverse' | 'finish';
  message: string;
  log: string;
  decision?: string;
  codeLine?: number | Record<string, number>;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  ans?: string;
  isAccepted?: boolean;
}

export const NEXT_PERMUTATION_CODES = {
  java: `public class Solution {
    public void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        // 1. 从后向前找第一个降序相邻对
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;
        }
        // 2. 在右侧降序区找到刚好大于 nums[i] 的元素交换
        if (i >= 0) {
            int j = nums.length - 1;
            while (j >= 0 && nums[j] <= nums[i]) {
                j--;
            }
            swap(nums, i, j);
        }
        // 3. 将 [i + 1 .. end] 原地反转为升序
        reverse(nums, i + 1, nums.length - 1);
    }
    private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    private void reverse(int[] a, int l, int r) {
        while (l < r) swap(a, l++, r--);
    }
}`,
  cpp: `class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int i = (int)nums.size() - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = (int)nums.size() - 1;
            while (j >= 0 && nums[j] <= nums[i]) j--;
            swap(nums[i], nums[j]);
        }
        reverse(nums.begin() + i + 1, nums.end());
    }
};`,
  python: `class Solution:
    def nextPermutation(self, nums: list[int]) -> None:
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            j = len(nums) - 1
            while j >= 0 and nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        nums[i + 1:] = reversed(nums[i + 1:])`,
};

export const NEXT_PERMUTATION_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 3, python: 3 },
  findI: { java: 5, cpp: 4, python: 4 },
  findJ: { java: 10, cpp: 7, python: 7 },
  swap: { java: 14, cpp: 9, python: 9 },
  reverse: { java: 17, cpp: 11, python: 10 },
  finish: { java: 20, cpp: 12, python: 11 },
};

function formatMetrics(
  i: number,
  j: number,
  phase: string,
  nums: number[]
): Record<string, string | number> {
  const iDesc = i >= 0 ? `${i} (值 ${nums[i]})` : '无 (全降序)';
  const jDesc = j >= 0 ? `${j} (值 ${nums[j]})` : '—';
  const statusDesc = phase === 'finish' ? '已收敛完成' : '变换中';
  return {
    '拐点下标 i': iDesc,
    '交换下标 j': jDesc,
    '当前推演阶段': phase,
    '重排状态': statusDesc,
  };
}

export function buildNextPermutationSteps(nums: number[] = [1, 2, 7, 4, 3, 1]): NextPermutationStep[] {
  const steps: NextPermutationStep[] = [];
  const arr = [...nums];
  const n = arr.length;

  // Step 0: Init
  steps.push({
    nums: [...arr],
    i: -1,
    j: -1,
    phase: 'init',
    message: `算法启动：原排列 [${arr.join(', ')}]。准备寻找下一个更大字典序排列。`,
    decision: `原排列 [${arr.join(', ')}]，准备自右向左寻找首个升序拐点。`,
    log: `初始化排列: [${arr.join(', ')}]`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.init,
    metrics: formatMetrics(-1, -1, 'init', arr),
    statusBadge: { text: '初始化', type: 'info' },
  });

  let i = n - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) {
    i--;
  }

  const findIMsg =
    i >= 0
      ? `步骤 1：从后向前找到第一个相邻升序对，在索引 i = ${i} 处：arr[${i}] = ${arr[i]} < arr[${i + 1}] = ${arr[i + 1]}。`
      : `步骤 1：全数组严格降序，当前已是最大字典序，i = -1！无需交换，直接反转全数组回到最小升序排列。`;

  steps.push({
    nums: [...arr],
    i,
    j: -1,
    phase: 'find-i',
    message: findIMsg,
    decision: i >= 0 ? `锁定升序拐点 i = ${i} (值 ${arr[i]})，降序后缀为 [${i + 1} .. ${n - 1}]` : `无升序对 (i = -1)，即将全数组原地翻转回初始升序`,
    log: `定位拐点 i=${i}`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.findI,
    metrics: formatMetrics(i, -1, 'find-i', arr),
    statusBadge: { text: i >= 0 ? `拐点 i=${i}` : '全降序', type: i >= 0 ? 'info' : 'warning' },
  });

  if (i >= 0) {
    let j = n - 1;
    while (j >= 0 && arr[j] <= arr[i]) {
      j--;
    }

    steps.push({
      nums: [...arr],
      i,
      j,
      phase: 'find-j',
      message: `步骤 2：在 [${i + 1} .. ${n - 1}] 中从后向前寻找第一个 > arr[${i}] (${arr[i]}) 的数：找到 j = ${j} (arr[${j}] = ${arr[j]})。`,
      decision: `在降序后缀中从右向左寻得刚好大于 arr[${i}] 的元素：arr[${j}] = ${arr[j]}`,
      log: `定位交换项 j=${j}`,
      codeLine: NEXT_PERMUTATION_CODE_LINES.findJ,
      metrics: formatMetrics(i, j, 'find-j', arr),
      statusBadge: { text: `交换项 j=${j}`, type: 'info' },
    });

    // 交换
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;

    steps.push({
      nums: [...arr],
      i,
      j,
      phase: 'swap',
      message: `执行交换：swap(arr[${i}], arr[${j}])。数组变为 [${arr.join(', ')}]。`,
      decision: `完成 arr[${i}] 与 arr[${j}] 交换，当前排列为 [${arr.join(', ')}]`,
      log: `交换元素 arr[${i}] 与 arr[${j}]`,
      codeLine: NEXT_PERMUTATION_CODE_LINES.swap,
      metrics: formatMetrics(i, j, 'swap', arr),
      statusBadge: { text: '完成交换', type: 'warning' },
    });
  }

  // 反转
  let l = i + 1;
  let r = n - 1;
  while (l < r) {
    const t = arr[l];
    arr[l] = arr[r];
    arr[r] = t;
    l++;
    r--;
  }

  steps.push({
    nums: [...arr],
    i,
    j: -1,
    phase: 'reverse',
    message: `步骤 3：反转后缀区间 [${i + 1} .. ${n - 1}]，使其由降序变为升序，保证增幅最小。`,
    decision: `原地反转降序后缀 [${i + 1} .. ${n - 1}]，使增量达到最小步长`,
    log: `反转后缀区间 [${i + 1} .. ${n - 1}]`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.reverse,
    metrics: formatMetrics(i, -1, 'reverse', arr),
    statusBadge: { text: '后缀翻转', type: 'info' },
  });

  // Finish
  const finalAns = `[${arr.join(', ')}]`;
  steps.push({
    nums: [...arr],
    i: -1,
    j: -1,
    phase: 'finish',
    message: `算法完成！下一个字典序排列为 ${finalAns}。`,
    decision: `🎉 字典序下一个排列构造完成：${finalAns}`,
    log: `算法收敛，得到下一个排列: ${finalAns}`,
    codeLine: NEXT_PERMUTATION_CODE_LINES.finish,
    metrics: formatMetrics(-1, -1, 'finish', arr),
    statusBadge: { text: '求解成功', type: 'success' },
    ans: finalAns,
    isAccepted: true,
  });

  return steps;
}

function renderNextPermutationCanvas(step: NextPermutationStep): string {
  const { nums, i, j, phase } = step;

  const cards = nums
    .map((val, idx) => {
      const isI = idx === i && phase !== 'finish';
      const isJ = idx === j && phase !== 'finish';
      const inSuffix = i >= 0 && idx > i && phase !== 'finish';

      let bg = '#ffffff';
      let border = '2px solid #cbd5e1';
      let color = '#1e293b';
      let shadow = '0 1px 3px rgba(0,0,0,0.05)';

      if (isI) {
        bg = '#fef3c7';
        border = '2px solid #f59e0b';
        color = '#b45309';
        shadow = '0 4px 12px rgba(245, 158, 11, 0.25)';
      } else if (isJ) {
        bg = '#fce7f3';
        border = '2px solid #ec4899';
        color = '#be185d';
        shadow = '0 4px 12px rgba(236, 72, 153, 0.25)';
      } else if (inSuffix) {
        bg = '#f0f9ff';
        border = '2px dashed #38bdf8';
        color = '#0369a1';
      }

      let tag = '&nbsp;';
      if (isI) tag = '<span style="color:#b45309;font-weight:700;font-size:11px;">拐点 i</span>';
      else if (isJ) tag = '<span style="color:#be185d;font-weight:700;font-size:11px;">目标 j</span>';
      else if (inSuffix) tag = '<span style="color:#0284c7;font-size:10px;font-weight:600;">降序后缀</span>';

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 56px; margin: 0 6px;">
        <div style="font-size: 11px; height: 18px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">${tag}</div>
        <div style="
          width: 100%;
          height: 56px;
          background: ${bg};
          border: ${border};
          border-radius: 12px;
          box-shadow: ${shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 800;
          font-size: 22px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 600;">[ ${idx} ]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
          <div style="font-size: 13px; color: #334155; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>🔢 全排列序列与字典序三步定位</span>
          </div>
          <div style="display: flex; gap: 14px; font-size: 11px; font-weight: 600;">
            <span style="color: #b45309; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> 降序拐点 i</span>
            <span style="color: #be185d; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span> 交换项 j</span>
            <span style="color: #0284c7; display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span> 待反转降序后缀</span>
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 100px;">
          ${cards}
        </div>
      </div>
    </div>
  `;
}

function renderNextPermutationAuxiliary(container: HTMLElement, step: NextPermutationStep): void {
  const { i, j, phase, nums } = step;
  const isFinish = phase === 'finish';

  let ruleState = '';
  if (phase === 'init') {
    ruleState = '准备从右向左扫描相邻元素，寻找首个满足 nums[i] < nums[i+1] 的升序突变点。';
  } else if (phase === 'find-i') {
    ruleState = i >= 0
      ? `已锁定拐点 i = ${i}（值为 ${nums[i]}），其右侧 [${i + 1} .. ${nums.length - 1}] 严格单调递减。`
      : '全数组严格降序排列（已是最大字典序），无需交换，直接反转全数组即可获得最小升序排列。';
  } else if (phase === 'find-j') {
    ruleState = `在降序后缀中从右向左找到首个大于 nums[${i}] (${nums[i]}) 的数：j = ${j} (值为 ${nums[j]})。`;
  } else if (phase === 'swap') {
    ruleState = `已交换 nums[${i}] 与 nums[${j}]。此时后缀区间仍保持严格降序！`;
  } else if (phase === 'reverse') {
    ruleState = `将降序后缀 [${i + 1} .. ${nums.length - 1}] 原地翻转为升序，使得字典序增幅达到最小。`;
  } else if (isFinish) {
    ruleState = `✅ 构造完成！当前排列 [${nums.join(', ')}] 是严格意义上的下一个最小更大字典序。`;
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: #1e293b;">💡 字典序三步法则与当前决策</span>
          <span style="font-size: 10px; font-weight: 700; color: ${isFinish ? '#059669' : '#0284c7'}; background: ${isFinish ? '#ecfdf5' : '#f0f9ff'}; padding: 2px 8px; border-radius: 999px; border: 1px solid ${isFinish ? '#a7f3d0' : '#bae6fd'};">
            ${isFinish ? '已就绪' : `阶段: ${phase}`}
          </span>
        </div>
        <div style="font-size: 12px; color: #334155; line-height: 1.6; font-weight: 500;">
          ${ruleState}
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #64748b; line-height: 1.6;">
        <span style="font-weight: 700; color: #475569;">📌 核心公理：</span>
        降序后缀已无增大可能。交换最小更大元素后，反转后缀使其由降序变升序，即保证在比原排列大的前提下字典序最小。
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm<NextPermutationStep>({
  id: 'next-permutation',
  name: '下一个排列',
  category: 'array',
  difficulty: 2,
  learningGoal: 'LeetCode 31: 求解下一个更大字典序排列。基于从后向前的三步双指针反转法，在 O(N) 时间和 O(1) 原地空间内达成极值。',
  codeLanguages: NEXT_PERMUTATION_CODES,
  metrics: [
    { id: '拐点下标 i', label: '拐点下标 i', color: '#f59e0b' },
    { id: '交换下标 j', label: '交换下标 j', color: '#ec4899' },
    { id: '当前推演阶段', label: '当前推演阶段', color: '#0ea5e9' },
    { id: '重排状态', label: '重排状态', color: '#10b981' },
  ],
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [1, 2, 7, 4, 3, 1];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 7, 4, 3, 1];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildNextPermutationSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: NextPermutationStep) => {
    container.innerHTML = renderNextPermutationCanvas(step);
  },
  auxiliaryVisual: {
    title: '字典序三步准则与状态空间',
    render: (container: HTMLElement, step: NextPermutationStep) => {
      renderNextPermutationAuxiliary(container, step);
    },
  },
  inputs: [
    {
      id: 'nums',
      label: '输入整数排列',
      type: 'text',
      defaultValue: '1, 2, 7, 4, 3, 1',
      placeholder: '逗号分隔序列',
    },
  ],
});
