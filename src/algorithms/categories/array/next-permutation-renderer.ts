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
  codeLine: number;
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
    log: `初始化排列: [${arr.join(', ')}]`,
    codeLine: 4,
  });

  let i = n - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) {
    i--;
  }

  steps.push({
    nums: [...arr],
    i,
    j: -1,
    phase: 'find-i',
    message:
      i >= 0
        ? `步骤 1：从后向前找到第一个相邻升序对，在索引 i = ${i} 处：arr[${i}] = ${arr[i]} < arr[${i + 1}] = ${arr[i + 1]}。`
        : `步骤 1：全数组严格降序，当前已是最大字典序，i = -1！无需交换，直接反转全数组回到最小升序排列。`,
    log: `定位拐点 i=${i}`,
    codeLine: 6,
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
      log: `定位交换项 j=${j}`,
      codeLine: 12,
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
      log: `交换元素 arr[${i}] 与 arr[${j}]`,
      codeLine: 15,
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
    log: `反转后缀区间 [${i + 1} .. ${n - 1}]`,
    codeLine: 18,
  });

  // Finish
  steps.push({
    nums: [...arr],
    i: -1,
    j: -1,
    phase: 'finish',
    message: `算法完成！下一个字典序排列为 [${arr.join(', ')}]。`,
    log: `算法收敛，得到下一个排列: [${arr.join(', ')}]`,
    codeLine: 20,
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

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isI) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isJ) {
        bg = 'rgba(236, 72, 153, 0.35)';
        border = '2px solid #ec4899';
        color = '#f472b6';
      } else if (inSuffix) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      let tag = '';
      if (isI) tag = '<span style="color:#fbbf24;font-weight:700;">i</span>';
      else if (isJ) tag = '<span style="color:#f472b6;font-weight:700;">j</span>';
      else if (inSuffix) tag = '<span style="color:#38bdf8;font-size:10px;">后缀</span>';

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${tag}</div>
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 18px;
          transition: all 0.2s;
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">全排列序列与字典序三步定位</div>
          <div style="display: flex; gap: 10px; font-size: 11px;">
            <span style="color: #fbbf24;">● 降序拐点 i</span>
            <span style="color: #f472b6;">● 交换项 j</span>
            <span style="color: #38bdf8;">● 待反转降序后缀</span>
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 75px;">
          ${cards}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">拐点下标 i</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${i >= 0 ? `${i} (值 ${nums[i]})` : '无 (全降序)'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">交换下标 j</div>
          <div style="font-size: 16px; font-weight: 700; color: #f472b6;">${j >= 0 ? `${j} (值 ${nums[j]})` : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前推演阶段</div>
          <div style="font-size: 15px; font-weight: 700; color: #38bdf8;">${phase}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">重排状态</div>
          <div style="font-size: 15px; font-weight: 700; color: #34d399;">${phase === 'finish' ? '已收敛完成' : '变换中'}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'next-permutation',
  name: '下一个排列',
  category: 'array',
  difficulty: 2,
  learningGoal: 'LeetCode 31: 求解下一个更大字典序排列。基于从后向前的三步双指针反转法，在 O(N) 时间和 O(1) 原地空间内达成极值。',
  codeLanguages: NEXT_PERMUTATION_CODES,
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
