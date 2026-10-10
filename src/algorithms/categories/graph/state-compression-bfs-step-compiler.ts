/**
 * 状态压缩 BFS (State Compression BFS - LeetCode 847 / 864) — 步进推演编译器
 * 职责：位掩码 1<<k 记录收集状态、状态空间扩维 (r, c, mask)、多图层 BFS 探索步骤生成
 */

import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface StateBFSItem {
  grid: string[][];
  curR: number;
  curC: number;
  keyMask: number;
  stepCount: number;
  activePath?: Array<[number, number]>;
  status: 'init' | 'key_a' | 'door_a' | 'key_b' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildStateBFSSteps(preset: string = 'classic_3x3'): StateBFSItem[] {
  const steps: StateBFSItem[] = [];
  const isLine = preset === 'simple_line';

  const grid: string[][] = isLine
    ? [['@', '.', 'a', 'b']]
    : [
        ['@', '.', 'a'],
        ['#', '#', '.'],
        ['b', '.', '.'],
      ];

  const targetMask = 3; // 2 把钥匙 a(位0), b(位1) -> 掩码 3 (0b11)

  let curR = 0;
  let curC = 0;
  let keyMask = 0;
  let stepCount = 0;
  const path: Array<[number, number]> = [[0, 0]];

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 8, java: 12, python: 8, javascript: 2 },
    initTarget: { cpp: 10, java: 14, python: 11, javascript: 3 },
    initVisited: { cpp: 13, java: 16, python: 12, javascript: 6 },
    initQueue: { cpp: 14, java: 17, python: 13, javascript: 7 },
    forSource: { cpp: 17, java: 20, python: 15, javascript: 9 },
    pushSource: { cpp: 18, java: 21, python: 16, javascript: 10 },
    markSource: { cpp: 19, java: 22, python: 17, javascript: 11 },
    whileQueue: { cpp: 23, java: 26, python: 20, javascript: 14 },
    pollCur: { cpp: 24, java: 27, python: 21, javascript: 15 },
    checkTarget: { cpp: 26, java: 30, python: 22, javascript: 17 },
    loopNeighbors: { cpp: 28, java: 32, python: 24, javascript: 19 },
    calcNextMask: { cpp: 29, java: 33, python: 25, javascript: 20 },
    checkVisited: { cpp: 30, java: 34, python: 26, javascript: 21 },
    markVisited: { cpp: 31, java: 35, python: 27, javascript: 22 },
    pushQueue: { cpp: 32, java: 36, python: 28, javascript: 23 },
    returnAns: { cpp: 36, java: 40, python: 32, javascript: 26 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'key_a' | 'door_a' | 'key_b' | 'move' | 'done'
  ): void {
    const maskBinary = `${keyMask.toString(2).padStart(2, '0')}b`;
    const keysCollected = [];
    if (keyMask & 1) keysCollected.push('🔑a');
    if (keyMask & 2) keysCollected.push('🔑b');
    const keyStr = keysCollected.length > 0 ? `${maskBinary} (${keysCollected.join(', ')})` : `${maskBinary} (无钥匙)`;

    const phaseStr =
      status === 'done'
        ? '所有钥匙集齐'
        : status === 'key_a'
          ? '拾得钥匙 a'
          : status === 'key_b'
            ? '拾得钥匙 b'
            : status === 'move'
              ? '网格探索移动'
              : '算法初始化';

    steps.push({
      grid: snapshotGrid2D(grid),
      curR,
      curC,
      keyMask,
      stepCount,
      activePath: path.map(([r, c]) => [r, c]),
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-state-keys': keyStr,
        'metric-state-steps': `${stepCount} 步`,
        'metric-state-coord': `(${curR}, ${curC})`,
        'metric-state-phase': phaseStr,
      },
    });
  }

  // 1. 初始化阶段
  makeStep(lines.entry, '🚀 [状态压缩 BFS 启动] shortestPathLength：扫描网格地图，寻找初始起点 \'@\' 与各钥匙分布。', 'BFS 入口', 'init');

  makeStep(lines.initTarget, '🎯 [确立目标状态] 全图共包含 2 把钥匙 (a, b)，终态目标二进制掩码 targetMask = 0b11 (十进制 3)。', 'targetMask = 3', 'init');

  makeStep(lines.initVisited, '📊 [构建扩维状态空间] boolean[][][] visited 记录坐标与钥匙掩码，不同掩码对应不同图层！', '构建三维 visited', 'init');

  makeStep(lines.initQueue, '📦 [初始化队列] Queue<int[]> queue = new LinkedList<>()；队列存储状态四元组 (r, c, mask, dist)。', '创建 BFS 队列', 'init');

  makeStep(lines.pushSource, '🌱 [起点状态入队] queue.offer([r=0, c=0, mask=0b00, dist=0])；初始无任何钥匙。', '起点状态入队', 'init');

  makeStep(lines.markSource, '🔒 [锁定初始状态] visited[0][0][0b00] = true；标记初始图层起点已访问。', 'visited[0][0][0]=true', 'init');

  if (isLine) {
    // 线性网格推演
    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty()) -> 展开队列前沿状态。', '!queue.isEmpty()', 'move');

    // (0,0) -> (0,1)
    curC = 1;
    stepCount = 1;
    path.push([curR, curC]);
    makeStep(lines.pollCur, '📤 [出队推进] poll() -> (r=0, c=0, mask=0b00)；尝试向右移动至通路 \'.\'。', 'poll (0,0)', 'move');
    makeStep(lines.checkTarget, '🔎 [终点检查] if (mask == targetMask) -> (0b00 != 0b11)。', 'check target', 'move');
    makeStep(lines.loopNeighbors, '  ↳ [考察出边] 遍历相邻可行格子 (0, 1)。', 'loop neighbor (0,1)', 'move');
    makeStep(lines.calcNextMask, '  ↳ [状态转移] 移动到 (0, 1)，未拾取钥匙，掩码保持 0b00。', 'nextMask = 0b00', 'move');
    makeStep(lines.checkVisited, '  🔎 [访问检查] if (!visited[0][1][0b00]) -> (true)。', 'check visited', 'move');
    makeStep(lines.markVisited, '  🏷️ [标记访问] visited[0][1][0b00] = true，加入队列。', 'visited[0][1][0]=true', 'move');
    makeStep(lines.pushQueue, '  📥 [状态入队] queue.offer([0, 1, mask=0b00, dist=1])。', 'offer (0,1,0)', 'move');

    // (0,1) -> (0,2) 'a'
    curC = 2;
    stepCount = 2;
    path.push([curR, curC]);
    keyMask |= 1; // 拾取钥匙 a
    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty())。', '!queue.isEmpty()', 'move');
    makeStep(lines.pollCur, '📤 [出队推进] poll() -> (r=0, c=1, mask=0b00)；继续向右移动。', 'poll (0,1)', 'move');
    makeStep(lines.checkTarget, '🔎 [终点检查] if (mask == targetMask) -> (0b00 != 0b11)。', 'check target', 'move');
    makeStep(lines.loopNeighbors, '  ↳ [考察出边] 遍历相邻钥匙格子 (0, 2)。', 'loop neighbor (0,2)', 'move');
    makeStep(lines.calcNextMask, '  ✨ [拾得钥匙 a] 踏入 (0, 2) 发现钥匙 \'a\'！执行位运算 mask |= (1<<0) -> 0b01！跃迁至新图层！', 'mask |= 1 (钥匙 a)', 'key_a');
    makeStep(lines.checkVisited, '  🔎 [访问检查] if (!visited[0][2][0b01]) -> (true)。', 'check visited', 'key_a');
    makeStep(lines.markVisited, '  🏷️ [新图层标记] visited[0][2][0b01] = true，携带钥匙 a 入队。', 'visited[0][2][1]=true', 'key_a');
    makeStep(lines.pushQueue, '  📥 [状态入队] queue.offer([0, 2, mask=0b01, dist=2])。', 'offer (0,2,1)', 'key_a');

    // (0,2) -> (0,3) 'b'
    curC = 3;
    stepCount = 3;
    path.push([curR, curC]);
    keyMask |= 2; // 拾取钥匙 b
    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty())。', '!queue.isEmpty()', 'move');
    makeStep(lines.pollCur, '📤 [出队推进] poll() -> (r=0, c=2, mask=0b01)；继续向右移动。', 'poll (0,2)', 'move');
    makeStep(lines.checkTarget, '🔎 [终点检查] if (mask == targetMask) -> (0b01 != 0b11)。', 'check target', 'move');
    makeStep(lines.loopNeighbors, '  ↳ [考察出边] 遍历相邻钥匙格子 (0, 3)。', 'loop neighbor (0,3)', 'move');
    makeStep(lines.calcNextMask, '  ✨ [拾得钥匙 b] 踏入 (0, 3) 发现钥匙 \'b\'！执行位运算 mask |= (1<<1) -> 0b11！集齐所有钥匙！', 'mask |= 2 (钥匙 b)', 'key_b');
    makeStep(lines.checkVisited, '  🔎 [访问检查] if (!visited[0][3][0b11]) -> (true)。', 'check visited', 'key_b');
    makeStep(lines.markVisited, '  🏷️ [新图层标记] visited[0][3][0b11] = true，集齐钥匙入队。', 'visited[0][3][3]=true', 'key_b');
    makeStep(lines.pushQueue, '  📥 [状态入队] queue.offer([0, 3, mask=0b11, dist=3])。', 'offer (0,3,3)', 'key_b');

    // 终态达成
    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty())。', '!queue.isEmpty()', 'done');
    makeStep(lines.pollCur, '📤 [终态出队] poll() -> (r=0, c=3, mask=0b11, dist=3)。', 'poll (0,3,3)', 'done');
    makeStep(lines.checkTarget, '🎉 [命中全状态目标] if (mask == targetMask) -> 0b11 == 0b11 (十进制 3)！', 'mask == targetMask', 'done');
    makeStep(lines.returnAns, `🏆 [算法成功终止] return dist -> 成功集齐所有钥匙，最短步数 = ${stepCount} 步！`, `return ${stepCount}`, 'done');
  } else {
    // 3x3 经典迷宫推演
    // (0,0) -> (0,1) -> (0,2) 'a'
    const route: Array<{ r: number; c: number; action: string; key?: number; status: 'init' | 'key_a' | 'door_a' | 'key_b' | 'move' | 'done' }> = [
      { r: 0, c: 1, action: '向右探测可行通路 (0, 1)', status: 'move' },
      { r: 0, c: 2, action: '向右探测发现钥匙 a (0, 2)', key: 1, status: 'key_a' },
      { r: 1, c: 2, action: '绕开障碍墙壁，向下探测 (1, 2)', status: 'move' },
      { r: 2, c: 2, action: '向下探测通路 (2, 2)', status: 'move' },
      { r: 2, c: 1, action: '向左探测通路 (2, 1)', status: 'move' },
      { r: 2, c: 0, action: '向左探测成功拾取钥匙 b (2, 0)', key: 2, status: 'key_b' },
    ];

    for (const step of route) {
      makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty())。', '!queue.isEmpty()', 'move');
      curR = step.r;
      curC = step.c;
      stepCount++;
      path.push([curR, curC]);

      if (step.key) {
        keyMask |= step.key;
        makeStep(lines.pollCur, `📤 [出队推进] 到达 (${curR}, ${curC})。`, `到达 (${curR}, ${curC})`, step.status);
        makeStep(lines.calcNextMask, `✨ [拾得钥匙] ${step.action}，更新状态掩码为 0b${keyMask.toString(2).padStart(2, '0')}！`, `钥匙更新: ${step.status}`, step.status);
      } else {
        makeStep(lines.pollCur, `📤 [出队推进] ${step.action}。`, `到达 (${curR}, ${curC})`, step.status);
      }
      makeStep(lines.checkVisited, `🔎 [多图层检查] visited[${curR}][${curC}][0b${keyMask.toString(2).padStart(2, '0')}] 记录新状态。`, '记录状态图层', step.status);
    }

    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty())。', '!queue.isEmpty()', 'done');
    makeStep(lines.checkTarget, '🎉 [命中全状态目标] if (mask == targetMask) -> 0b11 == 0b11，已收集所有钥匙 (a, b)！', 'mask == targetMask', 'done');
    makeStep(lines.returnAns, `🏆 [全局最优解输出] return dist -> 绕行障碍成功获取所有钥匙，最短步数 = ${stepCount} 步！`, `return ${stepCount}`, 'done');
  }

  return steps;
}
