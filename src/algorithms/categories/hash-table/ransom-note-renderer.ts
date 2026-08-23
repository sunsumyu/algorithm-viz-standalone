/**
 * 赎金信可视化器（字符计数）
 * LeetCode 383
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './ransom-note.html?raw';

interface RNStep {
  note: string;
  mag: string;
  phase: 'build' | 'check';
  i: number;
  charCount: Map<string, number>;
  countEntries: [string, number][];
  status: 'init' | 'count-mag' | 'check-char' | 'consume' | 'fail' | 'success';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildRNSteps(note: string, mag: string): RNStep[] {
  const steps: RNStep[] = [];
  const count = new Map<string, number>();

  // 初始状态
  steps.push({
    note, mag, phase: 'build', i: -1,
    charCount: new Map(count), countEntries: [],
    status: 'init',
    message: '创建空的字符频率表 Map，准备统计 magazine 中各字符出现次数。',
    log: '初始化空 Map。',
    codeLine: [1, 2],
  });

  // Build 阶段：统计 magazine 中每个字符的频率
  for (let i = 0; i < mag.length; i++) {
    const ch = mag[i];
    const prev = count.get(ch) || 0;
    count.set(ch, prev + 1);
    steps.push({
      note, mag, phase: 'build', i,
      charCount: new Map(count),
      countEntries: [...count.entries()],
      status: 'count-mag',
      message: `magazine[${i}] = '${ch}'，count['${ch}'] = ${prev} → ${prev + 1}。`,
      log: `统计 magazine[${i}] '${ch}' → count=${prev + 1}。`,
      codeLine: [3, 4, 5],
    });
  }

  // Check 阶段：逐个检查 ransomNote 中的字符
  for (let i = 0; i < note.length; i++) {
    const ch = note[i];
    const cur = count.get(ch);

    // 检查字符是否可用
    if (cur === undefined || cur === 0) {
      steps.push({
        note, mag, phase: 'check', i,
        charCount: new Map(count),
        countEntries: [...count.entries()],
        status: 'fail',
        message: `ransomNote[${i}] = '${ch}'，但 count 中没有或已为 0，无法构造！返回 false。`,
        log: `检查 note[${i}] '${ch}' → 不可用，失败！`,
        codeLine: [7, 8, 9],
      });
      return steps;
    }

    // 检查字符（即将消耗）
    steps.push({
      note, mag, phase: 'check', i,
      charCount: new Map(count),
      countEntries: [...count.entries()],
      status: 'check-char',
      message: `ransomNote[${i}] = '${ch}'，count['${ch}'] = ${cur}，剩余足够，准备消耗。`,
      log: `检查 note[${i}] '${ch}' → count=${cur}，可用。`,
      codeLine: [7, 8],
    });

    // 消耗字符
    count.set(ch, cur - 1);
    steps.push({
      note, mag, phase: 'check', i,
      charCount: new Map(count),
      countEntries: [...count.entries()],
      status: 'consume',
      message: `消耗 '${ch}'：count['${ch}'] = ${cur} → ${cur - 1}。`,
      log: `消耗 note[${i}] '${ch}' → count=${cur - 1}。`,
      codeLine: [11],
    });
  }

  // 成功
  steps.push({
    note, mag, phase: 'check', i: note.length,
    charCount: new Map(count),
    countEntries: [...count.entries()],
    status: 'success',
    message: '所有字符都能从 magazine 中获取，可以构造赎金信！返回 true。',
    log: '全部通过，返回 true。',
    codeLine: [13],
  });

  return steps;
}

export class RansomNoteVisualizer extends StepVisualizer<RNStep> {
  protected codeLines = [
    'public boolean canConstruct(String ransomNote, String magazine) {',
    '    HashMap<Character, Integer> count = new HashMap<>();',
    '    for (char ch : magazine.toCharArray()) {',
    '        count.put(ch, count.getOrDefault(ch, 0) + 1);',
    '    }',
    '    for (char ch : ransomNote.toCharArray()) {',
    '        if (!count.containsKey(ch) || count.get(ch) == 0) {',
    '            return false;',
    '        }',
    '        count.put(ch, count.get(ch) - 1);',
    '    }',
    '    return true;',
    '}',
  ];
  protected codePanelTitle = 'Java 赎金信代码';

  private noteInput: HTMLInputElement | null = null;
  private magInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private areaEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private idxEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.noteInput = this.root.querySelector('#rn-note-input');
    this.magInput = this.root.querySelector('#rn-mag-input');
    this.btnStart = this.root.querySelector('#rn-start');
    this.exampleButtons = this.root.querySelectorAll('.rn-example-btn');
    this.areaEl = this.root.querySelector('#rn-area');
    this.logEl = this.root.querySelector('#rn-log');
    this.idxEl = this.root.querySelector('#rn-idx');
    this.curEl = this.root.querySelector('#rn-cur');
    this.countEl = this.root.querySelector('#rn-count');
    this.statusEl = this.root.querySelector('#rn-status');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.noteInput) this.noteInput.value = btn.dataset.note || '';
        if (this.magInput) this.magInput.value = btn.dataset.mag || '';
        this.start();
      };
    });
  }

  protected buildSteps(): RNStep[] {
    let note = (this.noteInput?.value || 'aa').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
    let mag = (this.magInput?.value || 'aab').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
    if (note.length === 0) note = 'aa';
    if (mag.length === 0) mag = 'aab';
    if (this.noteInput) this.noteInput.value = note;
    if (this.magInput) this.magInput.value = mag;
    return buildRNSteps(note, mag);
  }

  protected renderStep(step: RNStep): void {
    // 更新统计
    if (this.idxEl) this.idxEl.textContent = step.i >= 0 ? String(step.i) : '-';
    if (this.curEl) {
      const srcStr = step.phase === 'build' ? step.mag : step.note;
      this.curEl.textContent = step.i >= 0 && step.i < srcStr.length ? srcStr[step.i] : '-';
    }
    if (this.countEl) {
      const srcStr = step.phase === 'build' ? step.mag : step.note;
      if (step.i >= 0 && step.i < srcStr.length) {
        const ch = srcStr[step.i];
        const c = step.charCount.get(ch);
        this.countEl.textContent = c !== undefined ? String(c) : '-';
      } else {
        this.countEl.textContent = '-';
      }
    }
    if (this.statusEl) this.statusEl.textContent = this.statusText(step.status);

    // 渲染可视化区域
    if (this.areaEl) {
      this.areaEl.innerHTML = '';

      // Magazine 字符串（顶部）
      this.areaEl.appendChild(this.makeMagBlock(step));
      // 频率表（中间）
      this.areaEl.appendChild(this.makeCountBlock(step));
      // RansomNote 字符串（底部）
      this.areaEl.appendChild(this.makeNoteBlock(step));
    }

    this.renderLogLine(step);
  }

  private makeMagBlock(step: RNStep): HTMLElement {
    const wrap = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'rn-block-title';
    t.textContent = `magazine = "${step.mag}"`;
    wrap.appendChild(t);
    const row = document.createElement('div');
    row.className = 'rn-strings';
    if (step.mag.length === 0) {
      row.innerHTML = '<span style="color:#6c7086">（空）</span>';
    } else {
      // 计算每个 magazine 字符被消耗了多少次
      const consumedCount = new Map<string, number>();
      if (step.phase === 'check' || step.status === 'success') {
        // 统计 note 中已检查的字符消耗
        const checkLimit = step.status === 'success' ? step.note.length : (step.status === 'fail' ? step.i : step.i + 1);
        for (let j = 0; j < Math.min(checkLimit, step.note.length); j++) {
          const ch = step.note[j];
          consumedCount.set(ch, (consumedCount.get(ch) || 0) + 1);
        }
      }
      // 追踪每个字符被消耗的第几次出现
      const consumedTracker = new Map<string, number>();
      [...step.mag].forEach((ch, i) => {
        const c = document.createElement('div');
        c.className = 'rn-char';

        // 确定此字符是否已被消耗
        const totalConsumed = consumedTracker.get(ch) || 0;
        const neededForThisChar = (consumedCount.get(ch) || 0);
        const thisIsConsumed = totalConsumed < neededForThisChar;
        consumedTracker.set(ch, totalConsumed + 1);

        const isCurrent = step.phase === 'build' && step.i === i;
        if (isCurrent) c.classList.add('current');
        if (thisIsConsumed && !isCurrent) c.classList.add('consumed');
        c.textContent = ch;
        row.appendChild(c);
      });
    }
    wrap.appendChild(row);
    return wrap;
  }

  private makeCountBlock(step: RNStep): HTMLElement {
    const wrap = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'rn-block-title';
    t.textContent = '字符频率表 count (Map)';
    wrap.appendChild(t);
    const table = document.createElement('div');
    table.className = 'rn-count-table';

    const sorted = step.countEntries.sort((a, b) => a[0].localeCompare(b[0]));
    const currentChar = step.i >= 0
      ? (step.phase === 'build' ? step.mag[step.i] : step.note[step.i])
      : '';

    sorted.forEach(([ch, cnt]) => {
      const cell = document.createElement('div');
      cell.className = 'rn-count-cell';
      if (ch === currentChar) cell.classList.add('changed');
      if (cnt === 0) cell.classList.add('zero');
      cell.innerHTML = `<div class="ch">${ch}</div><div class="cnt">${cnt}</div>`;
      table.appendChild(cell);
    });

    if (sorted.length === 0) {
      table.innerHTML = '<span style="color:#6c7086;font-size:12px;">（空 Map）</span>';
    }

    wrap.appendChild(table);
    return wrap;
  }

  private makeNoteBlock(step: RNStep): HTMLElement {
    const wrap = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'rn-block-title';
    t.textContent = `ransomNote = "${step.note}"`;
    wrap.appendChild(t);
    const row = document.createElement('div');
    row.className = 'rn-strings';
    if (step.note.length === 0) {
      row.innerHTML = '<span style="color:#6c7086">（空）</span>';
    } else {
      [...step.note].forEach((ch, i) => {
        const c = document.createElement('div');
        c.className = 'rn-char';

        if (step.phase === 'check') {
          if (step.status === 'fail' && i === step.i) {
            c.classList.add('checked-fail');
          } else if (i < step.i || (i === step.i && (step.status === 'consume' || step.status === 'success'))) {
            c.classList.add('checked-ok');
          } else if (i === step.i && step.status === 'check-char') {
            c.classList.add('current');
          }
        }

        c.textContent = ch;
        row.appendChild(c);
      });
    }
    wrap.appendChild(row);
    return wrap;
  }

  private statusText(s: RNStep['status']): string {
    return {
      init: '初始化',
      'count-mag': '统计 magazine',
      'check-char': '检查字符',
      consume: '消耗字符',
      fail: '构造失败',
      success: '构造成功',
    }[s];
  }

  private renderLogLine(step: RNStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'ransom-note',
  name: '赎金信（字符计数）',
  viewId: 'algo-ransom-note-view',
  category: 'hash-table',
  description: '用字符频率表判断赎金信能否由杂志构造',
  icon: '📰',
  template,
  Visualizer: RansomNoteVisualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握用 Map 统计字符频率的方法',
});

export {};
