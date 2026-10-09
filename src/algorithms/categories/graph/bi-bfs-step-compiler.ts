import { HighlightTarget } from '../../../core/code-panel';
import { StepBase } from '../../../core/step-visualizer';

export interface BiBFSStep extends StepBase {
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
    entry: { cpp: 9, java: 8, python: 1, javascript: 2 },
    checkEndInDict: { cpp: 11, java: 10, python: 12, javascript: 4 },
    initSets: { cpp: 13, java: 12, python: 15, javascript: 6 },
    addBeginEnd: { cpp: 13, java: 16, python: 15, javascript: 6 },
    forLenLoop: { cpp: 19, java: 19, python: 20, javascript: 12 },
    initNextLevel: { cpp: 20, java: 20, python: 21, javascript: 13 },
    forSmallWord: { cpp: 22, java: 22, python: 22, javascript: 15 },
    forCharPos: { cpp: 24, java: 24, python: 23, javascript: 16 },
    forLetters: { cpp: 26, java: 26, python: 23, javascript: 17 },
    checkMeet: { cpp: 30, java: 30, python: 24, javascript: 21 },
    returnLen: { cpp: 30, java: 31, python: 25, javascript: 22 },
    checkDict: { cpp: 32, java: 33, python: 26, javascript: 24 },
    addNextLevel: { cpp: 33, java: 34, python: 27, javascript: 25 },
    checkSwapSets: { cpp: 42, java: 43, python: 31, javascript: 31 },
    swapToSmall: { cpp: 43, java: 44, python: 32, javascript: 32 },
    swapToBig: { cpp: 45, java: 46, python: 34, javascript: 34 },
    returnZero: { cpp: 50, java: 50, python: 38, javascript: 41 },
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
  makeStep(lines.entry, `🚀 [算法初始化] ladderLength("${beginWord}" ➔ "${endWord}")：开启双向广度优先搜索。`, '启动双向广搜 ladderLength', 'init');

  const dictSet = new Set(wordList);
  makeStep(lines.checkEndInDict, `🔎 [检查终点在字典中] if (!dict.contains("${endWord}")) -> (${dictSet.has(endWord)})。`, `检查终点 "${endWord}" 是否在字典中`, 'init');
  if (!dictSet.has(endWord)) {
    makeStep(lines.returnZero, '❌ [终点不可达] 终点单词不在词表中，直接返回 0。', '终点不可达返回 0', 'done');
    return steps;
  }

  makeStep(lines.initSets, '📦 [初始化双向集合] 创建 smallLevel 与 bigLevel 集合；准备进行双端波前交替扩张。', '创建双向集合 small 与 big', 'init');

  makeStep(lines.addBeginEnd, `🌱 [起点终点入集] smallLevel.add("${beginWord}"), bigLevel.add("${endWord}")；正反双向锚定！`, '起点与终点分别加入双向集合', 'init', 'small', 0);

  // 2. 双向扩展循环
  let len = 2;
  stepCount = len;
  let collided = false;

  while (smallLevel.size > 0) {
    makeStep(lines.forLenLoop, `🔁 [进入转换轮次] for (len = ${len}; !smallLevel.isEmpty(); len++)：当前搜索层深度 = ${len}。`, `开始第 ${len} 轮波前扩展`, isForwardTurn ? 'forward' : 'backward');

    const nextLevel = new Set<string>();
    makeStep(lines.initNextLevel, '🧹 [分配下一层前沿] HashSet<String> nextLevel = new HashSet<>()。', '创建下一层前沿集合 nextLevel', isForwardTurn ? 'forward' : 'backward');

    for (const word of smallLevel) {
      curWord = word;
      makeStep(lines.forSmallWord, `  ↳ [遍历当前集合单词] for (String word : smallLevel) -> 考察 "${word}"。`, `考察前沿单词 "${word}"`, isForwardTurn ? 'forward' : 'backward');

      const chars = word.split('');
      for (let i = 0; i < chars.length; i++) {
        const oldChar = chars[i];
        makeStep(lines.forCharPos, `    🔤 [变换位置 i=${i}] 尝试替换第 ${i + 1} 位字符 '${oldChar}'。`, `变换第 ${i + 1} 位字符 '${oldChar}'`, isForwardTurn ? 'forward' : 'backward');

        for (let code = 97; code <= 122; code++) {
          const ch = String.fromCharCode(code);
          if (ch === oldChar) continue;

          chars[i] = ch;
          const nextWord = chars.join('');

          // 碰撞判定
          if (bigLevel.has(nextWord)) {
            meetWord = nextWord;
            collided = true;
            makeStep(lines.checkMeet, `    💥 [双向波前碰撞！] if (bigLevel.contains("${nextWord}")) -> (对向集合已包含 "${nextWord}")！两波相遇！`, `双向波前碰撞相遇于 "${nextWord}"`, 'meet');

            makeStep(lines.returnLen, `    🏆 [达成最短接龙] return len = ${len}！最短转换序列长度锁定为 ${len}！`, `相遇达成最短转换步数 ${len}`, 'meet');
            break;
          }

          if (dictSet.has(nextWord) && !visited.has(nextWord)) {
            nextLevel.add(nextWord);
            visited.add(nextWord);
            makeStep(lines.addNextLevel, `    ✨ [发现有效扩展词] "${nextWord}" 在词表中且未访问，加入下一层波前！`, `加入下一层前沿集合: "${nextWord}"`, isForwardTurn ? 'forward' : 'backward', 'visited');
          }
        }
        chars[i] = oldChar;
        if (collided) break;
      }
      if (collided) break;
    }

    if (collided) break;

    // 核心：始终选择较小集合作为下一次的 smallLevel
    makeStep(lines.checkSwapSets, `  ⚖️ [大小集合对调优化] 比较集合规模: nextLevel.size=${nextLevel.size} vs bigLevel.size=${bigLevel.size}。`, `比较双向集合规模 (${nextLevel.size} vs ${bigLevel.size})`, isForwardTurn ? 'forward' : 'backward');

    if (nextLevel.size <= bigLevel.size) {
      smallLevel = nextLevel;
      makeStep(lines.swapToSmall, `  📌 [沿当前方向推进] nextLevel 规模较小 (${nextLevel.size})，保持同向推进。`, `保持当前方向推进 (前沿规模 ${nextLevel.size})`, isForwardTurn ? 'forward' : 'backward', 'small');
    } else {
      smallLevel = bigLevel;
      bigLevel = nextLevel;
      isForwardTurn = !isForwardTurn;
      makeStep(lines.swapToBig, `  🔄 [调转搜索方向] 对向集合规模更小 (${smallLevel.size})！掉转方向优先扩展更小波前，压制指数爆炸！`, `掉转扩展方向优先扩展小集合 (${smallLevel.size})`, isForwardTurn ? 'forward' : 'backward', 'small');
    }

    len++;
    stepCount = len;
  }

  if (collided) {
    makeStep(lines.returnLen, `🎉 [双向广搜完成] 最短接龙步数 ${len} 步！双向同时向中心汇聚，搜索规模锐减为单向的开方量级！`, `双向广搜完成，输出结果 ${len} 步`, 'done');
  } else {
    makeStep(lines.returnZero, '⚠️ [未找到通路] return 0：双向波前均已耗尽但未能碰撞，两词不连通。', '双向波前耗尽未相遇，输出 0', 'done');
  }

  return steps;
}
