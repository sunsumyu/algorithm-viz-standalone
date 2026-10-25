/**
 * 左神算法通关课 第 097 课 - 数论与筛法公共可视化组件与接口
 */

export interface Math097Step {
  line?: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  curTesting?: number;
  testedDivisors?: { divisor: number; isFactor: boolean }[];
  factors?: { prime: number; power: number }[];
  currentRemainder?: number;
  sieveGrid?: { val: number; isPrime: boolean; markedBy?: number }[];
  primesFound?: number[];
  millerBases?: { base: number; passed: boolean }[];
  isResultPrime?: boolean;
}

/**
 * 渲染数论筛法百数表网格
 */
export function renderSieveGrid(
  container: HTMLElement,
  grid: { val: number; isPrime: boolean; markedBy?: number }[],
  activeVal?: number,
  title: string = '素数筛法状态网格'
) {
  const box = document.createElement('div');
  box.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #f8fafc;';
  header.innerHTML = `
    <span>🔢 ${title}</span>
    <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">
      <span style="color: #34d399; font-weight: 700;">● 质数</span> | 
      <span style="color: #64748b;">● 合数</span> | 
      <span style="color: #38bdf8; font-weight: 700;">● 活跃游标</span>
    </span>
  `;
  box.appendChild(header);

  const gridContainer = document.createElement('div');
  gridContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; max-height: 220px; overflow-y: auto; padding: 4px;';

  grid.forEach(cell => {
    const isActive = cell.val === activeVal;
    const isP = cell.isPrime;

    let bg = isP ? 'rgba(16, 185, 129, 0.15)' : '#1e293b';
    let border = isP ? '#10b981' : '#334155';
    let text = isP ? '#34d399' : '#64748b';
    let glow = isP ? 'box-shadow: 0 0 6px rgba(16, 185, 129, 0.2);' : '';

    if (isActive) {
      bg = 'rgba(56, 189, 248, 0.25)';
      border = '#38bdf8';
      text = '#38bdf8';
      glow = 'box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);';
    }

    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 38px;
      border-radius: 6px;
      background: ${bg};
      border: 1.5px solid ${border};
      font-family: 'JetBrains Mono', monospace;
      position: relative;
      ${glow}
      transition: all 0.2s ease;
    `;

    card.innerHTML = `
      <span style="font-size: 12px; font-weight: 800; color: ${text};">${cell.val}</span>
      ${!isP && cell.markedBy ? `<span style="font-size: 8px; color: #f43f5e; line-height: 1; font-weight: 700;">÷${cell.markedBy}</span>` : ''}
    `;

    gridContainer.appendChild(card);
  });

  box.appendChild(gridContainer);
  container.appendChild(box);
}

/**
 * 渲染质因数分解算式看板
 */
export function renderFactorEquation(
  container: HTMLElement,
  originalN: number,
  factors: { prime: number; power: number }[],
  currentRemainder?: number
) {
  const box = document.createElement('div');
  box.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #334155;
    color: #f8fafc;
    font-family: 'JetBrains Mono', monospace;
  `;

  const equationHtml = factors.length === 0
    ? '<span style="color: #64748b;">尚未提取因数</span>'
    : factors.map(f => `
        <span style="display: inline-flex; align-items: baseline; gap: 2px; padding: 2px 6px; border-radius: 4px; background: #1e293b; border: 1px solid #38bdf860;">
          <strong style="color: #38bdf8; font-size: 14px;">${f.prime}</strong>
          <sup style="color: #facc15; font-size: 10px; font-weight: 800;">${f.power}</sup>
        </span>
      `).join(' <span style="color: #94a3b8; font-weight: 700;">×</span> ');

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
      <span>📐 算术基本定理分解表达式:</span>
      ${currentRemainder && currentRemainder > 1 ? `<span style="color: #f59e0b;">剩余商 = ${currentRemainder}</span>` : '<span style="color: #10b981;">已完全分解</span>'}
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 14px; flex-wrap: wrap;">
      <span style="font-weight: 800; color: #f8fafc;">${originalN} =</span>
      ${equationHtml}
    </div>
  `;

  container.appendChild(box);
}
