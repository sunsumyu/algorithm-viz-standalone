/**
 * 二分查找可视化器
 * 重做：玻璃感 stat 面板 + 命中间距的"逐次折半"动画 + 命中 ripple 庆祝 + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './binary-search.html?raw';

type Phase = 'init' | 'search' | 'narrow-left' | 'narrow-right' | 'found' | 'not-found';

interface BSStep {
  array: number[];
  left: number;
  right: number;
  mid: number;          // -1 = 未计算
  target: number;
  phase: Phase;
  comparisons: number;  // 比较次数累计
  foundIndex: number;   // -1 = 未找到
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function binarySearchSteps(raw: number[], target: number): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...raw].sort((a, b) => a - b);
  let left = 0;
  let right = array.length - 1;
  let comparisons = 0;
  let foundIndex = -1;
  let found = false;

  steps.push({
    array, left, right, mid: -1, target, phase: 'init', comparisons,
    foundIndex: -1,
    message: `初始化：L=0，R=${right}，target=${target}，区间大小 ${right + 1}。`,
    log: `init L=0, R=${right}`,
    codeLine: 2,
  });

  if (array.length === 0) {
    steps.push({
      array, left: -1, right: -1, mid: -1, target, phase: 'not-found', comparisons,
      foundIndex: -1,
      message: '数组为空，无法查找。',
      log: 'empty array',
      codeLine: 4,
    });
    return steps;
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midVal = array[mid];
    comparisons++;

    steps.push({
      array, left, right, mid, target, phase: 'search', comparisons,
      foundIndex: -1,
      message: `计算 mid = ⌊(${left}+${right})/2⌋ = ${mid}，比较 arr[${mid}]=${midVal} 与 target=${target}。`,
      log: `mid=${mid}, arr[${mid}]=${midVal} vs target=${target}`,
      codeLine: 6,
    });

    if (midVal === target) {
      found = true;
      foundIndex = mid;
      steps.push({
        array, left: mid, right: mid, mid, target, phase: 'found', comparisons,
        foundIndex: mid,
        message: `🎯 命中！arr[${mid}] = ${target}，返回下标 ${mid}。共比较 ${comparisons} 次。`,
        log: `found @ ${mid} after ${comparisons} comparisons`,
        codeLine: 7,
      });
      break;
    } else if (midVal < target) {
      const newLeft = mid + 1;
      steps.push({
        array, left, right, mid, target, phase: 'narrow-right', comparisons,
        foundIndex: -1,
        message: `arr[${mid}]=${midVal} < ${target} ⇒ 目标在右半边，丢弃左半 [${left}..${mid}]，L = ${newLeft}。`,
        log: `arr[${mid}] < target → L = ${newLeft}`,
        codeLine: 9,
      });
      left = newLeft;
    } else {
      const newRight = mid - 1;
      steps.push({
        array, left, right, mid, target, phase: 'narrow-left', comparisons,
        foundIndex: -1,
        message: `arr[${mid}]=${midVal} > ${target} ⇒ 目标在左半边，丢弃右半 [${mid}..${right}]，R = ${newRight}。`,
        log: `arr[${mid}] > target → R = ${newRight}`,
        codeLine: 11,
      });
      right = newRight;
    }
  }

  if (!found) {
    steps.push({
      array, left: -1, right: -1, mid: -1, target, phase: 'not-found', comparisons,
      foundIndex: -1,
      message: `未找到 target=${target}，返回 -1。共比较 ${comparisons} 次。`,
      log: `not found after ${comparisons} comparisons`,
      codeLine: 13,
    });
  }

  return steps;
}

export class BinarySearchVisualizer extends StepVisualizer<BSStep> {
  protected codeLines = [
    'public int binarySearch(int[] arr, int target) {',
    '    int L = 0, R = arr.length - 1;',
    '    ',
    '    while (L <= R) {',
    '        int mid = (L + R) / 2;',
    '        if (arr[mid] == target) return mid;  // 命中',
    '        ',
    '        if (arr[mid] < target) {',
    '            L = mid + 1;   // 搜索右半',
    '        } else {',
    '            R = mid - 1;   // 搜索左半',
    '        }',
    '    }',
    '    return -1;',
    '}',
  ];
  protected codePanelTitle = 'Java 二分查找源码';

  private arrayInput: HTMLInputElement | null = null;
  private targetInput: HTMLInputElement | null = null;
  private statL: HTMLElement | null = null;
  private statR: HTMLElement | null = null;
  private statM: HTMLElement | null = null;
  private statT: HTMLElement | null = null;
  private statC: HTMLElement | null = null;
  private cellsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#bs-array');
    this.targetInput = this.root.querySelector('#bs-target');
    this.statL = this.root.querySelector('#bs-stat-l');
    this.statR = this.root.querySelector('#bs-stat-r');
    this.statM = this.root.querySelector('#bs-stat-m');
    this.statT = this.root.querySelector('#bs-stat-t');
    this.statC = this.root.querySelector('#bs-stat-c');
    this.cellsEl = this.root.querySelector('#bs-cells');
    this.resultEl = this.root.querySelector('#bs-result');
    this.logEl = this.root.querySelector('#bs-log');
    this.clearLogBtn = this.root.querySelector('#bs-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'bs-speed',
      speedLabel: 'bs-speed-label',
      counter: 'step-counter',
      message: 'step-message',
    });

    this.root.querySelector('#bs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.bs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        if (this.targetInput) this.targetInput.value = btn.dataset.tgt || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
    this.arrayInput?.addEventListener('change', () => this.start());
    this.targetInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): BSStep[] {
    const arr = parseArray(this.arrayInput?.value || '1,3,5,7,9,11,13,15,17,19');
    const tgt = parseInt(this.targetInput?.value || '7', 10);
    return binarySearchSteps(arr, Number.isFinite(tgt) ? tgt : 7);
  }

  protected renderStep(step: BSStep): void {
    this.renderStats(step);
    this.renderCells(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: BSStep): void {
    const last = this.steps[Math.max(0, this.currentIndex - 1)];
    this.flashIfChanged(this.statL, this.fmtIdx(step.left, step), this.fmtIdx(last?.left, last));
    this.flashIfChanged(this.statR, this.fmtIdx(step.right, step), this.fmtIdx(last?.right, last));
    this.flashIfChanged(this.statM, step.mid < 0 ? '-' : String(step.mid), last && last.mid < 0 ? '-' : String(last?.mid ?? '-'));
    if (this.statT) this.statT.textContent = String(step.target);
    if (this.statC) this.statC.textContent = String(step.comparisons);
  }

  private fmtIdx(idx: number | undefined, step?: BSStep): string {
    if (idx == null || idx < 0) return '-';
    if (step && idx < step.array.length) return `${idx} (${step.array[idx]})`;
    return String(idx);
  }

  private flashIfChanged(el: HTMLElement | null, next: string, prev: string | undefined): void {
    if (!el) return;
    el.textContent = next;
    if (next !== prev) {
      el.style.transition = 'none';
      el.style.transform = 'scale(1.2)';
      el.style.color = '#67e8f9';
      requestAnimationFrame(() => {
        el.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1), color .6s';
        el.style.transform = 'scale(1)';
        el.style.color = '';
      });
    }
  }

  private renderCells(step: BSStep): void {
    const cellsEl = this.cellsEl;
    if (!cellsEl) return;
    cellsEl.innerHTML = '';
    const arr = step.array;
    if (arr.length === 0) {
      cellsEl.innerHTML = '<div style="color:#64748b;padding:24px;">空数组</div>';
      return;
    }

    arr.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'bs-cell';
      if (index === step.mid) cell.classList.add('bs-mid');
      if (step.phase === 'found' && index === step.foundIndex) cell.classList.add('bs-found');
      if (step.left >= 0 && step.right >= 0 && index >= step.left && index <= step.right && step.phase !== 'found') {
        cell.classList.add('bs-range');
      }
      if ((step.phase === 'narrow-left' || step.phase === 'narrow-right') && step.mid === index) {
        cell.classList.add(step.phase === 'narrow-left' ? 'bs-compare-yes' : 'bs-compare-no');
      }
      if (step.phase === 'not-found' || step.phase === 'init') {
        if (index !== step.mid && (step.left < 0 || index < step.left || index > step.right)) {
          cell.classList.add('bs-out');
        }
      } else if (step.left < 0 || step.right < 0 || index < step.left || index > step.right) {
        cell.classList.add('bs-out');
      }

      cell.innerHTML = `<span>${value}</span><span class="bs-idx">${index}</span>`;
      if (index === step.left && step.left >= 0 && step.left <= step.right) {
        const p = document.createElement('span');
        p.className = 'bs-ptr bs-ptr--L';
        p.textContent = 'L';
        cell.appendChild(p);
      }
      if (index === step.right && step.left >= 0 && step.left <= step.right) {
        const p = document.createElement('span');
        p.className = 'bs-ptr bs-ptr--R';
        p.textContent = 'R';
        cell.appendChild(p);
      }
      cellsEl.appendChild(cell);
    });
  }

  private renderResultBanner(step: BSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('bs-result--success', 'bs-result--fail');
    const emoji = this.resultEl.querySelector('.bs-emoji') as HTMLElement | null;
    if (step.phase === 'found') {
      this.resultEl.classList.add('bs-result--success');
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'not-found') {
      this.resultEl.classList.add('bs-result--fail');
      if (emoji) emoji.textContent = '❌';
    } else if (step.phase === 'narrow-left') {
      if (emoji) emoji.textContent = '👈';
    } else if (step.phase === 'narrow-right') {
      if (emoji) emoji.textContent = '👉';
    } else {
      if (emoji) emoji.textContent = '🎯';
    }
  }

  private renderLogPanel(step: BSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'bs-log-line' + (i === this.currentIndex ? ' bs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'bs-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log;
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'binary-search',
  name: '二分查找',
  viewId: 'algo-binary-search-view',
  category: 'search',
  description: '在有序数组中以 O(log n) 时间定位目标',
  icon: '🔍',
  template,
  Visualizer: BinarySearchVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握二分搜索的标准写法与边界处理',
});
