import type { DpDemoStep } from '../dp-demo-visualizer';
import type { CodePanel } from '../../../../core/code-panel';
import type { StepVar } from '../../../../core/interfaces';

export interface LectureHUDElements {
  phaseEl: HTMLElement | null;
  coordsEl: HTMLElement | null;
  varsBoxEl: HTMLElement | null;
  varsListEl: HTMLElement | null;
}

/**
 * 教学 HUD 与变量监听面板渲染器 (Lecture HUD & Variables Watcher)
 */
export function renderLectureHUD(
  elements: LectureHUDElements,
  step: DpDemoStep,
  codePanel?: CodePanel | null
): void {
  const { phaseEl, coordsEl, varsBoxEl, varsListEl } = elements;
  if (!phaseEl && !coordsEl) return;

  const ci = step.current?.i;
  const cj = step.current?.j;
  const cIdx = step.current?.index;

  // 1. 更新阶段徽章
  let phaseText = '⚡ 状态转移递推';
  if (step.actionMeta?.type === 'init' || (ci === 0 && cj === 0) || step.metrics?.status === '初始化') {
    phaseText = '🎬 边界初始化';
  } else if (step.actionMeta?.type === 'match') {
    phaseText = '✨ 字符匹配 (0 代价继承)';
  } else if (step.actionMeta?.type === 'replace') {
    phaseText = '🔄 替换字符决策 (代价 +1)';
  } else if (step.actionMeta?.type === 'delete') {
    phaseText = '🗑️ 删除字符决策 (代价 +1)';
  } else if (step.actionMeta?.type === 'insert') {
    phaseText = '➕ 插入字符决策 (代价 +1)';
  } else if (step.metrics?.status === '条件判定') {
    phaseText = '🔍 字符比对与条件判定';
  } else if (step.metrics?.status === '已完成') {
    phaseText = '🏁 计算完毕 (全局最优解)';
  }

  if (phaseEl) {
    phaseEl.textContent = phaseText;
  }

  // 2. 更新坐标徽章
  if (coordsEl) {
    if (typeof ci === 'number' && typeof cj === 'number') {
      const rL = step.rowLabels?.[ci] ?? '';
      const cL = step.colLabels?.[cj] ?? '';
      coordsEl.textContent = `光标：i=${ci} (${rL || '∅'}), j=${cj} (${cL || '∅'})`;
    } else if (typeof cIdx === 'number') {
      coordsEl.textContent = `当前位置：index = ${cIdx}`;
    } else {
      coordsEl.textContent = `状态：${step.metrics?.status || '执行中'}`;
    }
  }

  // 3. 渲染专门的核心变量实时监视列表
  const stepAny = step as { vars?: StepVar[]; metrics?: Record<string, unknown> };
  const varsToDisplay: StepVar[] = stepAny.vars || (stepAny.metrics
    ? Object.entries(stepAny.metrics).map(([name, value]) => ({
        name,
        value: String(value ?? '-'),
        type: (typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string') as any,
      }))
    : []);

  if (varsListEl) {
    if (varsToDisplay.length > 0) {
      if (varsBoxEl) varsBoxEl.style.display = 'flex';
      varsListEl.innerHTML = '';
      varsToDisplay.forEach((v) => {
        const badge = document.createElement('span');
        badge.className = 'dp-var-badge';
        if (v.changed) badge.classList.add('is-changed');

        let typeCategory = 'result';
        let catTag = '';
        const lower = v.name.toLowerCase();
        if (lower.includes('cost') || lower.includes('input') || lower.includes('nums') || lower.includes('arr') || lower.includes('weight')) {
          typeCategory = 'input';
          catTag = '输入值';
        } else if (lower.includes('memo') || lower.includes('cache')) {
          typeCategory = 'memo';
          catTag = '备忘录';
        } else if (lower.includes('left') || lower.includes('right') || lower.includes('分支') || lower.includes('sub')) {
          typeCategory = 'branch';
          catTag = '分支';
        } else if (lower.startsWith('i') || lower.startsWith('j') || lower.includes('台阶') || lower.includes('规模') || lower.includes('目标')) {
          typeCategory = 'scale';
          catTag = '规模';
        }

        badge.innerHTML = `
          ${catTag ? `<span class="dp-var-tag">${catTag}</span>` : ''}
          <span class="dp-var-name">${v.name}</span>
          <span class="dp-var-val" data-type="${typeCategory}">${v.value}</span>
        `;
        varsListEl.appendChild(badge);
      });
    } else if (varsBoxEl) {
      varsBoxEl.style.display = 'none';
    }
  }

  // 同步更新右侧代码面板中的变量监视器
  if (varsToDisplay.length > 0) {
    codePanel?.updateVars(varsToDisplay);
  }
}
