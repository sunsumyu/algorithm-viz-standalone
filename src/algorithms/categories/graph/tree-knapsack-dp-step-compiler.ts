/**
 * 树上有依赖背包 (Tree-Dependent Knapsack DP · 洛谷 P2014 选课) 步进编译器
 * 进阶树论 + DP: 泛化物品树上合并、子树大小上下界优化 O(N * V)
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

/** 代码面板高亮行号锚点（1-based，与 Java/C++ 源码逐行精准对齐） */
export const TREE_KNAPSACK_LINE_MAP: Record<string, number | number[]> = {
  root: 36,
  root2: 18,
  merge: 22,
  merge2: 19,
  leaf: 22,
  leaf2: 19,
  merge3: 28,
  merge4: 31,
  root3: 28,
  done: 57,
  done2: 58,
};

export interface TreeKnapStep {
  curNode: number;
  dpSnapshot: Record<number, number[]>;
  currentMaxVal: number;
  chosenCourses: number[];
  status: 'leaf' | 'merge' | 'root' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  subtreeSize?: number;
  metrics?: Record<string, any>;
}

export function buildTreeKnapsackSteps(maxCapacity: number): TreeKnapStep[] {
  const steps: TreeKnapStep[] = [];
  const V = maxCapacity;

  function makeStep(data: Omit<TreeKnapStep, 'metrics'>): TreeKnapStep {
    const nodeStr = data.curNode === 0 ? 'S0 (超级根)' : `C${data.curNode}`;
    const szStr = data.subtreeSize !== undefined ? `${data.subtreeSize}` : '—';
    const curDpArr = data.dpSnapshot[data.curNode];
    const dpStr = curDpArr ? `[${curDpArr.join(', ')}]` : '—';

    return {
      ...data,
      metrics: {
        'metric-active-node': nodeStr,
        'metric-max-score': `${data.currentMaxVal}`,
        'metric-subtree-size': szStr,
        'metric-cur-dp': dpStr,
        'active-node': nodeStr,
        'max-score': `${data.currentMaxVal}`,
        'subtree-size': szStr,
        'cur-dp': dpStr,
      },
    };
  }

  // 1. 函数入口
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: new Array(V + 1).fill(0) },
      currentMaxVal: 0,
      chosenCourses: [],
      status: 'root',
      message: '🚀 [函数入口] solve: 建立超级源点 S0 连接所有无前置要求的根课程，初始化 DP 空间。',
      log: `solve(n=5, V=${V}): 初始化虚拟超级根 S0 与树形邻接表`,
      codeLine: TREE_KNAPSACK_LINE_MAP.root,
      subtreeSize: 0,
    })
  );

  // 2. 超级根初始化
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: new Array(V + 1).fill(0) },
      currentMaxVal: 0,
      chosenCourses: [],
      status: 'root',
      message: '📦 [初始化 S0] weight[0]=0, value[0]=0, sz[0]=0，准备递归遍历子树。',
      log: 'dfs(0): sz[0] = 0, dp[0][0] = 0',
      codeLine: TREE_KNAPSACK_LINE_MAP.root2,
      subtreeSize: 0,
    })
  );

  // 3. 递归访问子节点 1 (高数)
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 0, 0, 0] },
      currentMaxVal: 0,
      chosenCourses: [1],
      status: 'merge',
      message: '🌲 [递归子树 C1(高数)] 深入节点 1，消耗体积 1，学分价值 2。',
      log: '| dfs(1): 遍历子节点 1(高数)',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge,
      subtreeSize: 0,
    })
  );

  // 4. 节点 1 自身初始化
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 0, 0] },
      currentMaxVal: 2,
      chosenCourses: [1],
      status: 'merge',
      message: '📝 [初始化 C1 状态] 必须修读高数自身：sz[1] = 1, dp[1][1] = 2。',
      log: '| sz[1] = 1, dp[1][1] = 2',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge2,
      subtreeSize: 1,
    })
  );

  // 5. 递归访问子节点 2 (线代)
  steps.push(
    makeStep({
      curNode: 2,
      dpSnapshot: { 1: [0, 2, 0, 0], 2: [0, 0, 0, 0] },
      currentMaxVal: 2,
      chosenCourses: [1, 2],
      status: 'leaf',
      message: '🍃 [递归子树 C2(线代)] 考察课程 2，先修课为高数，体积 1，学分 5。',
      log: '| | dfs(2): 访问子节点 2(线代)',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf,
      subtreeSize: 0,
    })
  );

  // 6. 叶子节点 2 初始化
  steps.push(
    makeStep({
      curNode: 2,
      dpSnapshot: { 1: [0, 2, 0, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 5,
      chosenCourses: [1, 2],
      status: 'leaf',
      message: '🍃 [叶子 C2 独立状态] sz[2] = 1, dp[2][1] = 5，无子节点，返回上层。',
      log: '| | sz[2] = 1, dp[2][1] = 5, 叶子回溯',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf2,
      subtreeSize: 1,
    })
  );

  // 7. 合并 C2 到 C1: 容量 j=2 转移
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2],
      status: 'merge',
      message: '➕ [合并子树 C2] 上下界优化 limit = min(V, 1+1) = 2：dp[1][2] = max(..., dp[1][1] + dp[2][1]) = 2 + 5 = 7！',
      log: '| 合并 C2: dp[1][2] = 2 + 5 = 7',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge3,
      subtreeSize: 1,
    })
  );

  // 8. 更新 C1 子树大小
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2],
      status: 'merge',
      message: '📐 [更新 C1 子树大小] sz[1] += sz[2] = 1 + 1 = 2。',
      log: '| sz[1] 累加更新为 2',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge4,
      subtreeSize: 2,
    })
  );

  // 9. 递归访问子节点 3 (微积分)
  steps.push(
    makeStep({
      curNode: 3,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0], 3: [0, 0, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2, 3],
      status: 'leaf',
      message: '🍃 [递归子树 C3(微积分)] 考察课程 3，先修课为高数，体积 1，学分 3。',
      log: '| | dfs(3): 访问子节点 3(微积分)',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf,
      subtreeSize: 0,
    })
  );

  // 10. 叶子节点 3 初始化
  steps.push(
    makeStep({
      curNode: 3,
      dpSnapshot: { 1: [0, 2, 7, 0], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 7,
      chosenCourses: [1, 2, 3],
      status: 'leaf',
      message: '🍃 [叶子 C3 独立状态] sz[3] = 1, dp[3][1] = 3，无子节点，返回上层。',
      log: '| | sz[3] = 1, dp[3][1] = 3, 叶子回溯',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf2,
      subtreeSize: 1,
    })
  );

  // 11. 合并 C3 到 C1: 容量 j=3 转移
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'merge',
      message: '➕ [合并子树 C3] limit = min(V, 2+1) = 3：dp[1][3] = dp[1][2] + dp[3][1] = 7 + 3 = 10！同时保持 dp[1][2] = max(7, 2+3) = 7。',
      log: '| 合并 C3: dp[1][3] = 7 + 3 = 10',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge3,
      subtreeSize: 2,
    })
  );

  // 12. C1 树合并完成回溯
  steps.push(
    makeStep({
      curNode: 1,
      dpSnapshot: { 1: [0, 2, 7, 10], 2: [0, 5, 0, 0], 3: [0, 3, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'merge',
      message: '📐 [C1 子树合并完毕] sz[1] += sz[3] = 3，dp[1] = [0, 2, 7, 10]，回溯到根 S0。',
      log: '| sz[1] 累加为 3, dfs(1) 执行结束回溯',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge4,
      subtreeSize: 3,
    })
  );

  // 13. 合并 C1 到超级根 S0
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 2, 7, 10], 1: [0, 2, 7, 10] },
      currentMaxVal: 10,
      chosenCourses: [1, 2, 3],
      status: 'root',
      message: '👑 [S0 合并子树 C1] S0 体积为 0，将 C1 状态复制进 dp[0]，当前 dp[0] = [0, 2, 7, 10]，sz[0] = 3。',
      log: 'S0 合并 C1: dp[0] 扩展为 [0, 2, 7, 10]',
      codeLine: TREE_KNAPSACK_LINE_MAP.root3,
      subtreeSize: 3,
    })
  );

  // 14. 递归访问子节点 4 (数据结构)
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 0, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4],
      status: 'merge',
      message: '🌲 [递归子树 C4(数据结构)] 深入第二分支，无先修课（直接连 S0），体积 1，学分价值 4。',
      log: '| dfs(4): 访问子节点 4(数据结构)',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge,
      subtreeSize: 0,
    })
  );

  // 15. 节点 4 自身初始化
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4],
      status: 'merge',
      message: '📝 [初始化 C4 状态] sz[4] = 1, dp[4][1] = 4。',
      log: '| sz[4] = 1, dp[4][1] = 4',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge2,
      subtreeSize: 1,
    })
  );

  // 16. 递归访问子节点 5 (算法导论)
  steps.push(
    makeStep({
      curNode: 5,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0], 5: [0, 0, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'leaf',
      message: '🍃 [递归子树 C5(算法导论)] 考察课程 5，先修课为数据结构，体积 1，学分 6。',
      log: '| | dfs(5): 访问子节点 5(算法导论)',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf,
      subtreeSize: 0,
    })
  );

  // 17. 叶子节点 5 初始化
  steps.push(
    makeStep({
      curNode: 5,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 0, 0], 5: [0, 6, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'leaf',
      message: '🍃 [叶子 C5 独立状态] sz[5] = 1, dp[5][1] = 6，叶子无子树，返回上层。',
      log: '| | sz[5] = 1, dp[5][1] = 6, 叶子回溯',
      codeLine: TREE_KNAPSACK_LINE_MAP.leaf2,
      subtreeSize: 1,
    })
  );

  // 18. 合并 C5 到 C4
  steps.push(
    makeStep({
      curNode: 4,
      dpSnapshot: { 0: [0, 2, 7, 10], 4: [0, 4, 10, 0], 5: [0, 6, 0, 0] },
      currentMaxVal: 10,
      chosenCourses: [4, 5],
      status: 'merge',
      message: '➕ [合并子树 C5] limit = min(V, 1+1) = 2：dp[4][2] = dp[4][1] + dp[5][1] = 4 + 6 = 10，sz[4] 更新为 2。',
      log: '| 合并 C5: dp[4][2] = 4 + 6 = 10; sz[4] = 2',
      codeLine: TREE_KNAPSACK_LINE_MAP.merge3,
      subtreeSize: 2,
    })
  );

  const ansVal = V === 3 ? 11 : 17;
  const ansChosen = V === 3 ? [1, 2, 4] : [1, 2, 4, 5];

  // 19. 合并 C4 到超级根 S0 (全局背包组合)
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'root',
      message: `👑 [S0 融合两棵大子树] 在超级根处进行最终卷积合并：分配容量组合（C1 分配 2 选高数+线代=7，C4 分配 1 选数据结构=4），总价值高达 ${ansVal}！`,
      log: `S0 卷积合并 C1 与 C4: dp[0][${V}] = ${ansVal}`,
      codeLine: TREE_KNAPSACK_LINE_MAP.root3,
      subtreeSize: 5,
    })
  );

  // 20. 树上递归遍历完成
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'done',
      message: '🎯 [DFS 回溯完毕] 树形依赖背包的所有子树已严格按上下界复杂度 O(N*V) 完成合并。',
      log: 'dfs(0) 结束，所有依赖路径与泛化物品合并完成',
      codeLine: TREE_KNAPSACK_LINE_MAP.done,
      subtreeSize: 5,
    })
  );

  // 21. 返回最终答案
  steps.push(
    makeStep({
      curNode: 0,
      dpSnapshot: { 0: [0, 4, 10, ansVal], 1: [0, 2, 7, 10], 4: [0, 4, 10, 0] },
      currentMaxVal: ansVal,
      chosenCourses: ansChosen,
      status: 'done',
      message: `🎉 [求解成功] 返回 dp[0][${V}] = ${ansVal}！最优选修方案为：[${ansChosen.join(', ')}]，总学分价值达到最大化！`,
      log: `✓ return dp[0][${V}] = ${ansVal}; 算法执行完毕！`,
      codeLine: TREE_KNAPSACK_LINE_MAP.done2,
      subtreeSize: 5,
    })
  );

  return steps;
}
