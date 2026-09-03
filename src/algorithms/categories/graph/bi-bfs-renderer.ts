/**
 * 双向广度优先搜索 (Bidirectional BFS - 单词接龙 LeetCode 127) 声明式可视化器
 * 核心：起点与终点双端交替扩展、优先扩展规模较小队列、两端相遇终止、搜索空间由 b^d 降为 2*b^(d/2)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（双端初始化、for循环层级递增、逐词变换、碰撞判定、较小集合对调均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BI_BFS_CODE_LANGUAGES,
  BI_BFS_PROBLEM_HTML,
  BI_BFS_ANALYSIS_HTML,
} from './bi-bfs-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface BiBFSStep {
  forwardVisited: string[];
  backwardVisited: string[];
  curWord: string;
  meetWord: string | null;
  stepCount: number;
  activePath?: string[];
  smallLevelList: string[];
  bigLevelList: string[];
  visitedList: string[];
  activeArray?: 'small' | 'big' | 'visited';
  activeSlot?: number;
  status: 'init' | 'forward' | 'backward' | 'meet' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildBiBFSSteps(preset: string = 'classic_word'): BiBFSStep[] {
  const steps: BiBFSStep[] = [];
  const isClassic = preset === 'classic_word';

  const beginWord = isClassic ? 'hit' : 'bat';
  const endWord = isClassic ? 'cog' : 'cog';
  const wordList = isClassic
    ? ['hot', 'dot', 'dog', 'lot', 'log', 'cog']
    : ['cat', 'cot', 'cog'];

  let smallLevel = new Set<string>([beginWord]);
  let bigLevel = new Set<string>([endWord]);
  const visited = new Set<string>([beginWord, endWord]);

  let curWord = beginWord;
  let meetWord: string | null = null;
  let stepCount = 1;
  let isForwardTurn = true;

  // 精准 17 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 16, java: 8, python: 1, javascript: 2 },
    checkEndInDict: { cpp: 18, java: 10, python: 27, javascript: 4 },
    initSets: { cpp: 20, java: 12, python: 29, javascript: 6 },
    addBeginEnd: { cpp: 20, java: 16, python: 29, javascript: 6 },
    forLenLoop: { cpp: 26, java: 19, python: 34, javascript: 12 },
    initNextLevel: { cpp: 27, java: 20, python: 35, javascript: 13 },
    forSmallWord: { cpp: 29, java: 22, python: 36, javascript: 15 },
    forCharPos: { cpp: 31, java: 24, python: 37, javascript: 16 },
    forLetters: { cpp: 33, java: 26, python: 37, javascript: 17 },
    checkMeet: { cpp: 37, java: 30, python: 38, javascript: 21 },
    returnLen: { cpp: 37, java: 31, python: 39, javascript: 22 },
    checkDict: { cpp: 39, java: 33, python: 40, javascript: 24 },
    addNextLevel: { cpp: 40, java: 34, python: 41, javascript: 25 },
    checkSwapSets: { cpp: 49, java: 43, python: 45, javascript: 31 },
    swapToSmall: { cpp: 50, java: 44, python: 46, javascript: 32 },
    swapToBig: { cpp: 52, java: 46, python: 48, javascript: 34 },
    returnZero: { cpp: 57, java: 50, python: 52, javascript: 41 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'forward' | 'backward' | 'meet' | 'done',
    activeArray?: 'small' | 'big' | 'visited',
    activeSlot?: number
  ): void {
    const fwdList = Array.from(isForwardTurn ? smallLevel : bigLevel);
    const bwdList = Array.from(isForwardTurn ? bigLevel : smallLevel);
    const smallList = Array.from(smallLevel);
    const bigList = Array.from(bigLevel);
    const visList = Array.from(visited);

    const meetStr = meetWord ? `"${meetWord}"` : '尚未相遇';
    const phaseStr =
      status === 'done'
        ? '双向搜索完成'
        : status === 'meet'
          ? '双向波前碰撞相遇'
          : isForwardTurn
            ? '正向波前扩展'
            : '反向波前扩展';

    let activePath: string[] | undefined = undefined;
    if (status === 'done') {
      activePath = isClassic
        ? ['hit', 'hot', 'dot', 'dog', 'cog']
        : ['bat', 'cat', 'cot', 'cog'];
    }

    steps.push({
      forwardVisited: fwdList,
      backwardVisited: bwdList,
      curWord,
      meetWord,
      stepCount,
      activePath,
      smallLevelList: smallList,
      bigLevelList: bigList,
      visitedList: visList,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-bibfs-step': `${stepCount} 层转换`,
        'metric-bibfs-meet': meetStr,
        'metric-small-size': `${smallLevel.size} 个前沿词`,
        'metric-bibfs-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] ladderLength("${beginWord}" ➔ "${endWord}")：开启双向广度优先搜索。`, 'ladderLength 入口', 'init');

  const dictSet = new Set(wordList);
  makeStep(lines.checkEndInDict, `🔎 [检查终点在字典中] if (!dict.contains("${endWord}")) -> (${dictSet.has(endWord)})。`, `dict.contains("${endWord}")`, 'init');
  if (!dictSet.has(endWord)) {
    makeStep(lines.returnZero, '❌ [终点不可达] 终点单词不在词表中，直接返回 0。', 'return 0', 'done');
    return steps;
  }

  makeStep(lines.initSets, '📦 [初始化双向集合] 创建 smallLevel 与 bigLevel 集合；准备进行双端波前交替扩张。', '创建双向哈希集合', 'init');

  makeStep(lines.addBeginEnd, `🌱 [起点终点入集] smallLevel.add("${beginWord}"), bigLevel.add("${endWord}")；正反双向锚定！`, '起点终点就绪', 'init', 'small', 0);

  // 2. 双向扩展循环
  let len = 2;
  stepCount = len;
  let collided = false;

  while (smallLevel.size > 0) {
    makeStep(lines.forLenLoop, `🔁 [进入转换轮次] for (len = ${len}; !smallLevel.isEmpty(); len++)：当前搜索层深度 = ${len}。`, `len = ${len}`, isForwardTurn ? 'forward' : 'backward');

    const nextLevel = new Set<string>();
    makeStep(lines.initNextLevel, '🧹 [分配下一层前沿] HashSet<String> nextLevel = new HashSet<>()。', 'new nextLevel', isForwardTurn ? 'forward' : 'backward');

    for (const word of smallLevel) {
      curWord = word;
      makeStep(lines.forSmallWord, `  ↳ [遍历当前集合单词] for (String word : smallLevel) -> 考察 "${word}"。`, `word: "${word}"`, isForwardTurn ? 'forward' : 'backward');

      const chars = word.split('');
      for (let i = 0; i < chars.length; i++) {
        const oldChar = chars[i];
        makeStep(lines.forCharPos, `    🔤 [变换位置 i=${i}] 尝试替换第 ${i + 1} 位字符 '${oldChar}'。`, `pos: ${i}`, isForwardTurn ? 'forward' : 'backward');

        for (let code = 97; code <= 122; code++) {
          const ch = String.fromCharCode(code);
          if (ch === oldChar) continue;

          chars[i] = ch;
          const nextWord = chars.join('');

          // 碰撞判定
          if (bigLevel.has(nextWord)) {
            meetWord = nextWord;
            collided = true;
            makeStep(lines.checkMeet, `    💥 [双向波前碰撞！] if (bigLevel.contains("${nextWord}")) -> (对向集合已包含 "${nextWord}")！两波相遇！`, `碰撞相遇: "${nextWord}"`, 'meet');

            makeStep(lines.returnLen, `    🏆 [达成最短接龙] return len = ${len}！最短转换序列长度锁定为 ${len}！`, `return len=${len}`, 'meet');
            break;
          }

          if (dictSet.has(nextWord) && !visited.has(nextWord)) {
            nextLevel.add(nextWord);
            visited.add(nextWord);
            makeStep(lines.addNextLevel, `    ✨ [发现有效扩展词] "${nextWord}" 在词表中且未访问，加入下一层波前！`, `nextLevel.add("${nextWord}")`, isForwardTurn ? 'forward' : 'backward', 'visited');
          }
        }
        chars[i] = oldChar;
        if (collided) break;
      }
      if (collided) break;
    }

    if (collided) break;

    // 核心：始终选择较小集合作为下一次的 smallLevel
    makeStep(lines.checkSwapSets, `  ⚖️ [大小集合对调优化] 比较集合规模: nextLevel.size=${nextLevel.size} vs bigLevel.size=${bigLevel.size}。`, `compare (${nextLevel.size} vs ${bigLevel.size})`, isForwardTurn ? 'forward' : 'backward');

    if (nextLevel.size <= bigLevel.size) {
      smallLevel = nextLevel;
      makeStep(lines.swapToSmall, `  📌 [沿当前方向推进] nextLevel 规模较小 (${nextLevel.size})，保持同向推进。`, 'smallLevel = nextLevel', isForwardTurn ? 'forward' : 'backward', 'small');
    } else {
      smallLevel = bigLevel;
      bigLevel = nextLevel;
      isForwardTurn = !isForwardTurn;
      makeStep(lines.swapToBig, `  🔄 [调转搜索方向] 对向集合规模更小 (${smallLevel.size})！掉转方向优先扩展更小波前，压制指数爆炸！`, 'swap(small, big)', isForwardTurn ? 'forward' : 'backward', 'small');
    }

    len++;
    stepCount = len;
  }

  if (collided) {
    makeStep(lines.returnLen, `🎉 [双向广搜完成] 最短接龙步数 ${len} 步！双向同时向中心汇聚，搜索规模锐减为单向的开方量级！`, `完成: ${len} 步`, 'done');
  } else {
    makeStep(lines.returnZero, '⚠️ [未找到通路] return 0：双向波前均已耗尽但未能碰撞，两词不连通。', 'return 0', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BiBFSStep>({
  id: 'bi-bfs',
  name: '双向广度优先搜索 (Bidirectional BFS)',
  viewId: 'algo-bi-bfs-view',
  category: 'graph',
  icon: '↔️',
  badge: {
    mode: '双向对进 · 小集合优先扩展 · 碰撞判定',
    complexity: 'O(b^(d/2)) · O(b^(d/2))',
  },
  card1Title: '↔️ 单词接龙网络与双向波前碰撞沙盘',
  card2Title: '📊 双向集合监视器 (smallLevel, bigLevel, visited)',
  card2Desc: '展示双向波前交替扩展、每次选择较小集合向前扩散、以及两端波前碰撞相遇全过程',
  legend: [
    { label: '🔵 正向波前扩展词', color: '#0369a1' },
    { label: '🌸 反向波前扩展词', color: '#db2777' },
    { label: '💥 双向碰撞相遇词', color: '#f59e0b' },
    { label: '🟢 最优接龙完整路径', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设单词网络',
      type: 'select',
      defaultValue: 'classic_word',
      options: [
        { label: '经典 6 词网络 (hit ➔ cog，相遇于 dot，最短步数 5)', value: 'classic_word' },
        { label: '4 词入门网络 (bat ➔ cog，相遇于 cat/cot，最短步数 4)', value: 'line_4word' },
      ],
    },
  ],
  presets: [
    { label: '经典 6 词接龙', values: { 'input-preset': 'classic_word' } },
    { label: '4 词入门接龙', values: { 'input-preset': 'line_4word' } },
  ],
  metrics: [
    { id: 'metric-bibfs-step', label: '转换序列长度', color: '#10b981' },
    { id: 'metric-bibfs-meet', label: '两波相遇单词', color: '#f59e0b' },
    { id: 'metric-small-size', label: '当前小波前规模', color: '#38bdf8' },
    { id: 'metric-bibfs-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BI_BFS_CODE_LANGUAGES,
  problemHtml: BI_BFS_PROBLEM_HTML,
  analysisHtml: BI_BFS_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_word') as string;
    return buildBiBFSSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isClassic = step.activePath && step.activePath.length === 5;

    const words = isClassic
      ? ['hit', 'hot', 'dot', 'dog', 'lot', 'log', 'cog']
      : ['bat', 'cat', 'cot', 'cog'];

    const coords: Record<string, { x: number; y: number }> = isClassic
      ? {
          hit: { x: 35, y: 80 },
          hot: { x: 85, y: 80 },
          dot: { x: 145, y: 40 },
          lot: { x: 145, y: 120 },
          dog: { x: 210, y: 40 },
          log: { x: 210, y: 120 },
          cog: { x: 275, y: 80 },
        }
      : {
          bat: { x: 45, y: 80 },
          cat: { x: 115, y: 80 },
          cot: { x: 195, y: 80 },
          cog: { x: 265, y: 80 },
        };

    const edges: Array<[string, string]> = isClassic
      ? [
          ['hit', 'hot'],
          ['hot', 'dot'],
          ['hot', 'lot'],
          ['dot', 'dog'],
          ['lot', 'log'],
          ['dog', 'cog'],
          ['log', 'cog'],
        ]
      : [
          ['bat', 'cat'],
          ['cat', 'cot'],
          ['cot', 'cog'],
        ];

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (
          (step.activePath[i] === u && step.activePath[i + 1] === v) ||
          (step.activePath[i] === v && step.activePath[i + 1] === u)
        ) {
          return true;
        }
      }
      return false;
    };

    const svgEdges = edges
      .map(([u, v]) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(u, v);
        const color = onPath ? '#10b981' : '#334155';
        const width = onPath ? 3.5 : 1.5;

        return `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
        `;
      })
      .join('');

    const svgNodes = words
      .map((w) => {
        const p = coords[w];
        if (!p) return '';

        const isMeet = step.meetWord === w;
        const inSmall = step.smallLevelList.includes(w);
        const inBig = step.bigLevelList.includes(w);
        const onPath = step.activePath && step.activePath.includes(w);

        const bg = isMeet
          ? '#b45309'
          : onPath
            ? '#065f46'
            : inSmall
              ? '#0369a1'
              : inBig
                ? '#9d174d'
                : '#1e293b';

        const border = isMeet
          ? '#facc15'
          : onPath
            ? '#10b981'
            : inSmall
              ? '#38bdf8'
              : inBig
                ? '#f472b6'
                : '#475569';

        return `
          <g>
            <rect x="${p.x - 18}" y="${p.y - 12}" width="36" height="24" rx="6" fill="${bg}" stroke="${border}" stroke-width="${isMeet || onPath ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${w}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">↔️ 单词接龙网络拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            相遇词: <b style="color: #f59e0b;">${step.meetWord || '扩散中...'}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部双向波前碰撞舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">↔️ 双向波前交替与相遇碰撞舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前考察: <b>"${step.curWord}"</b>
            </div>
          </div>

          <div style="display: flex; gap: 10px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>优先扩张集合 (small):</b> [${step.smallLevelList.join(', ')}]
            </div>
            <div style="background: rgba(219, 39, 119, 0.3); border: 1px solid #db2777; border-radius: 4px; padding: 4px 8px; color: #fbcfe8;">
              <b>对向等待集合 (big):</b> [${step.bigLevelList.join(', ')}]
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const smallBadges = step.smallLevelList.length > 0
      ? step.smallLevelList.map((w) => `<span style="background: #0369a1; color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">${w}</span>`).join(' ')
      : '空';

    const bigBadges = step.bigLevelList.length > 0
      ? step.bigLevelList.map((w) => `<span style="background: #9d174d; color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">${w}</span>`).join(' ')
      : '空';

    const pathStr = step.activePath && step.activePath.length > 0
      ? step.activePath.join(' ➔ ')
      : '尚未相遇闭合';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">smallLevel (波前):</span>
            <div>${smallBadges}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f472b6;">bigLevel (对向):</span>
            <div>${bigBadges}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">接龙路径状态:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${pathStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'bi-bfs',
  name: '双向广度优先搜索 (Bidirectional BFS)',
  viewId: 'algo-bi-bfs-view',
  category: 'graph',
  description: '左程云 Class 063 核心：双端交替扩展、每次优选较小集合向前扩散、搜索空间由 b^d 降为 2*b^(d/2) (LeetCode 127)',
  icon: '↔️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 26,
  learningGoal: '深刻理解双向广搜的核心依据与优化精髓，掌握小集合优先扩散与碰撞判定的标准写法',
});

export { Visualizer as BiBFSVisualizer };
