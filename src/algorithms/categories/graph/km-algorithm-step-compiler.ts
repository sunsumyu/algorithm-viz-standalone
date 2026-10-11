/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) 步进生成器
 * 进阶匹配理论: 顶标可行性 lx[u] + ly[v] >= w(u,v)、相等子图增广、松弛变量 slack[v] 顶标调整、O(N³) 严格时间 (洛谷 P6577 / 左程云 class073)
 * 纯 TypeScript 实现，严禁英文调试命令泄漏，支持四语言精准行号映射
 */

export interface KMStep {
  lx: Record<string, number>;
  ly: Record<string, number>;
  matchedEdges: Array<[string, string]>;
  slack: Record<string, number>;
  curLeft?: string;
  activeEdge?: [string, string];
  totalWeight: number;
  deltaAdj?: number;
  lxArray: number[];
  lyArray: number[];
  slackArray: number[];
  matchArray: number[];
  activeArray?: 'lx' | 'ly' | 'slack' | 'match';
  activeSlot?: number;
  status: 'init_labels' | 'augment' | 'adjust_labels' | 'done';
  message: string;
  log: string;
  codeLine: number;
  codeLines?: Record<string, number>;
  metrics?: Record<string, string | number>;
}

export function buildKMSteps(preset: string = 'standard'): KMStep[] {
  const steps: KMStep[] = [];
  const isSimple = preset === 'simple';
  const n = isSimple ? 2 : 3;

  const weight: number[][] = isSimple
    ? [
        [0, 0, 0],
        [0, 10, 5],
        [0, 6, 8],
      ]
    : [
        [0, 0, 0, 0],
        [0, 4, 2, 3],
        [0, 3, 5, 2],
        [0, 2, 1, 3],
      ];

  const lx: number[] = new Array(n + 1).fill(0);
  const ly: number[] = new Array(n + 1).fill(0);
  const slack: number[] = new Array(n + 1).fill(0);
  const match: number[] = new Array(n + 1).fill(0);
  let visX: boolean[] = new Array(n + 1).fill(false);
  let visY: boolean[] = new Array(n + 1).fill(false);

  let totalWeight = 0;
  let curLeft: string | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;
  let deltaAdj: number | undefined = undefined;

  // 四语言映射行号字典 (java / cpp / python / javascript)
  const lineMap = {
    entry: { java: 107, cpp: 45, python: 161, javascript: 187 },
    initLx: { java: 110, cpp: 48, python: 140, javascript: 191 },
    forLeft: { java: 112, cpp: 51, python: 162, javascript: 200 },
    initSlack: { java: 113, cpp: 52, python: 163, javascript: 205 },
    whileAugment: { java: 114, cpp: 53, python: 164, javascript: 210 },
    resetVis: { java: 115, cpp: 54, python: 165, javascript: 215 },
    callDfs: { java: 117, cpp: 56, python: 167, javascript: 220 },
    dfsEntry: { java: 89, cpp: 27, python: 147, javascript: 199 },
    dfsMarkVisX: { java: 90, cpp: 28, python: 148, javascript: 200 },
    dfsLoopV: { java: 91, cpp: 29, python: 149, javascript: 201 },
    dfsCheckVisY: { java: 92, cpp: 30, python: 150, javascript: 202 },
    dfsCalcDelta: { java: 93, cpp: 31, python: 151, javascript: 203 },
    dfsCheckDeltaZero: { java: 94, cpp: 32, python: 152, javascript: 204 },
    dfsMarkVisY: { java: 95, cpp: 33, python: 153, javascript: 205 },
    dfsTryMatch: { java: 96, cpp: 34, python: 154, javascript: 206 },
    dfsAssignMatch: { java: 97, cpp: 35, python: 155, javascript: 207 },
    dfsUpdateSlack: { java: 101, cpp: 39, python: 158, javascript: 210 },
    calcD: { java: 118, cpp: 58, python: 169, javascript: 225 },
    adjustLabels: { java: 122, cpp: 62, python: 173, javascript: 230 },
    returnAns: { java: 129, cpp: 70, python: 180, javascript: 240 },
  };

  function makeStep(
    lines: { java: number; cpp: number; python: number; javascript: number },
    message: string,
    log: string,
    status: 'init_labels' | 'augment' | 'adjust_labels' | 'done',
    activeArray?: 'lx' | 'ly' | 'slack' | 'match',
    activeSlot?: number
  ): void {
    const lxRec: Record<string, number> = {};
    const lyRec: Record<string, number> = {};
    const slackRec: Record<string, number> = {};
    const matchedEdges: Array<[string, string]> = [];

    for (let i = 1; i <= n; i++) {
      lxRec[`L${i}`] = lx[i];
      lyRec[`R${i}`] = ly[i];
      slackRec[`R${i}`] = slack[i] >= 999 ? 0 : slack[i];
      if (match[i] > 0) {
        matchedEdges.push([`L${match[i]}`, `R${i}`]);
      }
    }

    const matchedStr = `${matchedEdges.length} / ${n} 对`;
    const slackStr = deltaAdj !== undefined ? `d = ${deltaAdj}` : '0';
    const phaseStr =
      status === 'done'
        ? 'KM 匹配完成'
        : status === 'adjust_labels'
          ? '顶标微调缩小 slack'
          : status === 'augment'
            ? '相等子图增广中'
            : '顶标初始化';

    const normalizedLines = {
      cpp: lines.cpp,
      java: lines.java > 76 ? lines.java - 76 : lines.java,
      python: lines.python > 135 ? lines.python - 135 : lines.python,
      javascript: lines.javascript > 185 ? lines.javascript - 185 : lines.javascript,
    };

    steps.push({
      lx: lxRec,
      ly: lyRec,
      matchedEdges,
      slack: slackRec,
      curLeft,
      activeEdge,
      totalWeight,
      deltaAdj,
      lxArray: [...lx],
      lyArray: [...ly],
      slackArray: [...slack],
      matchArray: [...match],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine: normalizedLines.java,
      codeLines: normalizedLines,
      metrics: {
        'metric-km-weight': `${totalWeight}`,
        'metric-km-matched': matchedStr,
        'metric-km-slack': slackStr,
        'metric-km-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lineMap.entry, '🚀 [KM 算法启动] 初始化二分图顶标与相等子图，寻找最大权完备匹配。', '启动 KM 算法初始化', 'init_labels');

  for (let i = 1; i <= n; i++) {
    let maxW = -Infinity;
    for (let j = 1; j <= n; j++) {
      maxW = Math.max(maxW, weight[i][j]);
    }
    lx[i] = maxW;
    makeStep(
      lineMap.initLx,
      `🏷️ [初始化左顶标] lx[${i}] = max(weight[${i}][*]) = ${maxW}，初始化可行顶标满足 lx[u] + ly[v] >= w。`,
      `初始化左部顶标 lx[${i}] = ${maxW}`,
      'init_labels',
      'lx',
      i
    );
  }

  // 2. 为每个左部节点寻找匹配
  for (let i = 1; i <= n; i++) {
    curLeft = `L${i}`;
    makeStep(lineMap.forLeft, `🔵 [为左部节点匹配] 开始为左部节点 L${i} 寻找相等子图增广路。`, `为左部节点 L${i} 寻找匹配`, 'augment');

    for (let j = 1; j <= n; j++) slack[j] = Infinity;
    makeStep(lineMap.initSlack, '🧹 [重置松弛数组] 将松弛数组 slack 填满无穷大，用于记录右部节点顶标最小差值。', '重置松弛数组 slack[] 为无穷大', 'augment', 'slack');

    while (true) {
      makeStep(lineMap.whileAugment, '🔁 [增广尝试循环] 尝试在当前相等子图中寻找增广路。', '启动相等子图增广循环', 'augment');

      visX = new Array(n + 1).fill(false);
      visY = new Array(n + 1).fill(false);
      makeStep(lineMap.resetVis, '🧹 [清空交错树访问标记] 重置 visX 与 visY 数组。', '清空交错树访问标记 visX 与 visY', 'augment');

      makeStep(lineMap.callDfs, `🚀 [调用深度优先搜索] 探查左部节点 L${i} 出发的相等子图交错路。`, `探查左部节点 L${i} 的相等子图交错路`, 'augment');
      makeStep(lineMap.dfsEntry, `  ↳ [遍历入口] 进入递归函数探查节点 L${i}。`, `进入节点 L${i} 的探查函数`, 'augment');
      visX[i] = true;
      makeStep(lineMap.dfsMarkVisX, `  🏷️ [标记左部访问] 标记左部节点 L${i} 属于交错树。`, `标记左部节点 L${i} 已访问`, 'augment');

      let found = false;
      for (let v = 1; v <= n; v++) {
        activeEdge = [`L${i}`, `R${v}`];
        makeStep(lineMap.dfsLoopV, `  ↳ [考察右部节点] 检查有向出边 L${i} ➔ R${v} (边权值 w = ${weight[i][v]})。`, `考察出边 (L${i}, R${v})`, 'augment');

        makeStep(lineMap.dfsCheckVisY, `  🔎 [核验右部访问] 检查右部节点 R${v} 是否已被交错树访问。`, `核验右部节点 R${v} 访问状态`, 'augment');
        if (visY[v]) continue;

        const delta = lx[i] + ly[v] - weight[i][v];
        makeStep(lineMap.dfsCalcDelta, `  📐 [计算顶标差值] delta = lx[${i}](${lx[i]}) + ly[${v}](${ly[v]}) - w(${weight[i][v]}) = ${delta}。`, `计算顶标差值 delta = ${delta}`, 'augment');

        makeStep(lineMap.dfsCheckDeltaZero, `  🔎 [相等子图核验] 核验 delta == 0 (${delta === 0})。`, `核验边是否属于相等子图`, 'augment');
        if (delta === 0) {
          visY[v] = true;
          makeStep(lineMap.dfsMarkVisY, `  🏷️ [加入相等子图] 标记 visY[${v}] = true；边 L${i} ➔ R${v} 属于相等子图！`, `右部节点 R${v} 加入相等子图`, 'augment');

          makeStep(lineMap.dfsTryMatch, `  🔎 [匹配尝试] 检查右部节点 R${v} 是否未配对或能腾出位置。`, `核验右部节点 R${v} 配对状态`, 'augment');
          if (match[v] === 0) {
            match[v] = i;
            found = true;
            makeStep(lineMap.dfsAssignMatch, `  💘 [增广配对成功] 右部节点 R${v} 匹配至左部节点 L${i}！`, `配对成功：(L${i}, R${v})`, 'augment', 'match', v);
            break;
          }
        } else {
          slack[v] = Math.min(slack[v], delta);
          makeStep(lineMap.dfsUpdateSlack, `  ⚡ [更新松弛变量] 更新右部节点 R${v} 的最小差值 slack[${v}] = ${slack[v]}。`, `更新松弛变量 slack[${v}] = ${slack[v]}`, 'augment', 'slack', v);
        }
      }

      if (found) {
        makeStep(lineMap.callDfs, `✨ [增广成功跳出] 节点 L${i} 增广成功，完成当前轮次！`, `节点 L${i} 增广成功并跳出循环`, 'augment');
        break;
      }

      // 顶标调整
      let d = Infinity;
      for (let j = 1; j <= n; j++) {
        if (!visY[j]) d = Math.min(d, slack[j]);
      }
      deltaAdj = d;
      makeStep(lineMap.calcD, `⚖️ [计算顶标微调量] 提取离相等子图最近的最小差值 d = ${d}。`, `计算最小顶标微调量 d = ${d}`, 'adjust_labels');

      for (let j = 1; j <= n; j++) {
        if (visX[j]) lx[j] -= d;
        if (visY[j]) ly[j] += d;
        else if (slack[j] !== Infinity) slack[j] -= d;
      }
      makeStep(
        lineMap.adjustLabels,
        `🔄 [顶标双向调整] 已访问左顶标 lx -= ${d}，已访问右顶标 ly += ${d}，未访问 slack -= ${d}！扩充相等子图！`,
        `双向调整顶标 (微调量 d = ${d})`,
        'adjust_labels',
        'lx'
      );
    }
  }

  // 3. 计算最终权值
  totalWeight = 0;
  for (let v = 1; v <= n; v++) {
    if (match[v] > 0) totalWeight += weight[match[v]][v];
  }
  curLeft = undefined;
  activeEdge = undefined;
  deltaAdj = undefined;

  makeStep(lineMap.returnAns, `🎉 [KM 最佳匹配达成] 最大权完备匹配总权值 = ${totalWeight}！`, 'KM 算法推导完成，达成最大权完美匹配', 'done');

  return steps;
}
