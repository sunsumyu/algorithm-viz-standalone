/**
 * Hard 11: 俄罗斯套娃信封问题 (Russian Doll Envelopes)
 * LeetCode 354 大厂高频顶级压轴题
 * 关键解题破局点：宽度升序 + 高度降序排序，降维至高度序列的 O(N log N) LIS 贪心二分
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type EnvelopeStep,
  RUSSIAN_DOLL_CODES,
  generateRussianDollSteps,
} from '../../../../core/renderers/adapters/russian-doll-step-compiler';
import { renderRussianDollCanvas } from '../../../../core/renderers/adapters/russian-doll-canvas-adapter';

export type { EnvelopeStep };
export { RUSSIAN_DOLL_CODES, generateRussianDollSteps, renderRussianDollCanvas };

export const russianDollVisualizer = registerDeclarativeAlgorithm<EnvelopeStep>({
  id: 'hard-russian-doll-envelopes',
  aliases: ['class071-code03', 'class072-code01', 'russian-doll-envelopes-354', 'leetcode-354', 'russian-doll-envelopes'],
  name: '大厂高频真题: 俄罗斯套娃信封问题 (Russian Doll Envelopes)',
  category: 'dynamic-programming',
  icon: '🪆',
  difficulty: 3,
  levelOrder: 354,
  learningGoal: '掌握二维偏序问题通过[宽升序+高降序]巧妙消解冲突并降维至一维 O(N log N) LIS 贪心二分的顶级算法思维',
  metrics: [
    { id: 'curEnvelope', label: '当前信封 (Envelope)', color: 'blue' },
    { id: 'maxEnvelopes', label: '最大套娃数 (Max LIS)', color: 'emerald' },
    { id: 'lisTailsLen', label: 'ends 数组长度 (Tails)', color: 'amber' },
    { id: 'replacedIndex', label: '二分贪心动作 (Action)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 354)</h3>
      <p>给你一个二维整数数组 <code>envelopes</code>，其中 <code>envelopes[i] = [wi, hi]</code>，表示第 <code>i</code> 个信封的宽度和高度：</p>
      <ul>
        <li>当另一个信封的宽度和高度都<strong>严格大于</strong>当前信封时，这个信封才可以放进另一个信封里。</li>
        <li><strong>破局思考</strong>：如果按宽度升序、高度也升序，那么 <code>[3, 3]</code> 和 <code>[3, 4]</code> 就会在高度上递增，导致错误套入同宽信封。</li>
        <li><strong>神级转化</strong>：同宽时高度<strong>严格逆序</strong>！这样 <code>[3, 4]</code> 走在 <code>[3, 3]</code> 前面，求 LIS 时两者永远不会共存。</li>
      </ul>
    </div>
  `,
  codeLanguages: RUSSIAN_DOLL_CODES,
  inputs: [
    {
      id: 'envelopes',
      label: '信封数据 [w, h] 序列 (格式: 5,4; 6,4; 6,7; 2,3)',
      type: 'text',
      defaultValue: '5,4; 6,4; 6,7; 2,3',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.envelopes || '5,4; 6,4; 6,7; 2,3');
    const pairs: [number, number][] = raw
      .split(';')
      .map(part => {
        const [w, h] = part.split(',').map(s => Number(s.trim()));
        return (isNaN(w) || isNaN(h)) ? null : [w, h] as [number, number];
      })
      .filter((p): p is [number, number] => p !== null);
    return generateRussianDollSteps(pairs.length > 0 ? pairs : [[5, 4], [6, 4], [6, 7], [2, 3]]);
  },
  renderCanvas: (container, step) => {
    renderRussianDollCanvas(container, step);
  },
});
