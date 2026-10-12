/**
 * Class 144: 卢卡斯定理与大组合数求模 (Lucas Theorem)
 * 洛谷 P3807 【模板】卢卡斯定理 / Lucas Theorem
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  LucasCallFrame,
  Lucas144Step,
  LUCAS_144_CODES,
  LUCAS_144_CODE_LINES,
  buildLucas144Steps,
} from '../../../../core/renderers/adapters/lucas-theorem-144-step-compiler';
import { renderLucas144Canvas } from '../../../../core/renderers/adapters/lucas-theorem-144-canvas-adapter';

export type { LucasCallFrame, Lucas144Step };
export { LUCAS_144_CODES, LUCAS_144_CODE_LINES, buildLucas144Steps };

export const lucas144Visualizer = registerDeclarativeAlgorithm<Lucas144Step>({
  id: 'lucas-theorem-144',
  name: '卢卡斯定理 (Class 144)',
  aliases: ['class144-code01', 'lucas-theorem', 'lucas-theorem-144'],
  category: 'math',
  icon: '⚛️',
  difficulty: 3,
  levelOrder: 144,
  learningGoal: '掌握卢卡斯定理对大组合数进行 p 进制分解、快速幂与费马小定理求逆元，解决大数模小素数难题',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定三个正整数 <code>n, m, p</code>，其中 <code>p</code> 为素数，计算组合数 <code>C(n + m, n) mod p</code> 或 <code>C(n, m) mod p</code> 的值。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例输入：</strong>n = 10, m = 3, p = 7<br/>
        <strong>输出样例：</strong>1<br/>
        <strong>解释：</strong>C(10, 3) = 120，120 mod 7 = 1。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'n',
      label: '总数 (n)',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 1000,
    },
    {
      id: 'm',
      label: '选取数 (m)',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 1000,
    },
    {
      id: 'p',
      label: '素数模数 (p)',
      type: 'number',
      defaultValue: 7,
      min: 2,
      max: 100,
    },
  ],
  codeLanguages: LUCAS_144_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(1, parseInt(String(inputs.n || 10), 10));
    const m = Math.max(0, parseInt(String(inputs.m || 3), 10));
    const p = Math.max(2, parseInt(String(inputs.p || 7), 10));
    return buildLucas144Steps(n, m, p);
  },
  renderCanvas: renderLucas144Canvas,
});
