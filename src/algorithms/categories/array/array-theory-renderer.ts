/**
 * 数组理论基础可视化器
 * 演示数组的内存布局、基本操作与时间复杂度
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './array-theory.html?raw';

interface ATStep {
  array: number[];
  action: 'access' | 'insert' | 'delete' | 'search';
  index: number;
  value: number | null;
  status: 'init' | 'access' | 'insert-shift' | 'insert-place' | 'delete-shift' | 'delete-remove' | 'search-found' | 'search-not-found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildAccessSteps(idx: number): ATStep[] {
  const arr = [3, 5, 7, 11, 15];
  const i = Math.max(0, Math.min(idx, arr.length - 1));
  return [
    {
      array: [...arr],
      action: 'access',
      index: -1,
      value: null,
      status: 'init',
      message: `初始化数组 arr = [${arr.join(', ')}]`,
      log: `初始化: arr = [${arr.join(', ')}]`,
      codeLine: 0,
    },
    {
      array: [...arr],
      action: 'access',
      index: i,
      value: arr[i],
      status: 'access',
      message: `访问 arr[${i}] = ${arr[i]}，地址 = base + ${i} \u00d7 size（O(1)）`,
      log: `访问 arr[${i}] = ${arr[i]} (O(1))`,
      codeLine: 1,
    },
  ];
}

function buildSearchSteps(arr: number[], target: number): ATStep[] {
  const steps: ATStep[] = [];
  let found = false;
  for (let i = 0; i < arr.length; i++) {
    const isMatch = arr[i] === target;
    steps.push({
      array: [...arr],
      action: 'search',
      index: i,
      value: target,
      status: isMatch ? 'search-found' : 'access',
      message: isMatch
        ? `搜索 ${target}: 检查 arr[${i}] = ${target} \u2713，返回下标 ${i}（O(n)）`
        : `搜索 ${target}: 检查 arr[${i}] = ${arr[i]} \u2260 ${target}`,
      log: isMatch
        ? `搜索: arr[${i}] = ${target}，找到下标 ${i}`
        : `搜索: arr[${i}] = ${arr[i]} \u2260 ${target}`,
      codeLine: isMatch ? 4 : [3, 4],
    });
    if (isMatch) {
      found = true;
      break;
    }
  }
  if (!found) {
    steps.push({
      array: [...arr],
      action: 'search',
      index: -1,
      value: target,
      status: 'search-not-found',
      message: `搜索 ${target}: 遍历完成，未找到`,
      log: `搜索: 未找到 ${target}`,
      codeLine: [3, 4],
    });
  }
  return steps;
}

function buildInsertSteps(arr: number[], insertIdx: number, value: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(insertIdx, arr.length));

  steps.push({
    array: [...arr],
    action: 'insert',
    index: -1,
    value: null,
    status: 'init',
    message: `初始化数组 arr = [${arr.join(', ')}]`,
    log: `初始化: arr = [${arr.join(', ')}]`,
    codeLine: 0,
  });

  let workingArr = [...arr];
  for (let i = arr.length; i > idx; i--) {
    if (i >= workingArr.length) {
      workingArr.push(workingArr[i - 1]);
    } else {
      workingArr[i] = workingArr[i - 1];
    }
    steps.push({
      array: [...workingArr],
      action: 'insert',
      index: i - 1,
      value,
      status: 'insert-shift',
      message: `插入 ${value} 到 index ${idx}: 将 arr[${i - 1}] = ${arr[i - 1]} 右移 \u2192 arr[${i}]`,
      log: `右移: arr[${i - 1}] = ${arr[i - 1]} \u2192 arr[${i}]`,
      codeLine: 7,
    });
  }

  workingArr[idx] = value;
  steps.push({
    array: [...workingArr],
    action: 'insert',
    index: idx,
    value,
    status: 'insert-place',
    message: `插入 ${value} 到 index ${idx}: arr[${idx}] = ${value}，插入完成`,
    log: `插入: arr[${idx}] = ${value}`,
    codeLine: 8,
  });

  return steps;
}

function buildDeleteSteps(arr: number[], deleteIdx: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(deleteIdx, arr.length - 1));

  steps.push({
    array: [...arr],
    action: 'delete',
    index: -1,
    value: null,
    status: 'init',
    message: `初始化数组 arr = [${arr.join(', ')}]`,
    log: `初始化: arr = [${arr.join(', ')}]`,
    codeLine: 0,
  });

  let workingArr = [...arr];
  for (let i = idx + 1; i < workingArr.length; i++) {
    workingArr[i - 1] = workingArr[i];
    steps.push({
      array: [...workingArr],
      action: 'delete',
      index: i,
      value: null,
      status: 'delete-shift',
      message: `删除 index ${idx}: 将 arr[${i}] = ${arr[i]} 左移 \u2192 arr[${i - 1}]`,
      log: `左移: arr[${i}] = ${arr[i]} \u2192 arr[${i - 1}]`,
      codeLine: 10,
    });
  }

  const deletedValue = arr[idx];
  workingArr.pop();
  steps.push({
    array: [...workingArr],
    action: 'delete',
    index: idx,
    value: null,
    status: 'delete-remove',
    message: `删除 index ${idx} 完成: arr = [${workingArr.join(', ')}]，被删除元素 ${deletedValue} 已移除`,
    log: `删除完成: arr = [${workingArr.join(', ')}]`,
    codeLine: 10,
  });

  return steps;
}

function buildDefaultSteps(): ATStep[] {
  const steps: ATStep[] = [];
  const arr = [3, 5, 7, 11, 15];

  // Step 0: init
  steps.push({
    array: [...arr],
    action: 'access',
    index: -1,
    value: null,
    status: 'init',
    message: `初始化数组 arr = [${arr.join(', ')}]`,
    log: `初始化: arr = [${arr.join(', ')}]`,
    codeLine: 0,
  });

  // Step 1: access arr[2]
  steps.push({
    array: [...arr],
    action: 'access',
    index: 2,
    value: 7,
    status: 'access',
    message: `访问 arr[2] = 7，地址 = base + 2 \u00d7 size（O(1)）`,
    log: `访问 arr[2] = 7 (O(1))`,
    codeLine: 1,
  });

  // Steps 2-5: search for 11
  steps.push({
    array: [...arr],
    action: 'search',
    index: 0,
    value: 11,
    status: 'access',
    message: `搜索 11: 检查 arr[0] = 3 \u2260 11`,
    log: `搜索: arr[0] = 3 \u2260 11`,
    codeLine: [3, 4],
  });
  steps.push({
    array: [...arr],
    action: 'search',
    index: 1,
    value: 11,
    status: 'access',
    message: `搜索 11: 检查 arr[1] = 5 \u2260 11`,
    log: `搜索: arr[1] = 5 \u2260 11`,
    codeLine: [3, 4],
  });
  steps.push({
    array: [...arr],
    action: 'search',
    index: 2,
    value: 11,
    status: 'access',
    message: `搜索 11: 检查 arr[2] = 7 \u2260 11`,
    log: `搜索: arr[2] = 7 \u2260 11`,
    codeLine: [3, 4],
  });
  steps.push({
    array: [...arr],
    action: 'search',
    index: 3,
    value: 11,
    status: 'search-found',
    message: `搜索 11: 检查 arr[3] = 11 \u2713，返回下标 3（O(n)）`,
    log: `搜索: arr[3] = 11，找到下标 3`,
    codeLine: 4,
  });

  // Steps 6-8: insert 9 at index 3
  steps.push({
    array: [3, 5, 7, 11, 15, 15],
    action: 'insert',
    index: 4,
    value: 9,
    status: 'insert-shift',
    message: `插入 9 到 index 3: 将 arr[4] = 15 右移 \u2192 arr[5]`,
    log: `右移: arr[4] = 15 \u2192 arr[5]`,
    codeLine: 7,
  });
  steps.push({
    array: [3, 5, 7, 11, 11, 15],
    action: 'insert',
    index: 3,
    value: 9,
    status: 'insert-shift',
    message: `插入 9 到 index 3: 将 arr[3] = 11 右移 \u2192 arr[4]`,
    log: `右移: arr[3] = 11 \u2192 arr[4]`,
    codeLine: 7,
  });
  steps.push({
    array: [3, 5, 7, 9, 11, 15],
    action: 'insert',
    index: 3,
    value: 9,
    status: 'insert-place',
    message: `插入 9 到 index 3: arr[3] = 9，插入完成`,
    log: `插入: arr[3] = 9`,
    codeLine: 8,
  });

  // Steps 9-13: delete at index 1
  steps.push({
    array: [3, 7, 7, 9, 11, 15],
    action: 'delete',
    index: 2,
    value: null,
    status: 'delete-shift',
    message: `删除 index 1: 将 arr[2] = 7 左移 \u2192 arr[1]`,
    log: `左移: arr[2] = 7 \u2192 arr[1]`,
    codeLine: 10,
  });
  steps.push({
    array: [3, 7, 9, 9, 11, 15],
    action: 'delete',
    index: 3,
    value: null,
    status: 'delete-shift',
    message: `删除 index 1: 将 arr[3] = 9 左移 \u2192 arr[2]`,
    log: `左移: arr[3] = 9 \u2192 arr[2]`,
    codeLine: 10,
  });
  steps.push({
    array: [3, 7, 9, 11, 11, 15],
    action: 'delete',
    index: 4,
    value: null,
    status: 'delete-shift',
    message: `删除 index 1: 将 arr[4] = 11 左移 \u2192 arr[3]`,
    log: `左移: arr[4] = 11 \u2192 arr[3]`,
    codeLine: 10,
  });
  steps.push({
    array: [3, 7, 9, 11, 15, 15],
    action: 'delete',
    index: 5,
    value: null,
    status: 'delete-shift',
    message: `删除 index 1: 将 arr[5] = 15 左移 \u2192 arr[4]`,
    log: `左移: arr[5] = 15 \u2192 arr[4]`,
    codeLine: 10,
  });
  steps.push({
    array: [3, 7, 9, 11, 15],
    action: 'delete',
    index: 1,
    value: null,
    status: 'delete-remove',
    message: `删除 index 1 完成: arr = [3, 7, 9, 11, 15]，被删除元素 5 已移除`,
    log: `删除完成: arr = [3, 7, 9, 11, 15]`,
    codeLine: 10,
  });

  return steps;
}

export class ArrayTheoryVisualizer extends StepVisualizer<ATStep> {
  protected codeLines = [
    '// 访问',
    'int x = arr[i];             // O(1)',
    '// 搜索',
    'for (int i = 0; i < n; i++) {',
    '    if (arr[i] == target) return i;',
    '}',
    '// 插入',
    'for (int i = n; i > idx; i--) arr[i] = arr[i - 1];',
    'arr[idx] = value;',
    '// 删除',
    'for (int i = idx; i < n - 1; i++) arr[i] = arr[i + 1];',
  ];
  protected codePanelTitle = '数组操作 Java 实现';

  private indexInput: HTMLInputElement | null = null;
  private valueInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentMode: 'default' | 'access' | 'insert' | 'delete' = 'default';

  protected initDOMElements(): void {
    if (!this.root) return;
    this.indexInput = this.root.querySelector('#at-index-input');
    this.valueInput = this.root.querySelector('#at-value-input');
    this.btnStart = this.root.querySelector('#at-start');
    this.exampleButtons = this.root.querySelectorAll('.at-example-btn');
    this.trackEl = this.root.querySelector('#at-track');
    this.logEl = this.root.querySelector('#at-log');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => {
      this.currentMode = 'default';
      this.start();
    };
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        this.currentMode = (btn.dataset.action as 'default' | 'access' | 'insert' | 'delete') || 'default';
        this.start();
      };
    });
  }

  protected buildSteps(): ATStep[] {
    const idx = parseInt(this.indexInput?.value || '2', 10);
    const val = parseInt(this.valueInput?.value || '9', 10);

    switch (this.currentMode) {
      case 'access':
        return buildAccessSteps(idx);
      case 'insert':
        return buildInsertSteps([3, 5, 7, 11, 15], idx, val);
      case 'delete':
        return buildDeleteSteps([3, 5, 7, 9, 11, 15], idx);
      default:
        return buildDefaultSteps();
    }
  }

  protected renderStep(step: ATStep): void {
    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      step.array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'at-cell';
        cell.innerHTML = `<span class="idx">${index}</span><span class="val">${value}</span>`;

        if (index === step.index) {
          switch (step.status) {
            case 'access':
              cell.classList.add('active');
              break;
            case 'insert-shift':
            case 'delete-shift':
              cell.classList.add('shifting');
              break;
            case 'search-found':
              cell.classList.add('found');
              break;
            case 'search-not-found':
              cell.classList.add('not-found');
              break;
          }
        }

        this.trackEl?.appendChild(cell);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: ATStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      let prefix = '';
      switch (s.action) {
        case 'access': prefix = s.status === 'init' ? '⚡' : '👁️'; break;
        case 'search': prefix = s.status === 'search-found' ? '✅' : '🔍'; break;
        case 'insert': prefix = s.status === 'insert-shift' ? '➜' : '⬇️'; break;
        case 'delete': prefix = s.status === 'delete-shift' ? '←' : '🗑️'; break;
      }
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${prefix} ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'array-theory',
  name: '数组理论基础',
  viewId: 'algo-array-theory-view',
  category: 'array',
  description: '数组的内存布局、基本操作和时间复杂度',
  icon: '📖',
  template,
  Visualizer: ArrayTheoryVisualizer,
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解数组的连续内存特性和基本操作',
});

export {};
