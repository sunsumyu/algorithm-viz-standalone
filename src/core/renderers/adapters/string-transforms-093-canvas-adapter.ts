/**
 * 转化字符串的最少操作次数 (String Transforms) Canvas Adapter
 */

import { StringTransformsStep } from './string-transforms-093-step-compiler';
import { renderDecisionBalance } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-shared';

export class StringTransforms093CanvasAdapter {
  render(stageContainer: HTMLElement, step: StringTransformsStep): void {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">目标字符集大小: <b>${step.distinctTargetChars.length}</b> / 26</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">映射边数: ${Object.keys(step.mapping).length} 条</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">能否转换:</span>
          <span style="color: ${step.canTransform ? '#059669' : '#dc2626'}; font-weight: 800; font-size: 15px;">${step.canTransform ? 'TRUE (可以)' : 'FALSE (不可)'}</span>
        </div>
      </div>
    `;

    // 中部映射有向边看板
    const mapBox = document.createElement('div');
    mapBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px; overflow-y: auto;';

    const entries = Object.entries(step.mapping);
    if (entries.length === 0) {
      mapBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">等待提取映射关系...</div>';
    } else {
      entries.forEach(([from, to]) => {
        const card = document.createElement('div');
        card.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 700;';
        card.innerHTML = `
          <span style="color: #2563eb;">'${from}'</span>
          <span style="color: #94a3b8; font-size: 11px;">➔</span>
          <span style="color: #059669;">'${to}'</span>
        `;
        mapBox.appendChild(card);
      });
    }
    mainCard.appendChild(mapBox);

    // 底部天平分析
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '一对多冲突校验',
      leftVal: step.conflictInfo ? '存在冲突 ❌' : '无冲突 ✓',
      rightTitle: '空闲字符破环校验',
      rightVal: step.isDeadlock ? '26字满射死锁 ❌' : `有空闲字符 (${26 - step.distinctTargetChars.length}个) ✓`,
      winner: step.canTransform ? 'right' : 'left',
      reason: step.canTransform ? '无冲突且具备空闲中转字符' : (step.conflictInfo ? '一对多无法分化' : '字符集满射死锁'),
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  }
}

export const stringTransforms093CanvasAdapter = new StringTransforms093CanvasAdapter();
