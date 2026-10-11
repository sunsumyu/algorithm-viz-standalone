/**
 * Class 039: 嵌套结构递归解法母题之三：原子的数量 (Count of Atoms)
 * Canvas Adapter
 */

import { renderFormulaCard } from './string-100-105/string-100-105-shared';
import { AtomStep } from './count-of-atoms-039-step-compiler';

export function renderCountOfAtomsCanvas(container: HTMLElement, step: AtomStep): void {
  const chars = step.formula.split('');
  const formulaChips = chars.map((ch, idx) => {
    const isCur = idx === step.cursor;
    const isPassed = idx < step.cursor;
    const bg = isCur ? '#3b82f6' : isPassed ? '#1e293b' : '#0f172a';
    const border = isCur ? '#60a5fa' : isPassed ? '#334155' : '#1e293b';
    const color = isCur ? '#ffffff' : isPassed ? '#94a3b8' : '#64748b';
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 0 2px;">
        <span style="font-size: 10px; color: ${isCur ? '#60a5fa' : '#475569'}; margin-bottom: 2px;">${idx}</span>
        <div style="width: 28px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${color}; font-family: monospace; font-size: 14px;">
          ${ch}
        </div>
      </div>
    `;
  }).join('');

  const atoms = Object.keys(step.currentMap).sort();
  const atomBadges = atoms.length > 0 ? atoms.map(a => `
    <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #38bdf8; border-radius: 6px; padding: 6px 12px; margin: 4px; display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: 800; color: #38bdf8; font-size: 15px;">${a}</span>
      <span style="background: #0284c7; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; font-weight: 700;">${step.currentMap[a]}</span>
    </div>
  `).join('') : '<span style="color: #64748b; font-size: 13px;">暂无原子统计</span>';

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 分子式游标滑动视图 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">
          🧪 化学分子式扫描游标 (Cursor: ${step.cursor})
        </div>
        <div style="display: flex; overflow-x: auto; padding: 6px 0; align-items: flex-end;">
          ${formulaChips}
        </div>
      </div>

      <!-- 递归状态沙盘 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- 当前递归层级与调用栈 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #a78bfa;">🥞 嵌套递归调用栈深度: Depth ${step.depth}</span>
            <span style="font-size: 11px; background: #6d28d9; color: white; padding: 2px 6px; border-radius: 4px;">递归天然解嵌套</span>
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #c4b5fd; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 4px;">
            ${step.callStackDesc.map((s, idx) => `<div>${idx === step.callStackDesc.length - 1 ? '👉 ' : '   '}${s}</div>`).join('')}
          </div>
        </div>

        <!-- 当前 TreeMap 原子累计 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">
            ⚛️ 当前层原子频次映射 (TreeMap&lt;Atom, Count&gt;)
          </div>
          <div style="display: flex; flex-wrap: wrap; min-height: 50px; align-items: center;">
            ${atomBadges}
          </div>
        </div>
      </div>

      <!-- 公式卡片 -->
      ${renderFormulaCard(
        '左程云嵌套递归通用三步律',
        '\\text{process}(s, i) \\longrightarrow \\big\\langle \\text{ResultMap}, \\; \\text{stopIndex} \\big\\rangle',
        '所有嵌套结构（计算器括号、字符串解码方括号、分子式圆括号）在遇到左括号时全部调用子递归 process(i + 1)；子过程在遇到对应右括号时立刻结算并把结果连同最新下标 stop 一同返回；父过程乘以外部系数合并进自己的 Map，天然利用系统调用栈处理任意深度的嵌套！'
      )}
    </div>
  `;
}
