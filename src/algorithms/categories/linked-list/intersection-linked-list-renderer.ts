/**
 * 相交链表可视化器 — 4-Card 标准现代架构
 * 面试题 02.07 / LeetCode 160：双指针浪漫换道相遇 (a + c + b == b + c + a)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  INTERSECTION_LINKED_LIST_PROBLEM_HTML,
  INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
  INTERSECTION_LINKED_LIST_CODE_LANGUAGES,
} from './intersection-linked-list-problem-content';
import template from './intersection-linked-list.html?raw';

export interface ILLStep {
  listA: number[];
  listB: number[];
  skipA: number; // 相交公共区间在 A 的起始下标 (-1 表示无)
  skipB: number; // 相交公共区间在 B 的起始下标 (-1 表示无)
  pa: number; // 在当前所在链表中的下标 (-1 表示 null)
  pb: number; // 在当前所在链表中的下标 (-1 表示 null)
  paOnList: 'A' | 'B' | 'null';
  pbOnList: 'A' | 'B' | 'null';
  found: boolean;
  missed: boolean;
  action: 'init' | 'step' | 'switch_lane' | 'meet' | 'done_null';
  message: string;
  codeLine: number;
}

export const LIST_A_MEET = [4, 1, 8, 4, 5];
export const LIST_B_MEET = [5, 6, 1, 8, 4, 5];
export const LIST_A_MISS = [2, 6, 4];
export const LIST_B_MISS = [1, 5];

export function buildIntersectionSteps(intersect: boolean): ILLStep[] {
  const steps: ILLStep[] = [];
  const listA = intersect ? LIST_A_MEET : LIST_A_MISS;
  const listB = intersect ? LIST_B_MEET : LIST_B_MISS;
  const skipA = intersect ? 2 : -1;
  const skipB = intersect ? 3 : -1;

  let pa = 0;
  let pb = 0;
  let paOnList: 'A' | 'B' | 'null' = 'A';
  let pbOnList: 'A' | 'B' | 'null' = 'B';

  steps.push({
    listA,
    listB,
    skipA,
    skipB,
    pa,
    pb,
    paOnList,
    pbOnList,
    found: false,
    missed: false,
    action: 'init',
    message: `初始化：pA 指向 headA (节点 ${listA[0]})，pB 指向 headB (节点 ${listB[0]})`,
    codeLine: 2,
  });

  const MAX_STEPS = 30;
  let loopCount = 0;

  while (loopCount++ < MAX_STEPS) {
    // 检查是否相遇
    const isSameNode =
      paOnList === pbOnList &&
      pa === pb &&
      pa !== -1;

    const bothAtIntersection =
      intersect &&
      ((paOnList === 'A' && pa >= skipA && pbOnList === 'B' && pb >= skipB && pa - skipA === pb - skipB) ||
        (paOnList === 'B' && pa >= skipB && pbOnList === 'A' && pb >= skipA && pa - skipB === pb - skipA));

    if (isSameNode || bothAtIntersection) {
      const meetVal = paOnList === 'A' ? listA[pa] : listB[pa];
      steps.push({
        listA,
        listB,
        skipA,
        skipB,
        pa,
        pb,
        paOnList,
        pbOnList,
        found: true,
        missed: false,
        action: 'meet',
        message: `🎉 浪漫相遇！pA 与 pB 在相同内存节点 (值 ${meetVal}) 处相遇，返回交点节点！`,
        codeLine: 11,
      });
      break;
    }

    if (paOnList === 'null' && pbOnList === 'null') {
      steps.push({
        listA,
        listB,
        skipA,
        skipB,
        pa: -1,
        pb: -1,
        paOnList: 'null',
        pbOnList: 'null',
        found: false,
        missed: true,
        action: 'done_null',
        message: `两指针同时到达 null (pA == pB == null)，说明两链表无相交交点，返回 null`,
        codeLine: 11,
      });
      break;
    }

    // 单步推进或换道
    let nextPaOnList: 'A' | 'B' | 'null' = paOnList;
    let nextPa = pa;
    let paSwitched = false;

    if (paOnList === 'A') {
      if (pa + 1 < listA.length) {
        nextPa = pa + 1;
      } else {
        nextPaOnList = 'null';
        nextPa = -1;
      }
    } else if (paOnList === 'null') {
      nextPaOnList = 'B';
      nextPa = 0;
      paSwitched = true;
    } else if (paOnList === 'B') {
      if (pa + 1 < listB.length) {
        nextPa = pa + 1;
      } else {
        nextPaOnList = 'null';
        nextPa = -1;
      }
    }

    let nextPbOnList: 'A' | 'B' | 'null' = pbOnList;
    let nextPb = pb;
    let pbSwitched = false;

    if (pbOnList === 'B') {
      if (pb + 1 < listB.length) {
        nextPb = pb + 1;
      } else {
        nextPbOnList = 'null';
        nextPb = -1;
      }
    } else if (pbOnList === 'null') {
      nextPbOnList = 'A';
      nextPb = 0;
      pbSwitched = true;
    } else if (pbOnList === 'A') {
      if (pb + 1 < listA.length) {
        nextPb = pb + 1;
      } else {
        nextPbOnList = 'null';
        nextPb = -1;
      }
    }

    pa = nextPa;
    paOnList = nextPaOnList;
    pb = nextPb;
    pbOnList = nextPbOnList;

    const action = paSwitched || pbSwitched ? 'switch_lane' : 'step';
    const paDesc = paOnList === 'null' ? 'null' : `${paOnList}[${pa}] (${(paOnList === 'A' ? listA : listB)[pa]})`;
    const pbDesc = pbOnList === 'null' ? 'null' : `${pbOnList}[${pb}] (${(pbOnList === 'B' ? listB : listA)[pb]})`;

    steps.push({
      listA,
      listB,
      skipA,
      skipB,
      pa,
      pb,
      paOnList,
      pbOnList,
      found: false,
      missed: false,
      action,
      message: `${action === 'switch_lane' ? '🔀 换道走对方链表' : '双指针前进一步'}：pA 移动到 ${paDesc}，pB 移动到 ${pbDesc}`,
      codeLine: 7,
    });
  }

  return steps;
}

export class IntersectionLinkedListVisualizer extends StepVisualizer<ILLStep> {
  protected codeLanguages = INTERSECTION_LINKED_LIST_CODE_LANGUAGES;
  protected codeLines = INTERSECTION_LINKED_LIST_CODE_LANGUAGES['java'];
  protected codePanelTitle = '相交链表 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#ill-sandbox-container');
    this.pointersContainer = this.root.querySelector('#ill-pointers-container');
    this.decisionMonitorContainer = this.root.querySelector('#ill-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#ill-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: INTERSECTION_LINKED_LIST_PROBLEM_HTML,
      analysisHtml: INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ILLStep[] {
    const select = this.root?.querySelector('#select-intersect-case') as HTMLSelectElement | null;
    const isMeet = (select?.value || 'meet') === 'meet';
    return buildIntersectionSteps(isMeet);
  }

  protected renderStep(step: ILLStep): void {
    const listA = step.listA;
    const listB = step.listB;
    const skipA = step.skipA;
    const skipB = step.skipB;
    const pa = step.pa;
    const pb = step.pb;
    const paOnList = step.paOnList;
    const pbOnList = step.pbOnList;

    // 1. 渲染双链表拓扑沙盘 (Card 1)
    if (this.sandboxContainer) {
      const renderTrack = (title: string, list: number[], skip: number, listName: 'A' | 'B') => {
        const nodes = list
          .map((val, idx) => {
            const isIntersectNode = skip !== -1 && idx >= skip;
            const hasPa = paOnList === listName && pa === idx;
            const hasPb = pbOnList === listName && pb === idx;

            const pointerBadges: string[] = [];
            if (hasPa) pointerBadges.push('<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pA</span>');
            if (hasPb) pointerBadges.push('<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">pB</span>');

            return `
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                  <div style="min-height: 12px; display: flex; gap: 2px;">
                    ${pointerBadges.join('')}
                  </div>
                  <div style="min-width: 38px; height: 38px; padding: 0 8px; border-radius: 8px; background: ${isIntersectNode ? '#fdf2f8' : '#ffffff'}; border: 2px ${isIntersectNode ? 'solid #ec4899' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                    <span style="font-size: 12px; font-weight: 800; color: ${isIntersectNode ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                      ${val}
                    </span>
                    <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">${listName}[${idx}]</span>
                  </div>
                </div>
                ${idx < list.length - 1 ? '<span style="color:#cbd5e1; font-size:12px;">▶</span>' : ''}
              </div>
            `;
          })
          .join('');

        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569; min-width: 44px;">${title}:</span>
            <div style="display: flex; align-items: center; gap: 4px; overflow-x: auto; padding: 4px 0;">
              ${nodes}
              <span style="color:#cbd5e1; font-size:12px;">▶</span>
              <div style="min-width: 34px; height: 38px; border-radius: 8px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-family: monospace;">null</div>
            </div>
          </div>
        `;
      };

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${renderTrack('链表 A', listA, skipA, 'A')}
          ${renderTrack('链表 B', listB, skipB, 'B')}
        </div>
      `;
    }

    // 2. 渲染指针位置 (Card 2 Left)
    if (this.pointersContainer) {
      this.pointersContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>pA 指针:</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb;">
              ${paOnList === 'null' ? 'null' : `${paOnList}[${pa}] (值 ${(paOnList === 'A' ? listA : listB)[pa]})`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>pB 指针:</span>
            <span style="font-family: monospace; font-weight:800; color: #059669;">
              ${pbOnList === 'null' ? 'null' : `${pbOnList}[${pb}] (值 ${(pbOnList === 'B' ? listB : listA)[pb]})`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>相遇判定 (pA == pB):</span>
            <span style="font-family: monospace; font-weight:800; color: ${step.found ? '#059669' : '#64748b'};">
              ${step.found ? 'true (交点已锁定)' : 'false'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      let actionBadge = '';
      if (step.action === 'step') actionBadge = '<span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:700;">双指针平移</span>';
      else if (step.action === 'switch_lane') actionBadge = '<span style="background:#f3e8ff; color:#9333ea; padding:2px 6px; border-radius:4px; font-weight:700;">🔀 换道走对方链表</span>';
      else if (step.action === 'meet') actionBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">💖 浪漫相遇！</span>';
      else actionBadge = '<span style="background:#f1f5f9; color:#64748b; padding:2px 6px; border-radius:4px; font-weight:700;">两指针同时到达 null</span>';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前指令:</span>
            ${actionBadge}
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 换道原理: <strong>pA 走完 A 走 B (a+c+b)，pB 走完 B 走 A (b+c+a)</strong></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染相交结果 (Card 2 Bottom)
    if (this.metricsContainer) {
      let resultText = '<span style="color:#64748b;">探索同步中...</span>';
      if (step.found) {
        const meetVal = paOnList === 'A' ? listA[pa] : listB[pa];
        resultText = `<strong style="color: #059669; font-family: monospace; font-size: 13px;">相交于节点 ${meetVal}</strong>`;
      } else if (step.missed) {
        resultText = '<strong style="color: #ef4444; font-family: monospace; font-size: 13px;">null (两链表不相交)</strong>';
      }

      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>相交交点 (Intersection): ${resultText}</span>
            <span style="font-family: monospace; font-weight: 700; color: #2563eb;">路程同步完成</span>
          </div>
        </div>
      `;
    }

    const badgeStatus = this.root?.querySelector('#badge-intersection-status') as HTMLElement | null;
    if (badgeStatus) {
      if (step.found) {
        badgeStatus.textContent = '相交已锁定';
        badgeStatus.style.background = '#ecfdf5';
        badgeStatus.style.color = '#059669';
      } else if (step.missed) {
        badgeStatus.textContent = '无交点';
        badgeStatus.style.background = '#fef2f2';
        badgeStatus.style.color = '#ef4444';
      } else {
        badgeStatus.textContent = '探索中';
        badgeStatus.style.background = '#eff6ff';
        badgeStatus.style.color = '#2563eb';
      }
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'step') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '平移';
        } else if (st.action === 'switch_lane') {
          badgeColor = '#9333ea';
          badgeBg = '#f3e8ff';
          badgeText = '换道';
        } else if (st.action === 'meet') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '相遇';
        } else if (st.action === 'done_null') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '结束';
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
  id: 'intersection-linked-list',
  name: '链表相交',
  viewId: 'algo-intersection-linked-list-view',
  category: 'linked-list',
  description: '面试题 02.07 / LC 160 · 双指针浪漫换道相遇，巧妙消除长度差确定两链表交点',
  icon: '🤝',
  template,
  Visualizer: IntersectionLinkedListVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '透彻理解双指针换道算法数学原理 (a + c + b == b + c + a) 与链表相交判定技巧',
});
