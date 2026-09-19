/**
 * 除自身以外数组的乘积 (Product of Array Except Self)
 * LeetCode 238 (Medium / 高频算法面试基石题)
 * 核心机制:
 *  题目要求：不能使用除法，且必须在 O(N) 时间和 O(1) 额外空间复杂度内完成
 *  解法：
 *   1. 第一遍扫描（从左向右）：计算前缀积，直接保存在结果数组 res 中 (res[i] = res[i-1] * nums[i-1])
 *   2. 第二遍扫描（从右向左）：用一个常数变量 R 维护后缀积，res[i] *= R，随后 R *= nums[i]
 *  利用返回数组存储中间状态，达到真正的 O(1) 额外辅助空间！
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ProductStep extends StepBase {
  nums: number[];
  res: number[];
  currentIndex: number;
  rightProduct: number;
  phase: 'init' | 'prefix_pass' | 'suffix_pass' | 'finish';
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  metrics?: Record<string, string | number>;
  decision?: string;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' };
  ans?: string;
  isAccepted?: boolean;
}

export const PRODUCT_EXCEPT_SELF_CODES = {
  java: `public class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];

        // 1. 从左向右计算前缀积：res[i] 表示 i 左侧所有元素的乘积
        res[0] = 1;
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }

        // 2. 从右向左计算后缀积：用常数 R 动态累乘
        int R = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] = res[i] * R;
            R *= nums[i];
        }

        return res;
    }
}`,
  cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 1);
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }
        int R = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] = res[i] * R;
            R *= nums[i];
        }
        return res;
    }
};`,
  python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        res = [1] * n
        for i in range(1, n):
            res[i] = res[i - 1] * nums[i - 1]
        R = 1
        for i in range(n - 1, -1, -1):
            res[i] = res[i] * R
            R *= nums[i]
        return res`,
};

export const PRODUCT_EXCEPT_SELF_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 4, python: 3 },
  prefixPass: { java: 8, cpp: 7, python: 5 },
  suffixPass: { java: 13, cpp: 12, python: 8 },
  finish: { java: 17, cpp: 15, python: 10 },
};

function formatProductMetrics(i: number, R: number, phase: string, n: number): Record<string, string | number> {
  let phaseText = '初始化';
  if (phase === 'prefix_pass') phaseText = '正向扫描 (前缀积)';
  else if (phase === 'suffix_pass') phaseText = '逆向扫描 (后缀积)';
  else if (phase === 'finish') phaseText = '求解完成';

  return {
    '当前扫描索引 i': i >= 0 ? `下标 [ ${i} ]` : '扫描完毕',
    '右侧累乘积 R': `R = ${R}`,
    '当前推演阶段': phaseText,
    '数组物理规模 N': `N = ${n}`,
  };
}

export function buildProductSteps(nums: number[] = [1, 2, 3, 4]): ProductStep[] {
  const steps: ProductStep[] = [];
  const n = nums.length;
  const res = new Array(n).fill(1);

  // Step 0: Init
  steps.push({
    nums: [...nums],
    res: [...res],
    currentIndex: 0,
    rightProduct: 1,
    phase: 'init',
    message: `算法启动：输入数组 nums = [${nums.join(', ')}]，初始化结果数组 res 均为 1。准备开始两遍扫描。`,
    decision: `初始化完成：准备第一遍正向扫描，将 i 左侧所有数的乘积就地填入 res[i]`,
    log: `初始化双向扫描: 数组长度 N = ${n}`,
    codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.init,
    metrics: formatProductMetrics(0, 1, 'init', n),
    statusBadge: { text: '初始化', type: 'info' },
  });

  // Pass 1: Prefix
  res[0] = 1;
  for (let i = 1; i < n; i++) {
    res[i] = res[i - 1] * nums[i - 1];
    steps.push({
      nums: [...nums],
      res: [...res],
      currentIndex: i,
      rightProduct: 1,
      phase: 'prefix_pass',
      message: `前缀积推进 [i = ${i}]：res[${i}] = res[${i - 1}] * nums[${i - 1}] = ${res[i]}（即下标 ${i} 左侧所有元素的乘积）。`,
      decision: `前缀扫描：res[${i}] = res[${i - 1}](${res[i - 1]}) × nums[${i - 1}](${nums[i - 1]}) = ${res[i]}`,
      log: `前缀扫描 i=${i}: res[${i}] = ${res[i]}`,
      codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.prefixPass,
      metrics: formatProductMetrics(i, 1, 'prefix_pass', n),
      statusBadge: { text: `正向前缀积 i=${i}`, type: 'info' },
    });
  }

  // Pass 2: Suffix
  let R = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] = res[i] * R;
    steps.push({
      nums: [...nums],
      res: [...res],
      currentIndex: i,
      rightProduct: R,
      phase: 'suffix_pass',
      message: `后缀积逆向合成 [i = ${i}]：当前右侧累计积 R = ${R}。res[${i}] = (左侧积 ${res[i] / R}) * (右侧积 ${R}) = ${res[i]}。`,
      decision: `后缀合成：res[${i}] 原有左积(${res[i] / R}) × 右累乘积 R(${R}) = ${res[i]}，随后 R 累乘 nums[${i}](${nums[i]})`,
      log: `后缀合成 i=${i}: res[${i}] = ${res[i]}, 随后 R *= nums[${i}]`,
      codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.suffixPass,
      metrics: formatProductMetrics(i, R, 'suffix_pass', n),
      statusBadge: { text: `逆向后缀积 i=${i}`, type: 'warning' },
    });
    R *= nums[i];
  }

  // Finish
  const finalAns = `[ ${res.join(', ')} ]`;
  steps.push({
    nums: [...nums],
    res: [...res],
    currentIndex: -1,
    rightProduct: R,
    phase: 'finish',
    message: `🎉 运算完毕！在不使用除法且仅用 O(1) 辅助空间下，求得最终乘积数组：${finalAns}。`,
    decision: `双向扫描完全收敛！求得除自身以外乘积结果：${finalAns}`,
    log: `计算结束: 结果=[${res.join(', ')}]`,
    codeLine: PRODUCT_EXCEPT_SELF_CODE_LINES.finish,
    metrics: formatProductMetrics(-1, R, 'finish', n),
    statusBadge: { text: '求解成功', type: 'success' },
    ans: finalAns,
    isAccepted: true,
  });

  return steps;
}

export function renderProductCanvas(container: HTMLElement, step: ProductStep) {
  const isFinish = step.phase === 'finish';
  const isSuffix = step.phase === 'suffix_pass';

  const cardsHtml = step.nums
    .map((v, i) => {
      const isCur = step.currentIndex === i && !isFinish;
      let border = 'border: 1.5px solid #cbd5e1;';
      let bg = '#ffffff';
      let shadow = 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
      let indicator = '&nbsp;';

      if (isCur) {
        border = isSuffix ? 'border: 2px solid #f59e0b;' : 'border: 2px solid #0ea5e9;';
        bg = isSuffix ? '#fef3c7;' : '#e0f2fe;';
        shadow = isSuffix ? 'box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);' : 'box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);';
        indicator = isSuffix
          ? '<span style="color: #b45309; font-weight: 700; font-size: 11px;">后缀合成 ➔</span>'
          : '<span style="color: #0369a1; font-weight: 700; font-size: 11px;">前缀扫描 ➔</span>';
      }

      return `
      <div style="
        padding: 12px 16px;
        border-radius: 12px;
        ${border}
        background: ${bg};
        ${shadow}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${indicator}</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">nums[ ${i} ]</div>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 4px 0;">${v}</div>
        <div style="
          font-size: 12px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #a7f3d0;
          margin-top: 6px;
        ">res: ${step.res[i]}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 700; color: #1e293b;">🔄 双向扫描状态沙盘 (Prefix & Suffix Product)</span>
            <span style="padding: 2px 8px; font-size: 11px; border-radius: 6px; background: #eff6ff; color: #1d4ed8; font-weight: 700; border: 1px solid #bfdbfe;">
              ${step.phase === 'prefix_pass' ? '正向前缀积阶段' : step.phase === 'suffix_pass' ? '逆向后缀积阶段' : step.phase === 'finish' ? '计算完成' : '准备扫描'}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
            <span style="color: #b45309; font-weight: 700; background: #fef3c7; padding: 2px 8px; border-radius: 6px; border: 1px solid #fde68a;">
              当前右侧累计积 R: ${step.rightProduct}
            </span>
          </div>
        </div>

        <!-- 数组元素卡片列表 -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; align-items: center; min-height: 120px;">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderProductAuxiliary(container: HTMLElement, step: ProductStep) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #bfdbfe; background: #eff6ff;">
          <div style="font-size: 12px; font-weight: 700; color: #1d4ed8;">1. 左侧前缀积一趟存</div>
          <div style="font-size: 11px; color: #3b82f6; margin-top: 4px; line-height: 1.5;">res[i] 暂时存放 i 左侧所有数的乘积，无需额外数组，就地复用输出缓存。</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #fde68a; background: #fefce8;">
          <div style="font-size: 12px; font-weight: 700; color: #b45309;">2. 右侧后缀积常数乘</div>
          <div style="font-size: 11px; color: #d97706; margin-top: 4px; line-height: 1.5;">倒序遍历时用单变量 R 累乘右边元素，res[i] *= R 瞬间完成左右乘积合成。</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #a7f3d0; background: #ecfdf5;">
          <div style="font-size: 12px; font-weight: 700; color: #047857;">3. 零除法与 O(1) 空间</div>
          <div style="font-size: 11px; color: #059669; margin-top: 4px; line-height: 1.5;">完美规避除零异常（含 0 数组天然兼容），达到工业级安全与极致时空性能。</div>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #475569; line-height: 1.6;">
        <span style="font-weight: 700; color: #1e293b;">💡 实时推演：</span>
        ${step.decision || step.message}
      </div>
    </div>
  `;
}

export const productExceptSelf238Visualizer = registerDeclarativeAlgorithm<ProductStep>({
  id: 'product-except-self-238',
  name: '除自身以外数组的乘积 (LeetCode 238)',
  category: 'array',
  icon: '✖️',
  difficulty: 2,
  levelOrder: 238,
  learningGoal: '掌握前缀积与后缀积双向扫描拆解数组乘积的核心思想，体会利用返回结果复用空间的 O(1) 优化技巧',
  codeLanguages: PRODUCT_EXCEPT_SELF_CODES,
  metrics: [
    { id: '当前扫描索引 i', label: '当前扫描索引 i', color: '#0ea5e9' },
    { id: '右侧累乘积 R', label: '右侧累乘积 R', color: '#f59e0b' },
    { id: '当前推演阶段', label: '当前推演阶段', color: '#6366f1' },
    { id: '数组物理规模 N', label: '数组物理规模 N', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'case',
      label: '输入数组',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[1, 2, 3, 4] (经典用例)', value: 'case1' },
        { label: '[-1, 1, 0, -3, 3] (包含 0 的边界用例)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [-1, 1, 0, -3, 3] : [1, 2, 3, 4];
    return buildProductSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderProductCanvas(container, step);
  },
  auxiliaryVisual: {
    title: '算法核心公理与三步准则',
    render: (container, step) => {
      renderProductAuxiliary(container, step);
    },
  },
});
