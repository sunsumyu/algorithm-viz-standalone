/**
 * Class 173: 网络流最大流 Dinic 算法 (Dinic Maximum Flow)
 * 层次图 BFS + 多路增广 DFS + 当前弧优化 / 洛谷 P3376 【模板】网络最大流
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { DINIC_MAX_FLOW_CODES, DINIC_MAX_FLOW_LINES } from './advanced-173-178-stage-codes';
import { Advanced173Step, DinicEdgeView, renderDinicBoard } from './advanced-173-178-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DinicStep extends Advanced173Step {
  nodes: number[];
  edges: DinicEdgeView[];
  dep: Record<number, number>;
  maxFlow: number;
  stage: string;
}

export function buildDinicSteps(): DinicStep[] {
  const steps: DinicStep[] = [];
  const lines = DINIC_MAX_FLOW_LINES;

  const nodes = [1, 2, 3, 4];
  const edges: DinicEdgeView[] = [
    { u: 1, v: 2, cap: 3, flow: 0 },
    { u: 1, v: 3, cap: 2, flow: 0 },
    { u: 2, v: 3, cap: 1, flow: 0 },
    { u: 2, v: 4, cap: 2, flow: 0 },
    { u: 3, v: 4, cap: 3, flow: 0 },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: { 1: 0, 2: -1, 3: -1, 4: -1 },
    maxFlow: 0,
    stage: '准备网络流拓扑',
    decision: `主函数入口：开始在包含 ${nodes.length} 个节点与 ${edges.length} 条容量边的网络中计算源点 S=1 到汇点 T=4 的最大流`,
    message: `初始化所有正向边流量为 0，并建立对称的反向退流边`,
    log: `enter dinic: S=1, T=4`,
    codeLine: lines.entry,
    metrics: { '源点 S': 1, '汇点 T': 4, '节点数': 4, '边数': edges.length },
  });

  // Step 1: BFS 层次图分层
  const dep1 = { 1: 0, 2: 1, 3: 1, 4: 2 };
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: dep1,
    maxFlow: 0,
    stage: 'Round 1: BFS 层次图构建',
    decision: `BFS 遍历分层：dep[1]=0, dep[2]=1, dep[3]=1, dep[4]=2`,
    message: `增广流将严格沿 dep[v] = dep[u] + 1 的方向流动，避免零增广死循环`,
    log: `bfsLayer: Round 1, dep4=2`,
    codeLine: lines.bfsLayer,
    statusBadge: { text: '层次图构建成功', type: 'info' },
    metrics: { '汇点深度': 2, '增广层数': 1 },
  });

  // Step 2: DFS 多路增广与推流 (Path 1: 1->2->4 推流 2)
  edges[0].flow += 2; // 1->2
  edges[3].flow += 2; // 2->4 (满载)
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: dep1,
    maxFlow: 2,
    stage: 'DFS 多路增广 (1->2->4)',
    decision: `沿路径 1 -> 2 -> 4 成功推送流量 2 (瓶颈由边 2->4 容量 2 限制)`,
    message: `边 2->4 达到容量饱和，当前弧优化指针自动向前跳跃避免重复扫描`,
    log: `dfsAugment: path 1-2-4, flow=2`,
    codeLine: lines.dfsAugment,
    statusBadge: { text: '推送流量: 2', type: 'warning' },
    metrics: { '当前最大流': 2, '瓶颈边': '2 -> 4' },
  });

  // Step 3: DFS 多路增广 (Path 2: 1->3->4 推流 2)
  edges[1].flow += 2; // 1->3 (满载)
  edges[4].flow += 2; // 3->4
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: dep1,
    maxFlow: 4,
    stage: 'DFS 多路增广 (1->3->4)',
    decision: `沿路径 1 -> 3 -> 4 成功推送流量 2 (边 1->3 达到满载)`,
    message: `汇点累计接收流量提升至 4，第一轮 BFS 层次图内的增广能力完全榨干`,
    log: `dfsAugment: path 1-3-4, flow=2`,
    codeLine: lines.dfsAugment,
    statusBadge: { text: '推送流量: 2', type: 'warning' },
    metrics: { '当前最大流': 4, '瓶颈边': '1 -> 3' },
  });

  // Step 4: BFS 再次分层无法到达汇点 T
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: { 1: 0, 2: 1, 3: -1, 4: -1 },
    maxFlow: 4,
    stage: 'Round 2: BFS 层次图构建 (无可行路径)',
    decision: `再次运行 BFS：残量网络中源点已无法到达汇点 T (dep[T]=-1)`,
    message: `最小割容量等于最大流 4，根据最大流最小割定理，增广完全结束`,
    log: `bfsLayer: dep[T]=-1, break`,
    codeLine: lines.bfsLayer,
    statusBadge: { text: '残量网络无增广路', type: 'info' },
    metrics: { '最终最大流': 4, '状态': '达到最大流' },
  });

  // Step 5: 终态返回
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    dep: { 1: 0, 2: 1, 3: -1, 4: -1 },
    maxFlow: 4,
    stage: '网络最大流求解完成',
    decision: `🎉 Dinic 最大流计算完成：源点 S=1 到汇点 T=4 的最大流为 4`,
    message: `Dinic 结合层次图与当前弧优化，时间复杂度 O(V^2 E)，二分图匹配场景更具备 O(E sqrt(V)) 的极致性能`,
    log: `returnAns: maxFlow=4`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'MaxFlow = 4', type: 'success' },
    metrics: { '最大流 MaxFlow': 4, '理论复杂度': 'O(V^2 E)' },
  });

  return steps;
}

export const dinicMaxFlowVisualizer = registerDeclarativeAlgorithm<DinicStep>({
  id: 'dinic-max-flow-173',
  name: '网络流最大流 Dinic (Class 173)',
  category: 'graph',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 173,
  description: '左程云算法通关课 Class 173：网络流最大流 Dinic 算法。层次图分层 BFS + 多路增广 DFS + 当前弧优化，O(V^2 E) 求解网络最大流。',
  learningGoal: '深刻理解残量网络与反向弧退流机制，掌握 BFS 层次图定向与当前弧优化避免冗余搜索',
  problemHtml: ADVANCED_173_178_PROBLEMS.dinicMaxFlow.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.dinicMaxFlow.html,
  inputs: [
    {
      id: 'preset',
      label: '网络拓扑预设',
      type: 'select',
      defaultValue: 'standard_4node',
      options: [
        { label: '标准 4 节点网络流 (S=1, T=4, 最大流: 4)', value: 'standard_4node' },
      ],
    },
  ],
  codeLanguages: DINIC_MAX_FLOW_CODES,
  generateSteps: () => buildDinicSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderDinicBoard(step.nodes, step.edges, step.dep, step.maxFlow, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前弧优化</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">避免重复无效深搜</div>
          </div>
        </div>

        ${renderFormulaCard(
          'Dinic 最大流与最大流最小割定理',
          `层次边条件: dep[v] = dep[u] + 1 | 反向弧退流: cap[e] -= f, cap[e ^ 1] += f | 最大流 = 最小割容量`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
