import type { DpDemoStep } from '../dp-demo-visualizer';
import type { DpBacktrackStep } from '../../../../core/interfaces';

export interface WorkshopElements {
  workshopSourceEl: HTMLElement | null;
  workshopTargetEl: HTMLElement | null;
  workshopHudEl: HTMLElement | null;
}

export interface StoryElements {
  storyGoalEl: HTMLElement | null;
  storyBranchesEl: HTMLElement | null;
  storyConclusionEl: HTMLElement | null;
}

export interface BacktrackElements {
  backtrackSummaryEl: HTMLElement | null;
  backtrackTimelineEl: HTMLElement | null;
  dp2dEl?: HTMLElement | null;
  goToStep?: (stepIndex: number) => void;
  currentIndex?: number;
  steps?: DpDemoStep[];
}

/**
 * 双字符串变身流水线工作台 (Workshop HUD)
 */
export function renderWorkshopHUD(elements: WorkshopElements, step: DpDemoStep): void {
  const { workshopSourceEl, workshopTargetEl, workshopHudEl } = elements;
  if (!workshopSourceEl || !workshopTargetEl || !workshopHudEl) return;

  const rowL = step.rowLabels || [];
  const colL = step.colLabels || [];
  const srcChars = rowL.length > 1 && rowL[0] === '∅' ? rowL.slice(1) : (step.source || []);
  const tgtChars = colL.length > 1 && colL[0] === '∅' ? colL.slice(1) : [];

  const ci = step.current?.i;
  const cj = step.current?.j;

  let actionType: 'match' | 'delete' | 'insert' | 'replace' | 'cond' | 'init' | 'done' = 'cond';
  let actionDesc = '比对状态中...';

  if (step.actionMeta) {
    actionType = step.actionMeta.type;
    actionDesc = step.actionMeta.desc || step.message;
  } else if (step.metrics?.status === '初始化' || (ci === 0 && cj === 0)) {
    actionType = 'init';
    actionDesc = '🎬 初始化状态，准备开始双端比对';
  } else if (step.metrics?.status === '已完成') {
    actionType = 'done';
    actionDesc = `✅ 变形流水线推导完毕！最终最少操作步数：${step.metrics?.answer ?? ''}`;
  } else if (step.metrics?.status === '条件判定') {
    actionType = 'cond';
    const isM = ci != null && cj != null && srcChars[ci - 1] === tgtChars[cj - 1];
    actionDesc = `🔍【条件判定】比对 S[${ci! - 1}]='${srcChars[ci! - 1] || ''}' 与 T[${cj! - 1}]='${tgtChars[cj! - 1] || ''}' ➔ ${isM ? '字符相同 ✓' : '字符不同 ✗'}`;
  } else {
    actionDesc = step.message || '计算状态转移中...';
  }

  // 渲染上排源卡片
  workshopSourceEl.innerHTML = '';
  srcChars.forEach((ch, idx) => {
    const card = document.createElement('div');
    card.className = 'dp-stage-card';
    card.innerHTML = `${ch}<span class="dp-card-idx">S[${idx}]</span>`;
    if (ci != null && idx === ci - 1) {
      if (actionType === 'delete') card.classList.add('is-deleted');
      else if (actionType === 'replace') card.classList.add('is-replaced');
      else if (actionType === 'match') card.classList.add('is-matched');
      else card.classList.add('is-active-focus');
    }
    workshopSourceEl.appendChild(card);
  });

  // 渲染下排目标卡片
  workshopTargetEl.innerHTML = '';
  tgtChars.forEach((ch, idx) => {
    const card = document.createElement('div');
    card.className = 'dp-stage-card';
    card.innerHTML = `${ch}<span class="dp-card-idx">T[${idx}]</span>`;
    if (cj != null && idx === cj - 1) {
      if (actionType === 'insert') card.classList.add('is-inserted');
      else if (actionType === 'match') card.classList.add('is-matched');
      else card.classList.add('is-active-focus');
    }
    workshopTargetEl.appendChild(card);
  });

  // 渲染 HUD 动作徽章
  const icon = actionType === 'match' ? '🟢' : actionType === 'delete' ? '🗑️' : actionType === 'insert' ? '➕' : actionType === 'replace' ? '🔄' : actionType === 'done' ? '✅' : '🔍';
  workshopHudEl.innerHTML = `<div class="dp-hud-badge"><span>${icon}</span> <span>${actionDesc}</span></div>`;
}

/**
 * 三路决策故事剧情卡片渲染 (Story Card)
 */
export function renderStory(elements: StoryElements, step: DpDemoStep): void {
  const { storyGoalEl, storyBranchesEl, storyConclusionEl } = elements;
  if (!storyGoalEl || !storyBranchesEl || !storyConclusionEl) return;

  if (step.storyMeta) {
    const sm = step.storyMeta;
    storyGoalEl.innerHTML = `
      <div class="dp-story-goal-title">🎯 当前推导小目标</div>
      <div class="dp-story-goal-content">${sm.goal}</div>
    `;

    if (sm.candidates && sm.candidates.length > 0) {
      storyBranchesEl.innerHTML = sm.candidates
        .map(
          (b) => `
        <div class="dp-story-branch-card ${b.isChosen ? 'is-chosen' : ''}">
          <div class="dp-story-branch-name">
            <span>${b.icon || '📌'} ${b.name}</span>
            <span class="dp-story-branch-cost">${b.formula}</span>
          </div>
          <div class="dp-story-branch-desc">${b.desc}</div>
          ${b.isChosen ? '<div class="dp-story-winner-badge" style="font-size:10px; font-weight:800; color:#34d399; margin-top:2px;">🏆 最优决策 (WINNER)</div>' : ''}
        </div>
      `
        )
        .join('');
    } else {
      storyBranchesEl.innerHTML = `<div style="grid-column: 1 / -1; color: #94a3b8; font-size: 12.5px; text-align: center; padding: 10px;">${step.message}</div>`;
    }

    storyConclusionEl.innerHTML = sm.conclusion || step.message;
    return;
  }

  // 通用回退
  const ci = step.current?.i ?? 0;
  const cj = step.current?.j ?? 0;
  storyGoalEl.innerHTML = `<div class="dp-story-goal-title">🎯 当前小目标</div><div class="dp-story-goal-content">${step.message || `推导状态 (${ci}, ${cj})`}</div>`;
  storyBranchesEl.innerHTML = `<div style="grid-column:1/-1; padding:8px; color:#cbd5e1; font-family:monospace;">${step.formulaSubstituted || step.formula || '计算中...'}</div>`;
  storyConclusionEl.innerHTML = step.message;
}

/**
 * 最优回溯操作时间轴渲染 (Backtrack Timeline)
 */
export function renderBacktrack(elements: BacktrackElements, step: DpDemoStep): void {
  const { backtrackSummaryEl, backtrackTimelineEl, dp2dEl, goToStep, currentIndex, steps } = elements;
  if (!backtrackSummaryEl || !backtrackTimelineEl) return;
  const path = step.backtrackPath;
  const rowL = step.rowLabels || [];
  const colL = step.colLabels || [];
  const srcChars = rowL.length > 1 && rowL[0] === '∅' ? rowL.slice(1) : (step.source || []);
  const tgtChars = colL.length > 1 && colL[0] === '∅' ? colL.slice(1) : [];

  if (!path || path.length === 0) {
    backtrackSummaryEl.textContent = '计算中，最优路径将在生成后实时更新...';
    backtrackTimelineEl.innerHTML = '<div style="color:#64748b; font-size:12px; padding:10px;">暂无路径</div>';
    return;
  }

  backtrackSummaryEl.innerHTML = `
    <span>🎯 最优操作路径序列 (共 <strong>${path.length}</strong> 步)</span>
    <span>源串 "<strong>${srcChars.join('')}</strong>" ➔ 目标串 "<strong>${tgtChars.join('')}</strong>"</span>
  `;

  backtrackTimelineEl.innerHTML = '';
  path.forEach((ps, idx) => {
    const item = document.createElement('div');
    item.className = 'dp-timeline-step';
    item.style.cursor = 'pointer';
    item.title = `点击直接跳转到该操作 (${ps.i}, ${ps.j}) 的推导步骤`;

    const isCurrentActive = (step.current?.i === ps.i && step.current?.j === ps.j) || (ps.stepIndex != null && ps.stepIndex === currentIndex);
    if (isCurrentActive) {
      item.classList.add('is-active');
    }

    item.innerHTML = `
      <span style="font-weight:700; color:#64748b; min-width:22px;">${idx + 1}.</span>
      <span class="dp-timeline-badge ${ps.badgeClass || ps.action}">${ps.badge || ps.action.toUpperCase()}</span>
      <span style="font-weight:700; color:#f1f5f9;">${ps.title || `步骤 (${ps.i}, ${ps.j})`}</span>
      <span style="font-size:11px; color:#94a3b8; margin-left:auto;">${ps.desc}</span>
    `;

    item.onclick = () => {
      if (typeof ps.stepIndex === 'number' && goToStep) {
        goToStep(ps.stepIndex);
      } else if (steps && goToStep) {
        const targetIdx = steps.findIndex((s) => s.current?.i === ps.i && s.current?.j === ps.j);
        if (targetIdx !== -1) {
          goToStep(targetIdx);
        }
      }
    };

    item.onmouseenter = () => {
      const targetCell = dp2dEl?.querySelector<HTMLElement>(`.dp-table-cell[data-r="${ps.i}"][data-c="${ps.j}"]`);
      if (targetCell) targetCell.classList.add('hover-highlight');
    };
    item.onmouseleave = () => {
      const targetCell = dp2dEl?.querySelector<HTMLElement>(`.dp-table-cell[data-r="${ps.i}"][data-c="${ps.j}"]`);
      if (targetCell) targetCell.classList.remove('hover-highlight');
    };

    backtrackTimelineEl.appendChild(item);
  });
}
