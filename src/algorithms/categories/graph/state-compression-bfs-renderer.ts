/**
 * 状态压缩 BFS (State Compression BFS - 状态扩维与多图层最短路 LeetCode 847 / 864) 声明式可视化器
 * 核心：位掩码 1<<k 记录收集/访问状态、状态空间扩维 (u, mask)、多图层 BFS 首次点亮目标即为全局最优
 * 深度架构重构：严格解释器级全流程逐行高亮执行（状态扩维初始化、队列多源入队、while循环、poll出队、目标掩码判定、位运算转移、三维去重均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  STATE_COMPRESSION_BFS_PROBLEM_HTML,
  STATE_COMPRESSION_BFS_ANALYSIS_HTML,
} from './state-compression-bfs-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

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
    entry: { cpp: 15, java: 12, python: 8, javascript: 2 },
    initTarget: { cpp: 17, java: 14, python: 11, javascript: 3 },
    initVisited: { cpp: 20, java: 16, python: 12, javascript: 6 },
    initQueue: { cpp: 21, java: 17, python: 13, javascript: 7 },
    forSource: { cpp: 24, java: 20, python: 15, javascript: 9 },
    pushSource: { cpp: 25, java: 21, python: 16, javascript: 10 },
    markSource: { cpp: 26, java: 22, python: 17, javascript: 11 },
    whileQueue: { cpp: 30, java: 26, python: 20, javascript: 14 },
    pollCur: { cpp: 31, java: 27, python: 21, javascript: 15 },
    checkTarget: { cpp: 33, java: 30, python: 22, javascript: 17 },
    loopNeighbors: { cpp: 35, java: 32, python: 24, javascript: 19 },
    calcNextMask: { cpp: 36, java: 33, python: 25, javascript: 20 },
    checkVisited: { cpp: 37, java: 34, python: 26, javascript: 21 },
    markVisited: { cpp: 38, java: 35, python: 27, javascript: 22 },
    pushQueue: { cpp: 39, java: 36, python: 28, javascript: 23 },
    returnAns: { cpp: 43, java: 40, python: 32, javascript: 26 },
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
      grid: grid.map((row) => [...row]),
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
    makeStep(lines.loopNeighbors, '  ↳ [考察出边] 遍历相邻钥匙格子 (0, 3)。', 'loop neighbor (0,3)', 'move');
    makeStep(lines.calcNextMask, '  ✨ [拾得钥匙 b] 踏入 (0, 3) 发现钥匙 \'b\'！执行位运算 mask |= (1<<1) -> 0b11！', 'mask |= 2 (钥匙 b)', 'key_b');
    makeStep(lines.markVisited, '  🏷️ [新图层标记] visited[0][3][0b11] = true。', 'visited[0][3][3]=true', 'key_b');
    makeStep(lines.checkTarget, '🎯 [目标命中核验] if (mask == targetMask) -> (0b11 == 0b11: 钥匙全数集齐)！', 'mask == target', 'done');
    makeStep(lines.returnAns, '🎉 [全钥匙集齐完成] return dist = 3！在 1 维线性地图耗费 3 步成功集齐所有钥匙！', 'return dist=3', 'done');
  } else {
    // 经典 3x3 绕行障碍地图
    makeStep(lines.whileQueue, '🔁 [外层广搜] while (!queue.isEmpty()) -> 展开队列前沿状态。', '!queue.isEmpty()', 'move');

    // (0,0) -> (0,1)
    curC = 1;
    stepCount = 1;
    path.push([curR, curC]);
    makeStep(lines.pollCur, '📤 [出队推进] poll() -> (r=0, c=0, mask=0b00)；向右移动至 (0, 1)。', 'poll (0,0)', 'move');
    makeStep(lines.markVisited, '  🏷️ [标记访问] visited[0][1][0b00] = true。', 'visited[0][1][0]=true', 'move');

    // (0,1) -> (0,2) 'a'
    curC = 2;
    stepCount = 2;
    path.push([curR, curC]);
    keyMask |= 1;
    makeStep(lines.pollCur, '📤 [出队推进] poll() -> (r=0, c=1, mask=0b00)；向右移动至 (0, 2)。', 'poll (0,1)', 'move');
    makeStep(lines.calcNextMask, '  ✨ [拾得钥匙 a] 踏入 (0, 2) 拾取钥匙 \'a\'！执行 mask |= 1 -> 0b01！跨入图层 1！', 'mask |= 1 (钥匙 a)', 'key_a');
    makeStep(lines.markVisited, '  🏷️ [新图层标记] visited[0][2][0b01] = true。', 'visited[0][2][1]=true', 'key_a');

    // (0,2) -> (1,2)
    curR = 1;
    stepCount = 3;
    path.push([curR, curC]);
    makeStep(lines.pollCur, '📤 [图层 1 出队] 携带钥匙 a (mask=0b01) 向下绕过障碍，移动至 (1, 2)。', 'poll (0,2,0b01)', 'move');
    makeStep(lines.markVisited, '  🏷️ [标记访问] visited[1][2][0b01] = true。', 'visited[1][2][1]=true', 'move');

    // (1,2) -> (2,2)
    curR = 2;
    stepCount = 4;
    path.push([curR, curC]);
    makeStep(lines.pollCur, '📤 [图层 1 出队] 继续向下移动至 (2, 2)。', 'poll (1,2,0b01)', 'move');
    makeStep(lines.markVisited, '  🏷️ [标记访问] visited[2][2][0b01] = true。', 'visited[2][2][1]=true', 'move');

    // (2,2) -> (2,1)
    curC = 1;
    stepCount = 5;
    path.push([curR, curC]);
    makeStep(lines.pollCur, '📤 [图层 1 出队] 向左移动至 (2, 1)。', 'poll (2,2,0b01)', 'move');
    makeStep(lines.markVisited, '  🏷️ [标记访问] visited[2][1][0b01] = true。', 'visited[2][1][1]=true', 'move');

    // (2,1) -> (2,0) 'b'
    curC = 0;
    stepCount = 6;
    path.push([curR, curC]);
    keyMask |= 2;
    makeStep(lines.pollCur, '📤 [图层 1 出队] 向左移动至 (2, 0)。', 'poll (2,1,0b01)', 'move');
    makeStep(lines.calcNextMask, '  ✨ [拾得钥匙 b] 踏入 (2, 0) 拾取钥匙 \'b\'！执行 mask |= 2 -> 0b11！集齐所有钥匙！', 'mask |= 2 (钥匙 b)', 'key_b');
    makeStep(lines.checkTarget, '🎯 [目标命中核验] if (mask == targetMask) -> (0b11 == 0b11: 达到终态)！', 'mask == target', 'done');
    makeStep(lines.returnAns, '🎉 [全钥匙集齐完成] return dist = 6！绕行障碍物共耗费 6 步，成功达成目标！', 'return dist=6', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<StateBFSItem>({
  id: 'state-compression-bfs',
  name: '状态压缩 BFS (State Compression BFS)',
  viewId: 'algo-state-compression-bfs-view',
  category: 'graph',
  icon: '🔑',
  badge: {
    mode: '状态扩维 (r, c, mask) · 位运算剪枝',
    complexity: 'O(R · C · 2^K) · O(R · C · 2^K)',
  },
  card1Title: '🔑 状态压缩网格地图与拾取轨迹沙盘',
  card2Title: '📊 状态空间监视器 (keyMask, 步数, 三元组)',
  card2Desc: '展示位掩码二进制位图、当前持有的钥匙状态、以及状态空间三维去重 (r, c, mask)',
  legend: [
    { label: '🚀 起点 (@)', color: '#38bdf8' },
    { label: '🔑 钥匙 (a, b)', color: '#f59e0b' },
    { label: '⚡ 当前探寻位置', color: '#eab308' },
    { label: '🧱 障碍阻挡 (#)', color: '#334155' },
    { label: '🟢 探索轨迹路径', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设地图模式',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 经典绕行障碍地图 (含钥匙 a, b，最短 6 步)', value: 'classic_3x3' },
        { label: '1x4 极简线性走廊地图 (直达钥匙 a, b，最短 3 步)', value: 'simple_line' },
      ],
    },
  ],
  presets: [
    { label: '3x3 绕行障碍', values: { 'input-preset': 'classic_3x3' } },
    { label: '1x4 极简走廊', values: { 'input-preset': 'simple_line' } },
  ],
  metrics: [
    { id: 'metric-state-keys', label: '持有的钥匙状态', color: '#f59e0b' },
    { id: 'metric-state-steps', label: '累计移动步数', color: '#10b981' },
    { id: 'metric-state-coord', label: '当前网格坐标', color: '#38bdf8' },
    { id: 'metric-state-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  problemHtml: STATE_COMPRESSION_BFS_PROBLEM_HTML,
  analysisHtml: STATE_COMPRESSION_BFS_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_3x3') as string;
    return buildStateBFSSteps(preset);
  },
  renderCanvas: (container, step) => {
    const rows = step.grid.length;
    const cols = step.grid[0].length;

    const cellHtml = step.grid
      .map((row, r) => {
        const rowCells = row
          .map((ch, c) => {
            const isCur = step.curR === r && step.curC === c;
            const onPath = step.activePath?.some(([pr, pc]) => pr === r && pc === c);
            const isWall = ch === '#';
            const isStart = ch === '@';
            const isKey = ch === 'a' || ch === 'b';

            let bg = isWall
              ? '#1e293b'
              : onPath
                ? '#065f46'
                : isCur
                  ? '#b45309'
                  : '#0f172a';

            let border = isCur
              ? '#facc15'
              : onPath
                ? '#10b981'
                : isWall
                  ? '#334155'
                  : isKey
                    ? '#f59e0b'
                    : '#334155';

            let label = ch;
            if (isStart) label = '🚩';
            else if (ch === 'a') label = '🔑a';
            else if (ch === 'b') label = '🔑b';
            else if (isWall) label = '🧱';
            else if (ch === '.') label = '·';

            return `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 48px; height: 48px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: monospace; font-size: 13px; font-weight: 800; color: #ffffff; box-sizing: border-box;">
                <span>${label}</span>
                <span style="font-size: 8px; color: #94a3b8;">${r},${c}</span>
              </div>
            `;
          })
          .join('');

        return `<div style="display: flex; gap: 8px;">${rowCells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🔑 状态压缩网格地图 (${rows}x${cols})</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前位置: <b style="color: #f59e0b;">(${step.curR}, ${step.curC})</b> | 步数: <b style="color: #10b981;">${step.stepCount}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 180px; background: #0f172a; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #334155; padding: 12px; box-sizing: border-box; gap: 8px;">
          ${cellHtml}
        </div>

        <!-- 底部状态扩维原理舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🔑 状态空间扩维与位掩码舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              目标掩码: <b>0b11 (集齐2把钥匙)</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>状态三元组:</b> (r=${step.curR}, c=${step.curC}, mask=${step.keyMask.toString(2).padStart(2, '0')}b)
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; color: #a7f3d0;">
              <b>多图层判重:</b> 每个钥匙掩码对应一个独立状态图层
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const maskBits = [0, 1].map((bit) => {
      const has = (step.keyMask & (1 << bit)) !== 0;
      const char = String.fromCharCode(97 + bit);
      const bg = has ? '#78350f' : '#1e293b';
      const textCol = has ? '#fde047' : '#64748b';
      const border = has ? '2px solid #eab308' : '1px solid #475569';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 52px; height: 34px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
          <span style="font-size: 8px; color: #94a3b8; line-height: 1;">位 ${bit} (钥匙 ${char})</span>
          <span style="line-height: 1.1;">${has ? '1 (持有)' : '0 (未得)'}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 140px; color: #f59e0b;">keyMask (二进制位图):</span>
            <div style="display: flex; gap: 6px;">${maskBits}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前扩维三元组:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">(r:${step.curR}, c:${step.curC}, mask:${step.keyMask}) | 累计 ${step.stepCount} 步</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'state-compression-bfs',
  name: '状态压缩 BFS (State Compression BFS)',
  viewId: 'algo-state-compression-bfs-view',
  category: 'graph',
  icon: '🔑',
  description: '状态空间扩维经典：位掩码 1<<k 记录收集状态、三维判重 visited[r][c][mask]、首次搜达目标必定为全局最优 (LeetCode 864)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 28,
  learningGoal: '掌握状态压缩 BFS 扩维思路、位运算判重与拾取机制及分层搜索最短性',
});

export { Visualizer as StateCompressionBfsVisualizer };
