/**
 * Class 188: 强连通分量与 Tarjan 缩点 (Tarjan SCC & Condensation)
 * DFN/LOW 追溯值 + 栈维护极大强连通分量 + 缩点 DAG 化 / 洛谷 P3387 【模板】缩点
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { TARJAN_SCC_CODES, TARJAN_SCC_LINES } from './advanced-185-190-stage-codes';
import { Advanced185Step, renderTarjanSCCBoard } from './advanced-185-190-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TarjanSCCStep extends Advanced185Step {
  nodes: number[];
  dfn: Record<number, number>;
  low: Record<number, number>;
  inStack: Record<number, boolean>;
  sccs: number[][];
  stage: string;
}

export function buildTarjanSCCSteps(): TarjanSCCStep[] {
  const steps: TarjanSCCStep[] = [];
  const lines = TARJAN_SCC_LINES;

  const nodes = [1, 2, 3, 4];
  // 拓扑：1 -> 2 -> 3 -> 1 (环，形成 SCC {1, 2, 3})，3 -> 4 (4 是独立 SCC {4})

  // Step 0: 入口帧
  steps.push({
    nodes,
    dfn: { 1: 0, 2: 0, 3: 0, 4: 0 },
    low: { 1: 0, 2: 0, 3: 0, 4: 0 },
    inStack: { 1: false, 2: false, 3: false, 4: false },
    sccs: [],
    stage: '初始化 Tarjan 时间戳与栈',
    decision: `主函数入口：开始对 4 个顶点的有向图进行 Tarjan 强连通分量划分与 DAG 缩点`,
    message: `dfn 记录搜索时间戳，low 记录子树通过返祖边能触达的最早时间戳`,
    log: `enter tarjan scc: n=4`,
    codeLine: lines.entry,
    metrics: { '节点数': 4, '当前时间戳': 0, '已划分 SCC': 0 },
  });

  // Step 1: DFS 遍历 1 -> 2 -> 3
  steps.push({
    nodes,
    dfn: { 1: 1, 2: 2, 3: 3, 4: 0 },
    low: { 1: 1, 2: 2, 3: 3, 4: 0 },
    inStack: { 1: true, 2: true, 3: true, 4: false },
    sccs: [],
    stage: 'DFS 前向推进与入栈',
    decision: `DFS 递归深入：dfn[1]=1, dfn[2]=2, dfn[3]=3，节点 1, 2, 3 相继压入栈中`,
    message: `节点在栈中表示其仍在当前搜索链条上，等待闭环形成或判定独立`,
    log: `dfs path: 1 -> 2 -> 3`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '前向探测: 1->2->3', type: 'info' },
    metrics: { '栈深度': 3, '当前时间戳': 3 },
  });

  // Step 2: 节点 3 发现返祖边 3 -> 1，更新 low[3]=1
  steps.push({
    nodes,
    dfn: { 1: 1, 2: 2, 3: 3, 4: 0 },
    low: { 1: 1, 2: 1, 3: 1, 4: 0 },
    inStack: { 1: true, 2: true, 3: true, 4: false },
    sccs: [],
    stage: '发现返祖边 3 -> 1 (触发环更新)',
    decision: `节点 3 扫描到出边 3 -> 1，且节点 1 已在栈中：检测到有向环！`,
    message: `更新 low[3] = min(low[3], dfn[1]) = 1，回溯时传递更新 low[2] = 1, low[1] = 1`,
    log: `back-edge: 3 -> 1 in-stack, low updated to 1`,
    codeLine: lines.backEdge,
    statusBadge: { text: '锁定强连通环', type: 'warning' },
    metrics: { '环深度': 3, '回溯最小时间戳': 1 },
  });

  // Step 3: DFS 遍历独立分支 3 -> 4
  steps.push({
    nodes,
    dfn: { 1: 1, 2: 2, 3: 3, 4: 4 },
    low: { 1: 1, 2: 1, 3: 1, 4: 4 },
    inStack: { 1: true, 2: true, 3: false, 4: false },
    sccs: [[4]],
    stage: '节点 4 满足 dfn == low 独立出栈',
    decision: `DFS 遍历至 4，4 无出边，dfn[4] == low[4] = 4：弹出节点 4，形成独立 SCC #{4}`,
    message: `节点 4 无法回溯到任何祖先，自身构成极大强连通分量`,
    log: `scc popped: [4]`,
    codeLine: lines.popSCC,
    statusBadge: { text: '生成 SCC #1: {4}', type: 'info' },
    metrics: { '已生成 SCC 数': 1, '当前出栈点': 4 },
  });

  // Step 4: 回溯到节点 1，dfn[1] == low[1] 触发批量出栈
  steps.push({
    nodes,
    dfn: { 1: 1, 2: 2, 3: 3, 4: 4 },
    low: { 1: 1, 2: 1, 3: 1, 4: 4 },
    inStack: { 1: false, 2: false, 3: false, 4: false },
    sccs: [[4], [3, 2, 1]],
    stage: '回溯至根节点 1，弹出环中所有节点',
    decision: `回溯至 1，满足 dfn[1] == low[1] = 1：连续弹出栈中节点 3, 2, 1，合并为极大 SCC #{1, 2, 3}`,
    message: `环上的所有点成功聚合成同一个强连通巨点`,
    log: `scc popped: [3, 2, 1]`,
    codeLine: lines.popSCC,
    statusBadge: { text: '生成 SCC #2: {1, 2, 3}', type: 'success' },
    metrics: { '已生成 SCC 数': 2, '当前出栈分量': '{1, 2, 3}' },
  });

  // Step 5: 终态缩点成 DAG
  steps.push({
    nodes,
    dfn: { 1: 1, 2: 2, 3: 3, 4: 4 },
    low: { 1: 1, 2: 1, 3: 1, 4: 4 },
    inStack: { 1: false, 2: false, 3: false, 4: false },
    sccs: [[4], [1, 2, 3]],
    stage: 'Tarjan SCC 缩点完成',
    decision: `🎉 强连通分量划分完成：共划分为 2 个 SCC，缩点后有向图退化为 DAG: SCC_{1,2,3} &rarr; SCC_{4}`,
    message: `原图中的环被完全消除，新图满足拓扑偏序关系，可在其上运行拓扑排序与最长路 DP`,
    log: `tarjan finished: 2 sccs, dag built`,
    codeLine: lines.entry,
    statusBadge: { text: '缩点为 DAG', type: 'success' },
    metrics: { 'SCC 总数': 2, 'DAG 节点数': 2, '状态': '求解完成' },
  });

  return steps;
}

export const tarjanSCCVisualizer = registerDeclarativeAlgorithm<TarjanSCCStep>({
  id: 'tarjan-scc-condensation-188',
  name: '强连通分量与 Tarjan 缩点 (Class 188)',
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 188,
  description: '左程云算法通关课 Class 188：强连通分量与 Tarjan 缩点。DFN 时间戳与 LOW 追溯值维护，弹栈识别极大 SCC 并将有向图缩点转化为 DAG 有向无环图。',
  learningGoal: '掌握 DFN 与 LOW 的精确定义、返祖边更新准则与出栈缩点消除有向环的数学原理',
  problemHtml: ADVANCED_185_190_PROBLEMS.tarjanSCC.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.tarjanSCC.html,
  inputs: [
    {
      id: 'preset',
      label: '有向图拓扑预设',
      type: 'select',
      defaultValue: 'cycle_with_tail',
      options: [
        { label: '4 点经典环带尾图 (环: 1-2-3, 尾: 3->4)', value: 'cycle_with_tail' },
      ],
    },
  ],
  codeLanguages: TARJAN_SCC_CODES,
  generateSteps: () => buildTarjanSCCSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTarjanSCCBoard(
          step.nodes,
          step.dfn,
          step.low,
          step.inStack,
          step.sccs,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">缩点转化</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">有向有环图 => 有向无环图 (DAG)</div>
          </div>
        </div>

        ${renderFormulaCard(
          'Tarjan SCC 根判定准则',
          'dfn[u] == low[u] <=> u 为其所属极大强连通分量在搜索树上的最早根节点',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
