/**
 * 左程云算法通关课 Class 062: 贴纸拼词 (Stickers to Spell Word · LeetCode 691)
 * BFS 状态空间探索 + 贪心首字母剪枝消除排列冗余
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  STICKERS_TO_SPELL_WORD_062_CODES,
  STICKERS_TO_SPELL_WORD_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase } from './graph-062-shared';

export interface StickersStep extends Graph062StepBase {
  curTarget: string;
  stickers: string[];
  chosenSticker: string | null;
  level: number;
  queueSnapshot: string[];
  visitedCount: number;
  ans: number;
}

function subtractLetters(target: string, stickerCount: number[]): string {
  const tCount = new Array(26).fill(0);
  for (let i = 0; i < target.length; i++) {
    tCount[target.charCodeAt(i) - 97]++;
  }
  let res = '';
  for (let i = 0; i < 26; i++) {
    const remain = Math.max(0, tCount[i] - stickerCount[i]);
    if (remain > 0) {
      res += String.fromCharCode(97 + i).repeat(remain);
    }
  }
  return res;
}

export function buildStickers062Steps(preset: string = 'classic_thehat'): StickersStep[] {
  const steps: StickersStep[] = [];
  const lines = STICKERS_TO_SPELL_WORD_062_LINES;

  let stickers: string[];
  let target: string;

  if (preset === 'impossible') {
    stickers = ['notice', 'possible'];
    target = 'basicbasic';
  } else {
    // classic: with, example, science -> "thehat"
    stickers = ['with', 'example', 'science'];
    target = 'thehat';
  }

  const n = stickers.length;
  const counts = stickers.map((s) => {
    const cnt = new Array(26).fill(0);
    for (const ch of s) cnt[ch.charCodeAt(0) - 97]++;
    return cnt;
  });

  const queue: string[] = [target];
  const visited = new Set<string>([target]);
  let level = 0;
  let ans = -1;

  // Step 0: 入口
  steps.push({
    curTarget: target,
    stickers,
    chosenSticker: null,
    level: 0,
    queueSnapshot: [target],
    visitedCount: 1,
    ans: -1,
    decision: '算法启动：统计贴纸字符词频矩阵，目标词入队',
    message: `目标单词 "${target}"，可用贴纸 [${stickers.join(', ')}]。准备按层广搜最少贴纸张数。`,
    log: `enter minStickers: target="${target}", ${n} stickers`,
    codeLine: lines.entry,
    metrics: { '当前目标词': target, '贴纸种类': n, '当前层数': 0, '队列规模': 1 },
    statusBadge: { text: 'BFS 初始化', type: 'info' },
  });

  // Step 1: 队列准备就绪
  steps.push({
    curTarget: target,
    stickers,
    chosenSticker: null,
    level: 0,
    queueSnapshot: [target],
    visitedCount: 1,
    ans: -1,
    decision: '首个状态入队：已把初始目标串放入 BFS 搜索队列',
    message: `状态空间根节点 "${target}" 入队，搜索深度记为 0。`,
    log: `enqueue root target "${target}"`,
    codeLine: lines.initTargetQueue,
    metrics: { '根节点状态': target, '已访问去重集': 1, '搜索深度': 0 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  let found = false;

  while (queue.length > 0 && !found && level < 5) {
    const size = queue.length;

    for (let k = 0; k < size; k++) {
      const cur = queue.shift()!;

      steps.push({
        curTarget: cur,
        stickers,
        chosenSticker: null,
        level,
        queueSnapshot: [...queue],
        visitedCount: visited.size,
        ans: -1,
        decision: `弹出当前待拼目标字符串 "${cur || '∅'}"，当前消耗贴纸 ${level} 张`,
        message: cur === ''
          ? `目标串已完全拼出！所需最少贴纸数为 ${level} 张。`
          : `当前剩余字符序列 "${cur}"，锚定其首个字符 '${cur[0]}' 进行针对性贴纸匹配剪枝。`,
        log: `pop state "${cur}", level=${level}`,
        codeLine: lines.pollString,
        metrics: { '待消减目标': cur || '∅', '当前消耗张数': level, '锚定首字符': cur ? cur[0] : '无' },
        statusBadge: { text: `深度 ${level}`, type: 'info' },
      });

      if (cur === '') {
        ans = level;
        found = true;
        break;
      }

      const firstChar = cur[0];
      const firstIdx = firstChar.charCodeAt(0) - 97;

      for (let sIdx = 0; sIdx < n; sIdx++) {
        const sName = stickers[sIdx];
        const sCount = counts[sIdx];

        if (sCount[firstIdx] === 0) {
          // 贪心剪枝跳过
          continue;
        }

        const nextStr = subtractLetters(cur, sCount);

        steps.push({
          curTarget: cur,
          stickers,
          chosenSticker: sName,
          level,
          queueSnapshot: [...queue],
          visitedCount: visited.size,
          ans: -1,
          decision: `应用贴纸 "${sName}" 消除字符：首字符 '${firstChar}' 被匹配消除！`,
          message: `使用贴纸 "${sName}" 对目标 "${cur}" 消减后，得到新状态 "${nextStr || '∅ (全部拼完)'}"。`,
          log: `apply sticker "${sName}" to "${cur}" -> "${nextStr}"`,
          codeLine: lines.firstCharPrune,
          metrics: { '选取贴纸': sName, '消减前': cur, '消减后': nextStr || '∅', '锚定字符': firstChar },
          statusBadge: { text: `消减 -> ${nextStr || '完成'}`, type: 'info' },
        });

        if (!visited.has(nextStr)) {
          visited.add(nextStr);
          queue.push(nextStr);

          steps.push({
            curTarget: nextStr,
            stickers,
            chosenSticker: sName,
            level: level + 1,
            queueSnapshot: [...queue],
            visitedCount: visited.size,
            ans: -1,
            decision: `新状态 "${nextStr || '∅'}" 入队，纳入第 ${level + 1} 层搜索`,
            message: `状态 "${nextStr || '∅'}" 首次被发现，入队排队。`,
            log: `enqueue state "${nextStr}"`,
            codeLine: lines.enqueueNext,
            metrics: { '入队状态': nextStr || '∅', '下一层深度': level + 1, '去重集规模': visited.size },
            statusBadge: { text: `入队第 ${level + 1} 层`, type: 'info' },
          });

          if (nextStr === '') {
            ans = level + 1;
            found = true;
            break;
          }
        }
      }

      if (found) break;
    }

    level++;
  }

  // 终态步骤
  steps.push({
    curTarget: found ? '' : target,
    stickers,
    chosenSticker: null,
    level: ans === -1 ? level : ans,
    queueSnapshot: [],
    visitedCount: visited.size,
    ans,
    decision: ans !== -1
      ? `拼词成功：最少需要 ${ans} 张贴纸拼出目标 "${target}"！`
      : `拼词失败：可用贴纸中缺少目标 "${target}" 所需的必要字母，返回 -1。`,
    message: ans !== -1
      ? `通过贪心首字母剪枝，极大压缩了状态树分支，在第 ${ans} 层搜索成功命中空串目标！`
      : `无法拼出目标，搜索空间已穷尽，返回 -1。`,
    log: `search complete -> ans=${ans}`,
    codeLine: lines.returnStep,
    metrics: { '最终答案': ans, '总探索状态数': visited.size, '算法模式': 'BFS + 贪心剪枝' },
    statusBadge: { text: ans !== -1 ? `最少张数: ${ans}` : '不可完成: -1', type: ans !== -1 ? 'success' : 'danger' },
  });

  return steps;
}

export const stickersToSpellWord062Visualizer = registerDeclarativeAlgorithm<StickersStep>({
  id: 'stickers-to-spell-word-062',
  aliases: ['stickers-to-spell-word', 'stickers-691'],
  name: '贴纸拼词与状态空间广搜 (Class 062)',
  category: 'graph',
  icon: '🏷️',
  difficulty: 3,
  levelOrder: 6202,
  learningGoal: '掌握 BFS 结合贪心首字符剪枝的高效状态空间搜索，杜绝同集合贴纸的不同排列导致的指数爆炸',
  problemHtml: GRAPH_062_PROBLEMS.stickersToSpellWord062.html,
  codeLanguages: STICKERS_TO_SPELL_WORD_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'classic_thehat',
      options: [
        { label: '经典可拼：["with", "example", "science"] -> "thehat" (需3张)', value: 'classic_thehat' },
        { label: '缺少字母：["notice", "possible"] -> "basicbasic" (-1)', value: 'impossible' },
      ],
    },
  ],
  presets: [
    { label: 'thehat 经典用例 (需3张)', values: { preset: 'classic_thehat' } },
    { label: '缺字母不可行用例 (-1)', values: { preset: 'impossible' } },
  ],
  generateSteps: (inputs) => buildStickers062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const stickersHtml = step.stickers
      .map((s) => {
        const isChosen = step.chosenSticker === s;
        return `
          <div style="
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            background: ${isChosen ? '#fef3c7' : '#ffffff'};
            border: ${isChosen ? '2px solid #f59e0b' : '1px solid #cbd5e1'};
            border-radius: 8px;
            box-shadow: ${isChosen ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'};
            font-family: monospace;
            font-weight: 700;
            color: #1e293b;
          ">
            🏷️ ${s}
          </div>
        `;
      })
      .join('');

    const targetBadgeHtml = step.curTarget === ''
      ? `<span style="color: #10b981; font-weight: 800;">🎉 目标字符已全部消减完毕！</span>`
      : step.curTarget
          .split('')
          .map(
            (ch, idx) => `
              <span style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                background: ${idx === 0 ? '#fee2e2' : '#f1f5f9'};
                border: ${idx === 0 ? '2px solid #ef4444' : '1px solid #cbd5e1'};
                border-radius: 6px;
                font-family: monospace;
                font-weight: 800;
                color: ${idx === 0 ? '#b91c1c' : '#334155'};
              ">
                ${ch}
              </span>
            `
          )
          .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; min-height: 280px; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 24px; max-width: 520px; width: 100%;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">待拼剩余目标串 (首字母红色锚定):</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
            ${targetBadgeHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; width: 100%; max-width: 520px;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">可用贴纸库:</span>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${stickersHtml}
          </div>
        </div>
      </div>
    `;
  },
});
