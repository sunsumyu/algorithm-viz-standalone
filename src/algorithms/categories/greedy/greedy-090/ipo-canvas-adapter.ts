import type { IPOStep } from './ipo-step-compiler';
import { renderIPOTwoHeapMarket } from './greedy-090-shared';

export const IPO_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 双堆贪心的运行机理与超集支配</h3>
    <p><b>为什么不能只用一个堆？</b></p>
    <p>因为项目的启动需要满足门槛 $capital[i] \\le w$。随着资本 $w$ 的增加，原本不能做的项目会陆续变成“可以做”。如果只有一个大根堆，堆顶的项目可能因为资金不够而无法启动；如果只有一个小根堆，又无法在常数时间内找到利润最大的项目。</p>
    
    <p><b>双堆协同的分工：</b></p>
    <ul>
      <li><b>门槛小根堆（待解锁池）</b>：堆顶是所需启动资金最少的项目。只要堆顶门槛 $\\le w$，就不断弹出并转移到利润大根堆。</li>
      <li><b>利润大根堆（可选池）</b>：里面的所有项目资本都已达标。直接弹出堆顶利润最高者变现，让 $w$ 滚雪球式快速增长！</li>
    </ul>
  </div>
`;

export function renderIPOCanvas(container: HTMLElement, step: IPOStep): void {
  renderIPOTwoHeapMarket(container, {
    capital: step.capital,
    kLeft: step.kLeft,
    lockedProjects: step.lockedProjects,
    unlockedProjects: step.unlockedProjects,
    activeProject: step.activeProject,
  });

  const root = container.closest('.dsp-view-root') || document;
  const capEl = root.querySelector('#metric-capital-w');
  const kEl = root.querySelector('#metric-k-left');
  const poolEl = root.querySelector('#metric-unlocked-count');

  if (capEl) capEl.textContent = `$${step.capital}`;
  if (kEl) kEl.textContent = `${step.kLeft} 轮`;
  if (poolEl) poolEl.textContent = `${step.unlockedProjects.length} 个`;
}

export function renderIPOCustomMetrics(container: HTMLElement, step: IPOStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">当前轮次状态:</span>
        <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
      </div>
      <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11.5px; color: #334155;">
        ${step.message}
      </div>
    </div>
  `;
}
