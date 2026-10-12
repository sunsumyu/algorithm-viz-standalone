/**
 * Hard 12: 地下城游戏反向 DP (Dungeon Game / Knight Princess)
 * LeetCode 174 大厂高频经典反向动态规划
 * 为什么正向 DP 具有后效性？为什么必须从右下角公主房向左上角逆推？
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type DungeonStep,
  DUNGEON_GAME_CODES,
  generateDungeonSteps,
} from '../../../../core/renderers/adapters/dungeon-game-step-compiler';
import { renderDungeonCanvas } from '../../../../core/renderers/adapters/dungeon-game-canvas-adapter';

export type { DungeonStep };
export { DUNGEON_GAME_CODES, generateDungeonSteps, renderDungeonCanvas };

export const dungeonGameVisualizer = registerDeclarativeAlgorithm<DungeonStep>({
  id: 'dungeon-game-reverse-dp',
  name: '大厂高频真题: 地下城游戏反向 DP (Dungeon Game)',
  category: 'dynamic-programming',
  icon: '🏰',
  difficulty: 3,
  levelOrder: 174,
  learningGoal: '透彻理解正向 DP 的后效性死局，掌握从终点公主房向起点逆向推导最低初始健康值的经典建模技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 174)</h3>
      <p>恶魔抓走了公主并关在地下城右下角 <code>(m - 1, n - 1)</code>。骑士从左上角 <code>(0, 0)</code> 出发拯救公主：</p>
      <ul>
        <li>骑士初始有一个健康点数，每次只能<strong>向右</strong>或<strong>向下</strong>移动一步。</li>
        <li>房间中数值为负数表示扣血，非负数表示加血。任何时刻骑士的血量都不能降到 <code>0</code> 或以下（必须 $\\ge 1$）。</li>
        <li><strong>为什么正向 DP 失败</strong>：走到某格时，如果之前耗血少但当前血少，和之前耗血多但当前血多，无法单向贪心比较优劣。</li>
        <li><strong>逆向 DP 破局</strong>：定义 <code>dp[i][j]</code> 为进入 <code>(i, j)</code> 所需要的<strong>最低初始生命值</strong>，彻底解耦后效性。</li>
      </ul>
    </div>
  `,
  codeLanguages: DUNGEON_GAME_CODES,
  metrics: [
    { id: 'focusCoord', label: '逆推房间坐标', color: '#38bdf8' },
    { id: 'roomCost', label: '当前房间增减', color: '#10b981' },
    { id: 'hpNeed', label: '所需最低 HP', color: '#f59e0b' },
    { id: 'startHp', label: '起点初始最低 HP', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 'dungeon',
      label: '地下城 3x3 房间数值 (格式: -2,-3,3; -5,-10,1; 10,30,-5)',
      type: 'text',
      defaultValue: '-2,-3,3; -5,-10,1; 10,30,-5',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.dungeon || '-2,-3,3; -5,-10,1; 10,30,-5');
    const grid: number[][] = raw.split(';').map(rowStr => {
      return rowStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }).filter(row => row.length > 0);
    return generateDungeonSteps(grid.length > 0 && grid[0].length > 0 ? grid : [
      [-2, -3, 3],
      [-5, -10, 1],
      [10, 30, -5]
    ]);
  },
  renderCanvas: (container, step) => {
    renderDungeonCanvas(container, step);
  },
});
