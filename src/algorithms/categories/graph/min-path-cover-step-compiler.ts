/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover) 步进生成器
 * 进阶网络流/二分图: 拆点 u -> u_out, v_in、二分图最大匹配、路径数 = n - 最大匹配 (洛谷 P2764 / 左程云 class071)
 * 纯 TypeScript 实现，严禁英文调试命令泄漏，支持四语言精准行号映射
 */

export interface PathCoverStep {
  splitMatches: Array<[number, number]>;
  currentMatchingCount: number;
  minPathsCount: number;
  recoveredPaths: number[][];
  status: 'init' | 'match' | 'recover' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: Record<string, number>;
  curU?: number;
  metrics?: Record<string, any>;
}

export function buildMinPathCoverSteps(preset: string = 'standard'): PathCoverStep[] {
  const steps: PathCoverStep[] = [];
  const isBranching = preset === 'branching';
  const n = isBranching ? 5 : 4;

  // 有向边列表
  const edges: Array<[number, number]> = isBranching
    ? [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 5],
        [4, 5],
      ]
    : [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 3],
      ];

  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
  }

  const match: number[] = new Array(n + 1).fill(0);
  const vis: boolean[] = new Array(n + 1).fill(false);
  let maxMatch = 0;

  function getRecoveredPaths(): number[][] {
    const nxt: number[] = new Array(n + 1).fill(0);
    const isHead: boolean[] = new Array(n + 1).fill(true);

    for (let v = 1; v <= n; v++) {
      if (match[v] > 0) {
        nxt[match[v]] = v;
        isHead[v] = false;
      }
    }

    const paths: number[][] = [];
    for (let i = 1; i <= n; i++) {
      if (isHead[i]) {
        const p: number[] = [i];
        let cur = i;
        while (nxt[cur] > 0) {
          cur = nxt[cur];
          p.push(cur);
        }
        paths.push(p);
      }
    }
    return paths;
  }

  function getSplitMatches(): Array<[number, number]> {
    const matches: Array<[number, number]> = [];
    for (let v = 1; v <= n; v++) {
      if (match[v] > 0) {
        matches.push([match[v], v]);
      }
    }
    return matches;
  }

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init' | 'match' | 'recover' | 'done',
    curU?: number
  ): void {
    const splitMatches = getSplitMatches();
    const minPathsCount = n - maxMatch;
    const curUStr = curU ? `节点 ${curU}_out` : '——';
    const formulaStr = `${n} - ${maxMatch} = ${minPathsCount}`;

    steps.push({
      splitMatches,
      currentMatchingCount: maxMatch,
      minPathsCount,
      recoveredPaths: getRecoveredPaths(),
      status,
      message,
      log,
      codeLine: lines.java,
      codeLines: lines,
      curU,
      metrics: {
        'metric-match-count': `${maxMatch} 条匹配`,
        'metric-path-count': `${minPathsCount} 条路径`,
        'metric-cur-node': curUStr,
        'metric-path-formula': formulaStr,
      },
    });
  }

  // 1. 初始化
  makeStep(
    { java: 80, cpp: 41, python: 108, javascript: 147 },
    `🚀 [算法入口] DAG 拆点建立二分图：每个节点 u 拆为出点 u_out 与入点 v_in (图含 ${n} 个点)。`,
    `初始化 DAG 拆点二分图拓扑 (共 ${n} 个节点)`,
    'init'
  );

  makeStep(
    { java: 88, cpp: 21, python: 111, javascript: 150 },
    `📦 [初始化匹配状态] match[1..${n}] 初始全为 0，初始 ${n} 个孤立点各自构成一条独立路径，路径数 = ${n}。`,
    `分配 match 数组，初始不相交路径数为 ${n}`,
    'init'
  );

  function dfs(u: number): boolean {
    for (const v of adj[u]) {
      makeStep(
        { java: 68, cpp: 30, python: 115, javascript: 154 },
        `⚡ [探查拆点边] 从出点 ${u}_out 考察通往入点 ${v}_in 的连边。`,
        `考察拆点有向边 (${u}_out ➔ ${v}_in)`,
        'match',
        u
      );

      if (!vis[v]) {
        vis[v] = true;
        makeStep(
          { java: 69, cpp: 31, python: 116, javascript: 155 },
          `🏷️ [标记入点访问] 标记入点 ${v}_in 已在当前交错树中被访问。`,
          `标记入点 ${v}_in 已访问`,
          'match',
          u
        );

        if (match[v] === 0 || dfs(match[v])) {
          match[v] = u;
          makeStep(
            { java: 71, cpp: 33, python: 118, javascript: 157 },
            `✓ [匹配配对成功] 入点 ${v}_in 成功配对到出点 ${u}_out，路径段 (${u} ➔ ${v}) 拼接成功！`,
            `配对成功：${u}_out 匹配至 ${v}_in`,
            'match',
            u
          );
          return true;
        }
      }
    }
    return false;
  }

  // 匈牙利算法逐个出点寻找增广路
  for (let i = 1; i <= n; i++) {
    vis.fill(false);
    makeStep(
      { java: 93, cpp: 43, python: 123, javascript: 166 },
      `🔍 [寻找增广路] 清空访问标记，尝试为出点 ${i}_out 寻找可用入点。`,
      `尝试为出点 ${i}_out 发起增广搜索`,
      'match',
      i
    );

    if (dfs(i)) {
      maxMatch++;
      makeStep(
        { java: 95, cpp: 45, python: 125, javascript: 168 },
        `📈 [增广成功] 匹配数增至 ${maxMatch}，当前剩余不相交路径数 = ${n} - ${maxMatch} = ${n - maxMatch}！`,
        `增广成功：匹配数达 ${maxMatch}，路径数减少至 ${n - maxMatch}`,
        'match',
        i
      );
    } else {
      makeStep(
        { java: 76, cpp: 38, python: 120, javascript: 162 },
        `🛑 [增广无果] 出点 ${i}_out 无法找到可用增广路，匹配数维持 ${maxMatch}。`,
        `出点 ${i}_out 无法进一步增广`,
        'match',
        i
      );
    }
  }

  // 阶段 3: 提取路径数
  makeStep(
    { java: 101, cpp: 47, python: 143, javascript: 170 },
    `👑 [柯尼希/路径覆盖定理] 最小不相交路径覆盖数 = 节点总数 ${n} - 最大匹配数 ${maxMatch} = ${n - maxMatch}！`,
    `应用路径覆盖定理计算：最小路径数 = ${n} - ${maxMatch} = ${n - maxMatch}`,
    'recover'
  );

  // 阶段 4: 还原路径链
  const finalPaths = getRecoveredPaths();
  const pathDesc = finalPaths.map((p) => `[${p.join(' ➔ ')}]`).join(', ');
  makeStep(
    { java: 101, cpp: 47, python: 135, javascript: 170 },
    `🔗 [路径链重建] 顺着匹配边反向追溯，还原出的 ${finalPaths.length} 条不相交路径链：${pathDesc}。`,
    `重建不相交路径集合：${pathDesc}`,
    'recover'
  );

  // 终态完成
  makeStep(
    { java: 102, cpp: 47, python: 143, javascript: 170 },
    `🎉 [求解圆满完成] 返回最小路径覆盖数 ${n - maxMatch}，全图 ${n} 个节点实现 100% 独立路径覆盖！`,
    'DAG 最小路径覆盖求解完毕',
    'done'
  );

  return steps;
}
