/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull - Incremental Algorithm - 洛谷 P4724) 声明式可视化器
 * 进阶几何与图论对偶: 四面体基底、有向体积与面可见性、地平线提取与锥面缝合
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CONVEX_HULL_3D_CODE_LANGUAGES,
  CONVEX_HULL_3D_PROBLEM_HTML,
  CONVEX_HULL_3D_ANALYSIS_HTML,
} from './convex-hull-3d-problem-content';

export interface Hull3DStep {
  activePointIdx: number;
  faces: Array<{ a: number; b: number; c: number; visible?: boolean; isNew?: boolean }>;
  horizonEdges: Array<[number, number]>;
  numVertices: number;
  numFaces: number;
  numEdges: number;
  status: 'base' | 'point' | 'visible' | 'horizon' | 'sew' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildConvexHull3DSteps(): Hull3DStep[] {
  const steps: Hull3DStep[] = [];

  const baseFaces = [
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 3 },
    { a: 0, b: 3, c: 1 },
    { a: 1, b: 3, c: 2 },
  ];

  steps.push({
    activePointIdx: -1,
    faces: baseFaces,
    horizonEdges: [],
    numVertices: 4,
    numFaces: 4,
    numEdges: 6,
    status: 'base',
    message: '🔺 [构建初始四面体] 选取 4 个不共面的基底点 P0~P3，构成包含 4 个三角形面的初始凸多面体！',
    log: '初始化不共面四面体：4 顶点 4 三角面',
    codeLine: [28, 32],
  });

  steps.push({
    activePointIdx: 4,
    faces: baseFaces,
    horizonEdges: [],
    numVertices: 5,
    numFaces: 4,
    numEdges: 6,
    status: 'point',
    message: '📍 [增量引入新点 P4] 位于右上方外部 (60, 25, 25)，准备计算各三角面对 P4 的空间可见性！',
    log: '增量加入新点 P4(60, 25, 25)',
    codeLine: 35,
  });

  const checkedFaces = [
    { a: 0, b: 1, c: 2, visible: false },
    { a: 0, b: 2, c: 3, visible: false },
    { a: 0, b: 3, c: 1, visible: true },
    { a: 1, b: 3, c: 2, visible: true },
  ];

  steps.push({
    activePointIdx: 4,
    faces: checkedFaces,
    horizonEdges: [],
    numVertices: 5,
    numFaces: 4,
    numEdges: 6,
    status: 'visible',
    message: '👁️ [面可见性判定] 有向体积 Volume > 0 的面为可见面 (🔴 红色)，点 P4 能够直视面 (0,3,1) 与 (1,3,2)！',
    log: '面可见性判定：发现 2 个可见三角面',
    codeLine: [38, 42],
  });

  const horizons: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];

  steps.push({
    activePointIdx: 4,
    faces: checkedFaces,
    horizonEdges: horizons,
    numVertices: 5,
    numFaces: 4,
    numEdges: 6,
    status: 'horizon',
    message: '🟡 [地平线提取] 锁定可见面与不可见面交界的分界闭合回路 (地平线 Horizon)！',
    log: '提取地平线闭合边界边',
    codeLine: 44,
  });

  const updatedFaces = [
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 3 },
    { a: 0, b: 1, c: 4, isNew: true },
    { a: 1, b: 2, c: 4, isNew: true },
    { a: 2, b: 3, c: 4, isNew: true },
    { a: 3, b: 0, c: 4, isNew: true },
  ];

  steps.push({
    activePointIdx: 4,
    faces: updatedFaces,
    horizonEdges: [],
    numVertices: 5,
    numFaces: 6,
    numEdges: 9,
    status: 'sew',
    message: '✨ [锥面缝合完成] 剔除可见面，将点 P4 与地平线边界边逐一相连生成 4 个全新三角面！',
    log: '锥面缝合：生成 4 个新三角面，更新凸包',
    codeLine: [46, 50],
  });

  steps.push({
    activePointIdx: -1,
    faces: updatedFaces,
    horizonEdges: [],
    numVertices: 5,
    numFaces: 6,
    numEdges: 9,
    status: 'done',
    message: '🎉 [三维凸包构建完毕] 满足欧拉示性数 V - E + F = 5 - 9 + 6 = 2，三维凸多面体拓扑严谨！',
    log: '✓ 凸包构建完成：V=5, E=9, F=6, V-E+F=2',
    codeLine: 52,
  });

  return steps;
}

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
    { label: '稳定三角面', color: '#38bdf8' },
    { label: '🔴 可见面 (Volume>0)', color: '#ef4444' },
    { label: '🟢 新缝合锥面', color: '#10b981' },
    { label: '🟡 地平线边界', color: '#facc15' },
  ],
  inputs: [],
  presets: [
    { label: '单点增量构造 (P4724)', values: {} },
  ],
  metrics: [
    { id: 'metric-vertices', label: '顶点数 V', color: '#2563eb' },
    { id: 'metric-faces', label: '三角面数 F', color: '#10b981' },
    { id: 'metric-euler', label: '欧拉示性数 V-E+F', color: '#f59e0b' },
  ],
  codeLanguages: CONVEX_HULL_3D_CODE_LANGUAGES,
  problemHtml: CONVEX_HULL_3D_PROBLEM_HTML,
  analysisHtml: CONVEX_HULL_3D_ANALYSIS_HTML,
  buildSteps: () => buildConvexHull3DSteps(),
  renderCanvas: (container, step) => {
    // 3D 投影像素点
    const pts2D: Record<number, { x: number; y: number }> = {
      0: { x: 100, y: 140 },
      1: { x: 210, y: 140 },
      2: { x: 155, y: 55 },
      3: { x: 155, y: 105 },
      4: { x: 235, y: 80 },
    };

    const svgFaces = step.faces
      .map((f) => {
        const pA = pts2D[f.a];
        const pB = pts2D[f.b];
        const pC = pts2D[f.c];
        if (!pA || !pB || !pC) return '';

        let fill = 'rgba(56, 189, 248, 0.12)';
        let stroke = 'rgba(56, 189, 248, 0.6)';

        if (f.visible) {
          fill = 'rgba(239, 68, 68, 0.35)';
          stroke = '#ef4444';
        } else if (f.isNew) {
          fill = 'rgba(16, 185, 129, 0.35)';
          stroke = '#10b981';
        }

        return `
          <polygon points="${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        `;
      })
      .join('');

    const svgHorizons = step.horizonEdges
      .map(([u, v]) => {
        const p1 = pts2D[u];
        const p2 = pts2D[v];
        if (!p1 || !p2) return '';
        return `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#facc15" stroke-width="3" />
        `;
      })
      .join('');

    const nodes = [0, 1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        if (u === 4 && step.status === 'base') return '';
        const p = pts2D[u];
        if (!p) return '';
        const isCur = step.activePointIdx === u;
        const bg = isCur ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="${isCur ? 6 : 4}" fill="${bg}" stroke="#ffffff" stroke-width="1.5" />
            <text x="${p.x + 6}" y="${p.y - 4}" fill="#ffffff" font-size="9.5" font-weight="700" font-family="monospace">${u === 4 ? 'P4(新)' : `P${u}`}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgFaces}
          ${svgHorizons}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🔴 红色为可见面 (有向体积 > 0) | 🟡 金色为地平线边界回路 | 🟢 绿色为新缝合锥面
        </div>
      </div>
    `;

    const root = container.closest('#algo-convex-hull-3d-view');
    if (root) {
      const vEl = root.querySelector('#metric-vertices');
      const fEl = root.querySelector('#metric-faces');
      const eulerEl = root.querySelector('#metric-euler');

      if (vEl) vEl.textContent = `${step.numVertices}`;
      if (fEl) fEl.textContent = `${step.numFaces}`;
      if (eulerEl) eulerEl.textContent = `${step.numVertices} - ${step.numEdges} + ${step.numFaces} = 2`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 有向体积判据:</span>
              <strong style="font-family: monospace; color: #2563eb;">Volume(F, P) = (AB × AC) · AP > 0</strong>
            </div>
          </div>
        `;
      }
    }
  },
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
