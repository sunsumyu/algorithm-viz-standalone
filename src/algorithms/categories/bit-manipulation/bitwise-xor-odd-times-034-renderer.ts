/**
 * Class 034: 异或运算的奇妙用法与奇数次提取 (Bitwise XOR Odd Occurrences)
 * 左程云算法通关课入门篇 Class 034 / LeetCode 136 & 260
 * 核心原语：异或无进位相加性质 (x^x=0, x^0=x) + 提取最右侧的 1 (eor & -eor) 划分独立空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface XorStep extends StepBase {
  stepIndex?: number;
  mode: 'single' | 'double';
  nums: number[];
  currentIndex: number;
  eorAll: number;
  rightOne?: number;
  groupA?: number[]; // 第 k 位为 1 的元素
  groupB?: number[]; // 第 k 位为 0 的元素
  resultA?: number;
  resultB?: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BITWISE_XOR_CODES = {
  java: `public class BitwiseXorPractice {
    // 1. 只有一种数出现奇数次，其余出现偶数次 (LeetCode 136)
    public static int printOddTimesNum1(int[] arr) {
        int eor = 0;
        for (int num : arr) {
            eor ^= num; // 成对偶数异或自动抵消为 0
        }
        return eor;
    }

    // 2. 有两种数 (a 和 b) 出现奇数次，其余出现偶数次 (LeetCode 260)
    public static int[] printOddTimesNum2(int[] arr) {
        int eor = 0;
        for (int num : arr) eor ^= num; // eor = a ^ b
        // 提取最右侧的 1
        int rightOne = eor & (-eor);
        int onlyOne = 0;
        for (int num : arr) {
            if ((num & rightOne) != 0) {
                onlyOne ^= num; // 仅与该位为 1 的数异或，最终得到 a 或 b
            }
        }
        return new int[]{onlyOne, eor ^ onlyOne};
    }
}`,
  cpp: `class Solution {
public:
    // 1. 单个奇数次
    int singleNumber(vector<int>& nums) {
        int eor = 0;
        for (int x : nums) eor ^= x;
        return eor;
    }
    // 2. 两个奇数次
    vector<int> singleNumber2(vector<int>& nums) {
        int eor = 0;
        for (int x : nums) eor ^= x;
        int rightOne = eor & (-eor);
        int a = 0;
        for (int x : nums) {
            if (x & rightOne) a ^= x;
        }
        return {a, eor ^ a};
    }
};`,
  python: `class Solution:
    def single_number_1(self, nums: list[int]) -> int:
        eor = 0
        for x in nums:
            eor ^= x
        return eor

    def single_number_2(self, nums: list[int]) -> list[int]:
        eor = 0
        for x in nums:
            eor ^= x
        right_one = eor & (-eor)
        only_one = 0
        for x in nums:
            if x & right_one:
                only_one ^= x
        return [only_one, eor ^ only_one]`,
  typescript: `function singleNumber1(nums: number[]): number {
    let eor = 0;
    for (const x of nums) eor ^= x;
    return eor;
}

function singleNumber2(nums: number[]): number[] {
    let eor = 0;
    for (const x of nums) eor ^= x;
    const rightOne = eor & (-eor);
    let onlyOne = 0;
    for (const x of nums) {
        if ((x & rightOne) !== 0) onlyOne ^= x;
    }
    return [onlyOne, eor ^ onlyOne];
}`
};

export function generateXorSteps(mode: 'single' | 'double' = 'double'): XorStep[] {
  const steps: XorStep[] = [];
  const nums = mode === 'single'
    ? [4, 1, 2, 1, 2] // 4 出现 1 次，其余出现 2 次
    : [3, 5, 2, 3, 2, 7]; // 5 与 7 出现 1 次，其余出现 2 次

  const lines = {
    singleEntry: 3,
    singleLoop: 5,
    singleReturn: 8,
    doubleEntry: 12,
    doubleLoop1: 14,
    doubleRightOne: 16,
    doubleLoop2: 19,
    doubleReturn: 23,
  };

  if (mode === 'single') {
    // Step 0: 单奇数入口
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: 0,
      decision: '启动异或求奇数次：输入序列含有 1 种奇数次数字',
      message: '异或核心性质：自反性 A^A=0 与恒等律 A^0=A。所有成对偶数次自动抵消为 0',
      log: `Init single odd: [${nums.join(', ')}]`,
      codeLine: lines.singleEntry,
      statusBadge: { text: '算法启动', type: 'info' },
    });

    let eor = 0;
    for (let i = 0; i < nums.length; i++) {
      const prev = eor;
      eor ^= nums[i];
      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        decision: `遍历到元素 [${i}] = ${nums[i]} ➔ eor = ${prev} ^ ${nums[i]} = ${eor}`,
        message: `当前累积异或和更新为 ${eor}`,
        log: `eor ^= ${nums[i]} -> ${eor}`,
        codeLine: lines.singleLoop,
        statusBadge: { text: `异或 ${nums[i]}`, type: 'info' },
      });
    }

    steps.push({
      mode,
      nums,
      currentIndex: nums.length - 1,
      eorAll: eor,
      resultA: eor,
      decision: `🎉 扫描完毕！唯一出现奇数次的数字是：${eor}`,
      message: '成对偶数次已被完全抵消，剩余值即为奇数次目标',
      log: `Single odd result = ${eor}`,
      codeLine: lines.singleReturn,
      statusBadge: { text: `答案: ${eor}`, type: 'success' },
    });
  } else {
    // 双奇数次
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: 0,
      decision: '启动双奇数次提取：输入序列含有 2 种奇数次数字 (a 与 b)',
      message: '第一阶段：全量异或得到 eor = a ^ b。由于 a != b，eor 必有至少某一位为 1！',
      log: `Init double odd: [${nums.join(', ')}]`,
      codeLine: lines.doubleEntry,
      statusBadge: { text: '算法启动', type: 'info' },
    });

    let eor = 0;
    for (let i = 0; i < nums.length; i++) {
      const prev = eor;
      eor ^= nums[i];
      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        decision: `第一轮异或 [${i}] = ${nums[i]} ➔ eor 变为 ${eor}`,
        message: `全量异或推进中，成对数字已在二进制层级自消`,
        log: `Phase 1: eor ^= ${nums[i]} -> ${eor}`,
        codeLine: lines.doubleLoop1,
        statusBadge: { text: `累加异或: ${eor}`, type: 'info' },
      });
    }

    // 提取最右侧的 1
    const rightOne = eor & (-eor);
    steps.push({
      mode,
      nums,
      currentIndex: -1,
      eorAll: eor,
      rightOne,
      decision: `关键分水岭：提取 eor (${eor}) 最右侧为 1 的位 ➔ rightOne = ${rightOne} (二进制: ${rightOne.toString(2)})`,
      message: `公式 rightOne = eor & (-eor)。在这一 bit 位上，两目标数必定一个为 1，另一个为 0！`,
      log: `rightOne extracted: ${rightOne}`,
      codeLine: lines.doubleRightOne,
      statusBadge: { text: `最右 1: ${rightOne}`, type: 'warning' },
    });

    // 分组异或
    let onlyOne = 0;
    const groupA: number[] = [];
    const groupB: number[] = [];

    for (let i = 0; i < nums.length; i++) {
      const val = nums[i];
      const hasBit = (val & rightOne) !== 0;
      if (hasBit) {
        groupA.push(val);
        onlyOne ^= val;
      } else {
        groupB.push(val);
      }

      steps.push({
        mode,
        nums,
        currentIndex: i,
        eorAll: eor,
        rightOne,
        groupA: [...groupA],
        groupB: [...groupB],
        resultA: onlyOne,
        decision: `考察 [${i}] = ${val}：该 bit 位为 ${hasBit ? '1 (加入组 A 异或池)' : '0 (划分至组 B)'}`,
        message: hasBit ? `组 A 累积异或 onlyOne 更新为 ${onlyOne}` : '组 B 数字被自然隔离，互不干扰',
        log: `Phase 2: num=${val}, bit=${hasBit ? 1 : 0}, onlyOne=${onlyOne}`,
        codeLine: lines.doubleLoop2,
        statusBadge: { text: hasBit ? '组 A 吸收' : '划分组 B', type: hasBit ? 'success' : 'info' },
      });
    }

    const otherOne = eor ^ onlyOne;
    steps.push({
      mode,
      nums,
      currentIndex: nums.length - 1,
      eorAll: eor,
      rightOne,
      groupA,
      groupB,
      resultA: onlyOne,
      resultB: otherOne,
      decision: `🎉 成功解出两奇数次数字！分别是：${onlyOne} 与 ${otherOne}`,
      message: `第二个数由 eor ^ onlyOne = ${eor} ^ ${onlyOne} = ${otherOne} 瞬间反解`,
      log: `Final results: a=${onlyOne}, b=${otherOne}`,
      codeLine: lines.doubleReturn,
      statusBadge: { text: `解出 [${onlyOne}, ${otherOne}]`, type: 'success' },
    });
  }

  return steps;
}

export function renderXorCanvas(container: HTMLElement, step: XorStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">全序列累积异或和 (EOR)</div>
          <div style="font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.eorAll} <span style="font-size: 12px; font-family: monospace; color: #94a3b8;">(0b${step.eorAll.toString(2)})</span>
          </div>
        </div>

        ${
          step.mode === 'double' && step.rightOne !== undefined
            ? `
            <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
              <div style="font-size: 11px; color: #94a3b8;">最右侧 1 划分掩码 (RightOne)</div>
              <div style="font-size: 20px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
                ${step.rightOne} <span style="font-size: 12px; font-family: monospace; color: #94a3b8;">(0b${step.rightOne.toString(2)})</span>
              </div>
            </div>
          `
            : ''
        }

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">求解结果</div>
          <div style="font-size: 22px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${
              step.mode === 'single'
                ? step.resultA !== undefined ? `奇数次元素: [ ${step.resultA} ]` : '计算中...'
                : step.resultB !== undefined
                ? `两数: [ ${step.resultA} , ${step.resultB} ]`
                : step.resultA !== undefined
                ? `部分解: ${step.resultA}`
                : '寻找分水岭...'
            }
          </div>
        </div>
      </div>

      <!-- 数组元素卡片序列沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">输入序列点阵</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.nums.map((num, idx) => {
            const isCurrent = idx === step.currentIndex;
            const inGroupA = step.groupA?.includes(num);
            return `
              <div style="
                min-width: 44px;
                height: 48px;
                background: ${isCurrent ? '#0284c7' : inGroupA ? '#065f46' : '#1e293b'};
                border: ${isCurrent ? '2px solid #38bdf8' : inGroupA ? '1px solid #34d399' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isCurrent ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
              ">
                <div style="font-size: 14px; font-weight: bold; color: #fff;">${num}</div>
                <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">0b${num.toString(2)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 分组异或池展示 (双奇数模式) -->
      ${
        step.mode === 'double' && step.groupA
          ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 8px; padding: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #34d399; margin-bottom: 6px;">
                组 A (该位为 1): [ ${step.groupA.join(', ') || '空'} ]
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                组内数字全部异或 ➔ 解出奇数次数字 A = ${step.resultA !== undefined ? step.resultA : '计算中'}
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 6px;">
                组 B (该位为 0): [ ${step.groupB?.join(', ') || '空'} ]
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                由 eor ^ A = ${step.eorAll} ^ ${step.resultA || 0} ➔ 解出数字 B = ${step.resultB !== undefined ? step.resultB : '待反解'}
              </div>
            </div>
          </div>
        `
          : ''
      }

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '异或运算与最右 1 提取定理',
        '异或本质是无进位相加。两个不同的数 a != b，异或结果必有某一位为 1！通过 rightOne = eor & (-eor) 提取出这个区分两数的关键位，将原本混杂的数组在 O(N) 时间内划分进两个互斥的虚拟空间，无需任何哈希表额外空间达成 O(1) 空间极速解题！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const bitwiseXorOddTimes034Visualizer = registerDeclarativeAlgorithm<XorStep>({
  id: 'bitwise-xor-odd-times-034',
  name: 'Class 034: 异或运算的奇妙用法与奇数次提取 (Bitwise XOR)',
  category: 'bit-manipulation',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 34,
  learningGoal: '掌握异或运算无进位相加与自反性质，熟练应用提取最右侧 1 (eor & -eor) 技巧解决海量数字奇偶次频度问题',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 034 / LeetCode 136 & 260)</h3>
      <p>异或运算的几何代数性质：</p>
      <ul>
        <li><strong>性质 1</strong>：$0 \oplus N = N$，$N \oplus N = 0$。满足交换律与结合律。</li>
        <li><strong>问题 1 (单奇数次)</strong>：数组中仅有 1 个数出现奇数次，其余全出现偶数次。直接全量异或，偶数次全部对消为 0，剩余即为所求。</li>
        <li><strong>问题 2 (双奇数次)</strong>：数组中有 2 个数 $a$ 与 $b$ 出现奇数次，其余全出现偶数次。
          <br/>1. 全量异或得到 $eor = a \oplus b$；
          <br/>2. 提取最右 1：$rightOne = eor \& (-eor)$；
          <br/>3. 将数组按该位是否为 1 划分为两组，分别异或即可独立解出 $a$ 与 $b$。</li>
      </ul>
    </div>
  `,
  codeLanguages: BITWISE_XOR_CODES,
  inputs: [
    {
      id: 'mode',
      label: '问题模式',
      type: 'select',
      defaultValue: 'double',
      options: [
        { label: '双奇数次提取 (LeetCode 260: [3, 5, 2, 3, 2, 7])', value: 'double' },
        { label: '单奇数次提取 (LeetCode 136: [4, 1, 2, 1, 2])', value: 'single' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = (input.mode || 'double') as 'single' | 'double';
    return generateXorSteps(mode);
  },
  renderCanvas: (container, step) => {
    renderXorCanvas(container, step);
  },
});
