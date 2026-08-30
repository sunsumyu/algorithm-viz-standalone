/**
 * 分发饼干可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 455：贪心双指针小饼干优先分配
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  ASSIGN_COOKIES_PROBLEM_HTML,
  ASSIGN_COOKIES_ANALYSIS_HTML,
  ASSIGN_COOKIES_CODE_LANGUAGES,
} from './assign-cookies-problem-content';
import template from './assign-cookies.html?raw';

export type AcPhase = 'init' | 'check' | 'matched' | 'skip' | 'done';

export interface AssignCookiesStep {
  phase: AcPhase;
  children: number[];
  cookies: number[];
  childIndex: number;
  cookieIndex: number;
  satisfiedCount: number;
  satisfiedChildren: number[];
  matchedCookies: number[];
  skippedCookies: number[];
  message: string;
  codeLine: number;
}

export function assignCookiesSteps(children: number[], cookies: number[]): AssignCookiesStep[] {
  const steps: AssignCookiesStep[] = [];

  const sortedChildren = [...children].sort((a, b) => a - b);
  const sortedCookies = [...cookies].sort((a, b) => a - b);

  steps.push({
    phase: 'init',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: 0,
    cookieIndex: 0,
    satisfiedCount: 0,
    satisfiedChildren: [],
    matchedCookies: [],
    skippedCookies: [],
    message: `升序排序完成：孩子胃口 g=[${sortedChildren.join(', ')}]，饼干尺寸 s=[${sortedCookies.join(', ')}]`,
    codeLine: 2,
  });

  let childIdx = 0;
  let cookieIdx = 0;
  let satisfied = 0;
  const satisfiedChildren: number[] = [];
  const matchedCookies: number[] = [];
  const skippedCookies: number[] = [];

  while (childIdx < sortedChildren.length && cookieIdx < sortedCookies.length) {
    const curG = sortedChildren[childIdx];
    const curS = sortedCookies[cookieIdx];

    steps.push({
      phase: 'check',
      children: [...sortedChildren],
      cookies: [...sortedCookies],
      childIndex: childIdx,
      cookieIndex: cookieIdx,
      satisfiedCount: satisfied,
      satisfiedChildren: [...satisfiedChildren],
      matchedCookies: [...matchedCookies],
      skippedCookies: [...skippedCookies],
      message: `贪心比较：孩子 g[${childIdx}]=${curG} 与 饼干 s[${cookieIdx}]=${curS}`,
      codeLine: 7,
    });

    if (curS >= curG) {
      satisfied++;
      satisfiedChildren.push(childIdx);
      matchedCookies.push(cookieIdx);
      childIdx++;
      cookieIdx++;

      steps.push({
        phase: 'matched',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx - 1,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `✓ 匹配成功！饼干 ${curS} 满足孩子胃口 ${curG}，累计满足 ${satisfied} 人`,
        codeLine: 8,
      });
    } else {
      skippedCookies.push(cookieIdx);
      cookieIdx++;

      steps.push({
        phase: 'skip',
        children: [...sortedChildren],
        cookies: [...sortedCookies],
        childIndex: childIdx,
        cookieIndex: cookieIdx - 1,
        satisfiedCount: satisfied,
        satisfiedChildren: [...satisfiedChildren],
        matchedCookies: [...matchedCookies],
        skippedCookies: [...skippedCookies],
        message: `⏭️ 饼干太小：s[${cookieIdx - 1}]=${curS} < g[${childIdx}]=${curG}，无法满足，跳过该饼干`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    phase: 'done',
    children: [...sortedChildren],
    cookies: [...sortedCookies],
    childIndex: childIdx,
    cookieIndex: cookieIdx,
    satisfiedCount: satisfied,
    satisfiedChildren: [...satisfiedChildren],
    matchedCookies: [...matchedCookies],
    skippedCookies: [...skippedCookies],
    message: `🎉 贪心扫描结束！最多可以满足 ${satisfied} 个孩子`,
    codeLine: 12,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class AssignCookiesVisualizer extends StepVisualizer<AssignCookiesStep> {
  protected codeLanguages = ASSIGN_COOKIES_CODE_LANGUAGES;
  protected codeLines = ASSIGN_COOKIES_CODE_LANGUAGES['java'];
  protected codePanelTitle = '分发饼干 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private greedyMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#ac-sandbox-container');
    this.pointersContainer = this.root.querySelector('#ac-pointers-container');
    this.greedyMonitorContainer = this.root.querySelector('#ac-greedy-monitor-container');
    this.metricsContainer = this.root.querySelector('#ac-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ac-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const gEl = this.root?.querySelector('#input-g') as HTMLInputElement | null;
        const sEl = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (gEl && btn.dataset.g) gEl.value = btn.dataset.g;
        if (sEl && btn.dataset.s) sEl.value = btn.dataset.s;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: ASSIGN_COOKIES_PROBLEM_HTML,
      analysisHtml: ASSIGN_COOKIES_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): AssignCookiesStep[] {
    const gEl = this.root?.querySelector('#input-g') as HTMLInputElement | null;
    const sEl = this.root?.querySelector('#input-s') as HTMLInputElement | null;

    const parseArr = (str: string, fallback: number[]) => {
      const arr = str
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      return arr.length > 0 ? arr : fallback;
    };

    const children = parseArr(gEl?.value || '1,2,3', [1, 2, 3]);
    const cookies = parseArr(sEl?.value || '1,1', [1, 1]);

    return assignCookiesSteps(children, cookies);
  }

  protected renderStep(step: AssignCookiesStep): void {
    // 1. 渲染贪心双指针数组沙盘 (Card 1)
    if (this.sandboxContainer) {
      const isDone = step.phase === 'done';

      // 孩子数组条
      const childrenHtml = step.children
        .map((val, idx) => {
          const isSatisfied = step.satisfiedChildren.includes(idx);
          const isCurrent = !isDone && idx === step.childIndex;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isSatisfied) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#059669';
          } else if (isCurrent) {
            bg = '#fff7ed';
            borderColor = '#ea580c';
            textColor = '#ea580c';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ child' : `g[${idx}]`}</span>
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
                ${val}
              </div>
              <span style="font-size: 9px; color: ${isSatisfied ? '#10b981' : '#94a3b8'}; font-weight: 600;">${isSatisfied ? '✓ 满足' : '待满足'}</span>
            </div>
          `;
        })
        .join('');

      // 饼干数组条
      const cookiesHtml = step.cookies
        .map((val, idx) => {
          const isMatched = step.matchedCookies.includes(idx);
          const isSkipped = step.skippedCookies.includes(idx);
          const isCurrent = !isDone && idx === step.cookieIndex;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isMatched) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#059669';
          } else if (isSkipped) {
            bg = '#f1f5f9';
            borderColor = '#cbd5e1';
            textColor = '#94a3b8';
          } else if (isCurrent) {
            bg = '#fff7ed';
            borderColor = '#ea580c';
            textColor = '#ea580c';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ cookie' : `s[${idx}]`}</span>
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
                ${val}
              </div>
              <span style="font-size: 9px; color: ${isMatched ? '#10b981' : isSkipped ? '#94a3b8' : '#64748b'}; font-weight: 600;">${isMatched ? '🍪 已发' : isSkipped ? '⏭️ 跳过' : '可用'}</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>👦 孩子胃口数组 (g, 已排序):</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${childrenHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>🍪 饼干尺寸数组 (s, 已排序):</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
            ${cookiesHtml}
          </div>
        </div>
      `;
    }

    // 2. 渲染当前双指针与候选值 (Card 2 Left)
    if (this.pointersContainer) {
      const curChildVal = step.childIndex < step.children.length ? step.children[step.childIndex] : '越界';
      const curCookieVal = step.cookieIndex < step.cookies.length ? step.cookies[step.cookieIndex] : '越界';

      this.pointersContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>孩子指针 <code style="color:#ea580c; font-weight:700;">childIndex</code>:</span>
            <span style="font-family: monospace; font-weight:700;">${step.childIndex} (需求: ${curChildVal})</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>饼干指针 <code style="color:#ea580c; font-weight:700;">cookieIndex</code>:</span>
            <span style="font-family: monospace; font-weight:700;">${step.cookieIndex} (尺寸: ${curCookieVal})</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染局部贪心判定监视器 (Card 2 Center)
    if (this.greedyMonitorContainer) {
      const isMatched = step.phase === 'matched';
      const isSkip = step.phase === 'skip';

      this.greedyMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isMatched ? '#ecfdf5' : isSkip ? '#fef2f2' : '#eff6ff'}; color: ${isMatched ? '#059669' : isSkip ? '#dc2626' : '#2563eb'}; border: 1px solid ${isMatched ? '#a7f3d0' : isSkip ? '#fecaca' : '#bfdbfe'};">
              ${isMatched ? '✓ 满足分配 (s[j] >= g[i])' : isSkip ? '⏭️ 尺寸不足 (s[j] < g[i])' : '🔍 比较中...'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心准则: 优先消耗能满足当前最小需求的最小饼干</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终全局最优统计看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const totalChildren = step.children.length;
      const percent = totalChildren > 0 ? (step.satisfiedCount / totalChildren) * 100 : 0;

      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>满足孩子数: <strong style="color: #0f172a; font-family: monospace; font-size: 12.5px;">${step.satisfiedCount}</strong> / ${totalChildren}</span>
            <span style="font-size: 10.5px; font-weight: 700; color: #059669;">${percent.toFixed(0)}% 满足率</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden;">
            <div style="background: #10b981; width: ${percent}%; height: 100%; transition: width 0.2s;"></div>
          </div>
        </div>
      `;
    }

    const badgeSatisfied = this.root?.querySelector('#badge-satisfied-count');
    if (badgeSatisfied) {
      badgeSatisfied.textContent = `满足人数: ${step.satisfiedCount} / ${step.children.length}`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.phase === 'matched') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '匹配';
        } else if (st.phase === 'skip') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '跳过';
        } else if (st.phase === 'done') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
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
  id: 'assign-cookies',
  name: '分发饼干',
  viewId: 'algo-assign-cookies-view',
  category: 'greedy',
  description: '贪心双指针小饼干优先分配，最大化满足孩子数量',
  icon: '🍪',
  template,
  Visualizer: AssignCookiesVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握贪心算法在排序+双指针场景下的局部最优到全局最优推导',
});
