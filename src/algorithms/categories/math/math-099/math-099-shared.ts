/**
 * 左神算法通关课 第 099 课 - 逆元、容斥与组合数学公共组件与接口
 */

export const MOD_1E9_7 = 1000000007;

export interface Math099Step {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  inversesTable?: { num: number; inv: number }[];
  activeNum?: number;
  ieSubsets?: { mask: number; cost: number; sign: number; ways: number }[];
  dpGrid?: number[][];
  finalValue?: number;
}

/**
 * 渲染乘法逆元卡片队列
 */
export function renderInverseCards(
  container: HTMLElement,
  inverses: { num: number; inv: number }[],
  activeNum?: number,
  mod: number = MOD_1E9_7
) {
  const box = document.createElement('div');
  box.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1e293b;';
  header.innerHTML = `
    <span>⚡ 模 ${mod} 乘法逆元对照表 (满足 (a × a⁻¹) ≡ 1)</span>
    <span style="font-size: 11px; color: #64748b;">共 ${inverses.length} 项</span>
  `;
  box.appendChild(header);

  const list = document.createElement('div');
  list.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; max-height: 160px; overflow-y: auto; padding: 2px;';

  inverses.forEach(item => {
    const isActive = item.num === activeNum;
    const card = document.createElement('div');
    card.style.cssText = `
      padding: 4px 8px;
      border-radius: 6px;
      background: ${isActive ? '#eff6ff' : '#f8fafc'};
      border: 1.5px solid ${isActive ? '#3b82f6' : '#cbd5e1'};
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    card.innerHTML = `
      <span style="font-weight: 700; color: ${isActive ? '#1d4ed8' : '#334155'};">${item.num}⁻¹</span>
      <span style="color: #94a3b8;">=</span>
      <span style="font-weight: 800; color: #059669;">${item.inv}</span>
    `;
    list.appendChild(card);
  });

  box.appendChild(list);
  container.appendChild(box);
}

/**
 * 渲染容斥原理子集交集符号流水线
 */
export function renderIeFlow(
  container: HTMLElement,
  subsets: { mask: number; cost: number; sign: number; ways: number }[],
  finalAns: number
) {
  const box = document.createElement('div');
  box.style.cssText = 'padding: 12px 16px; background: #0f172a; border-radius: 8px; color: #f8fafc; font-family: monospace; font-size: 12px; display: flex; flex-direction: column; gap: 6px;';

  box.innerHTML = `
    <div style="font-weight: 700; color: #cbd5e1; display: flex; justify-content: space-between;">
      <span>📐 容斥原理子集流水线 (奇减偶加):</span>
      <span style="color: #4ade80; font-size: 13px;">合法总方案 = ${finalAns}</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; margin-top: 4px;">
      ${subsets.map(s => {
        const signText = s.sign > 0 ? '+ (偶加)' : '- (奇减)';
        const signColor = s.sign > 0 ? '#4ade80' : '#f87171';
        return `
          <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-radius: 4px; background: #1e293b; border: 1px solid #334155;">
            <span>Mask #${s.mask.toString(2).padStart(4, '0')} (溢出开销 ${s.cost})</span>
            <span style="color: ${signColor}; font-weight: 700;">${signText} ${s.ways}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.appendChild(box);
}
