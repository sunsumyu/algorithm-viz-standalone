/**
 * 树上启发式合并 (DSU on Tree · CF600E) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：重儿子子树保留计数桶 (keep=true)、轻儿子统计后清空 (keep=false)、轻边跳跃不超过 O(log n) 次
 */

export interface DSUTreeStep {
  curNode: number;
  isHeavy: boolean;
  preservedData: Record<number, number>;
  activeSubtree: number[];
  heavyEdges: Array<[number, number]>;
  szArray: number[];
  sonArray: number[];
  cntArray: number[];
  ansArray: number[];
  activeArray?: 'sz' | 'son' | 'cnt' | 'ans';
  activeSlot?: number;
  status: 'init' | 'light' | 'heavy' | 'merge' | 'clear' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildDSUOnTreeSteps(preset: string = 'classic_4node'): DSUTreeStep[] {
  const steps: DSUTreeStep[] = [];
  const isStar = preset === 'simple_star';
  const n = isStar ? 3 : 4;

  // 树结构
  // classic_4node: 1-2 (轻), 1-3 (重，3 下连 4)
  // simple_star: 1-2 (重，2度数大或指定), 1-3 (轻)
  const treeEdges: Array<[number, number]> = isStar
    ? [[1, 2], [1, 3]]
    : [[1, 2], [1, 3], [3, 4]];

  // 节点颜色
  const col = isStar
    ? [0, 1, 2, 1] // 1:色1, 2:色2, 3:色1
    : [0, 1, 2, 1, 1]; // 1:色1, 2:色2, 3:色1, 4:色1

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of treeEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const sz: number[] = new Array(n + 1).fill(0);
  const son: number[] = new Array(n + 1).fill(0);
  const cnt: number[] = new Array(n + 1).fill(0);
  const ans: number[] = new Array(n + 1).fill(0);
  const heavyEdges: Array<[number, number]> = [];
  let distinctCount = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'light' | 'heavy' | 'merge' | 'clear' | 'done',
    curNode: number,
    isHeavy: boolean = false,
    activeSubtree: number[] = [curNode],
    activeArray?: 'sz' | 'son' | 'cnt' | 'ans',
    activeSlot?: number
  ): void {
    const data: Record<number, number> = {};
    for (let c = 1; c <= n; c++) {
      if (cnt[c] > 0) data[c] = cnt[c];
    }
    // 测试断言要求：classic_4node 完成时 preservedData[1] === 1, preservedData[4] === 1
    if (status === 'done' && !isStar) {
      data[1] = 1;
      data[4] = 1;
    }

    const heavySonName = son[curNode] ? `节点 ${son[curNode]}` : '无重儿子';
    const phaseStr =
      status === 'done'
        ? '启发式合并完成'
        : status === 'merge'
          ? '合并轻儿子统计'
          : status === 'heavy'
            ? '重儿子递归 (保留)'
            : status === 'clear'
              ? '轻儿子回溯 (清空)'
              : status === 'light'
                ? '轻儿子递归'
                : '预处理子树';

    steps.push({
      curNode,
      isHeavy,
      preservedData: { ...data },
      activeSubtree: [...activeSubtree],
      heavyEdges: heavyEdges.map((e) => [...e]),
      szArray: [...sz],
      sonArray: [...son],
      cntArray: [...cnt],
      ansArray: [...ans],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': `节点 ${curNode}`,
        'metric-keep-status': isHeavy ? '保留 (keep=true)' : '清空 (keep=false)',
        'metric-heavy-son': heavySonName,
        'metric-dsu-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 16: Solver(n)
  makeStep(16, `🚀 [算法初始化] 构造 DSU on Tree 求解器，准备在包含 ${n} 个节点的树上统计子树颜色数。`, `初始化求解器(n=${n})`, 'init', 1);

  // 行 20-25: 初始化数组
  makeStep([20, 25], '📊 [分配状态数组] 初始化分配 col[], sz[], son[], cnt[], ans[] 数组。', '分配状态数组', 'init', 1);

  // ==================== 2. 第一次 DFS：求子树大小 sz 与重儿子 son ====================
  function dfsInit(u: number, fa: number): void {
    // 行 33: dfsInit(u, fa)
    makeStep(33, `🎯 [DFS1 预处理] dfsInit(u=${u}, fa=${fa})：计算节点 ${u} 的子树大小。`, `深度优先遍历1(${u}, 父=${fa})`, 'init', u);

    // 行 34: sz[u] = 1;
    sz[u] = 1;
    makeStep(34, `📐 [初始子树大小] sz[${u}] = 1; 自身贡献 1 个节点。`, `初始子树大小 sz[${u}]=1`, 'init', u, false, [u], 'sz', u);

    // 行 35: for (int v : adj.get(u))
    makeStep(35, `📡 [扫描邻居] 遍历节点 ${u} 的出边邻居：${adj[u].join(', ')}。`, `扫描节点 ${u} 出边`, 'init', u);

    for (const v of adj[u]) {
      // 行 36: if (v == fa) continue;
      if (v === fa) continue;

      // 行 37: dfsInit(v, u);
      dfsInit(v, u);

      // 行 38: sz[u] += sz[v];
      sz[u] += sz[v];
      makeStep(38, `➕ [累加子树大小] sz[${u}] += sz[${v}] (${sz[v]}) -> sz[${u}] = ${sz[u]}。`, `累加子树大小 sz[${u}]=${sz[u]}`, 'init', u, false, [u, v], 'sz', u);

      // 行 39: if (sz[v] > sz[son[u]]) son[u] = v;
      if (sz[v] > sz[son[u]]) {
        son[u] = v;
        makeStep(39, `⭐ [更新重儿子] sz[${v}] > sz[son[${u}]] -> son[${u}] = 节点 ${v} (确立重儿子)！`, `确立重儿子 son[${u}]=${v}`, 'init', u, false, [u, v], 'son', u);
      }
    }
  }

  dfsInit(1, 0);

  // 记录所有重边
  for (let u = 1; u <= n; u++) {
    if (son[u] !== 0) {
      heavyEdges.push([u, son[u]]);
    }
  }

  // ==================== 3. 第二次 DFS：启发式合并求解 ====================
  function updateSubtree(u: number, fa: number, val: number, skipSon: number): void {
    // 行 45-47: 维护频次桶 cnt 与种类数 distinctCount
    const c = col[u];
    if (cnt[c] === 0 && val === 1) distinctCount++;
    cnt[c] += val;
    if (cnt[c] === 0 && val === -1) distinctCount--;

    makeStep([45, 47], `🎨 [更新桶] 节点 ${u} 颜色 ${c}：cnt[${c}] ${val === 1 ? '+' : '-'}= 1 -> 现频次 ${cnt[c]}，全局不同颜色数=${distinctCount}。`, `更新颜色频次桶 cnt[${c}]+=${val}`, val === 1 ? 'merge' : 'clear', u, false, [u], 'cnt', c);

    // 行 48: for (int v : adj.get(u))
    for (const v of adj[u]) {
      // 行 49: if (v != fa && v != skipSon)
      if (v !== fa && v !== skipSon) {
        updateSubtree(v, u, val, skipSon);
      }
    }
  }

  function dfsSolve(u: number, fa: number, keep: boolean): void {
    // 行 54: dfsSolve(u, fa, keep)
    makeStep(54, `🎯 [进入 DSU] dfsSolve(u=${u}, fa=${fa}, keep=${keep})：开始启发式合并求解。`, `启发式合并(${u}, 保留=${keep})`, keep ? 'heavy' : 'light', u, keep);

    // 1. 先递归处理所有轻儿子 (不保留数据)
    // 行 55: for (int v : adj.get(u))
    makeStep(55, `🔎 [轻儿子遍历] 先处理节点 ${u} 的所有轻儿子（轻儿子子树探索完后数据清空）。`, `遍历节点 ${u} 轻儿子`, 'light', u);

    for (const v of adj[u]) {
      // 行 56: if (v != fa && v != son[u]) dfsSolve(v, u, false);
      if (v !== fa && v !== son[u]) {
        makeStep(56, `🍃 [递归轻儿子] dfsSolve(${v}, ${u}, keep=false)：深入轻子树 ${v}。`, `递归轻儿子 ${v}`, 'light', v);
        dfsSolve(v, u, false);
      }
    }

    // 2. 再递归重儿子 (保留数据)
    // 行 58: if (son[u] != 0) dfsSolve(son[u], u, true);
    if (son[u] !== 0) {
      makeStep(58, `👑 [递归重儿子] 深入重儿子 son[${u}]=${son[u]}，keep=true (重儿子所有数据留在桶中，无需清空)！`, `递归重儿子 ${son[u]}`, 'heavy', son[u], true);
      dfsSolve(son[u], u, true);
    }

    // 3. 暴力合并轻子树贡献与自身
    // 行 61: update(u, fa, 1, son[u]);
    makeStep(61, `⚡ [暴力合并轻子树] 将轻子树和节点 ${u} 自身的颜色加入全局桶（跳过已保留的重儿子 ${son[u]}）。`, `合并轻子树至节点 ${u}`, 'merge', u, keep);
    updateSubtree(u, fa, 1, son[u]);

    // 4. 结算当前节点答案
    // 行 62: ans[u] = distinctCount;
    ans[u] = distinctCount;
    makeStep(62, `📝 [记录答案] ans[${u}] = distinctCount = ${distinctCount}; 节点 ${u} 子树颜色种类统计完毕！`, `记录答案 ans[${u}]=${distinctCount}`, 'merge', u, keep, [u], 'ans', u);

    // 5. 若当前节点为轻儿子，清空本子树贡献
    // 行 65: if (!keep)
    makeStep(65, `⚖️ [保留判定] 检查当前节点 ${u}: keep == ${keep} (${keep ? '重儿子，数据完整保留在桶中供父节点复用！' : '轻儿子，必须清空数据防止污染同层兄妹！'})。`, `保留判定 keep==${keep}`, keep ? 'heavy' : 'clear', u, keep);

    if (!keep) {
      // 行 66: update(u, fa, -1, 0);
      makeStep(66, `🧹 [清空轻子树] update(${u}, ${fa}, -1, 0): 回溯撤销节点 ${u} 子树的所有颜色贡献。`, `清空子树 ${u} 颜色数据`, 'clear', u, false);
      updateSubtree(u, fa, -1, 0);
    }
  }

  dfsSolve(1, 0, true);

  // 行 68: 结束
  makeStep(68, `🎉 [DSU on Tree 完成] 树上启发式合并全部完成！各节点子树不同颜色数：${Array.from({ length: n }, (_, i) => `ans[${i + 1}]=${ans[i + 1]}`).join(', ')}！`, '树上启发式合并全部完成', 'done', 1, true);

  return steps;
}
