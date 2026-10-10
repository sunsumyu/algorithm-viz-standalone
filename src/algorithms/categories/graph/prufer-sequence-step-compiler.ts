/**
 * Prufer 序列双向转换与 Cayley 公式 (Prufer Sequence · 洛谷 P6086) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 组合图论: 树到 Prufer 序列的双向一一双射、O(N) 线性双指针编解码、Cayley 定理
 */

export interface PruferStep {
  curLeaf: number;
  pruferSequence: number[];
  degMap: Record<number, number>;
  parentMap: Record<number, number>;
  activeEdge?: [number, number];
  removedEdges: Array<{ u: number; v: number }>;
  degArray: number[];
  parentArray: number[];
  activeArray?: 'deg' | 'parent' | 'prufer';
  activeSlot?: number;
  status: 'init' | 'deg_calc' | 'find_leaf' | 'append' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildPruferSteps(preset: string = 'star_4node'): PruferStep[] {
  const steps: PruferStep[] = [];
  const isLine = preset === 'line_4node';
  const n = 4;

  // 树结构定义 (以 n=4 为根建立有向父子关系)
  // star_4node: 节点 1 为中心，连接 2, 3, 4；以 4 为根则 parent[1]=4, parent[2]=1, parent[3]=1
  // 标准题目设定：若树有 4 点，Prufer 长度为 2
  // star_4node: 删 2 记 1，删 3 记 1 -> prufer = [1, 1]
  // line_4node: 1-2-3-4 -> 删 1 记 2，删 2 记 3 -> prufer = [2, 3]
  const parent = isLine ? [0, 2, 3, 4, 0] : [0, 4, 1, 1, 0];
  const deg = new Array(n + 1).fill(0);
  const prufer: number[] = [];
  const removedEdges: Array<{ u: number; v: number }> = [];

  let curLeaf = 1;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'deg_calc' | 'find_leaf' | 'append' | 'done',
    activeEdge?: [number, number],
    activeArray?: 'deg' | 'parent' | 'prufer',
    activeSlot?: number
  ): void {
    const degRecord: Record<number, number> = {};
    const parentRecord: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      degRecord[i] = deg[i];
      parentRecord[i] = parent[i];
    }

    const pSeqStr = prufer.length > 0 ? `[${prufer.join(', ')}]` : '[]';
    const phaseStr =
      status === 'done'
        ? 'Prufer 序列生成完毕'
        : status === 'append'
          ? '记录父节点至 Prufer'
          : status === 'find_leaf'
            ? '扫描最小编号叶子'
            : status === 'deg_calc'
              ? '统计各点度数'
              : '编解码器初始化';

    steps.push({
      curLeaf,
      pruferSequence: [...prufer],
      degMap: degRecord,
      parentMap: parentRecord,
      activeEdge,
      removedEdges: removedEdges.map((e) => ({ ...e })),
      degArray: [...deg],
      parentArray: [...parent],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-leaf': `叶节点 ${curLeaf}`,
        'metric-prufer-seq': pSeqStr,
        'metric-cayley-count': `Cayley 计数: n^(n-2) = ${Math.pow(n, n - 2)}`,
        'metric-prufer-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 16: Codec(int n)
  makeStep(16, `🚀 [算法初始化] 构造 Prufer 编解码器，设置节点总数 n = ${n}。`, `初始化编解码器(n=${n})`, 'init');

  // 行 17: parent 数组
  makeStep(17, '📊 [分配父节点数组] parent = new int[n + 1]; 记录树中各节点的父指针。', '分配父节点数组', 'init', undefined, 'parent');

  // 行 18: deg 数组
  makeStep(18, '📊 [分配度数数组] deg = new int[n + 1]; 维护无根树中各节点的剩余连边度数。', '分配度数数组', 'init', undefined, 'deg');

  // 行 19: prufer 数组
  makeStep(19, `📊 [分配 Prufer 数组] prufer = new int[n - 2] (长度为 ${n - 2}); 准备容纳消除序列。`, '分配Prufer数组', 'init', undefined, 'prufer');

  // ==================== 2. 统计各点出度/儿子数 ====================
  // 行 24: treeToPrufer(int[] p)
  makeStep(24, '⚡ [启动树转 Prufer] treeToPrufer(): 双指针线性扫描度数为 0 的最小编号叶节点。', '启动树转Prufer序列', 'deg_calc');

  // 行 25: 拷贝父节点
  makeStep(25, '📋 [拷贝原树父节点] 载入原树父节点拓扑结构。', '载入原树父节点拓扑', 'deg_calc', undefined, 'parent');

  // 行 26: Arrays.fill(deg, 0);
  makeStep(26, '🧹 [度数清零] deg 数组初始化清空。', '度数数组清零', 'deg_calc');

  // 行 27: for (int i = 1; i < n; i++) deg[parent[i]]++;
  for (let i = 1; i < n; i++) {
    const fa = parent[i];
    deg[fa]++;
    makeStep(27, `✏️ [度数累加] 节点 ${i} 的父亲是 ${fa}：deg[${fa}]++ -> ${deg[fa]}。`, `累加度数 deg[${fa}]=${deg[fa]}`, 'deg_calc', [i, fa], 'deg', fa);
  }

  // ==================== 3. 线性双指针删除叶节点并输出 Prufer ====================
  // 行 29: int pIdx = 0;
  makeStep(29, '📍 [初始化序列写入指针] pIdx = 0; 准备向 Prufer 数组写入元素。', '初始化写入指针', 'find_leaf');

  // 行 30: for (int i = 1, ptr = 1; i <= n - 2; i++)
  makeStep(30, '👉 [初始化双指针扫描位置] ptr = 1; 从编号为 1 的最小节点开始扫描度数。', '初始化双指针扫描位置', 'find_leaf');
  let ptr = 1;
  for (let i = 1; i <= n - 2; i++) {
    // 行 31: while (deg[ptr] > 0) ptr++;
    while (deg[ptr] > 0) {
      makeStep(31, `🔍 [寻找叶子] 节点 ${ptr} 当前 deg[${ptr}]=${deg[ptr]} > 0 (非叶子)，双指针推进 ptr++。`, `ptr=${ptr}非叶节点推进`, 'find_leaf', undefined, 'deg', ptr);
      ptr++;
    }

    curLeaf = ptr;
    makeStep(31, `🍃 [定位最小叶子] 找到当前编号最小的叶节点：节点 ${ptr} (deg=0)！`, `定位最小叶节点${ptr}`, 'find_leaf', undefined, 'deg', ptr);

    // 行 32: int fa = parent[ptr];
    let fa = parent[ptr];
    makeStep(32, `📌 [获取父节点] 叶节点 ${ptr} 的父节点为 fa = parent[${ptr}] = ${fa}。`, `获取父节点 parent[${ptr}]=${fa}`, 'append', [ptr, fa], 'parent', ptr);

    // 行 33: prufer[pIdx++] = fa;
    prufer.push(fa);
    removedEdges.push({ u: ptr, v: fa });
    makeStep(33, `📝 [追加序列] 删去叶节点 ${ptr}，将其父节点 ${fa} 写入 Prufer 序列：${JSON.stringify(prufer)}！`, `写入Prufer序列(${fa})`, 'append', [ptr, fa], 'prufer', prufer.length - 1);

    // 行 34: while (i <= n - 2 && --deg[fa] == 0 && fa < ptr)
    deg[fa]--;
    makeStep(34, `📉 [父节点度数减 1] --deg[${fa}] -> ${deg[fa]}。`, `父节点度数自减 deg[${fa}]=${deg[fa]}`, 'append', undefined, 'deg', fa);

    if (prufer.length < n - 2 && deg[fa] === 0 && fa < ptr) {
      curLeaf = fa;
      prufer.push(parent[fa]);
      removedEdges.push({ u: fa, v: parent[fa] });
      makeStep([35, 37], `🔄 [级联产生更小叶子] fa=${fa} < ptr=${ptr} 且 deg[${fa}] 归零！直接删去 ${fa} 并写入 parent[${fa}]=${parent[fa]}！`, `级联产生更小叶节点并写入Prufer(${parent[fa]})`, 'append', [fa, parent[fa]]);
      fa = parent[fa];
      i++;
    }

    ptr++;
  }

  // 行 41: return prufer;
  makeStep(41, `🎉 [Prufer 序列构建完成] 最终生成的 Prufer 序列为：${JSON.stringify(prufer)} (长度严格为 n-2 = ${n - 2})！`, 'Prufer序列构建完成', 'done');

  return steps;
}
