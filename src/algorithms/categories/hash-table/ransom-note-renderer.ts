/**
 * 赎金信可视化器 — 声明式 4-Card 标准架构
 * LeetCode 383：26 字符哈希库存数组
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  RANSOM_NOTE_PROBLEM_HTML,
  RANSOM_NOTE_ANALYSIS_HTML,
  RANSOM_NOTE_CODE_LANGUAGES,
} from './ransom-note-problem-content';

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
function withMetrics(steps: RansomNoteStep[]): RansomNoteStep[] {
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

export function renderRansomNoteCanvas(container: HTMLElement, step: RansomNoteStep): void {
  const { ransomNote, magazine, phase, charIndex, targetSlot, record, overdraftSlot } = step;

  // 1. 渲染 magazine 和 ransomNote 字符流
  const renderTrack = (str: string, activePhase: 'stock-mag' | 'deduct-ran') =>
    str
      .split('')
      .map((ch, idx) => {
        const isActive = phase === activePhase && charIndex === idx;
        const bg = isActive ? '#eff6ff' : '#ffffff';
        const border = isActive ? '#3b82f6' : '#cbd5e1';
        const color = isActive ? '#2563eb' : '#0f172a';
        const transform = isActive ? 'scale(1.1)' : 'none';
        const shadow = isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none';
        return `
          <div style="width: 28px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: ${color}; transition: all 0.2s; transform: ${transform}; box-shadow: ${shadow};">
            <span>${ch}</span>
          </div>
        `;
      })
      .join('');

  // 2. 渲染 26 字符库存网格
  const bucketsHtml = record
    .map((count, idx) => {
      const char = String.fromCharCode(97 + idx);
      const isTarget = targetSlot === idx;
      const isOverdraft = overdraftSlot === idx;

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let countColor = '#0f172a';
      let boxShadow = 'none';
      let transform = 'none';
      if (isOverdraft) {
        bg = '#fef2f2';
        border = '#ef4444';
        countColor = '#dc2626';
      } else if (count > 0) {
        bg = '#eff6ff';
        border = '#93c5fd';
        countColor = '#2563eb';
      }
      if (isTarget) {
        boxShadow = '0 0 0 2px #3b82f6';
        transform = 'scale(1.08)';
      }
      return `
        <div style="border-radius: 6px; background: ${bg}; border: 1px solid ${border}; padding: 3px 1px; display: flex; flex-direction: column; align-items: center; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; box-shadow: ${boxShadow}; transform: ${transform};">
          <span style="font-size: 9.5px; font-weight: 700; color: #64748b;">${char}</span>
          <span style="font-size: 11px; font-weight: 800; color: ${countColor};">${count}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; justify-content: center;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">MAG</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(magazine, 'stock-mag')}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; min-width: 30px; text-transform: uppercase;">RAN</span>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">${renderTrack(ransomNote, 'deduct-ran')}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">record[26] 字符库存表</span>
        <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 4px; width: 100%; max-width: 540px; margin: 0 auto;">${bucketsHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'ransom-note',
  name: '赎金信（字符计数）',
  category: 'hash-table',
  description: '用字符频率表判断赎金信能否由杂志构造',
  icon: '📰',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握用 Map 统计字符频率的方法',
  inputs: [
    {
      id: 'ransomNote',
      label: 'ransomNote',
      type: 'text',
      defaultValue: 'aa',
      width: '50px',
    },
    {
      id: 'magazine',
      label: 'magazine',
      type: 'text',
      defaultValue: 'aab',
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: ("a" / "b" ➔ false)', values: { ransomNote: 'a', magazine: 'b' } },
    { label: '示例 2: ("aa" / "ab" ➔ false)', values: { ransomNote: 'aa', magazine: 'ab' } },
    { label: '示例 3: ("aa" / "aab" ➔ true)', values: { ransomNote: 'aa', magazine: 'aab' } },
    { label: '多字符匹配: ("secret" / "recreates")', values: { ransomNote: 'secret', magazine: 'recreates' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#3b82f6' },
    { id: 'char', label: '当前字符', color: '#a855f7' },
    { id: 'stock', label: '剩余库存量', color: '#f59e0b' },
    { id: 'res', label: '判定结果', color: '#10b981' },
  ],
  legend: [
    { label: 'magazine(+) 进库', color: '#2563eb' },
    { label: 'ransomNote(-) 消耗', color: '#dc2626' },
  ],
  codeLanguages: RANSOM_NOTE_CODE_LANGUAGES,
  problemHtml: RANSOM_NOTE_PROBLEM_HTML,
  analysisHtml: RANSOM_NOTE_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildRansomNoteSteps(
        String(inputs.ransomNote ?? 'aa') || 'aa',
        String(inputs.magazine ?? 'aab') || 'aab'
      )
    ),
  renderCanvas: (container, step) => renderRansomNoteCanvas(container, step as RansomNoteStep),
});
