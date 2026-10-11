import { MinStackStep } from './min-stack-step-compiler';

export function renderMinStackCanvas(container: HTMLElement, step: MinStackStep): void {
  const { dataStack, minStack, currentMin, op, returnedVal } = step;

  const dataHtml = dataStack.map((val, idx) => `
    <div style="
      padding: 8px 14px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      border-radius: 6px;
      color: #38bdf8;
      font-weight: 700;
      font-size: 1.15rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 140px;
    ">
      <span>${val}</span>
      <span style="font-size: 0.72rem; color: #94a3b8;">${idx === dataStack.length - 1 ? 'TOP' : `[${idx}]`}</span>
    </div>
  `).reverse().join('');

  const minHtml = minStack.map((val, idx) => `
    <div style="
      padding: 8px 14px;
      background: rgba(52, 211, 153, 0.15);
      border: 1px solid #34d399;
      border-radius: 6px;
      color: #34d399;
      font-weight: 700;
      font-size: 1.15rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 140px;
    ">
      <span>${val}</span>
      <span style="font-size: 0.72rem; color: #94a3b8;">${idx === minStack.length - 1 ? 'MIN' : `[${idx}]`}</span>
    </div>
  `).reverse().join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 顶栏状态看板 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">当前指令:</span>
          <span style="
            font-size: 1.1rem;
            font-weight: 700;
            color: #fbbf24;
            background: rgba(251, 191, 36, 0.15);
            padding: 4px 12px;
            border-radius: 6px;
            border: 1px solid rgba(251, 191, 36, 0.3);
            font-family: monospace;
          ">
            ${op}
          </span>
          ${returnedVal !== undefined ? `<span style="color: #34d399; font-size: 0.9rem; font-weight: 600;">➔ 返回值: <b>${returnedVal}</b></span>` : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.85rem; color: #94a3b8;">常数时间极值:</span>
          <span style="
            font-size: 1.3rem;
            font-weight: 800;
            color: ${currentMin !== null ? '#34d399' : '#64748b'};
            background: rgba(52, 211, 153, 0.12);
            border: 1px solid rgba(52, 211, 153, 0.4);
            padding: 4px 14px;
            border-radius: 8px;
          ">
            ${currentMin !== null ? currentMin : 'NULL'}
          </span>
        </div>
      </div>

      <!-- 双栈实体展示 -->
      <div style="flex: 1; display: flex; gap: 16px;">
        <!-- 主数据栈 -->
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
            <span style="font-size: 0.95rem; font-weight: 600; color: #38bdf8;">📥 主数据栈 (Data Stack)</span>
            <span style="font-size: 0.8rem; color: #94a3b8;">大小: ${dataStack.length}</span>
          </div>
          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 8px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            overflow-y: auto;
            min-height: 160px;
          ">
            ${dataHtml.length ? dataHtml : '<div style="color:#64748b; font-size:0.85rem; margin:auto;">栈为空</div>'}
          </div>
        </div>

        <!-- 辅助最小栈 -->
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
            <span style="font-size: 0.95rem; font-weight: 600; color: #34d399;">🛡️ 辅助最小栈 (Min Stack)</span>
            <span style="font-size: 0.8rem; color: #94a3b8;">大小: ${minStack.length}</span>
          </div>
          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 8px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            overflow-y: auto;
            min-height: 160px;
          ">
            ${minHtml.length ? minHtml : '<div style="color:#64748b; font-size:0.85rem; margin:auto;">栈为空</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
