/**
 * Hard 14: 自由之路环形 DP (Freedom Trail)
 * LeetCode 514 大厂高频环形转盘旋转动态规划
 * 环形转盘顺逆时针双向距离 min(|i - j|, n - |i - j|) 与记忆化搜索
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type FreedomTrailStep,
  FREEDOM_TRAIL_CODES,
  generateFreedomTrailSteps,
} from '../../../../core/renderers/adapters/freedom-trail-step-compiler';
import { renderFreedomTrailCanvas } from '../../../../core/renderers/adapters/freedom-trail-canvas-adapter';

export type { FreedomTrailStep };
export { FREEDOM_TRAIL_CODES, generateFreedomTrailSteps, renderFreedomTrailCanvas };

export const freedomTrailVisualizer = registerDeclarativeAlgorithm<FreedomTrailStep>({
  id: 'freedom-trail-ring-dp',
  name: '大厂高频真题: 自由之路环形 DP (Freedom Trail)',
  category: 'dynamic-programming',
  icon: '🎡',
  difficulty: 3,
  levelOrder: 514,
  learningGoal: '掌握环形转盘双向旋转步数最短路径 min(|i - j|, n - |i - j|) 与多阶段动态规划状态建模 (LeetCode 514)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 514)</h3>
      <p>电子游戏“辐射4”中，通过一个名为“自由之路”的环形密码锁拼写关键词：</p>
      <ul>
        <li>给你一个字符串 <code>ring</code> 代表密码锁转盘，初始 12 点钟方向对准 <code>ring[0]</code>。</li>
        <li>给你一个字符串 <code>key</code> 代表需要拼写的关键词。</li>
        <li>顺时针或逆时针旋转转盘 1 个单位算作 1 步；当目标字符到达 12 点钟方向后按下中心按钮也算作 1 步。</li>
        <li>求拼写完整关键词所需的<strong>最少步数</strong>。</li>
      </ul>
    </div>
  `,
  codeLanguages: FREEDOM_TRAIL_CODES,
  metrics: [
    { id: 'targetChar', label: '目标字符 (Key)', color: '#38bdf8' },
    { id: 'ringPos', label: '转盘指针转移', color: '#f59e0b' },
    { id: 'rotateCost', label: '当前旋转代价', color: '#ec4899' },
    { id: 'accumulatedSteps', label: '累计总步数', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'ring',
      label: '转盘字符 (Ring)',
      type: 'text',
      defaultValue: 'godding',
    },
    {
      id: 'key',
      label: '目标词 (Key)',
      type: 'text',
      defaultValue: 'gd',
    },
  ],
  generateSteps: (input) => {
    const ring = String(input.ring || 'godding');
    const key = String(input.key || 'gd');
    return generateFreedomTrailSteps(ring, key);
  },
  renderCanvas: (container, step) => {
    renderFreedomTrailCanvas(container, step);
  },
});
