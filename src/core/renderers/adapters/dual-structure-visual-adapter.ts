/**
 * 双结构交互画板适配器 (DualStructureVisualAdapter)
 * 专门承载「双栈实现队列」、「双队列实现栈」等数据结构流转沙盘
 * 严格遵循 Zero-Subbox 规范：直接在浅灰画布上扁平排布，绝不嵌套任何白色边框卡片
 */

export interface DualStackState {
  inStack: number[];
  outStack: number[];
  currentOp?: string;
  transferHappened?: boolean;
  activeItem?: number | null;
}

export class DualStructureVisualAdapter {
  /**
   * 渲染双栈队列交互沙盘（100% 扁平，零白底嵌套框）
   */
  public static renderDualStack(container: HTMLElement, state: DualStackState): void {
    const { inStack, outStack, transferHappened } = state;

    // 输入栈元素 Chip 渲染
    const inItemsHtml =
      inStack.length === 0
        ? `<span style="color: #94a3b8; font-size: 11px; font-style: italic; line-height: 24px;">空栈</span>`
        : inStack
            .map(
              (val, idx) => `
              <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 4px; background: #ffffff; border: 1.5px solid #3b82f6; color: #1d4ed8; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                ${val}${idx === inStack.length - 1 ? ' <span style="font-size: 9px; margin-left: 2px; color: #60a5fa;">(栈顶)</span>' : ''}
              </div>
            `
            )
            .join('<span style="color: #cbd5e1; font-size: 11px; margin: 0 2px;">→</span>');

    // 输出栈元素 Chip 渲染
    const outItemsHtml =
      outStack.length === 0
        ? `<span style="color: #94a3b8; font-size: 11px; font-style: italic; line-height: 24px;">空栈</span>`
        : outStack
            .map(
              (val, idx) => `
              <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 4px; background: #ffffff; border: 1.5px solid #10b981; color: #047857; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                ${val}${idx === outStack.length - 1 ? ' <span style="font-size: 9px; margin-left: 2px; color: #34d399;">(队头)</span>' : ''}
              </div>
            `
            )
            .join('<span style="color: #cbd5e1; font-size: 11px; margin: 0 2px;">←</span>');

    // 中间转移流动状态条
    const transferIndicator = transferHappened
      ? `
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 10px; border-radius: 4px; background: #fef3c7; color: #b45309; font-size: 10.5px; font-weight: 700; margin: 4px 0;">
        <span>⬇️ 正在将 inStack 元素倾倒并反转压入 outStack ⬇️</span>
      </div>
    `
      : `
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 10px; color: #94a3b8; margin: 2px 0;">
        <span>⬇ outStack 为空时一次性转移全部元素 ⬇</span>
      </div>
    `;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
        
        <!-- 1. 输入栈 inStack 轨道 (直接排布于画布底色上，无白色子框) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #1e40af;">
              <span>📥 输入栈 inStack (栈底 → 栈顶):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #2563eb;">容量: ${inStack.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 28px;">
            ${inItemsHtml}
          </div>
        </div>

        <!-- 2. 中继流动指示 -->
        ${transferIndicator}

        <!-- 3. 输出栈 outStack 轨道 (直接排布于画布底色上，无白色子框) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #065f46;">
              <span>📤 输出栈 outStack (队头/栈顶 ← 栈底):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #059669;">容量: ${outStack.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 28px;">
            ${outItemsHtml}
          </div>
        </div>

      </div>
    `;
  }

  /**
   * 渲染单队列循环旋转模拟栈沙盘（100% 扁平，零白底嵌套框）
   */
  public static renderQueueRotation(
    container: HTMLElement,
    state: {
      queue: number[];
      rotatingItem: number | null;
      rotateStep: number;
      totalRotate: number;
    }
  ): void {
    const { queue, rotatingItem, rotateStep, totalRotate } = state;

    const queueItemsHtml =
      queue.length === 0
        ? `<span style="color: #94a3b8; font-size: 11px; font-style: italic; line-height: 24px;">空队列</span>`
        : queue
            .map((val, idx) => {
              const isTop = idx === 0;
              const isRotating = val === rotatingItem;
              const borderColor = isRotating ? '#f59e0b' : isTop ? '#0d9488' : '#cbd5e1';
              const textColor = isRotating ? '#b45309' : isTop ? '#0f766e' : '#334155';
              const bg = isRotating ? '#fef3c7' : '#ffffff';

              return `
              <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${borderColor}; color: ${textColor}; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                ${val}${isTop ? ' <span style="font-size: 9px; margin-left: 2px; color: #14b8a6;">(栈顶/队头)</span>' : ''}
              </div>
            `;
            })
            .join('<span style="color: #cbd5e1; font-size: 11px; margin: 0 2px;">→</span>');

    const rotationStatusHtml =
      rotateStep > 0
        ? `
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 10px; border-radius: 4px; background: #fef3c7; color: #b45309; font-size: 10.5px; font-weight: 700; margin: 4px 0;">
        <span>🔄 正在旋转第 ${rotateStep} / ${totalRotate} 步：队头出队重入队尾 🔄</span>
      </div>
    `
        : `
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 10px; color: #94a3b8; margin: 2px 0;">
        <span>🔄 push 新元素后循环旋转 size-1 次，保持队头为最新栈顶 🔄</span>
      </div>
    `;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
        
        <!-- 单队列轨道 (直接排布于画布底色上，无白色子框) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #0f766e;">
              <span>🥞 单队列存储轨道 (队头/栈顶 → 队尾):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0d9488;">队列容量: ${queue.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 28px;">
            ${queueItemsHtml}
          </div>
        </div>

        <!-- 循环旋转状态指示 -->
        ${rotationStatusHtml}

      </div>
    `;
  }
}
