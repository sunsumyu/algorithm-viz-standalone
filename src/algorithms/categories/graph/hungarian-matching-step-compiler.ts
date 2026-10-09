/**
 * 匈牙利算法二分图最大匹配 (Hungarian Algorithm - Maximum Bipartite Matching) 步进编译器
 * 进阶图论: 增广路探索、交错路寻找、协商腾位与反向边翻转、增广路定理 (洛谷 P3386 / 左程云 class069)
 * 架构：严格解释器级全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface HungarianStep {
  matchedEdges: Array<[string, string]>;
  curLeft: string;
  curAugmentPath: string[];
  activeEdge?: [string, string];
  conflictTarget?: string;
  matchCount: number;
  matchArray: number[];
  visitedArray: boolean[];
  activeArray?: 'match' | 'visited';
  activeSlot?: number;
  status: 'init' | 'augment' | 'flip' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildHungarianSteps(preset: string = 'four_nodes'): HungarianStep[] {
  const steps: HungarianStep[] = [];
  const is4Node = preset === 'four_nodes';
  const nLeft = is4Node ? 4 : 3;
  const nRight = is4Node ? 4 : 3;

  const graph: number[][] = is4Node
    ? [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
      ]
    : [
        [0, 1],
        [0, 2],
        [1, 2],
      ];

  const match: number[] = new Array(nRight).fill(-1);
  let visited: boolean[] = new Array(nRight).fill(false);
  let matchCount = 0;
  let curLeft = 'L0';
  let curAugmentPath: string[] = [];
  let activeEdge: [string, string] | undefined = undefined;
  let conflictTarget: string | undefined = undefined;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript 1-based)
  const lines = {
    mainFunc: { cpp: 20, java: 21, python: 2, javascript: 8 },
    initMatch: { cpp: 21, java: 22, python: 9, javascript: 9 },
    initCount: { cpp: 22, java: 24, python: 23, javascript: 24 },
    loopU: { cpp: 24, java: 26, python: 24, javascript: 25 },
    initVisited: { cpp: 25, java: 27, python: 25, javascript: 26 },
    checkDfs: { cpp: 26, java: 28, python: 26, javascript: 27 },
    dfsEntry: { cpp: 6, java: 8, python: 11, javascript: 11 },
    loopV: { cpp: 7, java: 9, python: 12, javascript: 12 },
    checkVisited: { cpp: 8, java: 10, python: 13, javascript: 13 },
    markVisited: { cpp: 9, java: 11, python: 15, javascript: 14 },
    checkMatchOrDfs: { cpp: 12, java: 13, python: 18, javascript: 16 },
    applyMatch: { cpp: 13, java: 14, python: 19, javascript: 17 },
    returnTrue: { cpp: 14, java: 15, python: 20, javascript: 18 },
    returnFalse: { cpp: 17, java: 18, python: 21, javascript: 21 },
    incCount: { cpp: 27, java: 29, python: 27, javascript: 27 },
    returnCount: { cpp: 30, java: 32, python: 29, javascript: 29 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'augment' | 'flip' | 'done',
    activeArray?: 'match' | 'visited',
    activeSlot?: number
  ): void {
    const matchedPairs: Array<[string, string]> = [];
    for (let v = 0; v < nRight; v++) {
      if (match[v] !== -1) {
        matchedPairs.push([`L${match[v]}`, `R${v}`]);
      }
    }

    const pathStr = curAugmentPath.length > 0 ? curAugmentPath.join(' ➔ ') : '寻找增广路中';
    const phaseStr =
      status === 'done'
        ? '匹配完成'
        : status === 'flip'
          ? '增广路翻转加边'
          : status === 'augment'
            ? '交错路探索协商'
            : '初始化';

    steps.push({
      matchedEdges: matchedPairs,
      curLeft,
      curAugmentPath: [...curAugmentPath],
      activeEdge,
      conflictTarget,
      matchCount,
      matchArray: [...match],
      visitedArray: [...visited],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-hungarian-left': curLeft,
        'metric-hungarian-count': `${matchCount} 对匹配`,
        'metric-hungarian-path': pathStr,
        'metric-hungarian-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.mainFunc, `🚀 [算法初始化] maxMatching(nLeft=${nLeft}, nRight=${nRight})：准备寻找二分图最大匹配。`, '进入二分图最大匹配主函数', 'init');
  makeStep(lines.initMatch, `📊 [初始化匹配数组] int[] match = new int[${nRight}]；初始填充 -1 (所有右部节点均无伴侣)。`, '初始化右部配对数组 match[]=-1', 'init', 'match');
  makeStep(lines.initCount, '🔢 [初始化匹配计数] int count = 0；记录成功配对的匹配边总数。', '初始化匹配计数 count = 0', 'init');

  // DFS 增广函数
  function dfs(u: number): boolean {
    curLeft = `L${u}`;
    curAugmentPath.push(`L${u}`);
    makeStep(lines.dfsEntry, `🔎 [进入 DFS] dfs(u=${u})：左部节点 L${u} 开始寻找增广路径。`, `左部节点 L${u} 发起增广探索`, 'augment');

    for (const v of graph[u]) {
      activeEdge = [`L${u}`, `R${v}`];
      curAugmentPath.push(`R${v}`);

      makeStep(lines.loopV, `  ↳ [考察出边] 考察二分图意向边 (L${u} ➔ R${v})。`, `考察意向边 (L${u} ➔ R${v})`, 'augment');

      makeStep(lines.checkVisited, `  🔎 [检查是否已访问] 检验右部节点 R${v} 本轮是否已询问: visited[${v}] = ${visited[v]}。`, `检验节点 R${v} 本轮协商标记: ${visited[v]}`, 'augment', 'visited', v);
      if (visited[v]) {
        makeStep(lines.checkVisited, `  ⏭️ [跳过已探节点] R${v} 本轮已被询问过，避免环路死锁，跳过。`, `跳过已协商节点 R${v}`, 'augment');
        curAugmentPath.pop();
        continue;
      }

      visited[v] = true;
      makeStep(lines.markVisited, `  🏷️ [标记本轮访问] visited[${v}] = true；锁定节点 R${v} 本轮协商状态。`, `标记节点 R${v} 本轮已访问`, 'augment', 'visited', v);

      const oldMatch = match[v];
      if (oldMatch === -1) {
        makeStep(lines.checkMatchOrDfs, `  ✨ [发现空闲节点] R${v} 处于未配对状态！增广路成功闭合！`, `发现空闲节点 R${v}，增广路闭合`, 'augment', 'match', v);

        match[v] = u;
        makeStep(lines.applyMatch, `  🎉 [建立新匹配] match[${v}] = ${u}：将边 (L${u} ➔ R${v}) 纳入匹配，完成增广翻转！`, `建立新匹配: L${u} 💖 R${v}`, 'flip', 'match', v);

        makeStep(lines.returnTrue, `  ✔ [返回成功] return true：节点 L${u} 成功配对！`, `dfs(L${u}) 寻路成功返回`, 'flip');
        activeEdge = undefined;
        return true;
      } else {
        conflictTarget = `L${oldMatch}`;
        makeStep(lines.checkMatchOrDfs, `  ⚡ [协商腾位递归] R${v} 已与 L${oldMatch} 配对，递归调用 dfs(${oldMatch}) 尝试为其寻找替代伴侣！`, `递归探索原配 L${oldMatch} 协商腾位`, 'augment');

        if (dfs(oldMatch)) {
          makeStep(lines.checkMatchOrDfs, `  🤝 [让位成功] 原配 L${oldMatch} 成功找到新伴侣，R${v} 顺利腾出名额！`, `原配 L${oldMatch} 让位成功`, 'flip');

          match[v] = u;
          makeStep(lines.applyMatch, `  🎉 [更新配对关系] match[${v}] = ${u}：节点 R${v} 与新伴侣 L${u} 建立新匹配！`, `更新配对关系: L${u} 💖 R${v}`, 'flip', 'match', v);

          makeStep(lines.returnTrue, `  ✔ [增广路整体翻转成功] return true！增广路径翻转使匹配数 +1！`, `增广路翻转成功，匹配数加一`, 'flip');
          conflictTarget = undefined;
          activeEdge = undefined;
          return true;
        } else {
          makeStep(lines.checkMatchOrDfs, `  ❌ [腾位失败] 原配 L${oldMatch} 无法找到其他伴侣，协商失败，继续尝试 L${u} 的下一个意向。`, `原配 L${oldMatch} 腾位失败`, 'augment');
          conflictTarget = undefined;
          curAugmentPath.pop();
        }
      }
    }

    makeStep(lines.returnFalse, `⚠️ [无路可走] return false：左部节点 L${u} 所有出边均无法形成增广路。`, `左部节点 L${u} 寻路失败返回 false`, 'augment');
    curAugmentPath.pop();
    activeEdge = undefined;
    return false;
  }

  // 2. 外层循环
  for (let u = 0; u < nLeft; u++) {
    curLeft = `L${u}`;
    curAugmentPath = [];
    makeStep(lines.loopU, `🔁 [外层遍历] 为左部节点 L${u} 寻求增广匹配。`, `外层循环为 L${u} 寻找增广路`, 'augment');

    visited = new Array(nRight).fill(false);
    makeStep(lines.initVisited, `🧹 [重置访问数组] boolean[] visited = new boolean[${nRight}]；新一轮增广重置标记。`, '重置本轮协商访问数组 visited[]', 'augment', 'visited');

    makeStep(lines.checkDfs, `🔎 [启动增广探索] 调用 dfs(${u})。`, `启动 DFS 寻找从 L${u} 出发的增广路`, 'augment');

    if (dfs(u)) {
      matchCount++;
      makeStep(lines.incCount, `📈 [匹配数累加] count++ -> 当前最大匹配对数刷新为 ${matchCount} 对！`, `匹配总数递增为 count = ${matchCount}`, 'flip');
    }
  }

  curLeft = '全部匹配完成';
  curAugmentPath = [];
  makeStep(lines.returnCount, `🎉 [匈牙利算法完成] return count = ${matchCount}！二分图最大匹配对数锁定为 ${matchCount}！`, `匈牙利增广全流程完成，输出最大匹配数 ${matchCount}`, 'done');

  return steps;
}
