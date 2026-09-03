/**
 * 树上路径相交判定与 LCA 包含定理 (Tree Path Intersection & LCA) 声明式可视化器
 * 进阶树论: 路径相交充要条件 LCA(P1) in P2 or LCA(P2) in P1
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_PATH_INTERSECT_CODE_LANGUAGES,
  TREE_PATH_INTERSECT_PROBLEM_HTML,
  TREE_PATH_INTERSECT_ANALYSIS_HTML,
} from './tree-path-intersection-problem-content';

export interface TreeIntersectStep {
  path1: [number, number];
  path2: [number, number];
  lca1: number;
  lca2: number;
  isIntersect: boolean;
  overlapNodes?: number[];
  status: 'init' | 'dfs' | 'calc_lca' | 'verify' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, any>;
}

export function buildTreePathIntersectSteps(isIntersectCase: boolean): TreeIntersectStep[] {
  const steps: TreeIntersectStep[] = [];

  function makeStep(data: Omit<TreeIntersectStep, 'metrics'>): TreeIntersectStep {
    const l1Str = data.lca1 ? `Node ${data.lca1}` : '—';
    const l2Str = data.lca2 ? `Node ${data.lca2}` : '—';
    const resStr =
      data.status === 'done'
        ? data.isIntersect
          ? '✓ 路径相交'
          : '❌ 路径不相交'
        : '判定中...';
    const overlapStr =
      data.overlapNodes && data.overlapNodes.length > 0
        ? `[${data.overlapNodes.join(', ')}]`
        : data.status === 'done'
          ? '无'
          : '—';

    return {
      ...data,
      metrics: {
        'metric-lca-p1': l1Str,
        'metric-lca-p2': l2Str,
        'metric-intersect-result': resStr,
        'metric-overlap-nodes': overlapStr,
        'lca-p1': l1Str,
        'lca-p2': l2Str,
        'intersect-result': resStr,
        'overlap-nodes': overlapStr,
      },
    };
  }

  if (isIntersectCase) {
    // 相交用例: P1=(4,5), P2=(4,6) -> LCA1=2, LCA2=1, 交集=[2,4]
    const p1: [number, number] = [4, 5];
    const p2: [number, number] = [4, 6];

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'init',
        message: '🚀 [算法入口] solve: 给定待判定路径 P1=(4 ➔ 5) 与 P2=(4 ➔ 6)，初始化树拓扑。',
        log: 'solve: 输入 P1=(4,5), P2=(4,6)',
        codeLine: 68,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 预处理] dfs(1, 0, 1): 访问根节点 1，记录 depth[1] = 1，父节点 up[1][0] = 0。',
        log: 'dfs(1, 0, 1): depth[1]=1',
        codeLine: 16,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 遍历左支] dfs(2, 1, 2): 深入左子节点 2，depth[2] = 2，up[2][0] = 1。',
        log: 'dfs(2, 1, 2): depth[2]=2',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🍃 [DFS 遍历左叶 4] dfs(4, 2, 3): 节点 4 的深度 depth[4] = 3，up[4][0] = 2。',
        log: 'dfs(4, 2, 3): depth[4]=3',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🍃 [DFS 遍历右叶 5] dfs(5, 2, 3): 节点 5 的深度 depth[5] = 3，up[5][0] = 2。',
        log: 'dfs(5, 2, 3): depth[5]=3',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 遍历右支] dfs(3, 1, 2): 回溯后深入右子节点 3，depth[3] = 2，up[3][0] = 1。',
        log: 'dfs(3, 1, 2): depth[3]=2',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '🍃 [DFS 遍历叶子 6与7] dfs(6, 3, 3) 与 dfs(7, 3, 3): 记录深度均为 3。',
        log: 'dfs 遍历完毕: depth[6]=3, depth[7]=3',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'dfs',
        message: '📈 [倍增表构建] up[u][i] = up[up[u][i-1]][i-1]，2^i 级祖先关系倍增预处理完毕。',
        log: '倍增表预处理递推完成',
        codeLine: 18,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'calc_lca',
        message: '⚡ [相交判定入口] isPathsIntersect: 开始进行路径相交判定定理检验。',
        log: '进入 isPathsIntersect(4, 5, 4, 6)',
        codeLine: 59,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🔍 [求解 P1 最近公共祖先] 调用 getLCA(4, 5)，准备向上跳跃检索。',
        log: 'getLCA(4, 5): 开始倍增跳跃',
        codeLine: 60,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🎯 [锁定 LCA1] 节点 4 与 5 的最近公共祖先为节点 2：LCA(P1) = 2。',
        log: 'LCA(4, 5) = 2',
        codeLine: 45,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 0,
        isIntersect: true,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🔍 [求解 P2 最近公共祖先] 调用 getLCA(4, 6)，分属左右两大子树。',
        log: 'getLCA(4, 6): 开始倍增跳跃',
        codeLine: 61,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🎯 [锁定 LCA2] 节点 4 与 6 在根节点相交汇：LCA(P2) = 1。',
        log: 'LCA(4, 6) = 1',
        codeLine: 45,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [],
        status: 'verify',
        message: '🧪 [充要检验 1] 检验 LCA(P1)=2 是否位于路径 P2=(4, 6) 上：isNodeOnPath(2, 4, 6)。',
        log: 'isNodeOnPath(x=2, u=4, v=6)',
        codeLine: 62,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [],
        status: 'verify',
        message: '📐 [计算树上距离 dis(4, 2)] depth[4](3) + depth[2](2) - 2*depth[2](2) = 1。',
        log: 'dis(4, 2) = 1',
        codeLine: 49,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [],
        status: 'verify',
        message: '📐 [计算树上距离 dis(2, 6)] depth[2](2) + depth[6](3) - 2*depth[1](1) = 3。',
        log: 'dis(2, 6) = 3',
        codeLine: 49,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [],
        status: 'verify',
        message: '📐 [计算全路径距离 dis(4, 6)] depth[4](3) + depth[6](3) - 2*depth[1](1) = 4。',
        log: 'dis(4, 6) = 4',
        codeLine: 49,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [2, 4],
        status: 'verify',
        message: '✨ [三角等式满足] dis(4, 2) + dis(2, 6) = 1 + 3 = 4 == dis(4, 6)！LCA(P1)=2 严格位于路径 P2 上！',
        log: 'dis(4, 2) + dis(2, 6) == dis(4, 6) 成立，LCA1 位于 P2',
        codeLine: 55,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [2, 4],
        status: 'verify',
        message: '✅ [充要条件一侧成立] on1 = true，逻辑或短路，无需继续校验 on2！',
        log: 'on1 = true, 判定相交成立',
        codeLine: 62,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [2, 4],
        status: 'done',
        message: '🎉 [相交判定成功] 路径 P1=(4➔2➔5) 与 P2=(4➔2➔1➔3➔6) 相交！交集包含节点 [2, 4]！',
        log: 'isPathsIntersect 返回 true: 路径相交于节点 2 和 4',
        codeLine: 64,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 1,
        isIntersect: true,
        overlapNodes: [2, 4],
        status: 'done',
        message: '✓ [算法执行完毕] 返回 true。单次查询仅需 O(log N) 树上倍增与距离判定！',
        log: '✓ return true; 算法执行完毕！',
        codeLine: 81,
      })
    );
  } else {
    // 不相交用例: P1=(4,5), P2=(6,7) -> LCA1=2, LCA2=3, 交集=[]
    const p1: [number, number] = [4, 5];
    const p2: [number, number] = [6, 7];

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'init',
        message: '🚀 [算法入口] solve: 给定待判定路径 P1=(4 ➔ 5) 与 P2=(6 ➔ 7)，初始化树拓扑。',
        log: 'solve: 输入 P1=(4,5), P2=(6,7)',
        codeLine: 68,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 预处理] dfs(1, 0, 1): 访问根节点 1，depth[1] = 1。',
        log: 'dfs(1, 0, 1): depth[1]=1',
        codeLine: 16,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 遍历左支] dfs(2, 1, 2): 深入节点 2，depth[2] = 2。',
        log: 'dfs(2, 1, 2): depth[2]=2',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '🍃 [DFS 遍历左叶 4与5] dfs(4, 2, 3) 与 dfs(5, 2, 3): depth[4]=3, depth[5]=3。',
        log: 'dfs 遍历左叶完成',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '🌲 [DFS 遍历右支] dfs(3, 1, 2): 深入节点 3，depth[3] = 2。',
        log: 'dfs(3, 1, 2): depth[3]=2',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '🍃 [DFS 遍历右叶 6与7] dfs(6, 3, 3) 与 dfs(7, 3, 3): depth[6]=3, depth[7]=3。',
        log: 'dfs 遍历右叶完成',
        codeLine: 21,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'dfs',
        message: '📈 [倍增表构建] up[u][i] = up[up[u][i-1]][i-1] 全部构建完毕。',
        log: '倍增表构建完毕',
        codeLine: 18,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'calc_lca',
        message: '⚡ [相交判定入口] isPathsIntersect: 开始进行路径相交判定定理检验。',
        log: '进入 isPathsIntersect(4, 5, 6, 7)',
        codeLine: 59,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 0,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🔍 [求解 P1 最近公共祖先] 调用 getLCA(4, 5)。',
        log: 'getLCA(4, 5)',
        codeLine: 60,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🎯 [锁定 LCA1] 节点 4 与 5 的最近公共祖先为节点 2：LCA(P1) = 2。',
        log: 'LCA(4, 5) = 2',
        codeLine: 45,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 0,
        isIntersect: false,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🔍 [求解 P2 最近公共祖先] 调用 getLCA(6, 7)。',
        log: 'getLCA(6, 7)',
        codeLine: 61,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'calc_lca',
        message: '🎯 [锁定 LCA2] 节点 6 与 7 的最近公共祖先为节点 3：LCA(P2) = 3。',
        log: 'LCA(6, 7) = 3',
        codeLine: 45,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '🧪 [充要检验 1] 检验 LCA(P1)=2 是否位于路径 P2=(6, 7) 上：isNodeOnPath(2, 6, 7)。',
        log: 'isNodeOnPath(x=2, u=6, v=7)',
        codeLine: 62,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '📐 [计算树上距离] dis(6, 2) = 3, dis(2, 7) = 3, 总和 = 6；而全路径 dis(6, 7) = 2。',
        log: 'dis(6, 2) + dis(2, 7) = 6 != dis(6, 7)(2)',
        codeLine: 49,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '❌ [前件不成立] 6 != 2，节点 2 不在路径 P2 上，on1 = false。',
        log: 'on1 = false',
        codeLine: 55,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '🧪 [充要检验 2] 检验 LCA(P2)=3 是否位于路径 P1=(4, 5) 上：isNodeOnPath(3, 4, 5)。',
        log: 'isNodeOnPath(x=3, u=4, v=5)',
        codeLine: 63,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '📐 [计算树上距离] dis(4, 3) = 3, dis(3, 5) = 3, 总和 = 6；而全路径 dis(4, 5) = 2。',
        log: 'dis(4, 3) + dis(3, 5) = 6 != dis(4, 5)(2)',
        codeLine: 49,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'verify',
        message: '❌ [后件不成立] 6 != 2，节点 3 亦不在路径 P1 上，on2 = false。',
        log: 'on2 = false',
        codeLine: 55,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'done',
        message: '🛑 [综合判定] on1 = false 且 on2 = false，相交判定定理充要条件全不满足！',
        log: 'on1 || on2 = false',
        codeLine: 64,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'done',
        message: '❌ [判定不相交] 路径 P1=(4➔2➔5) 与 P2=(6➔3➔7) 处于树的不同子分支，交集为空！',
        log: 'isPathsIntersect 返回 false: 两路径互不相交',
        codeLine: 64,
      })
    );

    steps.push(
      makeStep({
        path1: p1,
        path2: p2,
        lca1: 2,
        lca2: 3,
        isIntersect: false,
        overlapNodes: [],
        status: 'done',
        message: '✓ [算法执行完毕] 返回 false。树上路径相交判定完毕！',
        log: '✓ return false; 算法执行完毕！',
        codeLine: 81,
      })
    );
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeIntersectStep>({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: 'LCA 包含定理 O(1) 判定',
    complexity: 'O(log N) · O(N log N)',
  },
  card1Title: '🌲 树形拓扑与双路径高亮沙盘',
  card2Title: '🧭 LCA 包含判定监视器',
  card2Desc: 'LCA(P1)、LCA(P2) 树上深度与路径包含关系验证',
  legend: [
    { label: '路径一 (P1)', color: '#38bdf8' },
    { label: '路径二 (P2)', color: '#f59e0b' },
    { label: '🟢 相交交集点', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-intersect-case',
      label: '判定用例',
      type: 'select',
      defaultValue: 'intersect',
      options: [
        { label: '相交路径用例: (4,5) 与 (4,6)', value: 'intersect' },
        { label: '不相交用例: (4,5) 与 (6,7)', value: 'disjoint' },
      ],
      width: '210px',
    },
  ],
  presets: [
    { label: '相交路径 (4,5) & (4,6)', values: { 'input-intersect-case': 'intersect' } },
    { label: '不相交路径 (4,5) & (6,7)', values: { 'input-intersect-case': 'disjoint' } },
  ],
  metrics: [
    { id: 'metric-lca-p1', label: 'LCA(P1)', color: '#38bdf8' },
    { id: 'metric-lca-p2', label: 'LCA(P2)', color: '#f59e0b' },
    { id: 'metric-intersect-result', label: '相交结论', color: '#10b981' },
    { id: 'metric-overlap-nodes', label: '交集节点', color: '#a855f7' },
  ],
  codeLanguages: TREE_PATH_INTERSECT_CODE_LANGUAGES,
  problemHtml: TREE_PATH_INTERSECT_PROBLEM_HTML,
  analysisHtml: TREE_PATH_INTERSECT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isIntersect = (inputs['input-intersect-case'] || 'intersect') === 'intersect';
    return buildTreePathIntersectSteps(isIntersect);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 95 },
      3: { x: 215, y: 95 },
      4: { x: 65, y: 165 },
      5: { x: 125, y: 165 },
      6: { x: 185, y: 165 },
      7: { x: 245, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
      { u: 3, v: 6 },
      { u: 3, v: 7 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLCA1 = step.lca1 === u;
        const isLCA2 = step.lca2 === u;
        const bg = isLCA1 && isLCA2 ? '#10b981' : isLCA1 ? '#0284c7' : isLCA2 ? '#f59e0b' : '#1e293b';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="#ffffff" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            ${isLCA1 ? `<text x="${p.x}" y="${p.y - 18}" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">LCA1</text>` : ''}
            ${isLCA2 ? `<text x="${p.x}" y="${p.y + 26}" fill="#facc15" font-size="8.5" font-weight="700" text-anchor="middle">LCA2</text>` : ''}
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          相交充要条件：两路径相交 ⟺ LCA(P1) 位于 P2 上 或 LCA(P2) 位于 P1 上
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-path-intersection-view');
    if (root) {
      const l1El = root.querySelector('#metric-lca-p1') || root.querySelector('#lca-p1');
      const l2El = root.querySelector('#metric-lca-p2') || root.querySelector('#lca-p2');
      const resEl = root.querySelector('#metric-intersect-result') || root.querySelector('#intersect-result');
      const ovEl = root.querySelector('#metric-overlap-nodes') || root.querySelector('#overlap-nodes');

      if (l1El) l1El.textContent = step.lca1 ? `Node ${step.lca1}` : '—';
      if (l2El) l2El.textContent = step.lca2 ? `Node ${step.lca2}` : '—';
      if (resEl) {
        const el = resEl as HTMLElement;
        if (step.status === 'done') {
          el.textContent = step.isIntersect ? '✓ 路径相交' : '❌ 路径不相交';
          el.style.color = step.isIntersect ? '#10b981' : '#ef4444';
        } else {
          el.textContent = '判定中...';
          el.style.color = '#38bdf8';
        }
      }
      if (ovEl) {
        ovEl.textContent =
          step.overlapNodes && step.overlapNodes.length > 0
            ? `[${step.overlapNodes.join(', ')}]`
            : step.status === 'done'
              ? '无'
              : '—';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 LCA 包含定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">isOnPath(LCA1, P2) || isOnPath(LCA2, P1)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
  viewId: 'algo-tree-path-intersection-view',
  category: 'graph',
  description: '进阶树论定理：树上两条路径相交的充要条件判定、LCA 深度包含关系与 O(1) 快速检验',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 68,
  learningGoal: '掌握树上路径相交的 LCA 包含定理数学证明及快速判定技巧',
});

export { Visualizer as TreePathIntersectionVisualizer };
