/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull - Incremental Algorithm - 洛谷 P4724) 声明式可视化器
 * 进阶几何与图论对偶: 四面体基底、有向体积与面可见性、地平线提取与锥面缝合
 * 遵循 Matt Pocock 深模块哲学与标准 4-Card 声明式沙盘架构
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CONVEX_HULL_3D_CODE_LANGUAGES,
  CONVEX_HULL_3D_PROBLEM_HTML,
  CONVEX_HULL_3D_ANALYSIS_HTML,
} from './convex-hull-3d-problem-content';
import {
  type Hull3DStep,
  buildConvexHull3DSteps,
} from './convex-hull-3d-step-compiler';
import { renderConvexHull3DCanvas } from '../../../core/renderers/adapters/convex-hull-3d-canvas-adapter';

export type { Hull3DStep };
export { buildConvexHull3DSteps };

const { template, Visualizer } = createDeclarativeVisualizer<Hull3DStep>({
  id: 'convex-hull-3d',
  name: '三维凸包增量法 (3D Convex Hull)',
  viewId: 'algo-convex-hull-3d-view',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '面可见性 + 地平线缝合',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌐 3D 空间立体多面体沙盘',
  card2Title: '🧭 几何拓扑与欧拉示性数监视器',
  card2Desc: '三维多面体顶点数 V、棱边数 E、三角面数 F 与欧拉公式验证',
  legend: [
    { label: '稳定三角面', state: 'scanning' },
    { label: '🔴 可见面 (Volume>0)', state: 'swapping' },
    { label: '🟢 新缝合锥面', state: 'discovered' },
    { label: '🟡 地平线边界', color: '#facc15' },
  ],
  inputs: [],
  presets: [
    { label: '单点增量构造 (P4724)', values: {} },
  ],
  metrics: [
    { id: 'vertices', label: '顶点数 V', color: '#2563eb' },
    { id: 'faces', label: '三角面数 F', color: '#10b981' },
    { id: 'euler', label: '欧拉示性数 V-E+F', color: '#f59e0b' },
  ],
  codeLanguages: CONVEX_HULL_3D_CODE_LANGUAGES,
  problemHtml: CONVEX_HULL_3D_PROBLEM_HTML,
  analysisHtml: CONVEX_HULL_3D_ANALYSIS_HTML,
  buildSteps: () => buildConvexHull3DSteps(),
  renderCanvas: renderConvexHull3DCanvas,
});

registerAlgorithm({
  id: 'convex-hull-3d',
  name: '三维凸包增量法 (3D Convex Hull)',
  viewId: 'algo-convex-hull-3d-view',
  category: 'graph',
  description: '进阶计算几何与图论对偶：四面体基底、有向体积与面可见性、地平线提取与锥面缝合 (洛谷 P4724)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 75,
  learningGoal: '掌握三维凸包增量构造法的几何判据（外法向量与有向体积）、地平线提取与欧拉公式 V-E+F=2',
});

export { Visualizer as ConvexHull3DVisualizer };
