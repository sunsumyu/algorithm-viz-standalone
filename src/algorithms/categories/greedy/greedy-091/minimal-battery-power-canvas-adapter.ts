import type { MinimalBatteryPowerStep } from './minimal-battery-power-step-compiler';

export function renderMinimalBatteryPowerCanvas(stageContainer: HTMLElement, step: MinimalBatteryPowerStep): void {
  stageContainer.innerHTML = '';

  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态栏
  mainCard.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">任务总数: <b>${step.tasks.length}</b></span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">当前进度: ${step.curTaskIdx >= 0 ? step.curTaskIdx + 1 : (step.ans > 0 ? step.tasks.length : 0)} / ${step.tasks.length}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
        <span style="color: #64748b;">最少初始能量:</span>
        <span style="color: #2563eb; font-weight: 800; font-size: 16px;">${step.ans}</span>
      </div>
    </div>
  `;

  // 中部任务卡片列表
  const tasksBox = document.createElement('div');
  tasksBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

  step.tasks.forEach((t, idx) => {
    const isCurrent = step.curTaskIdx === idx;
    const isFinished = step.curTaskIdx > idx || (step.curTaskIdx === -1 && step.ans > 0);

    let bg = '#f8fafc';
    let border = '#cbd5e1';
    if (isCurrent) {
      bg = '#eff6ff';
      border = '#3b82f6';
    } else if (isFinished) {
      bg = '#ecfdf5';
      border = '#10b981';
    }

    const card = document.createElement('div');
    card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
        <span style="font-weight: 700; font-size: 12px; color: #1e293b;">任务 #${t.taskIdx} ${isCurrent ? '⚡ 执行中' : (isFinished ? '✓ 已完成' : '')}</span>
        <span style="font-size: 10px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px;">冗余差值: +${t.diff}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span style="color: #64748b;">消耗 actual:</span>
        <span style="font-weight: 700; color: #ef4444; font-family: 'JetBrains Mono', monospace;">${t.actual}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span style="color: #64748b;">门槛 minimum:</span>
        <span style="font-weight: 700; color: #f59e0b; font-family: 'JetBrains Mono', monospace;">${t.minimum}</span>
      </div>
    `;
    tasksBox.appendChild(card);
  });
  mainCard.appendChild(tasksBox);

  // 底部算式展示
  if (step.stepFormula) {
    const formulaBox = document.createElement('div');
    formulaBox.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-family: "JetBrains Mono", monospace; font-size: 12px; color: #1e293b; font-weight: 600; text-align: center;';
    formulaBox.textContent = `📐 递推算式: ${step.stepFormula}`;
    mainCard.appendChild(formulaBox);
  }

  stageContainer.appendChild(mainCard);
}
