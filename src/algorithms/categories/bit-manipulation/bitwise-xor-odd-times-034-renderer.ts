/**
 * Class 034: 异或运算的奇妙用法与奇数次提取 (Bitwise XOR Odd Occurrences)
 * 左程云算法通关课入门篇 Class 034 / LeetCode 136 & 260
 * 核心原语：异或无进位相加性质 (x^x=0, x^0=x) + 提取最右侧的 1 (eor & -eor) 划分独立空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type XorStep,
  BITWISE_XOR_CODES,
  generateXorSteps,
} from './bitwise-xor-odd-times-034-step-compiler';
import { renderXorCanvas } from './bitwise-xor-odd-times-034-canvas-adapter';

export {
  type XorStep,
  BITWISE_XOR_CODES,
  generateXorSteps,
  renderXorCanvas,
};

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
