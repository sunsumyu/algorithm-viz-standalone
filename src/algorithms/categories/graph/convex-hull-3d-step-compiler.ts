/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull Step Compiler - 洛谷 P4724)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：推演四面体基底、有向体积判定、地平线提取与锥面缝合的执行流
 */

import type { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

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
