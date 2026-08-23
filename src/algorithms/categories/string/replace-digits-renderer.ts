/**
 * 替换数字可视化器（单指针遍历）
 * 将字符串中的数字字符替换为指定字符串
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './replace-digits.html?raw';

interface RDStep {
  index: number;
  char: string;
  isDigit: boolean;
  replaced: number;
  result: string;
  status: 'init' | 'check' | 'skip' | 'replace' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export class ReplaceDigitsVisualizer extends StepVisualizer<RDStep> {
  protected codeLines = [
    'public String replaceDigits(String s, String replaceStr) {',
    '    StringBuilder sb = new StringBuilder();',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    '        if (c >= \'0\' && c <= \'9\') {',
    '            sb.append(replaceStr);',
    '        } else {',
    '            sb.append(c);',
    '        }',
    '    }',
    '    return sb.toString();',
    '}',
  ];
  protected codePanelTitle = '替换数字代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private replaceEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private replacedEl: HTMLElement | null = null;
  private lenEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rd-input');
    this.replaceEl = this.root.querySelector('#rd-replace');
    this.btnStart = this.root.querySelector('#rd-start');
    this.exampleButtons = this.root.querySelectorAll('.rd-example-btn');
    this.trackEl = this.root.querySelector('#rd-track');
    this.logEl = this.root.querySelector('#rd-log');
    this.iEl = this.root.querySelector('#rd-i');
    this.curEl = this.root.querySelector('#rd-cur');
    this.replacedEl = this.root.querySelector('#rd-replaced');
    this.lenEl = this.root.querySelector('#rd-len');
    this.phaseEl = this.root.querySelector('#rd-phase');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        if (this.replaceEl) this.replaceEl.value = btn.dataset.replace || 'number';
        this.start();
      };
    });
  }

  protected buildSteps(): RDStep[] {
    const s = this.inputEl?.value || 'a1b2c3def45';
    const replaceStr = this.replaceEl?.value || 'number';
    const steps: RDStep[] = [];

    steps.push({
      index: 0, char: s[0] || '', isDigit: /\d/.test(s[0]), replaced: 0, result: '',
      status: 'init',
      message: `开始遍历字符串 "${s}"，将数字替换为 "${replaceStr}"。`,
      log: `开始遍历，替换目标="${replaceStr}"。`,
      codeLine: [1, 2],
    });

    let result = '';
    let replaced = 0;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const isDigit = /\d/.test(ch);

      steps.push({
        index: i, char: ch, isDigit, replaced, result: result + '…',
        status: 'check',
        message: `检查 s[${i}]='${ch}'，是否数字？${isDigit ? '是' : '否'}。`,
        log: `检查 s[${i}]='${ch}'。`,
        codeLine: 3,
      });

      if (isDigit) {
        result += replaceStr;
        replaced++;
        steps.push({
          index: i, char: ch, isDigit, replaced, result,
          status: 'replace',
          message: `s[${i}]='${ch}' 是数字 → 替换为 "${replaceStr}"。结果: "${result}"。`,
          log: `替换 '${ch}' → "${replaceStr}"。`,
          codeLine: [4, 5],
        });
      } else {
        result += ch;
        steps.push({
          index: i, char: ch, isDigit, replaced, result,
          status: 'skip',
          message: `s[${i}]='${ch}' 不是数字 → 保留。结果: "${result}"。`,
          log: `保留 '${ch}'。`,
          codeLine: [6, 7],
        });
      }
    }

    steps.push({
      index: s.length, char: '', isDigit: false, replaced, result,
      status: 'done',
      message: `遍历完成！共替换 ${replaced} 处数字，最终结果: "${result}"。`,
      log: `完成，替换 ${replaced} 次，结果="${result}"。`,
      codeLine: 9,
    });

    return steps;
  }

  protected renderStep(step: RDStep): void {
    if (this.iEl) this.iEl.textContent = String(step.index);
    if (this.curEl) this.curEl.textContent = step.char || '-';
    if (this.replacedEl) this.replacedEl.textContent = String(step.replaced);
    if (this.lenEl) this.lenEl.textContent = String(step.result.length);
    if (this.phaseEl) {
      const phaseMap: Record<string, string> = { init: '开始', check: '检查中', skip: '保留字符', replace: '替换数字', done: '完成' };
      this.phaseEl.textContent = phaseMap[step.status] || '';
    }

    // Render the source string with pointer
    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      const s = this.inputEl?.value || '';

      // Show source chars at top
      const sourceRow = document.createElement('div');
      sourceRow.style.cssText = 'display:flex; gap:6px; align-items:flex-end; width:100%; justify-content:center;';
      [...s].forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'rd-cell';
        if (idx === step.index && step.status !== 'done') {
          cell.classList.add('current');
        }
        if (idx < step.index) {
          cell.classList.add('done');
        }
        if (/\d/.test(ch)) {
          cell.classList.add('digit');
        }
        let ptr = '';
        if (idx === step.index && step.status !== 'done') ptr = '<span class="rd-ptr">▼</span>';
        cell.innerHTML = `${ptr}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        sourceRow.appendChild(cell);
      });
      this.trackEl.appendChild(sourceRow);

      // Show result string below
      if (step.status !== 'init') {
        const resultRow = document.createElement('div');
        resultRow.style.cssText = 'display:flex; gap:6px; align-items:flex-end; width:100%; justify-content:center; margin-top:24px;';
        resultRow.innerHTML = '<span style="color:#94a3b8;font-size:12px;margin-right:6px;align-self:center;">→ </span>';

        // Build result display character by character
        let pos = 0;
        let displayItems: string[] = [];
        for (let i = 0; i < s.length; i++) {
          if (i < step.index || (i === step.index && step.status === 'done')) {
            // Already processed
            if (/\d/.test(s[i])) {
              displayItems.push(this.replaceEl?.value || 'number');
            } else {
              displayItems.push(s[i]);
            }
            pos++;
          } else if (i === step.index) {
            // Currently processing
            if (step.status === 'replace') {
              displayItems.push(this.replaceEl?.value || 'number');
            } else if (step.status === 'skip') {
              displayItems.push(s[i]);
            }
          } else {
            break;
          }
        }

        displayItems.forEach((item, i) => {
          const cell = document.createElement('div');
          cell.className = 'rd-cell replaced';
          cell.style.width = 'auto';
          cell.style.minWidth = '42px';
          cell.style.padding = '0 6px';
          cell.innerHTML = `<span class="val" style="font-size:14px;">${item}</span>`;
          resultRow.appendChild(cell);
        });

        this.trackEl.appendChild(resultRow);
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: RDStep): void {
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
  id: 'replace-digits',
  name: '替换数字（单指针遍历）',
  viewId: 'algo-replace-digits-view',
  category: 'string',
  description: '遍历字符串，将数字字符替换为指定内容',
  icon: '🔢',
  template,
  Visualizer: ReplaceDigitsVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握字符串遍历中条件替换的逻辑',
});
