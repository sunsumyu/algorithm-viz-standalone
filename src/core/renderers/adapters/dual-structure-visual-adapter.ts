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
   * 渲染双栈队列交互沙盘（100% 扁平，零白底嵌套框，物理栈槽位）
   */
  public static renderDualStack(container: HTMLElement, state: DualStackState): void {
    const { inStack, outStack, transferHappened } = state;

    // 输入栈元素 Chip 渲染（自底向顶）
    const inItemsHtml =
      inStack.length === 0
        ? `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 11px; font-style: italic;">空栈 (inStack)</div>`
        : inStack
            .map(
              (val, idx) => `
              <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #3b82f6; color: #1d4ed8; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.2s;">
                ${val}${idx === inStack.length - 1 ? ' <span style="font-size: 9px; margin-left: 4px; color: #3b82f6; font-weight: 700;">(栈顶)</span>' : ''}
              </div>
            `
            )
            .join('<span style="color: #94a3b8; font-size: 11px; margin: 0 3px;">➔</span>');

    // 输出栈元素 Chip 渲染（队头在最前/栈顶）
    const outItemsHtml =
      outStack.length === 0
        ? `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 11px; font-style: italic;">空栈 (outStack)</div>`
        : outStack
            .map(
              (val, idx) => `
              <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #10b981; color: #047857; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.2s;">
                ${val}${idx === outStack.length - 1 ? ' <span style="font-size: 9px; margin-left: 4px; color: #10b981; font-weight: 700;">(队头)</span>' : ''}
              </div>
            `
            )
            .join('<span style="color: #94a3b8; font-size: 11px; margin: 0 3px;">⬅</span>');

    // 中间倾倒管道流向
    const transferIndicator = transferHappened
      ? `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 12px; border-radius: 6px; background: #fef3c7; border: 1px dashed #f59e0b; color: #b45309; font-size: 11px; font-weight: 800; animation: pulse 1.5s infinite;">
        <span>⚡ 触发倾倒倒置：inStack 元素逆序压入 outStack ⚡</span>
      </div>
    `
      : `
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10.5px; color: #94a3b8; padding: 2px 0;">
        <span style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 1px;">⬇ 当 outStack 为空时一次性倾倒转移全部元素 ⬇</span>
      </div>
    `;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 14px; box-sizing: border-box; padding: 6px;">
        
        <!-- 1. 输入栈 inStack 插槽 (平铺于底色之上) -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #1e40af;">
              <span>📥 输入栈 inStack (栈底 ➔ 栈顶):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #2563eb;">元素量: ${inStack.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 36px; padding: 4px 8px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
            ${inItemsHtml}
          </div>
        </div>

        <!-- 2. 中继流动管道 -->
        ${transferIndicator}

        <!-- 3. 输出栈 outStack 插槽 (平铺于底色之上) -->
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #065f46;">
              <span>📤 输出栈 outStack (队头 ⬅ 栈底):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #059669;">元素量: ${outStack.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 36px; padding: 4px 8px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
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
    state: { queue: number[]; rotatingItem?: number | null; rotateStep?: number; totalRotate?: number; action?: string }
  ): void {
    const { queue, rotatingItem, rotateStep = 0, totalRotate = 0, action } = state;

    const queueItemsHtml =
      queue.length === 0
        ? `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 11px; font-style: italic;">空队列 (Queue 为空)</div>`
        : queue
            .map((val, idx) => {
              const isTop = idx === 0;
              const isTail = idx === queue.length - 1;
              const isRotating = rotatingItem !== null && val === rotatingItem && action === 'rotate_step';

              let bg = '#ffffff';
              let border = '#3b82f6';
              let color = '#1d4ed8';

              if (isRotating) {
                bg = '#fef3c7';
                border = '#f59e0b';
                color = '#b45309';
              } else if (isTop) {
                bg = '#f0fdf4';
                border = '#10b981';
                color = '#047857';
              }

              return `
                <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${border}; color: ${color}; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.2s;">
                  ${val}${isTop ? ' <span style="font-size: 9px; margin-left: 4px; color: #10b981; font-weight: 700;">(栈顶/队头)</span>' : isTail ? ' <span style="font-size: 9px; margin-left: 4px; color: #64748b; font-weight: 700;">(队尾)</span>' : ''}
                </div>
              `;
            })
            .join('<span style="color: #94a3b8; font-size: 11px; margin: 0 3px;">➔</span>');

    const rotateIndicator =
      totalRotate > 0
        ? `
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 10px; border-radius: 6px; background: ${rotateStep > 0 ? '#fef3c7' : '#eff6ff'}; border: 1px dashed ${rotateStep > 0 ? '#f59e0b' : '#bfdbfe'}; color: ${rotateStep > 0 ? '#b45309' : '#1d4ed8'}; font-size: 11px; font-weight: 700;">
        <span>🔄 循环旋转进度: ${rotateStep} / ${totalRotate} ${rotateStep > 0 ? `(队头 ${rotatingItem} 出队推至队尾)` : '(push 后保持队头为最新栈顶)'}</span>
      </div>
    `
        : `
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10.5px; color: #94a3b8; padding: 2px 0;">
        <span style="border-bottom: 1px dashed #cbd5e1; padding-bottom: 1px;">🔄 单队列自环旋转：每次 push 后将前面 size-1 个元素重新移到队尾</span>
      </div>
    `;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 14px; box-sizing: border-box; padding: 6px;">
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #1e40af;">
              <span>🔁 循环队列主体 (队头/栈顶 ➔ 队尾):</span>
            </div>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #2563eb;">队列大小: ${queue.length}</span>
          </div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-height: 36px; padding: 4px 8px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
            ${queueItemsHtml}
          </div>
        </div>

        ${rotateIndicator}

      </div>
    `;
  }

  public static renderQueueStack(
    container: HTMLElement,
    state: { queue: number[]; rotatingItem?: number | null; rotateStep?: number; totalRotate?: number; action?: string }
  ): void {
    DualStructureVisualAdapter.renderQueueRotation(container, state);
  }
}
