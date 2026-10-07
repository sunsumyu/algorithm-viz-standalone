import type { ShortestUnsortedStep } from './shortest-unsorted-subarray-step-compiler';
import { renderArrayPointers, renderDecisionBalance } from './greedy-091-shared';

export function renderShortestUnsortedCanvas(stageContainer: HTMLElement, step: ShortestUnsortedStep): void {
  stageContainer.innerHTML = '';

  // 1. 指针配置
  const pointers: { index: number; label: string; color: string }[] = [];
  if (step.curIdx >= 0) {
    pointers.push({
      index: step.curIdx,
      label: step.direction === 'left-to-right' ? '正向扫描 i' : '逆向扫描 i',
      color: '#3b82f6',
    });
  }
  if (step.left >= 0 && step.left < step.nums.length) {
    pointers.push({ index: step.left, label: 'L 边界', color: '#ef4444' });
  }
  if (step.right >= 0 && step.right < step.nums.length) {
    pointers.push({ index: step.right, label: 'R 边界', color: '#10b981' });
  }

  const highlightRange: [number, number] | undefined = (step.left <= step.right && step.right >= 0)
    ? [step.left, step.right]
    : undefined;

  // 2. 主容器卡片
  const mainCard = document.createElement('div');
  mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 顶部状态指标条
  const isForward = step.direction === 'left-to-right';
  const extremeText = step.direction === 'done'
    ? '扫描已完成'
    : (isForward ? `历史最大值 max = ${step.curExtreme === -Infinity ? '-∞' : step.curExtreme}` : `历史最小值 min = ${step.curExtreme === Infinity ? '+∞' : step.curExtreme}`);

  const badgeHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-weight: 700; font-size: 13px; color: #1e293b;">阶段: ${step.direction === 'left-to-right' ? '➡️ 正向扫描 (找最右 R)' : (step.direction === 'right-to-left' ? '⬅️ 逆向扫描 (找最左 L)' : '🎉 计算收敛')}</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${extremeText}</span>
      </div>
      <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
        <span style="color: #ef4444; font-weight: 700;">Left: ${step.left === step.nums.length ? '未锁定' : step.left}</span>
        <span style="color: #64748b;">|</span>
        <span style="color: #10b981; font-weight: 700;">Right: ${step.right === -1 ? '未锁定' : step.right}</span>
      </div>
    </div>
  `;
  mainCard.innerHTML = badgeHtml;

  // 数组与指针区域
  const arrayBox = document.createElement('div');
  arrayBox.style.cssText = 'flex: 1; display: flex; align-items: center; justify-content: center; width: 100%;';
  renderArrayPointers(arrayBox, step.nums, pointers, highlightRange);
  mainCard.appendChild(arrayBox);

  // 底部天平卡片
  if (step.curIdx >= 0 && step.curIdx < step.nums.length) {
    const balanceBox = document.createElement('div');
    const curVal = step.nums[step.curIdx];
    if (isForward) {
      renderDecisionBalance(balanceBox, {
        leftTitle: `当前元素 nums[${step.curIdx}]`,
        leftVal: curVal,
        rightTitle: '历史前缀最大值 max',
        rightVal: step.curExtreme === -Infinity ? '-∞' : step.curExtreme,
        winner: step.isViolation ? 'left' : 'right',
        reason: step.isViolation ? `nums[${step.curIdx}] < max (违规逆序)` : `nums[${step.curIdx}] >= max (合规)`,
      });
    } else {
      renderDecisionBalance(balanceBox, {
        leftTitle: `当前元素 nums[${step.curIdx}]`,
        leftVal: curVal,
        rightTitle: '历史后缀最小值 min',
        rightVal: step.curExtreme === Infinity ? '+∞' : step.curExtreme,
        winner: step.isViolation ? 'left' : 'right',
        reason: step.isViolation ? `nums[${step.curIdx}] > min (违规逆序)` : `nums[${step.curIdx}] <= min (合规)`,
      });
    }
    mainCard.appendChild(balanceBox);
  }

  stageContainer.appendChild(mainCard);
}
