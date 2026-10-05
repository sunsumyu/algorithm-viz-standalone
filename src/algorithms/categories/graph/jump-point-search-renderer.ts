/**
 * Jump Point Search (跳点搜索, JPS)
 *
 * 领域适配器 (Thin Domain Adapter, LOC < 150 行)
 * 核心推演委托: JumpPointSearchStepCompiler
 * 画布与监视器委托: JumpPointSearchCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  STAGE1_ASTAR_CODE,
  STAGE2_PRUNING_CODE,
  STAGE3_RAY_CODE,
  STAGE4_JPS_CODE,
} from './jump-point-search-problem-content';
import {
  buildStage1Steps, buildStage2Steps, buildStage3Steps, buildStage4Steps,
} from '../../../core/renderers/adapters/jump-point-search-step-compiler';
import { renderJumpPointSearchCanvas, renderJumpPointSearchCard2 } from '../../../core/renderers/adapters/jump-point-search-canvas-adapter';
import type { JpsStep } from '../../../core/renderers/adapters/jump-point-search-step-compiler';

// 保持既有单测与外部引用 100% 兼容
export * from '../../../core/renderers/adapters/jump-point-search-step-compiler';
export * from '../../../core/renderers/adapters/jump-point-search-canvas-adapter';

const renderCanvas = (c: HTMLElement, s: unknown) => renderJumpPointSearchCanvas(c, s as JpsStep);
const renderCard2 = (c: HTMLElement, s: unknown) => renderJumpPointSearchCard2(c, s as JpsStep);

// 注册声明式多阶段演化模型
registerDeclarativeAlgorithm({
  id: 'jump-point-search',
  name: '跳点搜索 (Jump Point Search, JPS)',
  category: 'graph',
  description: '跳过网格对称路径！结合自然邻居剪枝、强迫邻居与递归射线跳跃，相比传统 A* 实现节点访问数量级降低',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '掌握均匀网格对称剪枝原理、自然邻居与强迫邻居定义，以及水平/垂直/对角线复合跳跃机制',
  aliases: ['jps', 'jump-point-search-grid', 'a-star-jps'],
  defaultStage: 'stage-3',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: A* 传统泛洪对比',
      shortName: 'A*泛洪',
      num: 1,
      timeBadge: 'O(bᵈ) 堆膨胀',
      theme: 'bg-amber',
      badge: { mode: '传统 8-向 A* 搜索', complexity: '大量等价对称路径冗余入堆' },
      card1Title: '🧭 传统 8-向 A* 网格泛洪沙盘',
      card2Title: '📊 A* 状态空间与 Open 堆规模监视器',
      codeLanguages: STAGE1_ASTAR_CODE,
      buildSteps: (i) => buildStage1Steps((i?.preset as string) || 'corner'),
      renderCanvas, renderCustomMetrics: renderCard2,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 邻居对称性剪枝',
      shortName: '邻居剪枝',
      num: 2,
      timeBadge: 'O(1) 几何判别',
      theme: 'bg-emerald',
      badge: { mode: '自然邻居 & 强迫邻居判定', complexity: '开阔地带仅保留 1~3 个自然邻居' },
      card1Title: '📐 自然邻居 (NN) 与强迫邻居 (FN) 几何剪枝沙盘',
      card2Title: '🔬 pruneNeighbors() 局部几何微观视镜',
      codeLanguages: STAGE2_PRUNING_CODE,
      buildSteps: (i) => buildStage2Steps((i?.preset as string) || 'corner'),
      renderCanvas, renderCustomMetrics: renderCard2,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 递归射线跳跃探测',
      shortName: '射线跳跃',
      num: 3,
      timeBadge: 'O(k) 沿途零入堆',
      theme: 'bg-blue',
      badge: { mode: '直行 & 对角线复合射线跳跃', complexity: '沿途零入堆 / 递归正交子探测' },
      card1Title: '🚀 递归光束射线探测与正交子跳跃沙盘',
      card2Title: '⚡ jump() 递归栈与正交子跳跃监视器',
      codeLanguages: STAGE3_RAY_CODE,
      buildSteps: (i) => buildStage3Steps((i?.preset as string) || 'diagonal'),
      renderCanvas, renderCustomMetrics: renderCard2,
    },
    {
      id: 'stage-4',
      name: '阶段 4: JPS 完整跳点搜索',
      shortName: 'JPS终局',
      num: 4,
      timeBadge: 'O(J log J) 极致压缩',
      theme: 'bg-purple',
      badge: { mode: 'JPS (Jump Point Search) 极速寻路', complexity: '节点访问减少 80%~95%' },
      card1Title: '⚡ JPS 跳点极速寻路沙盘',
      card2Title: '🏆 JPS 状态空间与终局跳点路径监视器',
      codeLanguages: STAGE4_JPS_CODE,
      buildSteps: (i) => buildStage4Steps((i?.preset as string) || 'diagonal'),
      renderCanvas, renderCustomMetrics: renderCard2,
    },
  ],
  inputs: [
    {
      id: 'preset',
      label: '地图预设',
      type: 'select',
      defaultValue: 'diagonal',
      options: [
        { label: '对角线侦察原理 (8×8 经典)', value: 'diagonal' },
        { label: '经典拐角 (8×10)', value: 'corner' },
        { label: '开阔平原 (10×14)', value: 'plain' },
        { label: '迷宫障碍 (12×16)', value: 'maze' },
      ],
    },
  ],
  presets: [
    { label: '对角线侦察原理 (8×8 经典)', values: { preset: 'diagonal' } },
    { label: '经典拐角 (8×10 地图)', values: { preset: 'corner' } },
    { label: '开阔平原 (10×14 地图)', values: { preset: 'plain' } },
    { label: '迷宫障碍 (12×16 地图)', values: { preset: 'maze' } },
  ],
  metrics: [
    { id: 'metric-jps-stage', label: '演进阶段', color: '#8b5cf6' },
    { id: 'metric-jps-cur', label: '当前考察点', color: '#ea580c' },
    { id: 'metric-jps-open', label: 'Open 堆规模', color: '#ca8a04' },
    { id: 'metric-jps-visited', label: '访问/跳点数', color: '#3b82f6' },
    { id: 'metric-jps-saved', label: '性能优化率', color: '#10b981' },
  ],
  legend: [
    { label: '起点 S', state: 'comparing' },
    { label: '终点 G', state: 'sorted' },
    { label: '障碍物', color: '#111a2e' },
    { label: '跳点 (JP)', color: '#8b5cf6' },
    { label: '强迫邻居 (FN)', color: '#f59e0b' },
    { label: '自然邻居 (NN)', color: '#14b8a6' },
    { label: '跳跃射线', color: '#38bdf8' },
    { label: '最优路径', state: 'discovered' },
  ],
  codeLanguages: STAGE4_JPS_CODE,
  problemHtml: JUMP_POINT_SEARCH_PROBLEM_HTML,
  analysisHtml: JUMP_POINT_SEARCH_ANALYSIS_HTML,
  generateSteps: (inputs) => buildStage3Steps((inputs?.preset as string) || 'diagonal'),
  renderCanvas, renderCustomMetrics: renderCard2,
});
