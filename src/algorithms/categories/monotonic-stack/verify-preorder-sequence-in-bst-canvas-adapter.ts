import { type VerifyPreorderBstStep } from './verify-preorder-sequence-in-bst-step-compiler';

export function renderVerifyPreorderCanvas(container: HTMLElement, step: VerifyPreorderBstStep): void {
  const { preorder, currentIndex, stack, lowerBound, isValidSoFar } = step;

  const seqHtml = preorder.map((val, idx) => {
    const isCurrent = idx === currentIndex;
    const isPast = idx < currentIndex;
    let bg = 'rgba(30, 41, 59, 0.6)';
    let border = '1px solid rgba(255, 255, 255, 0.1)';
    let color = '#f8fafc';

    if (isCurrent) {
      bg = isValidSoFar ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.3)';
      border = isValidSoFar ? '2px solid #38bdf8' : '2px solid #ef4444';
      color = isValidSoFar ? '#38bdf8' : '#f87171';
    } else if (isPast) {
      bg = 'rgba(15, 23, 42, 0.4)';
      border = '1px solid rgba(255, 255, 255, 0.05)';
      color = '#64748b';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="
          width: 48px;
          height: 52px;
          border-radius: 8px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.15rem;
          color: ${color};
          transition: all 0.2s;
        ">
          ${val}
        </div>
        <span style="font-size: 0.72rem; color: #64748b; font-family: monospace;">#${idx}</span>
      </div>
    `;
  }).join('');

  const stackHtml = stack.map((val, idx) => `
    <div style="
      padding: 8px 16px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      border-radius: 6px;
      color: #38bdf8;
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 140px;
    ">
      <span>${val}</span>
      <span style="font-size: 0.7rem; color: #94a3b8;">${idx === stack.length - 1 ? '栈顶 top' : `[${idx}]`}</span>
    </div>
  `).reverse().join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🔢 前序遍历序列考察流</span>
          <span style="font-size: 0.85rem; color: #94a3b8;">
            合法状态: <b style="color: ${isValidSoFar ? '#34d399' : '#ef4444'};">${isValidSoFar ? 'VALID (正常推进)' : 'INVALID (违规拦截)'}</b>
          </span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          ${seqHtml}
        </div>
      </div>

      <div style="flex: 1; display: flex; gap: 16px;">
        <div style="
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🥞 单调递减栈 (祖先链)</span>
            <span style="font-size: 0.8rem; color: #94a3b8;">容量: ${stack.length}</span>
          </div>
          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            overflow-y: auto;
            min-height: 140px;
          ">
            ${stackHtml.length ? stackHtml : '<div style="color:#64748b; font-size:0.85rem; margin:auto;">栈为空</div>'}
          </div>
        </div>

        <div style="
          flex: 1;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        ">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🌊 BST 右子树下界水位线 (Lower Bound)</span>

          <div style="
            padding: 16px;
            background: ${isValidSoFar ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.15)'};
            border: 1px solid ${isValidSoFar ? '#34d399' : '#ef4444'};
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          ">
            <div style="font-size: 0.85rem; color: #94a3b8;">当前右子树最低允许值:</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: ${isValidSoFar ? '#34d399' : '#f87171'};">
              ${lowerBound === -Infinity ? '-∞ (无下界约束)' : `≥ ${lowerBound}`}
            </div>
          </div>

          <div style="
            padding: 12px;
            background: rgba(30, 41, 59, 0.4);
            border-radius: 8px;
            font-size: 0.83rem;
            color: #94a3b8;
            line-height: 1.5;
          ">
            💡 <b>BST 核心法则</b>：<br>
            • 左子树遍历时持续压栈，保持递减；<br>
            • 遇到大于栈顶的数说明进入右子树，弹出所有左侧祖先，并将最后弹出的祖先值确立为后续全域下界！
          </div>
        </div>
      </div>
    </div>
  `;
}
