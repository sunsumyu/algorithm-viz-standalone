/**
 * 左程云算法通关课 Class 063: 单词接龙 (Word Ladder · LeetCode 127) - 步进推演编译器
 */

import { WORD_LADDER_063_LINES } from './graph-063-stage-codes';
import { Graph063StepBase } from './graph-063-shared';

export interface WordLadder063Step extends Graph063StepBase {
  smallLevel: string[];
  bigLevel: string[];
  visitedCount: number;
  curWord: string;
  nextLevel: string[];
  meetWord: string | null;
  stepLen: number;
  status: 'init' | 'forward' | 'backward' | 'meet' | 'done';
}

export function buildWordLadder063Steps(preset: string = 'hit_to_cog'): WordLadder063Step[] {
  const steps: WordLadder063Step[] = [];
  const lines = WORD_LADDER_063_LINES;

  let begin = 'hit';
  let end = 'cog';
  let wordList = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];

  if (preset === 'bat_to_cog') {
    begin = 'bat';
    end = 'cog';
    wordList = ['cat', 'cot', 'cog'];
  } else if (preset === 'unreachable') {
    begin = 'hit';
    end = 'cog';
    wordList = ['hot', 'dot', 'dog'];
  }

  const dict = new Set<string>(wordList);

  // Step 0: 入口帧
  steps.push({
    smallLevel: [begin],
    bigLevel: [end],
    visitedCount: 0,
    curWord: begin,
    nextLevel: [],
    meetWord: null,
    stepLen: 1,
    status: 'init',
    line: lines.entry.java,
    codeLine: lines.entry,
    message: `🚀 算法初始化：开始单词接龙。起点="${begin}", 终点="${end}", 词表词数=${wordList.length}。`,
    metrics: { '起点': begin, '终点': end, '当前步数': 1 },
  });

  // 检查终点是否在词表中
  if (!dict.has(end)) {
    steps.push({
      smallLevel: [begin],
      bigLevel: [end],
      visitedCount: 0,
      curWord: end,
      nextLevel: [],
      meetWord: null,
      stepLen: 0,
      status: 'done',
      line: lines.checkEndInDict.java,
      codeLine: lines.checkEndInDict,
      message: `❌ 终点词 "${end}" 不在词表中，无法接龙，直接返回 0！`,
      metrics: { '起点': begin, '终点': end, '结果': 0 },
    });
    return steps;
  }

  let smallLevel = new Set<string>([begin]);
  let bigLevel = new Set<string>([end]);
  let visitedCount = 0;
  let len = 2;
  let found = false;

  while (smallLevel.size > 0 && !found) {
    steps.push({
      smallLevel: Array.from(smallLevel),
      bigLevel: Array.from(bigLevel),
      visitedCount,
      curWord: '',
      nextLevel: [],
      meetWord: null,
      stepLen: len,
      status: 'forward',
      line: lines.whileLoop.java,
      codeLine: lines.whileLoop,
      message: `🔄 进入新一轮双向探索：当前序列累计长度 len=${len}。较小端 smallLevel 包含 ${smallLevel.size} 个词，对向 bigLevel 包含 ${bigLevel.size} 个词。`,
      metrics: { '当前步数': len, '波前词数': smallLevel.size, '对向词数': bigLevel.size },
    });

    const nextLevel = new Set<string>();

    for (const w of smallLevel) {
      steps.push({
        smallLevel: Array.from(smallLevel),
        bigLevel: Array.from(bigLevel),
        visitedCount,
        curWord: w,
        nextLevel: Array.from(nextLevel),
        meetWord: null,
        stepLen: len,
        status: 'forward',
        line: lines.forWord.java,
        codeLine: lines.forWord,
        message: `🔍 考察波前单词 "${w}"，准备尝试替换每个位置的 26 个小写英文字母。`,
        metrics: { '考察单词': w, '波前词数': smallLevel.size, '累计生成': nextLevel.size },
      });

      const chars = w.split('');
      for (let i = 0; i < chars.length; i++) {
        const old = chars[i];
        for (let c = 97; c <= 122; c++) {
          const char = String.fromCharCode(c);
          if (char === old) continue;
          chars[i] = char;
          const nxt = chars.join('');

          if (bigLevel.has(nxt)) {
            // 两军会师相遇！
            steps.push({
              smallLevel: Array.from(smallLevel),
              bigLevel: Array.from(bigLevel),
              visitedCount,
              curWord: w,
              nextLevel: Array.from(nextLevel),
              meetWord: nxt,
              stepLen: len,
              status: 'meet',
              line: lines.checkMeet.java,
              codeLine: lines.checkMeet,
              message: `🎉 成功会师！单词 "${w}" 变换 1 个字母得到 "${nxt}"，已在对向 bigLevel 中找到！最短序列长度为 ${len}！`,
              metrics: { '汇合单词': nxt, '最短序列长度': len, '状态': '相遇成功' },
            });
            found = true;
            break;
          }

          if (dict.has(nxt)) {
            dict.delete(nxt);
            nextLevel.add(nxt);
            visitedCount++;
            steps.push({
              smallLevel: Array.from(smallLevel),
              bigLevel: Array.from(bigLevel),
              visitedCount,
              curWord: w,
              nextLevel: Array.from(nextLevel),
              meetWord: null,
              stepLen: len,
              status: 'forward',
              line: lines.addNext.java,
              codeLine: lines.addNext,
              message: `➕ 发现词表中合法后继词 "${nxt}"，加入 nextLevel 并从全局字典移除防重。`,
              metrics: { '新增后继': nxt, 'nextLevel词数': nextLevel.size },
            });
          }
        }
        chars[i] = old;
        if (found) break;
      }
      if (found) break;
    }

    if (found) break;

    // 双向规模较小者对调
    if (nextLevel.size <= bigLevel.size) {
      smallLevel = nextLevel;
      steps.push({
        smallLevel: Array.from(smallLevel),
        bigLevel: Array.from(bigLevel),
        visitedCount,
        curWord: '',
        nextLevel: [],
        meetWord: null,
        stepLen: len,
        status: 'forward',
        line: lines.swapCheck.java,
        codeLine: lines.swapCheck,
        message: `⚖️ nextLevel 规模 (${nextLevel.size}) <= bigLevel 规模 (${bigLevel.size})，直接将 smallLevel 指向 nextLevel，保持前进方向。`,
        metrics: { '波前保持': nextLevel.size, '对向规模': bigLevel.size },
      });
    } else {
      smallLevel = bigLevel;
      bigLevel = nextLevel;
      steps.push({
        smallLevel: Array.from(smallLevel),
        bigLevel: Array.from(bigLevel),
        visitedCount,
        curWord: '',
        nextLevel: [],
        meetWord: null,
        stepLen: len,
        status: 'backward',
        line: lines.swapCheck.java,
        codeLine: lines.swapCheck,
        message: `🔄 规模对调优化！新生成的 nextLevel (${nextLevel.size}) 大于 bigLevel (${smallLevel.size})，反转方向由对向更小军团展开扩散！`,
        metrics: { '换向扩展': smallLevel.size, '原集合规模': bigLevel.size },
      });
    }

    len++;
  }

  if (!found) {
    steps.push({
      smallLevel: [],
      bigLevel: [],
      visitedCount,
      curWord: '',
      nextLevel: [],
      meetWord: null,
      stepLen: 0,
      status: 'done',
      line: lines.returnZero.java,
      codeLine: lines.returnZero,
      message: `⚠️ 搜索队列已耗尽，两军未能相遇，不存在从 "${begin}" 到 "${end}" 的有效转换序列，返回 0。`,
      metrics: { '最终结果': 0, '状态': '无法接龙' },
    });
  }

  return steps;
}
