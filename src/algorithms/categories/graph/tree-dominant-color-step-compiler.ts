/**
 * 树上众数求和 (Tree Dominant Color - CF600E) 步进编译器
 * 进阶树论启发式合并: DSU on Tree 动态维护最值与频次和、轻重儿子判定
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

export interface TreeDominantStep {
  curNode: number;
  nodeColors: Record<number, number>;
  heavySon: Record<number, number>;
  colorCount: Record<number, number>;
  maxFreq: number;
  sumColors: number;
  ans: Record<number, number>;
  szArray: number[];
  activeArray?: 'col' | 'sz' | 'son' | 'cnt' | 'ans';
  activeSlot?: number;
  status: 'init' | 'dfs_init' | 'heavy' | 'light' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTreeDominantColorSteps(preset: string = 'cf600e_5node'): TreeDominantStep[] {
  const steps: TreeDominantStep[] = [];
  const isBicolor = preset === 'bicolor_5node';
  const n = 5;

  // 节点颜色定义
  // cf600e_5node: 1:1, 2:2, 3:1, 4:1, 5:3 -> ans: 1:1, 2:6, 3:1, 4:1, 5:3
  // bicolor_5node: 1:1, 2:2, 3:2, 4:2, 5:2 -> 众数为2, ans[1]=2
  const colors = isBicolor ? [0, 1, 2, 2, 2, 2] : [0, 1, 2, 1, 1, 3];

  const treeEdges: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of treeEdges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const sz: number[] = new Array(n + 1).fill(0);
  const son: number[] = new Array(n + 1).fill(0);
  const cnt: number[] = new Array(n + 1).fill(0);
  const ans: number[] = new Array(n + 1).fill(0);

  let maxCnt = 0;
  let sumColor = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'dfs_init' | 'heavy' | 'light' | 'update' | 'done',
    curNode: number = 1,
    activeArray?: 'col' | 'sz' | 'son' | 'cnt' | 'ans',
    activeSlot?: number
  ): void {
    const colMap: Record<number, number> = {};
    const sonMap: Record<number, number> = {};
    const cntMap: Record<number, number> = {};
    const ansMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      colMap[i] = colors[i];
      sonMap[i] = son[i];
      cntMap[i] = cnt[i];
      ansMap[i] = ans[i];
    }

    const phaseStr =
      status === 'done'
        ? '众数统计完成'
        : status === 'update'
          ? '频次桶更新与众数结算'
          : status === 'heavy'
            ? '重儿子递归 (keep=true)'
            : status === 'light'
              ? '轻儿子递归 (keep=false)'
              : status === 'dfs_init'
                ? '预处理子树大小与重儿子'
                : '初始化';

    steps.push({
      curNode,
      nodeColors: colMap,
      heavySon: sonMap,
      colorCount: cntMap,
      maxFreq: maxCnt,
      sumColors: sumColor,
      ans: ansMap,
      szArray: [...sz],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-root': `Node ${curNode}`,
        'metric-max-freq': `最高频次: ${maxCnt}`,
        'metric-sum-colors': `众数颜色和: ${sumColor}`,
        'metric-dominant-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 18: DominantColorSolver(n, colors)
  makeStep(18, `🚀 [算法初始化] DominantColorSolver(n=${n})：准备统计 5 节点树上各子树众数之和。`, `DominantColorSolver(${n})`, 'init', 1);

  // 行 22-26: 分配状态数组
  makeStep([22, 26], '📊 [分配状态数组] 拷贝颜色 col[]，分配 sz[], son[], cnt[], ans[] 数组。', '分配状态数组', 'init', 1);

  // 逐条加边
  for (const [u, v] of treeEdges) {
    makeStep(30, `🔗 [添加树边] addEdge(${u}, ${v})：连接无向树边 (${u}, ${v})。`, `addEdge(${u}, ${v})`, 'init', u);
  }

  // ==================== 2. 第一次 DFS：求子树大小 sz 与重儿子 son ====================
  function dfsInit(u: number, p: number): void {
    // 行 35-36: dfsInit(u, p), sz[u] = 1
    sz[u] = 1;
    makeStep(36, `📐 [子树初始化] sz[${u}] = 1; 访问节点 ${u}。`, `sz[${u}] = 1`, 'dfs_init', u, 'sz', u);

    // 行 37: 遍历邻居
    for (const v of adj[u]) {
      // 行 38: if (v != p)
      if (v !== p) {
        // 行 39: dfsInit(v, u);
        dfsInit(v, u);

        // 行 40: sz[u] += sz[v];
        sz[u] += sz[v];
        makeStep(40, `➕ [子树累加] sz[${u}] += sz[${v}] (${sz[v]}) -> sz[${u}] = ${sz[u]}。`, `sz[${u}] += sz[${v}]`, 'dfs_init', u, 'sz', u);

        // 行 41: if (sz[v] > sz[son[u]]) son[u] = v;
        if (sz[v] > sz[son[u]]) {
          son[u] = v;
          makeStep(41, `⭐ [确认重儿子] son[${u}] = ${v}；节点 ${v} 成为 ${u} 的重儿子！`, `son[${u}] = ${v}`, 'dfs_init', u, 'son', u);
        }
      }
    }
  }

  dfsInit(1, 0);

  // ==================== 3. 第二次 DFS：启发式合并维护众数 ====================
  function addNode(u: number, p: number, val: number, skipSon: number): void {
    const c = colors[u];
    // 行 47: cnt[col[u]] += val;
    cnt[c] += val;

    // 行 48-52: 动态更新 maxCnt 与 sumColor
    if (cnt[c] > maxCnt) {
      maxCnt = cnt[c];
      sumColor = c;
    } else if (cnt[c] === maxCnt && maxCnt > 0) {
      sumColor += c;
    }

    makeStep([47, 52], `🎨 [更新颜色桶] 节点 ${u} 色 ${c}：cnt[${c}] ${val > 0 ? '+' : '-'}= 1 -> 频次 ${cnt[c]}；当前最高频次=${maxCnt}，众数和=${sumColor}。`, `cnt[${c}] += ${val}`, 'update', u, 'cnt', c);

    for (const v of adj[u]) {
      if (v !== p && v !== skipSon) {
        addNode(v, u, val, skipSon);
      }
    }
  }

  function dfsSolve(u: number, p: number, keep: boolean): void {
    // 1. 递归所有轻儿子 (不保留数据)
    for (const v of adj[u]) {
      if (v !== p && v !== son[u]) {
        makeStep(61, `🍃 [深入轻儿子] dfsSolve(${v}, keep=false): 递归轻子树 ${v}，数据算完即清空。`, `递归轻儿子 ${v}`, 'light', v);
        dfsSolve(v, u, false);
      }
    }

    // 2. 递归重儿子 (保留数据)
    if (son[u] !== 0) {
      makeStep(63, `👑 [深入重儿子] dfsSolve(${son[u]}, keep=true): 递归重子树 ${son[u]}，数据完整保留在桶中！`, `递归重儿子 ${son[u]}`, 'heavy', son[u]);
      dfsSolve(son[u], u, true);
    }

    // 3. 暴力合并轻子树贡献与自身
    // 行 65: addNode(u, p, 1, son[u]);
    makeStep(65, `⚡ [合并轻子树] 遍历节点 ${u} 及所有轻子树节点颜色，加入全局频次桶。`, `合并轻子树至 ${u}`, 'update', u);
    addNode(u, p, 1, son[u]);

    // 4. 记录答案
    // 行 66: ans[u] = sumColor;
    ans[u] = sumColor;
    makeStep(66, `📝 [记录众数答案] ans[${u}] = sumColor = ${sumColor}！子树 ${u} 众数求和完毕！`, `ans[${u}] = ${sumColor}`, 'update', u, 'ans', u);

    // 5. 若是轻儿子，回溯清空本子树
    if (!keep) {
      // 行 69-70: 清空
      makeStep([69, 70], `🧹 [清空轻子树] addNode(${u}, -1, 0); maxCnt = 0; sumColor = 0; 回溯撤销子树 ${u} 贡献。`, `清空子树 ${u}`, 'update', u);
      addNode(u, p, -1, 0);
      maxCnt = 0;
      sumColor = 0;
    }
  }

  dfsSolve(1, 0, true);

  // 终态
  makeStep(66, `🎉 [树上众数求解完成] DSU on Tree 合并统计完毕！各节点众数之和：${Array.from({ length: n }, (_, i) => `ans[${i + 1}]=${ans[i + 1]}`).join(', ')}！`, '求解完成', 'done', 1);

  return steps;
}
