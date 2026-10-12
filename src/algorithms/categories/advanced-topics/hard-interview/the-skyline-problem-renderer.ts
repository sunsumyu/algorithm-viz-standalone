/**
 * Hard 13: 城市天际线问题 (The Skyline Problem)
 * LeetCode 218 顶级扫描线与堆几何轮廓压轴题
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  SkylineStep,
  SKYLINE_PROBLEM_CODES,
  SKYLINE_CODE_LINES,
  generateSkylineSteps,
} from '../../../../core/renderers/adapters/skyline-problem-step-compiler';
import { renderSkylineCanvas } from '../../../../core/renderers/adapters/skyline-problem-canvas-adapter';

export type { SkylineStep };
export { SKYLINE_PROBLEM_CODES, SKYLINE_CODE_LINES, generateSkylineSteps, renderSkylineCanvas };

export const skylineProblemVisualizer = registerDeclarativeAlgorithm<SkylineStep>({
  id: 'the-skyline-problem',
  name: '大厂高频真题: 城市天际线问题 (The Skyline Problem)',
  category: 'heap',
  icon: '🏙️',
  difficulty: 3,
  levelOrder: 218,
  learningGoal: '掌握扫描线算法与最大堆动态维护轮廓几何最高点的经典转化模型 (LeetCode 218)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 218)</h3>
      <p>城市的 <strong>天际线</strong> 是从远处观看该城市中所有建筑物形成的轮廓的外部轮廓。给你所有建筑物的位置和高度，请返回由这些建筑物形成的 <strong>天际线</strong>：</p>
      <ul>
        <li>每个建筑用三元组 <code>[left, right, height]</code> 表示。</li>
        <li><strong>扫描线思维</strong>：将每个建筑拆分为左边缘事件 <code>(left, -height)</code> 和右边缘事件 <code>(right, height)</code>。</li>
        <li><strong>最大堆维护</strong>：从左往右扫过每个事件，当且仅当堆顶最大高度发生改变时，该点即为一个天际线关键拐点。</li>
      </ul>
    </div>
  `,
  metrics: [
    { id: 'currentX', label: '扫描线 X', color: '#0284c7' },
    { id: 'curMax', label: '当前最高高度', color: '#f59e0b' },
    { id: 'pointCount', label: '关键拐点数', color: '#16a34a' },
    { id: 'heapTop', label: '堆顶高度', color: '#9333ea' },
  ],
  codeLanguages: SKYLINE_PROBLEM_CODES,
  inputs: [
    {
      id: 'buildings',
      label: '建筑物 [L, R, H] (格式: 2,9,10; 3,7,15; 5,12,12)',
      type: 'text',
      defaultValue: '2,9,10; 3,7,15; 5,12,12; 15,20,10; 19,24,8',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.buildings || '2,9,10; 3,7,15; 5,12,12; 15,20,10; 19,24,8');
    const buildings: [number, number, number][] = raw
      .split(';')
      .map(part => {
        const [l, r, h] = part.split(',').map(s => Number(s.trim()));
        return (isNaN(l) || isNaN(r) || isNaN(h)) ? null : [l, r, h] as [number, number, number];
      })
      .filter((b): b is [number, number, number] => b !== null);

    return generateSkylineSteps(buildings.length > 0 ? buildings : [
      [2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]
    ]);
  },
  renderCanvas: (container, step) => {
    renderSkylineCanvas(container, step);
  },
});
