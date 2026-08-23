/**
 * 四数相加II可视化器（哈希表分组）
 * LeetCode 454
 * 将四数组分为两组，用哈希表统计和为0的元组数
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './four-sum-ii.html?raw';

interface FSIIStep {
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  phase: 'build' | 'lookup';
  i: number;
  j: number;
  pairSum: number;
  sumMap: Map<number, number>;
  mapEntries: [number, number][];
  count: number;
  status: 'init' | 'add-map' | 'lookup' | 'found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildFSIISteps(a: number[], b: number[], c: number[], d: number[]): FSIIStep[] {
  const steps: FSIIStep[] = [];
  const sumMap = new Map<number, number>();

  steps.push({
    a, b, c, d,
    phase: 'build',
    i: -1, j: -1,
    pairSum: 0,
    sumMap: new Map(sumMap),
    mapEntries: [],
    count: 0,
    status: 'init',
    message: `初始化：A=[${a.join(', ')}], B=[${b.join(', ')}], C=[${c.join(', ')}], D=[${d.join(', ')}]。先枚举 A+B 所有对和写入哈希表，再枚举 C+D 查互补值。`,
    log: '初始化空哈希表。开始构建阶段。',
    codeLine: [1, 2],
  });

  // Build phase: enumerate all (A[i], B[j]) pairs, accumulate sum -> count
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const sum = a[i] + b[j];
      sumMap.set(sum, (sumMap.get(sum) || 0) + 1);
      const cnt = sumMap.get(sum)!;
      steps.push({
        a, b, c, d,
        phase: 'build',
        i, j,
        pairSum: sum,
        sumMap: new Map(sumMap),
        mapEntries: [...sumMap],
        count: 0,
        status: 'add-map',
        message: `构建：A[${i}]=${a[i]} + B[${j}]=${b[j]} = ${sum}，map[${sum}] → ${cnt}。`,
        log: `map[${sum}] = ${cnt}。`,
        codeLine: [3, 4, 5, 6],
      });
    }
  }

  // Transition to lookup phase
  steps.push({
    a, b, c, d,
    phase: 'lookup',
    i: -1, j: -1,
    pairSum: 0,
    sumMap: new Map(sumMap),
    mapEntries: [...sumMap],
    count: 0,
    status: 'init',
    message: `构建阶段完成，哈希表共 ${sumMap.size} 个键。进入查找阶段：枚举 C+D 对，查互补值。`,
    log: `构建完成，map 大小 = ${sumMap.size}。开始查找。`,
    codeLine: [7, 8],
  });

  // Lookup phase: enumerate all (C[i], D[j]) pairs, look for -(c+d) in map
  let count = 0;
  for (let i = 0; i < c.length; i++) {
    for (let j = 0; j < d.length; j++) {
      const sum = c[i] + d[j];
      const target = -sum;
      const found = sumMap.has(target);
      const added = found ? sumMap.get(target)! : 0;
      if (found) count += added;
      steps.push({
        a, b, c, d,
        phase: 'lookup',
        i, j,
        pairSum: sum,
        sumMap: new Map(sumMap),
        mapEntries: [...sumMap],
        count,
        status: found ? 'found' : 'lookup',
        message: found
          ? `查找：C[${i}]=${c[i]} + D[${j}]=${d[j]} = ${sum}，互补 ${target} 在 map 中（计数 ${added}），元组 += ${added}。`
          : `查找：C[${i}]=${c[i]} + D[${j}]=${d[j]} = ${sum}，互补 ${target} 不在 map 中。`,
        log: found ? `互补 ${target} 命中，+${added}。累计 ${count}。` : `互补 ${target} 未命中。`,
        codeLine: found ? [9, 10, 11, 12, 13] : [9, 10, 11, 12],
      });
    }
  }

  steps.push({
    a, b, c, d,
    phase: 'lookup',
    i: c.length, j: d.length,
    pairSum: 0,
    sumMap: new Map(sumMap),
    mapEntries: [...sumMap],
    count,
    status: 'done',
    message: `完成！和为 0 的四元组共 ${count} 个。`,
    log: `返回 ${count}。`,
    codeLine: 15,
  });

  return steps;
}

export class FourSumIIVisualizer extends StepVisualizer<FSIIStep> {
  protected codeLines = [
    'public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {',
    '    HashMap<Integer, Integer> map = new HashMap<>();',
    '    for (int a : nums1) {',
    '        for (int b : nums2) {',
    '            int sum = a + b;',
    '            map.put(sum, map.getOrDefault(sum, 0) + 1);',
    '        }',
    '    }',
    '    int count = 0;',
    '    for (int c : nums3) {',
    '        for (int d : nums4) {',
    '            int target = -(c + d);',
    '            if (map.containsKey(target)) {',
    '                count += map.get(target);',
    '            }',
    '        }',
    '    }',
    '    return count;',
    '}',
  ];
  protected codePanelTitle = 'Java 四数相加II代码';

  private inputA: HTMLInputElement | null = null;
  private inputB: HTMLInputElement | null = null;
  private inputC: HTMLInputElement | null = null;
  private inputD: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private rowsEl: HTMLElement | null = null;
  private mapEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private pairSumEl: HTMLElement | null = null;
  private mapSizeEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private visualTagEl: HTMLElement | null = null;
  private phaseTagEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputA = this.root.querySelector('#fsii-input-a');
    this.inputB = this.root.querySelector('#fsii-input-b');
    this.inputC = this.root.querySelector('#fsii-input-c');
    this.inputD = this.root.querySelector('#fsii-input-d');
    this.btnStart = this.root.querySelector('#fsii-start');
    this.exampleButtons = this.root.querySelectorAll('.fsii-example-btn');
    this.rowsEl = this.root.querySelector('#fsii-rows');
    this.mapEl = this.root.querySelector('#fsii-map-items');
    this.logEl = this.root.querySelector('#fsii-log');
    this.phaseEl = this.root.querySelector('#fsii-phase');
    this.pairSumEl = this.root.querySelector('#fsii-pair-sum');
    this.mapSizeEl = this.root.querySelector('#fsii-map-size');
    this.countEl = this.root.querySelector('#fsii-count');
    this.visualTagEl = this.root.querySelector('#fsii-visual-tag');
    this.phaseTagEl = this.root.querySelector('#fsii-phase-tag');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputA) this.inputA.value = btn.dataset.a || '';
        if (this.inputB) this.inputB.value = btn.dataset.b || '';
        if (this.inputC) this.inputC.value = btn.dataset.c || '';
        if (this.inputD) this.inputD.value = btn.dataset.d || '';
        this.start();
      };
    });
  }

  protected buildSteps(): FSIIStep[] {
    const parse = (s: string, fallback: number[]): number[] => {
      const parsed = s.split(/[,，\s]+/).map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n));
      return parsed.length > 0 ? parsed : fallback;
    };
    const a = parse(this.inputA?.value || '', [1, 2]);
    const b = parse(this.inputB?.value || '', [-2, -1]);
    const c = parse(this.inputC?.value || '', [-1, 2]);
    const d = parse(this.inputD?.value || '', [0, 2]);
    return buildFSIISteps(a, b, c, d);
  }

  protected renderStep(step: FSIIStep): void {
    // Stats
    if (this.phaseEl) this.phaseEl.textContent = step.phase === 'build' ? 'A+B' : 'C+D';
    if (this.pairSumEl) {
      this.pairSumEl.textContent =
        step.status === 'init' || step.status === 'done' ? '-' : String(step.pairSum);
    }
    if (this.mapSizeEl) this.mapSizeEl.textContent = String(step.mapEntries.length);
    if (this.countEl) this.countEl.textContent = String(step.count);
    if (this.visualTagEl) this.visualTagEl.textContent = step.phase === 'build' ? '构建中' : '查找中';
    if (this.phaseTagEl) {
      this.phaseTagEl.textContent = step.phase === 'build' ? '构建' : '查找';
      this.phaseTagEl.className = `fsii-phase-tag ${step.phase}`;
    }

    // Four array rows
    if (this.rowsEl) {
      this.rowsEl.innerHTML = '';
      const isBuild = step.phase === 'build';
      const isActive = step.status === 'add-map' || step.status === 'lookup' || step.status === 'found';

      const rowDefs: Array<{ label: string; arr: number[]; cls: string; idx: number; isTarget: boolean }> = [
        { label: 'A', arr: step.a, cls: 'fsii-row-a', idx: isBuild && isActive ? step.i : -1, isTarget: false },
        { label: 'B', arr: step.b, cls: 'fsii-row-b', idx: isBuild && isActive ? step.j : -1, isTarget: false },
        { label: 'C', arr: step.c, cls: 'fsii-row-c', idx: !isBuild && isActive ? step.i : -1, isTarget: false },
        { label: 'D', arr: step.d, cls: 'fsii-row-d', idx: !isBuild && isActive ? step.j : -1, isTarget: false },
      ];

      for (const def of rowDefs) {
        const row = document.createElement('div');
        row.className = `fsii-array-row ${def.cls}`;

        const label = document.createElement('span');
        label.className = 'fsii-array-label';
        label.textContent = def.label;
        row.appendChild(label);

        const cells = document.createElement('div');
        cells.className = 'fsii-array-cells';
        def.arr.forEach((val, k) => {
          const cell = document.createElement('div');
          cell.className = 'fsii-cell';
          if (k === def.idx && def.idx >= 0) cell.classList.add('active');
          cell.innerHTML = `<span class="idx">${k}</span><span class="val">${val}</span>`;
          cells.appendChild(cell);
        });
        row.appendChild(cells);
        this.rowsEl.appendChild(row);
      }
    }

    // Hash map
    if (this.mapEl) {
      this.mapEl.innerHTML = '';
      if (step.mapEntries.length === 0) {
        this.mapEl.innerHTML = '<span class="fsii-map-empty">（空）</span>';
      } else {
        step.mapEntries.forEach(([sum, cnt]) => {
          const entry = document.createElement('span');
          entry.className = 'fsii-map-entry';
          if (step.phase === 'lookup' && (step.status === 'found' || step.status === 'lookup')) {
            const target = -step.pairSum;
            if (sum === target) {
              entry.classList.add(step.status === 'found' ? 'lookup-hit' : 'lookup-miss');
            }
          }
          entry.innerHTML = `<span class="fsii-entry-key">${sum}</span><span class="fsii-entry-sep">:</span><span class="fsii-entry-val">${cnt}</span>`;
          this.mapEl?.appendChild(entry);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: FSIIStep): void {
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
  id: 'four-sum-ii',
  name: '四数相加II（分组哈希）',
  viewId: 'algo-four-sum-ii-view',
  category: 'hash-table',
  description: '将四数组分为两组，用哈希表统计和为0的元组数',
  icon: '🧮',
  template,
  Visualizer: FourSumIIVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握分组降维 + 哈希表计数优化四重循环',
});

export {};
