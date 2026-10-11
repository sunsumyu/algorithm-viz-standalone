/**
 * 赎金信 — 步进推演编译器
 * LeetCode 383：26 字符哈希库存数组
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RansomNoteStep {
  ransomNote: string;
  magazine: string;
  phase: 'check-length' | 'stock-mag' | 'deduct-ran' | 'done';
  charIndex: number;
  currentChar: string | null;
  targetSlot: number | null;
  record: number[];
  canConstruct: boolean;
  overdraftSlot: number | null;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildRansomNoteSteps(ransomNote: string, magazine: string): RansomNoteStep[] {
  const steps: RansomNoteStep[] = [];
  const record = new Array(26).fill(0);

  const lines = {
    checkLenFail: { java: 2, cpp: 4, python: [3, 4], javascript: 2 },
    initRecord: { java: 3, cpp: 5, python: 5, javascript: [3, 4] },
    stockMag: { java: [4, 5], cpp: [6, 7], python: 5, javascript: [5, 6] },
    deductOverdraft: { java: [8, 9, 10], cpp: [10, 11], python: [7, 8], javascript: [10, 11] },
    deductSuccess: { java: 8, cpp: 10, python: 9, javascript: 10 },
    done: { java: 13, cpp: 13, python: 10, javascript: 13 },
  };

  if (ransomNote.length > magazine.length) {
    steps.push({
      ransomNote,
      magazine,
      phase: 'check-length',
      charIndex: -1,
      currentChar: null,
      targetSlot: null,
      record: [...record],
      canConstruct: false,
      overdraftSlot: null,
      message: `赎金信长度 (${ransomNote.length}) 大于杂志库长度 (${magazine.length})，字符总数不足，直接返回 false。`,
      log: `长度不足: ${ransomNote.length} > ${magazine.length} => false`,
      codeLine: lines.checkLenFail,
    });
    return steps;
  }

  steps.push({
    ransomNote,
    magazine,
    phase: 'check-length',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    canConstruct: true,
    overdraftSlot: null,
    message: `长度校验通过 (ransomNote: ${ransomNote.length}, magazine: ${magazine.length})，初始化 26 槽位字符库存表 record。`,
    log: `初始化库存 record[26]`,
    codeLine: lines.initRecord,
  });

  // 1. 扫描 magazine 进库
  for (let i = 0; i < magazine.length; i++) {
    const char = magazine[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]++;

    steps.push({
      ransomNote,
      magazine,
      phase: 'stock-mag',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      canConstruct: true,
      overdraftSlot: null,
      message: `杂志库进库 magazine[${i}] = '${char}'：槽位 [${slot}] 库存 +1 (现存 ${record[slot]})。`,
      log: `杂志入库 '${char}': record[${slot}] = ${record[slot]}`,
      codeLine: lines.stockMag,
    });
  }

  // 2. 扫描 ransomNote 消耗
  for (let j = 0; j < ransomNote.length; j++) {
    const char = ransomNote[j];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]--;

    if (record[slot] < 0) {
      steps.push({
        ransomNote,
        magazine,
        phase: 'deduct-ran',
        charIndex: j,
        currentChar: char,
        targetSlot: slot,
        record: [...record],
        canConstruct: false,
        overdraftSlot: slot,
        message: `⚠️ 赎金信扣减 ransomNote[${j}] = '${char}'：槽位 [${slot}] 库存不足透支 (record[${slot}] = ${record[slot]} < 0)！无法构成赎金信，返回 false。`,
        log: `✗ 透支: 字符 '${char}' 不足 (record[${slot}] < 0)`,
        codeLine: lines.deductOverdraft,
      });
      return steps;
    }

    steps.push({
      ransomNote,
      magazine,
      phase: 'deduct-ran',
      charIndex: j,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      canConstruct: true,
      overdraftSlot: null,
      message: `赎金信扣减 ransomNote[${j}] = '${char}'：槽位 [${slot}] 消耗 1 (剩余库存 ${record[slot]})。`,
      log: `消耗 '${char}': record[${slot}] 剩余 ${record[slot]}`,
      codeLine: lines.deductSuccess,
    });
  }

  steps.push({
    ransomNote,
    magazine,
    phase: 'done',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    canConstruct: true,
    overdraftSlot: null,
    message: `🎉 赎金信所有字符均已成功在杂志库中找到并扣减！可以构成赎金信，返回 true。`,
    log: `✓ 成功构成赎金信 (true)`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withRansomNoteMetrics(steps: RansomNoteStep[]): RansomNoteStep[] {
  return steps.map((s) => {
    const phaseNames: Record<string, string> = {
      'check-length': '长度检查',
      'stock-mag': '杂志入库',
      'deduct-ran': '赎金信扣减',
      done: '完成',
    };
    let res: string;
    if (s.overdraftSlot !== null) {
      res = '✗ false (不足)';
    } else if (s.phase === 'done') {
      res = '✓ true (满足)';
    } else {
      res = '计算中...';
    }

    return {
      ...s,
      metrics: {
        phase: phaseNames[s.phase] || s.phase,
        char: s.currentChar ? `'${s.currentChar}'` : '—',
        stock: s.targetSlot !== null ? String(s.record[s.targetSlot]) : '—',
        res,
      },
    };
  });
}
