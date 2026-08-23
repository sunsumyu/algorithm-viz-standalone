/**
 * 哈希表理论基础可视化器
 * 演示哈希函数、插入、查找、冲突处理等核心概念
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './hash-table-theory.html?raw';

interface HTStep {
  table: (number | null)[];
  action: 'init' | 'hash' | 'collision' | 'insert' | 'search' | 'found' | 'not-found';
  key: number;
  index: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildHTSteps(keys: number[]): HTStep[] {
  const size = 7;
  const table: (number | null)[] = new Array(size).fill(null);
  const steps: HTStep[] = [];

  // Step 0: init
  steps.push({
    table: [...table],
    action: 'init',
    key: 0,
    index: -1,
    message: '初始化哈希表，size = 7，所有桶为空。使用 hash(key) = key % 7 作为哈希函数。',
    log: '初始化空表 (size=7)。',
    codeLine: 0,
  });

  // Insert each key
  for (const key of keys) {
    const idx = key % size;

    // Check for collision
    if (table[idx] !== null) {
      steps.push({
        table: [...table],
        action: 'collision',
        key,
        index: idx,
        message: `计算 hash(${key}) = ${key} % ${size} = ${idx}，冲突! 下标 ${idx} 已被 ${table[idx]} 占用。`,
        log: `hash(${key})=${idx} 冲突 (已有 ${table[idx]})。`,
        codeLine: [0, 1],
      });
    } else {
      steps.push({
        table: [...table],
        action: 'hash',
        key,
        index: idx,
        message: `计算 hash(${key}) = ${key} % ${size} = ${idx}，下标 ${idx} 为空，直接插入。`,
        log: `hash(${key})=${idx}，桶为空。`,
        codeLine: [0, 1],
      });
    }

    // Insert
    table[idx] = key;
    steps.push({
      table: [...table],
      action: 'insert',
      key,
      index: idx,
      message: `插入 ${key} 到下标 ${idx}，table[${idx}] = ${key}。`,
      log: `插入 table[${idx}] = ${key}。`,
      codeLine: [3, 4, 5],
    });
  }

  // Search for an existing key (use the last inserted key)
  const searchKey1 = keys[keys.length - 1] ?? 5;
  const idx1 = searchKey1 % size;
  steps.push({
    table: [...table],
    action: 'search',
    key: searchKey1,
    index: idx1,
    message: `查找 ${searchKey1}: hash(${searchKey1}) = ${searchKey1} % ${size} = ${idx1}，检查 table[${idx1}]。`,
    log: `查找 ${searchKey1}: hash=${idx1}。`,
    codeLine: [7, 8],
  });
  steps.push({
    table: [...table],
    action: 'found',
    key: searchKey1,
    index: idx1,
    message: `找到! table[${idx1}] = ${table[idx1]} == ${searchKey1}，查找成功。`,
    log: `命中: table[${idx1}] = ${searchKey1}。`,
    codeLine: 9,
  });

  // Search for a non-existing key
  const searchKey2 = 99;
  const idx2 = searchKey2 % size;
  steps.push({
    table: [...table],
    action: 'search',
    key: searchKey2,
    index: idx2,
    message: `查找 ${searchKey2}: hash(${searchKey2}) = ${searchKey2} % ${size} = ${idx2}，检查 table[${idx2}]。`,
    log: `查找 ${searchKey2}: hash=${idx2}。`,
    codeLine: [7, 8],
  });
  steps.push({
    table: [...table],
    action: 'not-found',
    key: searchKey2,
    index: idx2,
    message: `未找到! table[${idx2}] = ${table[idx2] === null ? 'null' : table[idx2]} ≠ ${searchKey2}，查找失败。`,
    log: `未命中: table[${idx2}] = null。`,
    codeLine: 9,
  });

  return steps;
}

export class HashTableTheoryVisualizer extends StepVisualizer<HTStep> {
  protected codeLines = [
    'public int hash(int key, int size) {',
    '    return key % size;',
    '}',
    'public void insert(int[] table, int key) {',
    '    int idx = hash(key, table.length);',
    '    table[idx] = key;',
    '}',
    'public boolean search(int[] table, int key) {',
    '    int idx = hash(key, table.length);',
    '    return table[idx] == key;',
    '}',
  ];
  protected codePanelTitle = 'Java 哈希表操作代码';

  private keysInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.keysInput = this.root.querySelector('#ht-keys-input');
    this.btnStart = this.root.querySelector('#ht-start');
    this.exampleButtons = this.root.querySelectorAll('.ht-example-btn');
    this.trackEl = this.root.querySelector('#ht-track');
    this.logEl = this.root.querySelector('#ht-log');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.keysInput) this.keysInput.value = btn.dataset.keys || '';
        this.start();
      };
    });
  }

  protected buildSteps(): HTStep[] {
    const keys = (this.keysInput?.value || '5,12,19,26,3,10')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (keys.length === 0) keys.push(5, 12, 19, 26, 3, 10);
    return buildHTSteps(keys);
  }

  protected renderStep(step: HTStep): void {
    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      step.table.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'ht-cell';
        if (value !== null) cell.classList.add('filled');
        if (index === step.index) {
          if (step.action === 'found') cell.classList.add('found');
          else if (step.action === 'not-found') cell.classList.add('not-found');
          else cell.classList.add('active');
        }
        cell.innerHTML = `<span class="idx">${index}</span><span class="val">${value ?? '-'}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: HTStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      let prefix = '';
      switch (s.action) {
        case 'init': prefix = '⚡'; break;
        case 'hash': prefix = '🔢'; break;
        case 'collision': prefix = '💥'; break;
        case 'insert': prefix = '⬇️'; break;
        case 'search': prefix = '🔍'; break;
        case 'found': prefix = '✅'; break;
        case 'not-found': prefix = '❌'; break;
      }
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${prefix} ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'hash-table-theory',
  name: '哈希表理论基础',
  viewId: 'algo-hash-table-theory-view',
  category: 'hash-table',
  description: '哈希表的核心概念、哈希函数与冲突处理',
  icon: '📖',
  template,
  Visualizer: HashTableTheoryVisualizer,
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解哈希表的原理、哈希函数和冲突处理方法',
});

export {};
