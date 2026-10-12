/**
 * Class 141: 中国剩余定理 (Chinese Remainder Theorem - CRT)
 * 洛谷 P1495 【模板】中国剩余定理(CRT) / 孙子算经 "物不知数"
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  CrtItem,
  Crt141Step,
  CRT_141_CODES,
  CRT_141_CODE_LINES,
  buildCrt141Steps,
} from '../../../../core/renderers/adapters/crt-141-step-compiler';
import { renderCrt141Canvas } from '../../../../core/renderers/adapters/crt-141-canvas-adapter';

export type { CrtItem, Crt141Step };
export { CRT_141_CODES, CRT_141_CODE_LINES, buildCrt141Steps };

export const crt141Visualizer = registerDeclarativeAlgorithm<Crt141Step>({
  id: 'crt-141',
  name: '中国剩余定理 (Class 141)',
  aliases: ['class141-code01', 'crt', 'crt-141', 'chinese-remainder-theorem'],
  category: 'math',
  icon: '📜',
  difficulty: 3,
  levelOrder: 141,
  learningGoal: '掌握中国剩余定理 (CRT) 的构造性证明与逆元求解，秒杀孙子算经经典物不知数线性同余方程组',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (孙子算经·物不知数)</h3>
      <p>有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二。问物几何？</p>
      <p>即求解一元线性同余方程组：<br/>
      <code>x ≡ 2 (mod 3)</code><br/>
      <code>x ≡ 3 (mod 5)</code><br/>
      <code>x ≡ 2 (mod 7)</code></p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>最小正整数解：</strong>23<br/>
        <strong>解释：</strong>23 % 3 = 2, 23 % 5 = 3, 23 % 7 = 2。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'moduli',
      label: '模数序列 (两两互质正整数)',
      type: 'text',
      defaultValue: '3, 5, 7',
      placeholder: '请输入模数 m_i',
    },
    {
      id: 'remainders',
      label: '余数序列 (对应方程余数 a_i)',
      type: 'text',
      defaultValue: '2, 3, 2',
      placeholder: '请输入余数 a_i',
    },
  ],
  codeLanguages: CRT_141_CODES,
  generateSteps: (inputs) => {
    const rawM = String(inputs.moduli || '3, 5, 7');
    const rawA = String(inputs.remainders || '2, 3, 2');
    const mList = rawM.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const aList = rawA.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildCrt141Steps(mList.length > 0 ? mList : [3, 5, 7], aList.length > 0 ? aList : [2, 3, 2]);
  },
  renderCanvas: (container, step) => {
    renderCrt141Canvas(container, step);
  },
});
