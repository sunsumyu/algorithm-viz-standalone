import { ParenthesesStep } from './min-remove-valid-parentheses-step-compiler';

export function renderMinRemoveCanvas(container: HTMLElement, step: ParenthesesStep) {
  const charsHtml = step.s
    .split('')
    .map((c, i) => {
      const isCur = step.currentIndex === i;
      const isInvalid = step.invalidIndices.includes(i);
      const inStack = step.stack.includes(i);

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      if (isInvalid) {
        border = 'border: 2px solid #f43f5e; background: rgba(225, 29, 72, 0.3); text-decoration: line-through;';
      } else if (isCur) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.5);';
      } else if (inStack) {
        border = 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.3);';
      }

      return `
      <div style="
        padding: 8px 12px;
        border-radius: 6px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 38px;
        transition: all 0.2s;
      ">
        <div style="font-size: 16px; font-weight: bold; color: ${isInvalid ? '#f87171' : '#f8fafc'}; font-family: monospace;">${c}</div>
        <div style="font-size: 9px; color: #64748b;">${i}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">括号有效性索引栈与标记重构沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #f43f5e;">无效括号数: ${step.invalidIndices.length}</span>
          ${
            step.resultStr
              ? `<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">最终串: "${step.resultStr}"</span>`
              : ''
          }
        </div>
      </div>

      <!-- 字符点阵卡片 -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap; padding: 14px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${charsHtml}
      </div>

      <!-- 核心原理说明卡 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 存索引而非字符</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">栈内只压入左括号的下标索引，遇到右括号弹顶，空栈遇右括号立即锁死无效下标。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. 残留左括号清算</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">遍历结束后留在栈内的左括号必无后继匹配，全量标记为无效，彻底消灭孤立括号。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 线性重构 O(N)</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">第二遍扫描跳过 invalid 标记，单次重组输出结果，严格 O(N) 极速通过。</div>
        </div>
      </div>
    </div>
  `;
}
