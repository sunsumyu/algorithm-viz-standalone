/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull - Incremental Algorithm - 洛谷 P4724) 声明式可视化器
 * 进阶几何与图论对偶: 四面体基底、有向体积与面可见性、地平线提取与锥面缝合
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import type { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  CONVEX_HULL_3D_CODE_LANGUAGES,
  CONVEX_HULL_3D_PROBLEM_HTML,
  CONVEX_HULL_3D_ANALYSIS_HTML,
} from './convex-hull-3d-problem-content';

export interface Hull3DStep {
  activePointIdx: number;
  faces: Array<{ a: number; b: number; c: number; visible?: boolean; isNew?: boolean; isTesting?: boolean }>;
  horizonEdges: Array<[number, number]>;
  numVertices: number;
  numFaces: number;
  numEdges: number;
  status: 'base' | 'point' | 'visible' | 'horizon' | 'sew' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildConvexHull3DSteps(): Hull3DStep[] {
  const steps: Hull3DStep[] = [];

  // 四语言 1-based 相对行号映射字典
  const lines = {
    entry:          { java: 37, cpp: 39, python: 18, javascript: 9 },
    initBase:       { java: 41, cpp: 41, python: 19, javascript: 10 },
    pointIter:      { java: 47, cpp: 45, python: 20, javascript: 11 },
    calcVolume:     { java: 30, cpp: 32, python: 13, javascript: 12 },
    checkVisible:   { java: 50, cpp: 49, python: 22, javascript: 14 },
    extractHorizon: { java: 69, cpp: 55, python: 24, javascript: 17 },
    sewHorizon:     { java: 58, cpp: 57, python: 25, javascript: 19 },
    completeHull:   { java: 64, cpp: 57, python: 26, javascript: 20 },
    returnArea:     { java: 66, cpp: 57, python: 27, javascript: 21 },
  };

  const baseFaces = [
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 3 },
    { a: 0, b: 3, c: 1 },
    { a: 1, b: 3, c: 2 },
  ];

  function makeStep(data: Omit<Hull3DStep, 'metrics'>): Hull3DStep {
    return {
      ...data,
      metrics: {
        vertices: data.numVertices,
        faces: data.numFaces,
        euler: `${data.numVertices} - ${data.numEdges} + ${data.numFaces} = 2`,
      },
    };
  }

  // 1. 函数入口
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: [],
      horizonEdges: [],
      numVertices: 0,
      numFaces: 0,
      numEdges: 0,
      status: 'base',
      message: '🚀 [函数入口] calcSurfaceArea(pts): 接收 5 个三维空间点 P0~P4，准备增量构建三维凸包。',
      log: '启动 calcSurfaceArea(Point3D[] pts)，点数 n = 5',
      codeLine: lines.entry,
    })
  );

  // 2. 初始化面表
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: [],
      horizonEdges: [],
      numVertices: 4,
      numFaces: 0,
      numEdges: 0,
      status: 'base',
      message: '📦 [初始化多面体] 创建三角形面表 List<Face> faces，准备选取前 4 个不共面基底点构建初始四面体。',
      log: 'List<Face> faces = new ArrayList<>();',
      codeLine: lines.initBase,
    })
  );

  // 3. 添加基底底面 F0(0,1,2)
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: [{ a: 0, b: 1, c: 2, isNew: true }],
      horizonEdges: [],
      numVertices: 3,
      numFaces: 1,
      numEdges: 3,
      status: 'base',
      message: '🔺 [四面体构面 1/4] 添加底面三角形 F0(P0, P1, P2)。',
      log: 'faces.add(new Face(0, 1, 2));',
      codeLine: lines.entry,
    })
  );

  // 4. 添加侧面 F1(0,2,3)
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: [{ a: 0, b: 1, c: 2 }, { a: 0, b: 2, c: 3, isNew: true }],
      horizonEdges: [],
      numVertices: 4,
      numFaces: 2,
      numEdges: 5,
      status: 'base',
      message: '🔺 [四面体构面 2/4] 添加后侧面三角形 F1(P0, P2, P3)。',
      log: 'faces.add(new Face(0, 2, 3));',
      codeLine: lines.initBase,
    })
  );

  // 5. 添加左侧面 F2(0,3,1)
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: [{ a: 0, b: 1, c: 2 }, { a: 0, b: 2, c: 3 }, { a: 0, b: 3, c: 1, isNew: true }],
      horizonEdges: [],
      numVertices: 4,
      numFaces: 3,
      numEdges: 6,
      status: 'base',
      message: '🔺 [四面体构面 3/4] 添加左前侧面三角形 F2(P0, P3, P1)。',
      log: 'faces.add(new Face(0, 3, 1));',
      codeLine: lines.pointIter,
    })
  );

  // 6. 添加右侧面 F3(1,3,2)
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: baseFaces,
      horizonEdges: [],
      numVertices: 4,
      numFaces: 4,
      numEdges: 6,
      status: 'base',
      message: '🔺 [四面体构建完成] 4 个三角形面 F0~F3 形成严格闭合的三维四面体！满足欧拉示性数 V - E + F = 4 - 6 + 4 = 2。',
      log: 'faces.add(new Face(1, 3, 2)); // 四面体闭合 V=4, E=6, F=4',
      codeLine: lines.calcVolume,
    })
  );

  // 7. 外层循环：引入新点 P4
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: baseFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'point',
      message: '📍 [增量循环 i = 4] 考察待加入凸包的新点 P4(60, 25, 25)，准备逐面判定其空间可见性。',
      log: 'for (int i = 4; i < n; i++) // 考察点 P4',
      codeLine: lines.checkVisible,
    })
  );

  // 8. 判定面 F0(0,1,2)
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [
        { a: 0, b: 1, c: 2, isTesting: true, visible: false },
        { a: 0, b: 2, c: 3 },
        { a: 0, b: 3, c: 1 },
        { a: 1, b: 3, c: 2 },
      ],
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'visible',
      message: '🔍 [可见性测试 F0] 计算点 P4 到面 F0(P0,P1,P2) 的有向体积 Volume ≤ 0 ⟹ 点 P4 在面内部背光侧，不可见 (保留)。',
      log: '| 面 F0(0,1,2): volume(4, F0) <= 0 -> visible = false (保留)',
      codeLine: lines.extractHorizon,
    })
  );

  // 9. 判定面 F1(0,2,3)
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [
        { a: 0, b: 1, c: 2, visible: false },
        { a: 0, b: 2, c: 3, isTesting: true, visible: false },
        { a: 0, b: 3, c: 1 },
        { a: 1, b: 3, c: 2 },
      ],
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'visible',
      message: '🔍 [可见性测试 F1] 计算点 P4 到面 F1(P0,P2,P3) 的有向体积 Volume ≤ 0 ⟹ 不可见 (保留)。',
      log: '| 面 F1(0,2,3): volume(4, F1) <= 0 -> visible = false (保留)',
      codeLine: lines.extractHorizon,
    })
  );

  // 10. 判定面 F2(0,3,1) -> 可见！
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [
        { a: 0, b: 1, c: 2, visible: false },
        { a: 0, b: 2, c: 3, visible: false },
        { a: 0, b: 3, c: 1, isTesting: true, visible: true },
        { a: 1, b: 3, c: 2 },
      ],
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'visible',
      message: '👁️ [可见性测试 F2] 发现可见面！Volume(P4, F2) > 0 ⟹ 点 P4 能直视三角面 F2(0,3,1)，标记为红色可见待清除！',
      log: '| 🔴 面 F2(0,3,1): volume(4, F2) > 0 -> visible = true (直视可见)',
      codeLine: lines.extractHorizon,
    })
  );

  // 11. 判定面 F3(1,3,2) -> 可见！
  const checkedFaces = [
    { a: 0, b: 1, c: 2, visible: false },
    { a: 0, b: 2, c: 3, visible: false },
    { a: 0, b: 3, c: 1, visible: true },
    { a: 1, b: 3, c: 2, isTesting: true, visible: true },
  ];
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: checkedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'visible',
      message: '👁️ [可见性测试 F3] 发现可见面！Volume(P4, F3) > 0 ⟹ 点 P4 能直视三角面 F3(1,3,2)，标记为红色可见待清除！',
      log: '| 🔴 面 F3(1,3,2): volume(4, F3) > 0 -> visible = true (直视可见)',
      codeLine: lines.extractHorizon,
    })
  );

  // 12. 提取地平线边界 (Horizon)
  const horizons: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: checkedFaces,
      horizonEdges: horizons,
      numVertices: 5,
      numFaces: 4,
      numEdges: 6,
      status: 'horizon',
      message: '🟡 [提取地平线回路] 锁定可见面 (F2, F3) 与背光面 (F0, F1) 的交界分界闭合边 (0,1)-(1,2)-(2,3)-(3,0)！',
      log: 'findHorizonEdges: 提取 4 条地平线边界回路边',
      codeLine: lines.sewHorizon,
    })
  );

  // 13. 保留背光面
  const retainedFaces = [
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 3 },
  ];
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: retainedFaces,
      horizonEdges: horizons,
      numVertices: 5,
      numFaces: 2,
      numEdges: 5,
      status: 'sew',
      message: '🗑️ [剔除内部可见面] 删除被点 P4 完全遮挡的内部三角面 F2 与 F3，保留背光面 F0 与 F1。',
      log: '剔除可见面 F2, F3，保留不可见面 F0, F1',
      codeLine: lines.completeHull,
    })
  );

  // 14. 缝合锥面 1
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [...retainedFaces, { a: 0, b: 1, c: 4, isNew: true }],
      horizonEdges: horizons.slice(1),
      numVertices: 5,
      numFaces: 3,
      numEdges: 6,
      status: 'sew',
      message: '🧵 [锥面缝合 1/4] 连接地平线边 (P0, P1) 与点 P4，生成新三角锥面 (P0, P1, P4)！',
      log: '| 缝合新面: (P0, P1, P4)',
      codeLine: lines.completeHull,
    })
  );

  // 15. 缝合锥面 2
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [...retainedFaces, { a: 0, b: 1, c: 4, isNew: true }, { a: 1, b: 2, c: 4, isNew: true }],
      horizonEdges: horizons.slice(2),
      numVertices: 5,
      numFaces: 4,
      numEdges: 7,
      status: 'sew',
      message: '🧵 [锥面缝合 2/4] 连接地平线边 (P1, P2) 与点 P4，生成新三角锥面 (P1, P2, P4)！',
      log: '| 缝合新面: (P1, P2, P4)',
      codeLine: lines.completeHull,
    })
  );

  // 16. 缝合锥面 3
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: [
        ...retainedFaces,
        { a: 0, b: 1, c: 4, isNew: true },
        { a: 1, b: 2, c: 4, isNew: true },
        { a: 2, b: 3, c: 4, isNew: true },
      ],
      horizonEdges: horizons.slice(3),
      numVertices: 5,
      numFaces: 5,
      numEdges: 8,
      status: 'sew',
      message: '🧵 [锥面缝合 3/4] 连接地平线边 (P2, P3) 与点 P4，生成新三角锥面 (P2, P3, P4)！',
      log: '| 缝合新面: (P2, P3, P4)',
      codeLine: lines.completeHull,
    })
  );

  // 17. 缝合锥面 4
  const updatedFaces = [
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 3 },
    { a: 0, b: 1, c: 4, isNew: true },
    { a: 1, b: 2, c: 4, isNew: true },
    { a: 2, b: 3, c: 4, isNew: true },
    { a: 3, b: 0, c: 4, isNew: true },
  ];
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      status: 'sew',
      message: '🧵 [锥面缝合 4/4] 连接地平线边 (P3, P0) 与点 P4，生成新三角锥面 (P3, P0, P4)！全部缝合完成。',
      log: '| 缝合新面: (P3, P0, P4) - 4 个新锥面缝合完毕',
      codeLine: lines.completeHull,
    })
  );

  // 18. 面表更新完成
  steps.push(
    makeStep({
      activePointIdx: 4,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      status: 'sew',
      message: '✨ [面表更新完毕] faces = nextFaces: 当前凸多面体由 2 个原背光面 + 4 个新缝合面共 6 个面组成。',
      log: 'faces = nextFaces; 当前三角面总数 F = 6',
      codeLine: lines.completeHull,
    })
  );

  // 19. 校验欧拉示性数
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      status: 'done',
      message: '📐 [拓扑校验] 验证欧拉示性数：V - E + F = 5 - 9 + 6 = 2！三维凸包拓扑结构严格满足封闭多面体定理。',
      log: '✓ 欧拉公式验证：V=5, E=9, F=6, V-E+F=2',
      codeLine: lines.completeHull,
    })
  );

  // 20. 累加表面积
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      status: 'done',
      message: '📊 [计算总表面积] 遍历当前 6 个三角形面，向量叉乘求模累加各面面积：totalArea = 4328.50。',
      log: 'for (Face f : faces) totalArea += f.area(pts); // 累加得 4328.50',
      codeLine: lines.returnArea,
    })
  );

  // 21. 返回最终表面积
  steps.push(
    makeStep({
      activePointIdx: -1,
      faces: updatedFaces,
      horizonEdges: [],
      numVertices: 5,
      numFaces: 6,
      numEdges: 9,
      status: 'done',
      message: '🏆 [算法执行完成] return totalArea: 三维凸包构建成功，表面积求解完毕！',
      log: '🏆 return totalArea = 4328.50; 演化推导圆满完成！',
      codeLine: lines.returnArea,
    })
  );

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
    { id: 'vertices', label: '顶点数 V', color: '#2563eb' },
    { id: 'faces', label: '三角面数 F', color: '#10b981' },
    { id: 'euler', label: '欧拉示性数 V-E+F', color: '#f59e0b' },
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
        } else if (f.isTesting) {
          fill = 'rgba(250, 204, 21, 0.25)';
          stroke = '#facc15';
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
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgFaces}
          ${svgHorizons}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🔴 红色为可见面 (有向体积 > 0) | 🟡 金色为地平线边界回路 | 🟢 绿色为新缝合锥面
        </div>
      </div>
    `;

    const root = container.closest('#algo-convex-hull-3d-view');
    if (root) {
      const vEl = root.querySelector('#metric-vertices') || root.querySelector('#vertices');
      const fEl = root.querySelector('#metric-faces') || root.querySelector('#faces');
      const eulerEl = root.querySelector('#metric-euler') || root.querySelector('#euler');

      if (vEl) vEl.textContent = `${step.numVertices}`;
      if (fEl) fEl.textContent = `${step.numFaces}`;
      if (eulerEl) eulerEl.textContent = step.numVertices > 0 ? `${step.numVertices} - ${step.numEdges} + ${step.numFaces} = 2` : '—';

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
