/**
 * 下一个更大元素 I 可视化器（单调栈）
 * LeetCode 496
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './next-greater-element-i.html?raw';

interface NGE1Step {
  nums1: number[];
  nums2: number[];
  stack: number[];           // 单调栈，存 nums2 的下标
  nextGreaterMap: Map<number, number>; // 值 → 下一个更大值
  current: number;           // 当前在 nums2 中处理的索引 j
  popping: number;           // 正在弹出的下标，-1 无
  queryIndex: number;        // 当前在 nums1 中查询的索引，-1 表示不在查询阶段
  status: 'init' | 'traverse-nums2-push' | 'traverse-nums2-pop' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildNGE1Steps(nums1: number[], nums2: number[]): NGE1Step[] {
  const steps: NGE1Step[] = [];
  const n = nums2.length;
  const stack: number[] = [];
  const nextGreaterMap = new Map<number, number>();

  // 初始状态
  steps.push({
    nums1, nums2, stack: [], nextGreaterMap: new Map(), current: -1, popping: -1,
    queryIndex: -1, status: 'init',
    message: `初始化空栈和映射表。先遍历 nums2=[${nums2.join(', ')}]，用单调栈为每个元素找下一个更大值。`,
    log: '初始化。nums1=' + JSON.stringify(nums1) + ', nums2=' + JSON.stringify(nums2),
    codeLine: [1, 2, 3],
  });

  // 第一阶段：遍历 nums2，用单调栈构建 nextGreaterMap
  for (let j = 0; j < n; j++) {
    while (stack.length > 0 && nums2[j] > nums2[stack[stack.length - 1]]) {
      const top = stack.pop()!;
      nextGreaterMap.set(nums2[top], nums2[j]);
      steps.push({
        nums1, nums2, stack: [...stack], nextGreaterMap: new Map(nextGreaterMap),
        current: j, popping: top, queryIndex: -1, status: 'traverse-nums2-pop',
        message: `nums2[${j}]=${nums2[j]} > 栈顶 nums2[${top}]=${nums2[top]}，弹出 ${nums2[top]}，映射 ${nums2[top]} → ${nums2[j]}。`,
        log: `弹出 ${nums2[top]}，映射 ${nums2[top]}→${nums2[j]}`,
        codeLine: [4, 5, 6],
      });
    }
    stack.push(j);
    steps.push({
      nums1, nums2, stack: [...stack], nextGreaterMap: new Map(nextGreaterMap),
      current: j, popping: -1, queryIndex: -1, status: 'traverse-nums2-push',
      message: `下标 ${j}（值 ${nums2[j]}）入栈。当前栈：[${stack.map((s) => nums2[s]).join(', ')}]（值递减）。`,
      log: `入栈 idx=${j}, val=${nums2[j]}`,
      codeLine: 7,
    });
  }

  // 栈中剩余元素映射为 -1
  const remainingMapCount = nextGreaterMap.size;
  steps.push({
    nums1, nums2, stack: [...stack], nextGreaterMap: new Map(nextGreaterMap),
    current: n, popping: -1, queryIndex: -1, status: 'traverse-nums2-push',
    message: `遍历 nums2 完成。栈中剩余 ${stack.length} 个元素没有更大值，将映射为 -1。已建 ${remainingMapCount} 个正映射。`,
    log: `nums2 遍历完成，栈剩 ${stack.length} 个`,
    codeLine: 8,
  });

  // 补充栈中剩余元素映射为 -1（再推一步让视觉可见）
  for (const idx of [...stack]) {
    nextGreaterMap.set(nums2[idx], -1);
  }
  steps.push({
    nums1, nums2, stack: [], nextGreaterMap: new Map(nextGreaterMap),
    current: n, popping: -1, queryIndex: -1, status: 'traverse-nums2-push',
    message: `栈中 ${stack.length === 0 ? stack.length : '已清空'} 元素映射为 -1。映射表：${[...nextGreaterMap.entries()].map(([k, v]) => `${k}→${v}`).join(', ')}。接下来查询 nums1。`,
    log: '剩余元素映射为 -1，进入查询阶段',
    codeLine: 8,
  });

  // 第二阶段：遍历 nums1，查映射表得到答案
  const answers: number[] = [];
  for (let i = 0; i < nums1.length; i++) {
    const ans = nextGreaterMap.get(nums1[i]) ?? -1;
    answers.push(ans);
    const ansText = ans === -1 ? '-1（无更大）' : String(ans);
    steps.push({
      nums1, nums2, stack: [], nextGreaterMap: new Map(nextGreaterMap),
      current: -1, popping: -1, queryIndex: i, status: 'query',
      message: `查询 nums1[${i}]=${nums1[i]}，查映射表得 ${ansText}。答案：[${answers.join(', ')}]。`,
      log: `查询 ${nums1[i]} → ${ans}`,
      codeLine: 9,
    });
  }

  // 最终完成
  steps.push({
    nums1, nums2, stack: [], nextGreaterMap: new Map(nextGreaterMap),
    current: -1, popping: -1, queryIndex: -1, status: 'done',
    message: `完成！nums1=[${nums1.join(', ')}] 的下一个更大元素为 [${answers.join(', ')}]。`,
    log: '完成！答案: [' + answers.join(', ') + ']',
    codeLine: 10,
  });
  return steps;
}

export class NextGreaterElement1Visualizer extends StepVisualizer<NGE1Step> {
  protected codeLines = [
    'public int[] nextGreaterElement(int[] nums1, int[] nums2) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    for (int j = 0; j < nums2.length; j++) {',
    '        while (!stack.isEmpty() && nums2[j] > nums2[stack.peek()]) {',
    '            int top = stack.pop();',
    '            map.put(nums2[top], nums2[j]);',
    '        }',
    '        stack.push(j);',
    '    }',
    '    // 栈中剩余元素映射为 -1',
    '    int[] ans = new int[nums1.length];',
    '    for (int i = 0; i < nums1.length; i++) {',
    '        ans[i] = map.getOrDefault(nums1[i], -1);',
    '    }',
    '    return ans;',
    '}',
  ];
  protected codePanelTitle = '下一个更大元素I代码 (Java)';

  private input1El: HTMLInputElement | null = null;
  private input2El: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private barsEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private mapEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private jEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private topEl: HTMLElement | null = null;
  private mapCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.input1El = this.root.querySelector('#nge1-input1');
    this.input2El = this.root.querySelector('#nge1-input2');
    this.btnStart = this.root.querySelector('#nge1-start');
    this.exampleButtons = this.root.querySelectorAll('.nge1-example-btn');
    this.barsEl = this.root.querySelector('#nge1-bars');
    this.stackEl = this.root.querySelector('#nge1-stack');
    this.mapEl = this.root.querySelector('#nge1-map');
    this.logEl = this.root.querySelector('#nge1-log');
    this.jEl = this.root.querySelector('#nge1-j');
    this.curEl = this.root.querySelector('#nge1-cur');
    this.topEl = this.root.querySelector('#nge1-top');
    this.mapCountEl = this.root.querySelector('#nge1-mapcount');
    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'nge1-speed',
      speedLabel: 'nge1-speed-label',
      message: 'step-message'
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.input1El && this.input2El) {
          this.input1El.value = btn.dataset.nums1 || '';
          this.input2El.value = btn.dataset.nums2 || '';
        }
        this.start();
      };
    });
  }

  protected buildSteps(): NGE1Step[] {
    const nums1 = (this.input1El?.value || '4,1,2')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    const nums2 = (this.input2El?.value || '1,3,4,2')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums1.length === 0) nums1.push(4, 1, 2);
    if (nums2.length === 0) nums2.push(1, 3, 4, 2);
    return buildNGE1Steps(nums1, nums2);
  }

  protected renderStep(step: NGE1Step): void {
    // 更新统计面板
    if (this.jEl) {
      this.jEl.textContent = step.current >= 0 && step.current < step.nums2.length ? String(step.current) : '-';
    }
    if (this.curEl) {
      this.curEl.textContent = step.current >= 0 && step.current < step.nums2.length ? String(step.nums2[step.current]) : '-';
    }
    if (this.topEl) {
      this.topEl.textContent = step.stack.length > 0 ? String(step.nums2[step.stack[step.stack.length - 1]]) : '-';
    }
    // 统计映射数（只计正映射，不含 -1）
    const positiveMapCount = [...step.nextGreaterMap.entries()].filter(([, v]) => v !== -1).length;
    if (this.mapCountEl) {
      this.mapCountEl.textContent = String(positiveMapCount);
    }

    // 渲染 nums2 柱状图
    if (this.barsEl) {
      this.barsEl.innerHTML = '';
      const maxVal = Math.max(...step.nums2, 1);
      // 哪些元素已有答案（映射为正数）
      const resolvedSet = new Set<number>();
      step.nextGreaterMap.forEach((v, k) => { if (v !== -1) resolvedSet.add(k); });

      step.nums2.forEach((val, idx) => {
        const col = document.createElement('div');
        col.className = 'nge1-bar-col';

        const bar = document.createElement('div');
        bar.className = 'nge1-bar';
        bar.style.height = `${(val / maxVal) * 180 + 24}px`;

        // 高亮状态优先级：popping > current > querying > instack > resolved
        if (idx === step.popping) {
          bar.classList.add('popping');
        }
        if (step.current === idx && step.queryIndex === -1) {
          bar.classList.add('current');
        }
        if (step.queryIndex >= 0 && idx >= 0) {
          // 在查询阶段，高亮正在查询的 nums1 元素对应的 nums2 位置
          const queryVal = step.nums1[step.queryIndex];
          // 找到该值在 nums2 中的位置
          const queryIdxInNums2 = step.nums2.indexOf(queryVal);
          if (idx === queryIdxInNums2 && step.status === 'query') {
            bar.classList.add('querying');
          }
        }
        if (step.stack.includes(idx)) {
          bar.classList.add('instack');
        }
        if (resolvedSet.has(val) && idx !== step.popping && step.current !== idx) {
          bar.classList.add('resolved');
        }

        bar.textContent = String(val);

        const ans = document.createElement('div');
        ans.className = 'nge1-ans';
        const mapped = step.nextGreaterMap.get(val);
        if (mapped !== undefined) {
          ans.classList.add('filled');
          ans.textContent = `→${mapped}`;
        } else {
          ans.textContent = '→?';
        }

        col.appendChild(bar);
        col.appendChild(ans);
        this.barsEl?.appendChild(col);
      });
    }

    // 渲染栈
    if (this.stackEl) {
      this.stackEl.innerHTML = '';
      if (step.stack.length === 0 && step.status !== 'init') {
        this.stackEl.innerHTML = '<span style="color:#64748b;font-size:13px;font-style:italic;">（空栈）</span>';
      } else if (step.stack.length === 0 && step.status === 'init') {
        this.stackEl.innerHTML = '<span style="color:#64748b;font-size:13px;font-style:italic;">（空栈）</span>';
      } else {
        step.stack.forEach((idx, i) => {
          const item = document.createElement('span');
          item.className = 'nge1-stack-item';
          if (i === step.stack.length - 1) item.classList.add('nge1-stack-top');
          item.textContent = `idx=${idx} (${step.nums2[idx]})`;
          this.stackEl?.appendChild(item);
        });
      }
    }

    // 渲染映射表
    if (this.mapEl) {
      this.mapEl.innerHTML = '';
      if (step.nextGreaterMap.size === 0) {
        this.mapEl.innerHTML = '<span style="color:#64748b;font-size:12px;font-style:italic;">（空）</span>';
      } else {
        step.nextGreaterMap.forEach((v, k) => {
          const item = document.createElement('span');
          item.className = 'nge1-map-item';
          item.textContent = `${k}→${v}`;
          this.mapEl?.appendChild(item);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: NGE1Step): void {
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
  id: 'next-greater-element-i',
  name: '下一个更大元素I',
  viewId: 'algo-next-greater-element-i-view',
  category: 'monotonic-stack',
  description: '单调栈求 nums1 中每个元素在 nums2 中的下一个更大值',
  icon: '🔍',
  template,
  Visualizer: NextGreaterElement1Visualizer,
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '理解单调栈如何找下一个更大元素',
});
