/**
 * 下一个更大元素 I 可视化器（单调栈）— 4-Card 标准现代架构
 * LeetCode 496：母集 nums2 单调栈建表 map(num -> nextGreater)，子集 nums1 O(1) 查表输出答案
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES,
} from './next-greater-element-i-problem-content';
import template from './next-greater-element-i.html?raw';

export interface NGE1Step {
  nums1: number[];
  nums2: number[];
  stack: number[]; // 存储数字本身
  nextGreaterMap: Record<number, number>;
  currentIndex2: number;
  queryIndex1: number;
  answers: number[];
  action: 'init' | 'scan_nums2' | 'pop_map' | 'push_nums2' | 'query_nums1' | 'done';
  message: string;
  codeLine: number;
}

export function buildNextGreaterElementISteps(nums1: number[], nums2: number[]): NGE1Step[] {
  const steps: NGE1Step[] = [];
  const n2 = nums2.length;
  const n1 = nums1.length;

  if (n1 === 0 || n2 === 0) {
    steps.push({
      nums1,
      nums2,
      stack: [],
      nextGreaterMap: {},
      currentIndex2: -1,
      queryIndex1: -1,
      answers: [],
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: 2,
    });
    return steps;
  }

  const stack: number[] = [];
  const nextGreaterMap: Record<number, number> = {};

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: {},
    currentIndex2: -1,
    queryIndex1: -1,
    answers: [],
    action: 'init',
    message: `阶段 1：初始化单调栈与哈希表，准备遍历母集 nums2=[${nums2.join(', ')}] 构建全量下一个更大元素映射`,
    codeLine: 3,
  });

  // 1. 遍历 nums2 构建映射
  for (let j = 0; j < n2; j++) {
    const cur = nums2[j];

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'scan_nums2',
      message: `🔍 nums2 考察 [${j}]: 值 ${cur}，与单调栈顶 ${stack.length > 0 ? stack[stack.length - 1] : '（栈空）'} 比对`,
      codeLine: 6,
    });

    while (stack.length > 0 && cur > stack[stack.length - 1]) {
      const top = stack.pop()!;
      nextGreaterMap[top] = cur;

      steps.push({
        nums1: [...nums1],
        nums2: [...nums2],
        stack: [...stack],
        nextGreaterMap: { ...nextGreaterMap },
        currentIndex2: j,
        queryIndex1: -1,
        answers: [],
        action: 'pop_map',
        message: `🔥 弹出栈顶 ${top}！确立映射：${top} &rarr; 右侧首个更大元素为 ${cur}！`,
        codeLine: 7,
      });
    }

    stack.push(cur);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'push_nums2',
      message: `📥 将 ${cur} 压入单调栈，维持栈内单调递减`,
      codeLine: 9,
    });
  }

  // 栈中剩余元素映射为 -1
  while (stack.length > 0) {
    const rem = stack.pop()!;
    nextGreaterMap[rem] = -1;
  }

  // 2. 遍历 nums1 查表
  const answers: number[] = [];
  for (let i = 0; i < n1; i++) {
    const queryVal = nums1[i];
    const ans = nextGreaterMap[queryVal] ?? -1;
    answers.push(ans);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: -1,
      queryIndex1: i,
      answers: [...answers],
      action: 'query_nums1',
      message: `📋 阶段 2：查询 nums1[${i}] = ${queryVal}，查哈希表得下一个更大元素为 ${ans === -1 ? '-1 (无)' : ans}，写入结果`,
      codeLine: 14,
    });
  }

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: { ...nextGreaterMap },
    currentIndex2: -1,
    queryIndex1: n1 - 1,
    answers: [...answers],
    action: 'done',
    message: `🎉 查询完毕！nums1 对应的下一个更大元素最终结果数组为：[${answers.join(', ')}]`,
    codeLine: 16,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class NextGreaterElementIVisualizer extends StepVisualizer<NGE1Step> {
  protected codeLanguages = NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES;
  protected codeLines = NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES['java'];
  protected codePanelTitle = '下一个更大元素 I 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private elemContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#nge1-sandbox-container');
    this.elemContainer = this.root.querySelector('#nge1-elem-container');
    this.decisionMonitorContainer = this.root.querySelector('#nge1-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#nge1-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.nge1-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n1El = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
        const n2El = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;
        if (n1El && btn.dataset.nums1) n1El.value = btn.dataset.nums1;
        if (n2El && btn.dataset.nums2) n2El.value = btn.dataset.nums2;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
      analysisHtml: NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): NGE1Step[] {
    const n1El = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
    const n2El = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;

    const nums1 = (n1El?.value || '4,1,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const nums2 = (n2El?.value || '1,3,4,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildNextGreaterElementISteps(nums1.length ? nums1 : [4, 1, 2], nums2.length ? nums2 : [1, 3, 4, 2]);
  }

  protected renderStep(step: NGE1Step): void {
    const nums1 = step.nums1;
    const nums2 = step.nums2;
    const stack = step.stack;
    const map = step.nextGreaterMap;
    const answers = step.answers;

    // 1. 渲染双数组与单调栈沙盘 (Card 1)
    if (this.sandboxContainer) {
      const curIdx2 = step.currentIndex2;
      const curIdx1 = step.queryIndex1;

      // nums2 流
      const nums2Html = nums2
        .map((num, idx) => {
          const isCurrent = idx === curIdx2;
          const inStack = stack.includes(num);
          const mappedVal = map[num];

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#eff6ff';
            border = '#2563eb';
            textColor = '#2563eb';
          } else if (inStack) {
            bg = '#fffbeb';
            border = '#fde68a';
            textColor = '#d97706';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span>${num}</span>
                <span style="font-size: 8.5px; color: ${mappedVal !== undefined ? (mappedVal === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 700;">
                  ${mappedVal !== undefined ? `&rarr;${mappedVal}` : ''}
                </span>
              </div>
            </div>
          `;
        })
        .join('');

      // nums1 查询流
      const nums1Html = nums1
        .map((num, idx) => {
          const isQuerying = idx === curIdx1;
          const ans = answers[idx];

          let bg = '#ffffff';
          let border = '#e2e8f0';

          if (isQuerying) {
            bg = '#ecfdf5';
            border = '#10b981';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <div style="padding: 3px 8px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #0f172a; display: flex; align-items: center; gap: 4px;">
                <span>${num}</span>
                <span style="color: ${ans !== undefined ? (ans === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 800;">
                  ${ans !== undefined ? `&rarr; ${ans}` : ''}
                </span>
              </div>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- nums2 母集单调栈流 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>1️⃣ 母集 nums2 (单调栈建立映射):</span>
            <span style="color: #d97706;">栈内: [${stack.join(', ')}]</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${nums2Html}
          </div>

          <!-- nums1 子集查询流 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
            <span>2️⃣ 子集 nums1 (查表生成答案):</span>
            <span>已查: ${answers.length} / ${nums1.length}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${nums1Html}
          </div>
        </div>
      `;
    }

    // 2. 渲染当前考察元素 (Card 2 Left)
    if (this.elemContainer) {
      const isScanNums2 = step.action === 'scan_nums2' || step.action === 'pop_map' || step.action === 'push_nums2';
      const cur2 = step.currentIndex2 >= 0 && step.currentIndex2 < nums2.length ? nums2[step.currentIndex2] : null;
      const cur1 = step.queryIndex1 >= 0 && step.queryIndex1 < nums1.length ? nums1[step.queryIndex1] : null;

      this.elemContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前处理元素:</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb; font-size: 12.5px;">
              ${isScanNums2 && cur2 !== null ? `nums2[${step.currentIndex2}] = ${cur2}` : cur1 !== null ? `nums1[${step.queryIndex1}] = ${cur1}` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>单调栈顶元素:</span>
            <span style="font-family: monospace; font-weight:700; color: #d97706;">
              ${stack.length > 0 ? stack[stack.length - 1] : '（栈空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染单调栈建表与查表监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPopMap = step.action === 'pop_map';
      const isPush = step.action === 'push_nums2';
      const isQuery = step.action === 'query_nums1';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPopMap ? '#ecfdf5' : isPush ? '#eff6ff' : isQuery ? '#fdf4ff' : '#f8fafc'}; color: ${isPopMap ? '#059669' : isPush ? '#2563eb' : isQuery ? '#c026d3' : '#64748b'}; border: 1px solid ${isPopMap ? '#a7f3d0' : isPush ? '#bfdbfe' : isQuery ? '#f5d0fe' : '#e2e8f0'};">
              ${isPopMap ? '🔥 出栈确立哈希映射' : isPush ? '📥 压栈 (维护单调递减)' : isQuery ? '📋 查表填入答案' : '🔍 准备就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#2563eb; font-family:monospace;">nums2 单调递减栈建表，nums1 遍历 O(1) 查表</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终答案看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>答案数组: <strong style="color: #2563eb; font-family: monospace; font-size: 13.5px;">[${answers.join(', ')}]</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已建立 ${Object.keys(map).length} 个映射</span>
          </div>
        </div>
      `;
    }

    const badgeMap = this.root?.querySelector('#badge-map-size');
    if (badgeMap) {
      badgeMap.textContent = `已建映射: ${Object.keys(map).length} 个`;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'pop_map') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '映射';
        } else if (st.action === 'push_nums2') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入栈';
        } else if (st.action === 'query_nums1') {
          badgeColor = '#c026d3';
          badgeBg = '#fdf4ff';
          badgeText = '查表';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'next-greater-element-i',
  name: '下一个更大元素 I',
  viewId: 'algo-next-greater-element-i-view',
  category: 'monotonic-stack',
  description: '单调栈在母集 nums2 中构建下一个更大元素哈希映射，子集 nums1 查表输出答案',
  icon: '🔍',
  template,
  Visualizer: NextGreaterElementIVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握单调栈与哈希表结合的高效解题范式，理解子集查询先在母集建表的降维思路',
});
