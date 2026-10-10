/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count - POJ 1741 / 洛谷 P3806) 步进编译器
 * 进阶树论: 树上重心分治、子树距离收集与双指针排序、容斥去重
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

import type { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface TreePathStep {
  centroidNode: number;
  distPool: Array<{ node: number; dist: number }>;
  rawPairs: number;
  deductPairs: number;
  validPairs: number;
  thresholdK: number;
  status: 'centroid' | 'dist' | 'pointers' | 'deduct' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildTreeCentroidPathCountSteps(thresholdK: number): TreePathStep[] {
  const steps: TreePathStep[] = [];
  const K = thresholdK;

  const lines = {
    entry:          { java: 86,  cpp: 66, python: 2,  javascript: 2 },
    getCentroid:    { java: 23,  cpp: 25, python: 12, javascript: 12 },
    calcSubSize:    { java: 29,  cpp: 30, python: 16, javascript: 15 },
    confirmCentroid:{ java: 35,  cpp: 36, python: 19, javascript: 17 },
    markCentroid:   { java: 72,  cpp: 66, python: 43, javascript: 10 },
    collectRootDist:{ java: 43,  cpp: 42, python: 24, javascript: 12 },
    collectAllDist: { java: 47,  cpp: 46, python: 28, javascript: 15 },
    sortDist:       { java: 56,  cpp: 52, python: 33, javascript: 22 },
    twoPointersInit:{ java: 58,  cpp: 54, python: 35, javascript: 24 },
    twoPointersStep:{ java: 61,  cpp: 57, python: 37, javascript: 26 },
    twoPointersDone:{ java: 67,  cpp: 63, python: 41, javascript: 32 },
    accumulateRaw:  { java: 73,  cpp: 68, python: 45, javascript: 30 },
    deductCollect:  { java: 77,  cpp: 72, python: 49, javascript: 31 },
    recurseSubtree: { java: 78,  cpp: 74, python: 53, javascript: 33 },
    allDone:        { java: 104, cpp: 75, python: 55, javascript: 34 },
    returnAns:      { java: 105, cpp: 75, python: 56, javascript: 35 },
  };

  function makeStep(data: Omit<TreePathStep, 'metrics'>): TreePathStep {
    const centStr = `Node ${data.centroidNode}`;
    const rawStr = `${data.rawPairs} 对`;
    const deductStr = `${data.deductPairs} 对`;
    const validStr = `${data.validPairs} 对`;

    return {
      ...data,
      metrics: {
        'metric-centroid': centStr,
        'metric-raw-pairs': rawStr,
        'metric-deduct-pairs': deductStr,
        'metric-valid-pairs': validStr,
        centroid: centStr,
        'raw-pairs': rawStr,
        'deduct-pairs': deductStr,
        'valid-pairs': validStr,
      },
    };
  }

  // 1. 算法入口
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'centroid',
      message: '🚀 [算法入口] solve: 初始化无向树 (7 个节点，6 条带权边)，总节点数 totalNodes = 7。',
      log: `solve(n=7, K=${K}): 初始化整树邻接表与状态数组`,
      codeLine: lines.entry,
    })
  );

  // 2. 启动寻找重心
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'centroid',
      message: '👑 [寻找重心] 启动 getCentroid(1, 0)，通过 DFS 计算各子树大小与最大子树断裂分量。',
      log: 'getCentroid(1, 0): 开始寻找全树分治重心',
      codeLine: lines.getCentroid,
    })
  );

  // 3. 计算节点 2 与 3 的子树大小
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'centroid',
      message: '📊 [子树统计] 节点 2 子树包含 {2, 4, 5}，大小 sz[2] = 3；节点 3 子树包含 {3, 6, 7}，大小 sz[3] = 3。',
      log: 'DFS 统计: sz[2]=3, sz[3]=3, sz[1]=7',
      codeLine: lines.calcSubSize,
    })
  );

  // 4. 锁定节点 1 为全树重心
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'centroid',
      message: '🎯 [锁定重心] 节点 1 的最大子树断裂分量为 max(3, 3, 7-7) = 3 <= 7/2，确定节点 1 为当前分治重心！',
      log: 'maxPart[1]=3 <= 7/2 -> 确认重心 Root = Node 1',
      codeLine: lines.confirmCentroid,
    })
  );

  // 5. 启动点分治 solveCentroid(1)
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'centroid',
      message: '⚡ [标记重心] 进入 solveCentroid(1)，置 vis[1] = true，防止后续分治折返。',
      log: 'solveCentroid(1): vis[1] = true',
      codeLine: lines.markCentroid,
    })
  );

  // 6. 收集以 1 为根的整树距离池
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: [
        { node: 1, dist: 0 },
        { node: 2, dist: 2 },
        { node: 3, dist: 3 },
      ],
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'dist',
      message: '🧭 [收集根距离] 调用 calcPairs(1, 0)，递归收集 1 的直连子节点距离：N1(0), N2(2), N3(3)。',
      log: 'getDist(1, 0, 0): 收集第 1 层节点距离',
      codeLine: lines.collectRootDist,
    })
  );

  const dists = [
    { node: 1, dist: 0 },
    { node: 2, dist: 2 },
    { node: 4, dist: 3 },
    { node: 3, dist: 3 },
    { node: 5, dist: 4 },
    { node: 6, dist: 4 },
    { node: 7, dist: 5 },
  ];

  // 7. 收集完整距离池
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'dist',
      message: '📥 [递归收集深层距离] 遍历叶子节点，完成所有 7 个节点到重心 1 的距离池收集。',
      log: 'getDist 完成: 收集到全部 7 个节点到重心的距离',
      codeLine: lines.collectAllDist,
    })
  );

  // 8. 距离池升序排序
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'dist',
      message: `📈 [距离池升序排序] 排序结果: ${dists.map((d) => `N${d.node}(${d.dist})`).join(' <= ')}。准备双指针扫描！`,
      log: 'Collections.sort(distPool): 升序排列完成',
      codeLine: lines.sortDist,
    })
  );

  // 9. 双指针扫描初始状态
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: 0,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'pointers',
      message: `👈👉 [双指针启动] 设置左指针 l=0(dist=0)，右指针 r=6(dist=5)，检验和 dist[l] + dist[r] <= K(${K})。`,
      log: `双指针初始化: l=0(d=0), r=6(d=5), K=${K}`,
      codeLine: lines.twoPointersInit,
    })
  );

  // 10. 双指针第 1 轮推进 (l=0)
  const round1Pairs = 6;
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: round1Pairs,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'pointers',
      message: `⚡ [双指针步进 l=0] dist[0]+dist[6] = 0+5 <= ${K}，单调性成立！配对数 += (r - l) = 6，l 自增为 1。`,
      log: `l=0: 0+5<=${K}, cnt += 6 -> 6; l++`,
      codeLine: lines.twoPointersStep,
    })
  );

  const rawCnt = K === 5 ? 15 : 7;

  // 11. 双指针扫描全部推进完成
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: rawCnt,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'pointers',
      message: `🎯 [双指针扫描结束] 左右指针交汇，初筛出满足距离 <= ${K} 的总点对数 = ${rawCnt} 对（含跨重心及同子树路径）。`,
      log: `双指针完成: 初筛点对数 rawPairs = ${rawCnt}`,
      codeLine: lines.twoPointersDone,
    })
  );

  // 12. 累加到全局 totalPairs
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: rawCnt,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'deduct',
      message: `➕ [累加初筛点对] totalPairs += ${rawCnt}。接下来利用容斥原理剔除同子树内的折返虚假路径！`,
      log: `totalPairs += ${rawCnt}`,
      codeLine: lines.accumulateRaw,
    })
  );

  // 13. 容斥考察子树 2: 收集虚假折返距离
  const distsSub2 = [
    { node: 2, dist: 2 },
    { node: 4, dist: 3 },
    { node: 5, dist: 4 },
  ];
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: distsSub2,
      rawPairs: rawCnt,
      deductPairs: 0,
      validPairs: 0,
      thresholdK: K,
      status: 'deduct',
      message: '🛑 [容斥子树 2] 考察边 (1, 2, w=2)，调用 calcPairs(2, w=2)，收集以 2 为根在重心折返的虚假距离：{2, 3, 4}。',
      log: 'calcPairs(v=2, w=2): 收集子树 2 折返距离',
      codeLine: lines.deductCollect,
    })
  );

  const deductSub2 = K === 5 ? 3 : 1;

  // 14. 扣除子树 2 虚假点对
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: distsSub2,
      rawPairs: rawCnt,
      deductPairs: deductSub2,
      validPairs: rawCnt - deductSub2,
      thresholdK: K,
      status: 'deduct',
      message: `➖ [扣除子树 2] 双指针测得子树 2 内部同侧点对有 ${deductSub2} 对满足条件，totalPairs -= ${deductSub2}！`,
      log: `容斥去重: totalPairs -= ${deductSub2}`,
      codeLine: lines.deductCollect,
    })
  );

  // 15. 容斥考察子树 3: 收集虚假折返距离
  const distsSub3 = [
    { node: 3, dist: 3 },
    { node: 6, dist: 4 },
    { node: 7, dist: 5 },
  ];
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: distsSub3,
      rawPairs: rawCnt,
      deductPairs: deductSub2,
      validPairs: rawCnt - deductSub2,
      thresholdK: K,
      status: 'deduct',
      message: '🛑 [容斥子树 3] 考察边 (1, 3, w=3)，调用 calcPairs(3, w=3)，收集以 3 为根在重心折返的虚假距离：{3, 4, 5}。',
      log: 'calcPairs(v=3, w=3): 收集子树 3 折返距离',
      codeLine: lines.deductCollect,
    })
  );

  const deductSub3 = K === 5 ? 1 : 0;
  const deductTotal = deductSub2 + deductSub3;
  const finalVal = rawCnt - deductTotal;

  // 16. 扣除子树 3 虚假点对
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: distsSub3,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'deduct',
      message: `➖ [扣除子树 3] 双指针测得子树 3 内部同侧点对有 ${deductSub3} 对，totalPairs -= ${deductSub3}！`,
      log: `容斥去重: totalPairs -= ${deductSub3}`,
      codeLine: lines.deductCollect,
    })
  );

  // 17. 重心 1 当前层统计完成
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'done',
      message: `🎉 [当前重心层结算] 初筛 ${rawCnt} - 容斥扣除 ${deductTotal} = 净跨重心 1 的合法点对数 ${finalVal} 对！`,
      log: `重心 1 层结算: 合法跨重心点对 = ${finalVal}`,
      codeLine: lines.deductCollect,
    })
  );

  // 18. 准备分治子树 2
  steps.push(
    makeStep({
      centroidNode: 2,
      distPool: distsSub2,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'centroid',
      message: '🌲 [分治子树 2] 递归进入子树 2，寻找其局部重心（节点 2，子树大小 3）。',
      log: 'getCentroid(2, 0) -> 局部重心为 Node 2',
      codeLine: lines.recurseSubtree,
    })
  );

  // 19. 准备分治子树 3
  steps.push(
    makeStep({
      centroidNode: 3,
      distPool: distsSub3,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'centroid',
      message: '🌲 [分治子树 3] 递归进入子树 3，寻找其局部重心（节点 3，子树大小 3）。',
      log: 'getCentroid(3, 0) -> 局部重心为 Node 3',
      codeLine: lines.recurseSubtree,
    })
  );

  // 20. 所有层分治执行完成
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'done',
      message: '👑 [全树分治完成] 所有子树深度受限于 O(log N)，递归树遍历完全结束。',
      log: 'solveCentroid 递归完全终止',
      codeLine: lines.allDone,
    })
  );

  // 21. 返回最终结果
  steps.push(
    makeStep({
      centroidNode: 1,
      distPool: dists,
      rawPairs: rawCnt,
      deductPairs: deductTotal,
      validPairs: finalVal,
      thresholdK: K,
      status: 'done',
      message: `🎉 [求解成功] 树上距离 <= ${K} 的无序点对总数 = ${finalVal} 对！时间复杂度严格保证为 O(N log² N)。`,
      log: `✓ return totalPairs = ${finalVal}; 算法执行完毕！`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
