import type { KeyPointsData } from '../../../../core/code-panel';

export interface HandbookModalConfig {
  title: string;
  description?: string;
  keyPoints?: KeyPointsData | string;
  codeLines?: string[];
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  faqList?: Array<{ question: string; answer: string; tag?: string }>;
}

/**
 * 教学精解与考点手册模态弹窗管理器 (Handbook Modal Manager)
 */
export function setupHandbookModal(
  root: HTMLElement | null,
  modalEl: HTMLElement | null,
  config: HandbookModalConfig
): void {
  if (!root || !modalEl) return;
  const openBtns = root.querySelectorAll('#dp-btn-open-handbook, #dp-top-btn-open-handbook, .dp-lecture-handbook-btn');
  const closeBtn = root.querySelector('#dp-handbook-close');
  const contentEl = root.querySelector('#dp-handbook-content');
  const titleTextEl = root.querySelector('#dp-handbook-title-text');

  if (titleTextEl) {
    titleTextEl.textContent = `📚 《${config.title}》教学精解与考点手册`;
  }

  const modal = modalEl;
  openBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      populateHandbookContent(contentEl as HTMLElement | null, config);
      modal.style.display = 'flex';
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      modal.style.display = 'none';
    }
  });
}

export function populateHandbookContent(contentEl: HTMLElement | null, config: HandbookModalConfig): void {
  if (!contentEl) return;
  contentEl.innerHTML = '';

  // 1. 核心题意与生活化通俗类比
  const sec1 = document.createElement('div');
  sec1.className = 'dp-handbook-section';
  sec1.innerHTML = `
    <div class="dp-handbook-sec-title">🎯 一、核心题意与生活化通俗类比</div>
    <div style="color: #e2e8f0; font-size: 13px; line-height: 1.6;">${config.description || '本算法通过自底向上的动态规划求解最优决策。'}</div>
  `;
  contentEl.appendChild(sec1);

  // 2. 动态规划 5 步法标准推导
  if (config.keyPoints && typeof config.keyPoints === 'object') {
    const kp = config.keyPoints;
    const sec2 = document.createElement('div');
    sec2.className = 'dp-handbook-section';
    sec2.innerHTML = `
      <div class="dp-handbook-sec-title">🧠 二、动态规划 5 步法系统推导</div>
      ${kp.summary ? `<div style="background: rgba(59,130,246,0.15); border-left: 3px solid #3b82f6; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; color: #93c5fd;">${kp.summary}</div>` : ''}
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${kp.points.map(pt => `
          <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px;">
            <div style="font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
              <span>${pt.icon || '📌'}</span>
              <span>${pt.label}</span>
              ${pt.badge ? `<span style="font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fde68a; margin-left: auto;">${pt.badge}</span>` : ''}
            </div>
            <div style="color: #cbd5e1; font-size: 12.5px; margin-top: 4px; line-height: 1.5;">${pt.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
    contentEl.appendChild(sec2);
  }

  // 3. 完整代码逐行精解大表
  const sec3 = document.createElement('div');
  sec3.className = 'dp-handbook-section';
  const lines = config.codeLines || [];
  const lineExps = config.lineExplanations || {};

  let tableHtml = `
    <div class="dp-handbook-sec-title">📝 三、算法代码逐行精解全览表</div>
    <table class="dp-handbook-table">
      <thead>
        <tr>
          <th style="width: 50px;">行号</th>
          <th style="width: 42%;">代码语句</th>
          <th>教学级深度拆解与底层逻辑</th>
        </tr>
      </thead>
      <tbody>
  `;
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const exp = (lineExps as Record<number, string>)[lineNum] || '执行语句。';
    tableHtml += `
      <tr>
        <td style="font-family: monospace; font-weight: bold; color: #38bdf8;">${lineNum}</td>
        <td style="font-family: ui-monospace, Consolas, monospace; color: #f1f5f9; white-space: pre-wrap;">${line}</td>
        <td style="color: #cbd5e1; line-height: 1.45;">${exp}</td>
      </tr>
    `;
  });
  tableHtml += `</tbody></table>`;
  sec3.innerHTML = tableHtml;
  contentEl.appendChild(sec3);

  // 4. 常见面试考点与避坑解惑 (FAQ)
  if (config.faqList && config.faqList.length > 0) {
    const sec4 = document.createElement('div');
    sec4.className = 'dp-handbook-section';
    sec4.innerHTML = `
      <div class="dp-handbook-sec-title">💡 四、核心考点避坑与高频面试 FAQ</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${config.faqList.map(faq => `
          <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px;">
            <div style="font-weight: 800; color: #6ee7b7; display: flex; align-items: center; gap: 6px;">
              <span>❓</span>
              <span>${faq.question}</span>
              ${faq.tag ? `<span style="font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #6ee7b7; margin-left: auto;">${faq.tag}</span>` : ''}
            </div>
            <div style="color: #cbd5e1; font-size: 12.5px; margin-top: 4px; line-height: 1.5;">${faq.answer}</div>
          </div>
        `).join('')}
      </div>
    `;
    contentEl.appendChild(sec4);
  }
}
