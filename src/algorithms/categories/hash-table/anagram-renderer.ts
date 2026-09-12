/**
 * 有效的字母异位词可视化器 — 声明式 4-Card 标准架构
 * LeetCode 242：26 字符哈希计数数组
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ANAGRAM_PROBLEM_HTML,
  ANAGRAM_ANALYSIS_HTML,
  ANAGRAM_CODE_LANGUAGES,
} from './anagram-problem-content';

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
function withMetrics(steps: AnagramStep[]): AnagramStep[] {
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

export function renderAnagramCanvas(container: HTMLElement, step: AnagramStep): void {
  const { s, t, phase, charIndex, targetSlot, record } = step;

  // 1. 渲染 s 和 t 字符串轨道
  const renderTrack = (str: string, activePhase: 'scan-s' | 'scan-t') =>
    str
      .split('')
      .map((ch, idx) => {
        const isActive = phase === activePhase && charIndex === idx;
        const bg = isActive ? '#eff6ff' : '#ffffff';
        const border = isActive ? '#2563eb' : '#cbd5e1';
        const color = isActive ? '#1d4ed8' : '#334155';
        const transform = isActive ? 'scale(1.08)' : 'none';
        const shadow = isActive ? '0 2px 6px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)';
        return `
          <div style="width: 26px; height: 28px; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800; color: ${color}; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; box-shadow: ${shadow}; transform: ${transform};">
            <span>${ch}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 26 字符哈希桶
  const bucketsHtml = record
    .map((count, idx) => {
      const char = String.fromCharCode(97 + idx);
      const isTarget = targetSlot === idx;
      let bg = '#ffffff';
      let border = '#cbd5e1';
      let countColor = '#334155';
      let transform = 'none';
      if (count > 0) {
        bg = '#eff6ff';
        border = '#93c5fd';
        countColor = '#1d4ed8';
      } else if (count < 0) {
        bg = '#fef2f2';
        border = '#fca5a5';
        countColor = '#b91c1c';
      }
      if (isTarget) {
        border = '#2563eb';
        bg = '#eff6ff';
        transform = 'scale(1.08)';
      }
      return `
        <div style="display: flex; flex-direction: column; align-items: center; border-radius: 6px; background: ${bg}; border: 1px solid ${border}; padding: 3px 0; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; transition: all 0.15s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); transform: ${transform};">
          <span style="font-weight: 800; color: #475569;">${char}</span>
          <span style="font-weight: 800; font-size: 10.5px; color: ${countColor};">${count}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">S</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(s, 'scan-s')}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">T</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(t, 'scan-t')}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">record[26] 字符频次哈希数组</span>
        <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 5px; width: 100%;">${bucketsHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'anagram',
  name: '有效的字母异位词（哈希计数）',
  category: 'hash-table',
  description: '长度26数组统计频次判断异位词',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '用字符频次统计判断字母异位词',
  inputs: [
    {
      id: 's',
      label: 's',
      type: 'text',
      defaultValue: 'anagram',
      placeholder: '字符串 s',
      width: '75px',
    },
    {
      id: 't',
      label: 't',
      type: 'text',
      defaultValue: 'nagaram',
      placeholder: '字符串 t',
      width: '75px',
    },
  ],
  presets: [
    { label: '经典匹配: ("anagram", "nagaram")', values: { s: 'anagram', t: 'nagaram' } },
    { label: '字符失配: ("rat", "car")', values: { s: 'rat', t: 'car' } },
    { label: '长度不一致: ("ab", "a")', values: { s: 'ab', t: 'a' } },
    { label: '单词乱序: ("listen", "silent")', values: { s: 'listen', t: 'silent' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'char', label: '当前字符 char', color: '#9333ea' },
    { id: 'slot', label: '槽位索引 slot', color: '#f59e0b' },
    { id: 'res', label: '异位词判定', color: '#10b981' },
    { id: 'action', label: '槽位计算', color: '#2563eb' },
  ],
  legend: [
    { label: 's(+) 累加', color: '#2563eb' },
    { label: 't(-) 抵消', color: '#dc2626' },
  ],
  codeLanguages: ANAGRAM_CODE_LANGUAGES,
  problemHtml: ANAGRAM_PROBLEM_HTML,
  analysisHtml: ANAGRAM_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildAnagramSteps(
        String(inputs.s ?? 'anagram') || 'anagram',
        String(inputs.t ?? 'nagaram') || 'nagaram'
      )
    ),
  renderCanvas: (container, step) => renderAnagramCanvas(container, step as AnagramStep),
});
