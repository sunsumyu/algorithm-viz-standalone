/**
 * Class 200: 仙人掌图与仙人掌 DP (Cactus Graph DP)
 * DFS 树边转移 + 返祖边找环 + 环上单调队列破环成链 / 洛谷 P4244 【模板】仙人掌直径 / 左程云《算法通关课》第200讲大结局
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { CACTUS_GRAPH_DP_CODES, CACTUS_GRAPH_DP_LINES } from './advanced-196-200-stage-codes';
import { Advanced196Step, renderCactusGraphDPBoard } from './advanced-196-200-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CactusGraphDPStep extends Advanced196Step {
  dfsStates: { u: number; dfn: number; low: number; f: number }[];
  currentCycle: { nodes: number[]; len: number; cycleSeq: number[] } | null;
  monotonicQueue: { pos: number; val: number }[];
  globalDiameter: number;
  phase: string;
}

export function buildCactusGraphDPSteps(): CactusGraphDPStep[] {
  const steps: CactusGraphDPStep[] = [];
  const lines = CACTUS_GRAPH_DP_LINES;

  const baseStates = [
    { u: 1, dfn: 1, low: 1, f: 0 },
    { u: 2, dfn: 2, low: 2, f: 0 },
    { u: 3, dfn: 3, low: 3, f: 0 },
    { u: 4, dfn: 4, low: 4, f: 0 },
  ];

  // Step 0: 入口帧
  steps.push({
    dfsStates: [
      { u: 1, dfn: 0, low: 0, f: 0 },
      { u: 2, dfn: 0, low: 0, f: 0 },
      { u: 3, dfn: 0, low: 0, f: 0 },
      { u: 4, dfn: 0, low: 0, f: 0 },
    ],
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 0,
    phase: '仙人掌图 DFS 初始化',
    decision: `主函数入口：开始求解仙人掌图的图上最长直径 (左神第 200 讲终极大课)`,
    message: `仙人掌图是每条边至多出现在一个简单环内的图；在 DFS 树上区分树枝边与返祖边进行环形分解`,
    log: `enter dfsCactus: root=1`,
    codeLine: lines.entry,
    metrics: { '课时编号': 'Class 200', '专题': '仙人掌图与圆方树DP' },
  });

  // Step 1: DFS 树枝边遍历与时间戳标记
  steps.push({
    dfsStates: baseStates,
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 0,
    phase: 'DFS 遍历生成 DFS 树',
    decision: `从根节点 1 出发 DFS：访问 1 -> 2 -> 3 -> 4，标记各点 dfn 与 low 时间戳`,
    message: `当前树枝链长度 3，已为各点分配唯一的时间戳`,
    log: `dfs tree path: 1 -> 2 -> 3 -> 4, dfn assigned`,
    codeLine: lines.initDfn,
    statusBadge: { text: 'DFS 树构建中', type: 'info' },
    metrics: { '当前搜索深度': 4, '时间戳': 4 },
  });

  // Step 2: 发现返祖边构成简单环
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 0 },
      { u: 2, dfn: 2, low: 1, f: 0 },
      { u: 3, dfn: 3, low: 1, f: 0 },
      { u: 4, dfn: 4, low: 1, f: 0 },
    ],
    currentCycle: { nodes: [1, 2, 3, 4], len: 4, cycleSeq: [1, 2, 3, 4, 1, 2, 3, 4] },
    monotonicQueue: [],
    globalDiameter: 0,
    phase: '返祖边 (4, 1) 检测到简单环',
    decision: `节点 4 探测到返祖边向点 1 (dfn[1] < dfn[4])：检测到 4 元简单环 [1, 2, 3, 4]！`,
    message: `low[4] 回传更新为 dfn[1]=1，环根为点 1，准备倍长破环成链`,
    log: `back-edge detected from 4 to 1: cycle length = 4`,
    codeLine: lines.updateBack,
    statusBadge: { text: '锁定简单环', type: 'warning' },
    metrics: { '环长 L': 4, '环根': '点 1' },
  });

  // Step 3: 单调队列处理倍增环上两点最长距离
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 0 },
      { u: 2, dfn: 2, low: 1, f: 1 },
      { u: 3, dfn: 3, low: 1, f: 1 },
      { u: 4, dfn: 4, low: 1, f: 1 },
    ],
    currentCycle: { nodes: [1, 2, 3, 4], len: 4, cycleSeq: [1, 2, 3, 4, 1, 2, 3, 4] },
    monotonicQueue: [
      { pos: 1, val: 1 },
      { pos: 2, val: 2 },
    ],
    globalDiameter: 3,
    phase: '单调队列滑动窗口求解环上最长直径',
    decision: `单调队列优化：维护窗口大小 <= L/2 (2) 的最优转移点，滑动计算 f[i] + f[j] + (i - j) 最大值`,
    message: `在环内最远对径点间计算出最大路径贡献为 3，更新仙人掌全局直径 = 3`,
    log: `monotonic queue cycle DP: max dist in cycle = 3`,
    codeLine: lines.solveCycle,
    statusBadge: { text: '环形 DP 完成', type: 'info' },
    metrics: { '窗口大小': 2, '环上直径': 3 },
  });

  // Step 4: 环根向上汇报与仙人掌全局最优收官
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 2 },
      { u: 2, dfn: 2, low: 1, f: 1 },
      { u: 3, dfn: 3, low: 1, f: 1 },
      { u: 4, dfn: 4, low: 1, f: 1 },
    ],
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 3,
    phase: '全局求解完成 (通关课 100~200 盛大圆满)',
    decision: `环根 1 汇总环内最长链向上回传 (f[1]=2)，仙人掌图全图直径最终锁定为 3！`,
    message: `左程云《算法通关课》Class 100 ~ 200 全套 101 门高阶算法课全景图谱至此全部完美通关！`,
    log: `cactus graph DP completed: global diameter = 3. ALL CLASSES 100-200 DONE!`,
    codeLine: lines.updateTree,
    statusBadge: { text: '第 200 讲终极通关', type: 'success' },
    metrics: { '仙人掌直径': 3, '课程进度': '100% 达成' },
  });

  return steps;
}

export const cactusGraphDPVisualizer = registerDeclarativeAlgorithm<CactusGraphDPStep>({
  id: 'cactus-graph-dp-200',
  name: '仙人掌图与仙人掌 DP (Class 200)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.cactusGraphDP,
  sourceCodes: CACTUS_GRAPH_DP_CODES,
  generateSteps: buildCactusGraphDPSteps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCactusGraphDPBoard(
          step.dfsStates,
          step.currentCycle,
          step.monotonicQueue,
          step.globalDiameter,
          step.phase
        )}
        ${renderFormulaCard(
          '仙人掌图环上单调队列 DP 状态转移方程',
          '\\text{Diameter}_{\\text{cycle}} = \\max_{1 \\le j < i \\le 2L, \\; i - j \\le \\lfloor L/2 \\rfloor} \\Big( f[i] + f[j] + (i - j) \\Big)',
          '每个简单环倍长为 $2L$ 展开为线段，在滑动窗口内使用单调队列维护 $f[j] - j$ 的最大值，将环上环形 DP 从 $O(L^2)$ 压制为严格的 $O(L)$ 线性复杂度！'
        )}
      </div>
    `;
  },
});
