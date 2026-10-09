/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem - Min Vertex Cover) 步进生成器
 * 进阶匹配理论: 最大匹配数 = 最小点覆盖数、未匹配点交错路 DFS 染色提取覆盖集与最大独立集 (洛谷 P6062 / 左程云 class069)
 * 纯 TypeScript 实现，严禁英文调试命令泄漏，支持四语言精准行号映射
 */

export interface KonigStep {
  matchedEdges: Array<[string, string]>;
  visitedLeft: string[];
  visitedRight: string[];
  coverSet: string[];
  independentSet?: string[];
  curAlternatingPath?: string[];
  activeEdge?: [string, string];
  matchLArray: number[];
  matchRArray: number[];
  visLArray: boolean[];
  visRArray: boolean[];
  activeArray?: 'matchL' | 'matchR' | 'visL' | 'visR';
  activeSlot?: number;
  status: 'init' | 'match' | 'alternating' | 'cover' | 'independent' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: Record<string, number>;
  metrics?: Record<string, string | number>;
}

export function buildKonigSteps(preset: string = 'classic'): KonigStep[] {
  const steps: KonigStep[] = [];
  const isClassic = preset === 'classic';

  // 经典图: 左 4 右 3；简单图: 左 3 右 2
  const n = isClassic ? 4 : 3;
  const m = isClassic ? 3 : 2;

  // 有向二分边 [u, v] (u 在左 1..n, v 在右 1..m)
  const edges: Array<[number, number]> = isClassic
    ? [
        [1, 1],
        [2, 1],
        [2, 2],
        [3, 2],
        [4, 3],
      ]
    : [
        [1, 1],
        [2, 2],
        [3, 1],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  const matchL: number[] = new Array(n + 1).fill(0);
  const matchR: number[] = new Array(m + 1).fill(0);
  const vis: boolean[] = new Array(m + 1).fill(false);
  const visL: boolean[] = new Array(n + 1).fill(false);
  const visR: boolean[] = new Array(m + 1).fill(false);
  const coverSet: string[] = [];
  const independentSet: string[] = [];

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'match' | 'alternating' | 'cover' | 'independent' | 'done',
    activeEdge?: [string, string],
    activeArray?: 'matchL' | 'matchR' | 'visL' | 'visR',
    activeSlot?: number
  ): void {
    const matched: Array<[string, string]> = [];
    for (let u = 1; u <= n; u++) {
      if (matchL[u] > 0) {
        matched.push([`L${u}`, `R${matchL[u]}`]);
      }
    }

    const vL: string[] = [];
    for (let u = 1; u <= n; u++) {
      if (visL[u]) vL.push(`L${u}`);
    }

    const vR: string[] = [];
    for (let v = 1; v <= m; v++) {
      if (visR[v]) vR.push(`R${v}`);
    }

    const phaseStr =
      status === 'done'
        ? '求解完成'
        : status === 'independent'
          ? '构造最大独立集'
          : status === 'cover'
            ? '构造最小点覆盖'
            : status === 'alternating'
              ? '交错路 DFS 染色'
              : status === 'match'
                ? '匈牙利最大匹配'
                : '初始化';

    steps.push({
      matchedEdges: matched,
      visitedLeft: vL,
      visitedRight: vR,
      coverSet: [...coverSet],
      independentSet: [...independentSet],
      activeEdge,
      matchLArray: [...matchL],
      matchRArray: [...matchR],
      visLArray: [...visL],
      visRArray: [...visR],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      metrics: {
        'metric-match-size': `${matched.length} 对`,
        'metric-cover-size': coverSet.length > 0 ? `${coverSet.length} 个点` : '推导中',
        'metric-indep-size': independentSet.length > 0 ? `${independentSet.length} 个点` : '—',
        'metric-konig-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  makeStep(
    { java: 82, cpp: 24, python: 167, javascript: 226 },
    `🚀 [算法初始化] 准备在左部 ${n} 点、右部 ${m} 点的二分图上运行 König 定理。`,
    `初始化二分图结构 (左部 ${n} 点，右部 ${m} 点)`,
    'init'
  );

  makeStep(
    { java: 87, cpp: 24, python: 171, javascript: 230 },
    '📊 [分配状态数组] 初始化 matchL、matchR、vis、visL、visR 等匹配与交错树标记数组。',
    '分配匹配与染色标记数组',
    'init'
  );

  // 逐条建边
  for (const [u, v] of edges) {
    adj[u].push(v);
    makeStep(
      { java: 94, cpp: 28, python: 177, javascript: 237 },
      `🔗 [添加二分边] 连接左部节点 L${u} 到右部节点 R${v}。`,
      `添加拓扑二分边 (L${u}, R${v})`,
      'init',
      [`L${u}`, `R${v}`]
    );
  }

  // ==================== 2. 匈牙利算法求最大匹配 ====================
  makeStep(
    { java: 112, cpp: 47, python: 190, javascript: 255 },
    '⚡ [启动匈牙利算法] 第一阶段：求解二分图基准最大匹配，作为点覆盖推导的基础。',
    '启动匈牙利增广匹配算法',
    'match'
  );

  function dfs(u: number): boolean {
    for (const v of adj[u]) {
      if (!vis[v]) {
        vis[v] = true;
        makeStep(
          { java: 101, cpp: 35, python: 183, javascript: 244 },
          `🔎 [检查右部点] 尝试匹配 (L${u} ➔ R${v})：标记右部节点 R${v} 已访问。`,
          `探测右部节点 R${v}`,
          'match',
          [`L${u}`, `R${v}`]
        );

        if (matchR[v] === 0 || dfs(matchR[v])) {
          matchR[v] = u;
          matchL[u] = v;
          makeStep(
            { java: 103, cpp: 37, python: 185, javascript: 246 },
            `❤️ [配对成功] 左部节点 L${u} 与右部节点 R${v} 配对成功，增广链建立！`,
            `增广成功：建立匹配 (L${u}, R${v})`,
            'match',
            [`L${u}`, `R${v}`],
            'matchL',
            u
          );
          return true;
        }
      }
    }
    return false;
  }

  // 运行匹配
  for (let i = 1; i <= n; i++) {
    vis.fill(false);
    makeStep(
      { java: 116, cpp: 49, python: 194, javascript: 259 },
      `🎯 [寻找匹配] 为左部节点 L${i} 发起匈牙利增广路搜索。`,
      `尝试为左部节点 L${i} 寻找匹配`,
      'match'
    );
    dfs(i);
  }

  // ==================== 3. König 定理交错路 DFS 染色 ====================
  makeStep(
    { java: 135, cpp: 56, python: 208, javascript: 278 },
    '👑 [启动 König 覆盖集构造] 从所有未匹配的左部节点出发，沿交错路走未匹配边到右部、沿匹配边走回左部进行标记！',
    '启动未匹配点交错路 DFS 染色',
    'alternating'
  );

  function alternatingDfs(u: number): void {
    visL[u] = true;
    makeStep(
      { java: 124, cpp: 58, python: 201, javascript: 267 },
      `🏷️ [左部标记] 标记左部节点 L${u} 为交错树访问节点。`,
      `标记左部节点 L${u}`,
      'alternating',
      undefined,
      'visL',
      u
    );

    for (const v of adj[u]) {
      // 沿未匹配边走向右部
      if (!visR[v] && v !== matchL[u]) {
        visR[v] = true;
        makeStep(
          { java: 127, cpp: 61, python: 204, javascript: 270 },
          `🏷️ [右部标记] 沿未匹配边到达右部节点 R${v}，标记右部节点已被交错路访问。`,
          `标记右部节点 R${v}`,
          'alternating',
          [`L${u}`, `R${v}`],
          'visR',
          v
        );

        // 沿匹配边走回左部
        if (matchR[v] !== 0 && !visL[matchR[v]]) {
          const nextL = matchR[v];
          makeStep(
            { java: 129, cpp: 63, python: 206, javascript: 272 },
            `🔄 [匹配边反推] 沿匹配边走回左部节点 L${nextL}。`,
            `沿匹配边反推至左部节点 L${nextL}`,
            'alternating',
            [`L${nextL}`, `R${v}`]
          );
          alternatingDfs(nextL);
        }
      }
    }
  }

  // 从未匹配左部点发起交错遍历
  for (let u = 1; u <= n; u++) {
    if (matchL[u] === 0 && !visL[u]) {
      makeStep(
        { java: 138, cpp: 56, python: 211, javascript: 281 },
        `🔍 [未匹配点出发] 左部节点 L${u} 未被匹配，从该节点出发展开交错路染色！`,
        `从未匹配节点 L${u} 展开交错路`,
        'alternating'
      );
      alternatingDfs(u);
    }
  }

  // ==================== 4. 提取最小点覆盖集合 ====================
  for (let u = 1; u <= n; u++) {
    if (!visL[u]) {
      coverSet.push(`L${u}`);
      makeStep(
        { java: 145, cpp: 67, python: 216, javascript: 288 },
        `🛡️ [选中左部点] 左部节点 L${u} 未被交错路访问，加入最小点覆盖集！`,
        `将左部节点 L${u} 纳入最小点覆盖`,
        'cover'
      );
    }
  }

  for (let v = 1; v <= m; v++) {
    if (visR[v]) {
      coverSet.push(`R${v}`);
      makeStep(
        { java: 148, cpp: 67, python: 219, javascript: 291 },
        `🛡️ [选中右部点] 右部节点 R${v} 已被交错路访问，加入最小点覆盖集！`,
        `将右部节点 R${v} 纳入最小点覆盖`,
        'cover'
      );
    }
  }

  // ==================== 5. 提取最大独立集 (互补点集) ====================
  for (let u = 1; u <= n; u++) {
    if (visL[u]) independentSet.push(`L${u}`);
  }
  for (let v = 1; v <= m; v++) {
    if (!visR[v]) independentSet.push(`R${v}`);
  }
  makeStep(
    { java: 153, cpp: 68, python: 221, javascript: 293 },
    `✨ [互补最大独立集] 最大独立集 = 全集 \\ 覆盖集: { ${independentSet.join(', ')} }！`,
    '构造互补最大独立集',
    'independent'
  );

  // 终态
  makeStep(
    { java: 135, cpp: 53, python: 208, javascript: 278 },
    `🎉 [König 定理验证完成] 最小点覆盖集 = { ${coverSet.join(', ')} } (大小 ${coverSet.length}) 严格等于最大匹配数！`,
    'König 定理推导完成',
    'done'
  );

  return steps;
}
