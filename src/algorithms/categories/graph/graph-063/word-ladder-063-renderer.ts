/**
 * 左程云算法通关课 Class 063: 单词接龙 (Word Ladder · LeetCode 127)
 * 双向广搜（Bidirectional BFS）波前扩散与小集合优先探索
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 统合了库内经典双向广搜与左神名师讲义，采用声明式架构、四语言行号联动与双端波前沙盘。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import {
  WORD_LADDER_063_CODES,
  WORD_LADDER_063_LINES,
} from './graph-063-stage-codes';
import { Graph063StepBase, renderBiBfsWavefront } from './graph-063-shared';

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
      message: `⚠️ 搜索队列已耗尽，两军未能相遇，不存在从 "${begin}" 到 "${end}" 的有效转换序列，返回 0。`,
      metrics: { '最终结果': 0, '状态': '无法接龙' },
    });
  }

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'word-ladder-063',
  name: '单词接龙 (双向广搜)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code01：双向广搜经典，小集合优先相向扩展，空间复杂度从 b^d 锐减至 2*b^(d/2) (LeetCode 127)',
  aliases: ['word-ladder-class063', 'bi-bfs-class063', 'word-ladder-127'],
  problemHtml: GRAPH_063_PROBLEMS['word-ladder-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['word-ladder-063'].complexityHtml,
  codeLanguages: WORD_LADDER_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'hit_to_cog',
      options: [
        { label: '经典接龙 (hit -> cog, 5步)', value: 'hit_to_cog' },
        { label: '精炼接龙 (bat -> cog, 4步)', value: 'bat_to_cog' },
        { label: '无解阻断 (hit -x-> cog, 0步)', value: 'unreachable' },
      ],
    },
  ],
  presets: [
    { label: '经典接龙 (hit -> cog, 5步)', values: { preset: 'hit_to_cog' } },
    { label: '精炼接龙 (bat -> cog, 4步)', values: { preset: 'bat_to_cog' } },
    { label: '无解阻断 (hit -x-> cog, 0步)', values: { preset: 'unreachable' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildWordLadder063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: WordLadder063Step) => {
    container.innerHTML = renderBiBfsWavefront({
      smallLevel: step.smallLevel,
      bigLevel: step.bigLevel,
      visitedCount: step.visitedCount,
      curWord: step.curWord,
      nextLevel: step.nextLevel,
      meetWord: step.meetWord,
      status: step.status,
    });
  },
});
