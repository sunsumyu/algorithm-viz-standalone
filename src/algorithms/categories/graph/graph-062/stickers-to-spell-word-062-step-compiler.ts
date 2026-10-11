/**
 * 左程云算法通关课 Class 062: 贴纸拼词 Step Compiler
 */

import { STICKERS_TO_SPELL_WORD_062_LINES } from './graph-062-stage-codes';
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

  outerLoop: while (queue.length > 0) {
    const size = queue.length;
    level++;

    steps.push({
      curTarget: queue[0],
      stickers,
      chosenSticker: null,
      level,
      queueSnapshot: [...queue],
      visitedCount: visited.size,
      ans: -1,
      decision: `开启第 ${level} 层搜索：本层共有 ${size} 个待处理目标状态`,
      message: `按层遍历，最先匹配空串的层数即为最少使用贴纸张数。`,
      log: `level ${level} start, batchSize=${size}`,
      codeLine: lines.outerLevelLoop,
      metrics: { '搜索深度(贴纸数)': level, '本层节点数': size, '已探索去重状态': visited.size },
      statusBadge: { text: `深度 ${level} 开始`, type: 'info' },
    });

    for (let k = 0; k < size; k++) {
      const cur = queue.shift()!;
      const firstCharIdx = cur.charCodeAt(0) - 97;
      const firstChar = cur[0];

      steps.push({
        curTarget: cur,
        stickers,
        chosenSticker: null,
        level,
        queueSnapshot: [cur, ...queue],
        visitedCount: visited.size,
        ans: -1,
        decision: `出队考察状态 "${cur}"：贪心锚定首字母 '${firstChar}'`,
        message: `核心剪枝定理：若多张贴纸都能消解 '${firstChar}'，由于贴纸使用顺序不影响结果，强制仅选取包含首字母 '${firstChar}' 的贴纸，避免同一贴纸集合的排列爆炸！`,
        log: `pop target "${cur}", anchor firstChar='${firstChar}'`,
        codeLine: lines.pollAndAnchor,
        metrics: { '当前考察目标': cur, '首字母锚点': firstChar, '队列剩余': queue.length },
        statusBadge: { text: `考察 "${cur}"`, type: 'warning' },
      });

      for (let i = 0; i < n; i++) {
        if (counts[i][firstCharIdx] > 0) {
          const nextTarget = subtractLetters(cur, counts[i]);
          const stickerName = stickers[i];

          steps.push({
            curTarget: cur,
            stickers,
            chosenSticker: stickerName,
            level,
            queueSnapshot: [...queue],
            visitedCount: visited.size,
            ans: -1,
            decision: `尝试贴纸 "${stickerName}"：成功抵扣首字母 '${firstChar}'，剩余待拼 "${nextTarget || '∅ (已拼成)'}"`,
            message: `应用贴纸 "${stickerName}" 后，原目标 "${cur}" 消减为 "${nextTarget}"。`,
            log: `apply sticker "${stickerName}" -> nextTarget="${nextTarget}"`,
            codeLine: lines.applySticker,
            metrics: { '尝试贴纸': stickerName, '消解后新状态': nextTarget || '∅', '去重检验': visited.has(nextTarget) ? '已存在(跳过)' : '新状态' },
            statusBadge: { text: `尝试贴纸 "${stickerName}"`, type: 'info' },
          });

          if (nextTarget === '') {
            ans = level;
            steps.push({
              curTarget: '',
              stickers,
              chosenSticker: stickerName,
              level,
              queueSnapshot: [...queue],
              visitedCount: visited.size,
              ans,
              decision: `命中目标！使用贴纸 "${stickerName}" 成功将目标完全消减为空串！最少张数 = ${ans}`,
              message: `BFS 的层序扩展性质保证了最先遇到空串的分支必具备最少贴纸张数。`,
              log: `hit empty target! ans=${ans}`,
              codeLine: lines.hitEmptyTarget,
              metrics: { '最终答案': ans, '消耗贴纸数': ans, '命中状态': '空串 ∅' },
              statusBadge: { text: `🎉 成功命中: ${ans}张`, type: 'success' },
            });
            break outerLoop;
          }

          if (!visited.has(nextTarget)) {
            visited.add(nextTarget);
            queue.push(nextTarget);

            steps.push({
              curTarget: nextTarget,
              stickers,
              chosenSticker: stickerName,
              level,
              queueSnapshot: [...queue],
              visitedCount: visited.size,
              ans: -1,
              decision: `新状态 "${nextTarget}" 入队等待下一层扩展`,
              message: `已加入 visited 去重哈希表，防止重复遍历产生死循环。`,
              log: `enqueue new target "${nextTarget}", queueSize=${queue.length}`,
              codeLine: lines.enqueueNext,
              metrics: { '新入队状态': nextTarget, '去重集容量': visited.size, '队列总规模': queue.length },
              statusBadge: { text: `入队 "${nextTarget}"`, type: 'info' },
            });
          }
        }
      }
    }
  }

  // 终局
  steps.push({
    curTarget: ans === -1 ? target : '',
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
