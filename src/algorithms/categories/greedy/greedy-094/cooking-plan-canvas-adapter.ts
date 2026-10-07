import { CookingPlanStep } from './cooking-plan-step-compiler';
import { renderDecisionBalance } from './greedy-094-shared';

export function renderCookingPlanCanvas(stageContainer: HTMLElement, step: CookingPlanStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">当前后缀累加和 suffixSum:</span>
        <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.suffixSum}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">累计总喜爱时间:</span>
        <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalSum} 分</span>
      </div>
    </div>
  `;

  // 菜肴卡片列表
  const dishBox = document.createElement('div');
  dishBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

  const title = document.createElement('div');
  title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
  title.textContent = '🍳 菜肴序列 (升序排列后由右至左扫描贪心纳入)';
  dishBox.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center;';

  step.dishes.forEach((d) => {
    const isCur = step.curIdx === d.idx;
    const isSelected = d.selected;

    let border = '#cbd5e1';
    let bg = '#f8fafc';
    let color = '#334155';

    if (isCur && step.stopped) {
      border = '#ef4444';
      bg = '#fee2e2';
      color = '#b91c1c';
    } else if (isCur) {
      border = '#3b82f6';
      bg = '#eff6ff';
      color = '#1d4ed8';
    } else if (isSelected) {
      border = '#10b981';
      bg = '#ecfdf5';
      color = '#047857';
    }

    const item = document.createElement('div');
    item.style.cssText = `min-width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 800; position: relative;`;

    item.innerHTML = `
      <span style="font-size: 16px; color: ${color};">${d.val >= 0 ? `+${d.val}` : d.val}</span>
      <span style="font-size: 10px; color: #94a3b8; margin-top: 2px;">菜品 #${d.idx}</span>
    `;

    if (isSelected) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -10px; background: #10b981; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
      tag.textContent = '选中';
      item.appendChild(tag);
    } else if (isCur && step.stopped) {
      const tag = document.createElement('span');
      tag.style.cssText = 'position: absolute; top: -10px; background: #ef4444; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
      tag.textContent = '放弃';
      item.appendChild(tag);
    }

    grid.appendChild(item);
  });
  dishBox.appendChild(grid);
  mainCard.appendChild(dishBox);

  // 决策天平
  const balanceBox = document.createElement('div');
  renderDecisionBalance(balanceBox, {
    leftTitle: '后缀累加和 suffixSum > 0 时纳入',
    leftVal: '为总和带来正向净收益 (total += suffixSum)',
    rightTitle: '后缀累加和 suffixSum <= 0 时停止',
    rightVal: '负满意度不仅自身扣分，还会侵蚀前序收益',
    winner: 'left',
    reason: '由右向左后缀累加，每多做一道前序菜肴，所有后续菜品的时间权重均+1，当且仅当 suffixSum > 0 时带来总分增量',
  });
  mainCard.appendChild(balanceBox);

  stageContainer.appendChild(mainCard);
}
