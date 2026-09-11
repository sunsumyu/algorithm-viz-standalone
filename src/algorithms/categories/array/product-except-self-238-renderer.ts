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
  codeLine: number;
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
    log: `初始化双向扫描: 数组长度 N = ${n}`,
    codeLine: 4,
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
      log: `前缀扫描 i=${i}: res[${i}] = ${res[i]}`,
      codeLine: 9,
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
      log: `后缀合成 i=${i}: res[${i}] = ${res[i]}, 随后 R *= nums[${i}]`,
      codeLine: 16,
    });
    R *= nums[i];
  }

  // Finish
  steps.push({
    nums: [...nums],
    res: [...res],
    currentIndex: -1,
    rightProduct: R,
    phase: 'finish',
    message: `🎉 运算完毕！在不使用除法且仅用 O(1) 辅助空间下，求得最终乘积数组：[ ${res.join(' , ')} ]。`,
    log: `计算结束: 结果=[${res.join(', ')}]`,
    codeLine: 21,
  });

  return steps;
}

export function renderProductCanvas(container: HTMLElement, step: ProductStep) {
  const cardsHtml = step.nums
    .map((v, i) => {
      const isCur = step.currentIndex === i;
      const border = isCur
        ? 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.3); box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);'
        : 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';

      return `
      <div style="
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 70px;
        transition: all 0.2s;
      ">
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">nums[${i}]</div>
        <div style="font-size: 18px; font-weight: bold; color: #f8fafc; margin: 2px 0;">${v}</div>
        <div style="font-size: 10px; color: #34d399; font-family: monospace; margin-top: 4px;">res: ${step.res[i]}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">除自身外数组乘积双向扫描沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #fbbf24;">当前右侧累计积 R: ${step.rightProduct}</span>
        </div>
      </div>

      <!-- 数组元素卡片 -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${cardsHtml}
      </div>

      <!-- 算法精髓卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 左侧前缀积一趟存</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">res[i] 暂时存放 i 左侧所有数的乘积，无需额外数组，就地复用输出缓存。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. 右侧后缀积常数乘</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">倒序遍历时用单变量 R 累乘右边元素，res[i] *= R 瞬间完成左右乘积合成。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 零除法与 O(1) 空间</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">完美规避除零异常（含 0 数组天然兼容），达到工业级安全与极致时空性能。</div>
        </div>
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
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 238)</h3>
      <p>给你一个整数数组 <code>nums</code>，返回数组 <code>answer</code> ，其中 <code>answer[i]</code> 等于 <code>nums</code> 中除 <code>nums[i]</code> 之外其余各元素的乘积：</p>
      <ul>
        <li><strong>限制条件</strong>：不要使用除法，且在 $O(N)$ 时间复杂度内完成。进阶要求使用 $O(1)$ 的额外空间复杂度（返回值不计入额外空间）。</li>
        <li><strong>解题思路</strong>：
          <br/>任何一个数除自身以外的乘积，都可以拆解为：<strong>（其左侧所有数的乘积）$\times$（其右侧所有数的乘积）</strong>。
          <br/>第一遍扫描自左向右将左侧积填入 <code>res</code>；第二遍扫描自右向左用单变量 <code>R</code> 累乘右侧积并就地更新 <code>res[i] *= R</code>。</li>
      </ul>
    </div>
  `,
  codeLanguages: PRODUCT_EXCEPT_SELF_CODES,
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
});
