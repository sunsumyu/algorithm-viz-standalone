/**
 * 哈希表理论基础 — 画布与 DOM 渲染适配器
 */

import { HTTStep } from './hash-table-theory-step-compiler';

export interface HTTDomElements {
  root: HTMLElement | null;
  bucketsListEl: HTMLElement | null;
  metricKeyEl: HTMLElement | null;
  metricSlotEl: HTMLElement | null;
  metricCollisionEl: HTMLElement | null;
  metricLoadEl: HTMLElement | null;
  formulaCalcEl: HTMLElement | null;
  logContainer: HTMLElement | null;
  logCountEl: HTMLElement | null;
}

export function renderHashTableTheoryStep(
  elements: HTTDomElements,
  step: HTTStep,
  currentStepIndex: number
): void {
  const { buckets, currentKey, targetSlot, isCollision, loadFactor, status } = step;

  // 1. 渲染哈希桶阵列与链表
  if (elements.bucketsListEl) {
    elements.bucketsListEl.innerHTML = buckets
      .map((chain, slotIdx) => {
        const isTarget = targetSlot === slotIdx;
        let rowClass = 'htt-bucket-row';
        if (isTarget) rowClass += ' is-target';

        const nodesHtml =
          chain.length === 0
            ? '<span style="color:#94a3b8; font-size:10px; font-style:italic;">null (空)</span>'
            : chain
                .map((k, kIdx) => {
                  const isNew =
                    isTarget &&
                    kIdx === chain.length - 1 &&
                    (status === 'insert' || status === 'collision-chain');
                  return `
                  <div class="htt-chain-node ${isNew ? 'is-new' : ''}">
                    <span>key: ${k}</span>
                  </div>
                  ${kIdx < chain.length - 1 ? '<span style="color:#94a3b8;">&rarr;</span>' : ''}
                `;
                })
                .join('');

        return `
          <div class="${rowClass}">
            <div class="htt-slot-badge">桶 [${slotIdx}]</div>
            <div class="htt-chain-nodes">${nodesHtml}</div>
          </div>
        `;
      })
      .join('');
  }

  // 2. 更新状态监视器
  if (elements.metricKeyEl) elements.metricKeyEl.textContent = currentKey !== null ? String(currentKey) : '—';
  if (elements.metricSlotEl) elements.metricSlotEl.textContent = targetSlot !== null ? `[${targetSlot}]` : '—';
  if (elements.metricCollisionEl) {
    if (status === 'collision-chain') {
      elements.metricCollisionEl.textContent = '⚠️ 发生碰撞';
      elements.metricCollisionEl.style.color = '#ef4444';
    } else if (status === 'insert') {
      elements.metricCollisionEl.textContent = '无碰撞';
      elements.metricCollisionEl.style.color = '#10b981';
    } else {
      elements.metricCollisionEl.textContent = '—';
      elements.metricCollisionEl.style.color = '#64748b';
    }
  }
  if (elements.metricLoadEl) elements.metricLoadEl.textContent = String(loadFactor);

  if (elements.formulaCalcEl) {
    if (currentKey !== null && targetSlot !== null) {
      elements.formulaCalcEl.textContent = `hash(${currentKey}) = ${currentKey} % 6 = ${targetSlot}`;
    } else {
      elements.formulaCalcEl.textContent = 'hash(key) = key % 6';
    }
  }

  // 3. 更新日志流
  if (elements.logContainer) {
    const logEntry = document.createElement('div');
    logEntry.style.padding = '4px 8px';
    logEntry.style.borderRadius = '6px';
    logEntry.style.background = isCollision ? '#fef2f2' : status === 'done' ? '#f0fdf4' : '#eff6ff';
    logEntry.style.color = isCollision ? '#b91c1c' : status === 'done' ? '#15803d' : '#1d4ed8';
    logEntry.style.border =
      '1px solid ' + (isCollision ? '#fecaca' : status === 'done' ? '#bbf7d0' : '#bfdbfe');
    logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${currentStepIndex + 1}]</span> ${step.log}`;

    elements.logContainer.appendChild(logEntry);
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;

    if (elements.logCountEl) {
      elements.logCountEl.textContent = `${elements.logContainer.children.length} 条记录`;
    }
  }

  const badgeCollision = elements.root?.querySelector('#badge-collision');
  if (badgeCollision) {
    badgeCollision.textContent =
      status === 'done' ? '演示完成' : isCollision ? '⚠️ 发生碰撞 (Chaining)' : '无碰撞 (Direct)';
  }
}
