/**
 * Class 039: 嵌套结构递归解法母题之三：原子的数量 (Count of Atoms)
 * 左程云算法通关课入门/必备篇 Class 039 / LeetCode 726 (原子的数量)
 * 核心原语：嵌套递归通用模板——遇到 '(' 深入子过程，遇到 ')' 连同原子频次字典与最新游标返回，
 * 主过程读取外部倍数乘算合并至当前层，最后按原子字典序输出
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  AtomStep,
  COUNT_OF_ATOMS_CODES,
  COUNT_OF_ATOMS_CODE_LINES,
  generateCountOfAtomsSteps,
} from './count-of-atoms-039-step-compiler';
import { renderCountOfAtomsCanvas } from './count-of-atoms-039-canvas-adapter';

export type { AtomStep };
export { COUNT_OF_ATOMS_CODES, COUNT_OF_ATOMS_CODE_LINES, generateCountOfAtomsSteps, renderCountOfAtomsCanvas };

export const countOfAtoms039Visualizer = registerDeclarativeAlgorithm<AtomStep>({
  id: 'count-of-atoms-039',
  aliases: ['class039-code03', 'count-atoms', 'count-of-atoms', 'leetcode-726', 'number-of-atoms'],
  name: 'Class 039: 分子式中原子的数量 (Count of Atoms)',
  category: 'string',
  icon: '🧪',
  difficulty: 3,
  levelOrder: 726,
  learningGoal: '掌握左程云嵌套递归模板在复杂分子式括号乘算与 TreeMap 字典序合并中的通用解法',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 039 / LeetCode 726)</h3>
      <p>给定一个化学分子式，输出所有原子的数量。格式要求：原子名称后紧跟该原子的数量；如果数量为 1 则不输出数字。所有原子按照<strong>字典序升序排列</strong>。</p>
      <h4>经典嵌套用例：</h4>
      <ul>
        <li><code>H2O</code> ➔ <code>H2O</code></li>
        <li><code>Mg(OH)2</code> ➔ <code>H2MgO2</code></li>
        <li><code>K4(ON(SO3)2)2</code> ➔ <code>K4N2O14S4</code></li>
      </ul>
      <p><strong>左程云黄金套路</strong>：无论是计算器还是本题，遇到 <code>(</code> 递归深入，遇到 <code>)</code> 弹栈返回 <code>{ map, stopIndex }</code>，主过程乘算后无缝累加！</p>
    </div>
  `,
  codeLanguages: COUNT_OF_ATOMS_CODES,
  inputs: [
    {
      id: 'formula',
      label: '化学分子式',
      type: 'select',
      defaultValue: 'K4(ON(SO3)2)2',
      options: [
        { label: '多重深度嵌套: K4(ON(SO3)2)2', value: 'K4(ON(SO3)2)2' },
        { label: '简单括号: Mg(OH)2', value: 'Mg(OH)2' },
        { label: '双嵌套组合: ((N42)24(H2O)10)2', value: '((N42)24(H2O)10)2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const f = String(input.formula || 'K4(ON(SO3)2)2');
    return generateCountOfAtomsSteps(f);
  },
  renderCanvas: (container, step) => {
    renderCountOfAtomsCanvas(container, step);
  },
});
