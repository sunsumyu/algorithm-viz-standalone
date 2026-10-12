/**
 * Hard 16: 表达式添加运算符 (Expression Add Operators)
 * LeetCode 282 顶级回溯搜索与乘法结合律优先级处理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  ExpressionStep,
  EXPRESSION_ADD_CODES,
  EXPRESSION_ADD_CODE_LINES,
  generateExpressionSteps,
} from '../../../../core/renderers/adapters/expression-add-operators-step-compiler';
import { renderExpressionCanvas } from '../../../../core/renderers/adapters/expression-add-operators-canvas-adapter';

export type { ExpressionStep };
export { EXPRESSION_ADD_CODES, EXPRESSION_ADD_CODE_LINES, generateExpressionSteps, renderExpressionCanvas };

export const expressionAddOperatorsVisualizer = registerDeclarativeAlgorithm<ExpressionStep>({
  id: 'expression-add-operators',
  name: '大厂高频真题: 表达式添加运算符 (Expression Add Operators)',
  category: 'backtracking',
  icon: '🔣',
  difficulty: 3,
  levelOrder: 282,
  learningGoal: '透彻掌握回溯搜索中利用 prevNum 结合律撤销机制搞定乘法运算优先级的高阶技巧 (LeetCode 282)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 282)</h3>
      <p>给定一个仅包含数字的字符串 <code>num</code> 和一个目标值 <code>target</code>：</p>
      <ul>
        <li>在 <code>num</code> 的数字之间添加二元运算符 <code>'+'</code>、<code>'-'</code> 或 <code>'*'</code>，返回所有能够求得目标值的表达式。</li>
        <li><strong>核心挑战</strong>：<code>*</code> 具有乘法优先结合律。例如前面算好了 <code>2 + 3 = 5</code>，后面跟上 <code>* 4</code> 时，必须把先前加上的 <code>3</code> 撤销，变为 <code>5 - 3 + (3 * 4) = 14</code>。</li>
        <li><strong>前导零约束</strong>：多位数（如 <code>"05"</code>）不合法，必须及时剪枝。</li>
      </ul>
    </div>
  `,
  codeLanguages: EXPRESSION_ADD_CODES,
  metrics: [
    { id: 'inputTarget', label: '目标约束', color: '#38bdf8' },
    { id: 'currentVal', label: '当前路径计算值', color: '#f59e0b' },
    { id: 'prevNum', label: '结合律撤销项 (multed)', color: '#a855f7' },
    { id: 'solCount', label: '已寻得解数', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'numStr',
      label: '输入数字串',
      type: 'text',
      defaultValue: '123',
    },
    {
      id: 'target',
      label: '目标值 (Target)',
      type: 'number',
      defaultValue: 6,
    },
  ],
  generateSteps: (input) => {
    const numStr = String(input.numStr || '123');
    const target = Number(input.target) || 6;
    return generateExpressionSteps(numStr, target);
  },
  renderCanvas: (container, step) => {
    renderExpressionCanvas(container, step);
  },
});
