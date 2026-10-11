/**
 * 有效的字母异位词 — 步进推演编译器
 * LeetCode 242：26 字符哈希计数数组
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface AnagramStep {
  s: string;
  t: string;
  phase: 'check-length' | 'scan-s' | 'scan-t' | 'check-record' | 'done';
  charIndex: number;
  currentChar: string | null;
  targetSlot: number | null;
  record: number[];
  isMatch: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildAnagramSteps(s: string, t: string): AnagramStep[] {
  const steps: AnagramStep[] = [];
  const record = new Array(26).fill(0);

  const lines = {
    lenMismatch: { java: 2, cpp: 4, python: [3, 4], javascript: 2 },
    initRecord: { java: 3, cpp: 5, python: 5, javascript: 3 },
    scanS: { java: [4, 5], cpp: 6, python: [6, 7], javascript: [5, 6] },
    scanT: { java: [7, 8], cpp: 7, python: [8, 9], javascript: [8, 9] },
    checkRecord: { java: [10, 11, 13], cpp: [8, 9, 11], python: 10, javascript: 11 },
  };

  // 1. 检查长度
  if (s.length !== t.length) {
    steps.push({
      s,
      t,
      phase: 'check-length',
      charIndex: -1,
      currentChar: null,
      targetSlot: null,
      record: [...record],
      isMatch: false,
      message: `字符串 s 长度 (${s.length}) 与 t 长度 (${t.length}) 不相等，无法构成字母异位词，直接返回 false。`,
      log: `长度不一致: ${s.length} != ${t.length} => false`,
      codeLine: lines.lenMismatch,
    });
    return steps;
  }

  steps.push({
    s,
    t,
    phase: 'check-length',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    isMatch: true,
    message: `两字符串长度一致 (len = ${s.length})，初始化 26 长度哈希数组 record = [0, ..., 0]。`,
    log: `长度一致 (len=${s.length})，初始化 record[26]`,
    codeLine: lines.initRecord,
  });

  // 2. 扫描 s
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]++;

    steps.push({
      s,
      t,
      phase: 'scan-s',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      isMatch: true,
      message: `扫描 s[${i}] = '${char}'：槽位 index = '${char}' - 'a' = ${slot}，频次累加 record[${slot}]++ (变为 ${record[slot]})。`,
      log: `s[${i}]='${char}': record[${slot}]++ => ${record[slot]}`,
      codeLine: lines.scanS,
    });
  }

  // 3. 扫描 t
  for (let i = 0; i < t.length; i++) {
    const char = t[i];
    const slot = char.charCodeAt(0) - 'a'.charCodeAt(0);
    record[slot]--;

    steps.push({
      s,
      t,
      phase: 'scan-t',
      charIndex: i,
      currentChar: char,
      targetSlot: slot,
      record: [...record],
      isMatch: true,
      message: `扫描 t[${i}] = '${char}'：槽位 index = '${char}' - 'a' = ${slot}，频次扣减 record[${slot}]-- (变为 ${record[slot]})。`,
      log: `t[${i}]='${char}': record[${slot}]-- => ${record[slot]}`,
      codeLine: lines.scanT,
    });
  }

  // 4. 检查 record 是否全 0
  const isAnagram = record.every((count) => count === 0);
  steps.push({
    s,
    t,
    phase: 'check-record',
    charIndex: -1,
    currentChar: null,
    targetSlot: null,
    record: [...record],
    isMatch: isAnagram,
    message: isAnagram
      ? `🎉 遍历 record[26]，所有字符槽位计数全部归零！s 与 t 互为有效的字母异位词，返回 true。`
      : `⚠️ 遍历 record[26]，发现存在非零槽位计数，字符频次不完全一致，返回 false。`,
    log: `检查 record 数组 => ${isAnagram ? '全部归 0 (true)' : '存在非零项 (false)'}`,
    codeLine: lines.checkRecord,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withAnagramMetrics(steps: AnagramStep[]): AnagramStep[] {
  return steps.map((s) => {
    const phaseNames: Record<string, string> = {
      'check-length': '长度检查',
      'scan-s': 's 累加计数',
      'scan-t': 't 抵消扣减',
      'check-record': '结果判定',
      done: '完成',
    };
    let res: string;
    if (s.phase === 'check-record' || s.phase === 'done') {
      res = s.isMatch ? '✓ true (是)' : '✗ false (否)';
    } else {
      res = '统计中...';
    }
    const action =
      s.currentChar && s.targetSlot !== null
        ? `'${s.currentChar}' - 'a' = ${s.targetSlot} (record[${s.targetSlot}] = ${s.record[s.targetSlot]})`
        : `'char' - 'a' = 槽位索引 (0~25)`;

    return {
      ...s,
      metrics: {
        phase: phaseNames[s.phase] || s.phase,
        char: s.currentChar ? `'${s.currentChar}'` : '—',
        slot: s.targetSlot !== null ? `[${s.targetSlot}]` : '—',
        res,
        action,
      },
    };
  });
}
