/**
 * 除自身以外数组的乘积 — 画布适配器
 * 负责双向扫描状态沙盘、元素卡片列表与辅助引导面板渲染
 */

import { ProductStep } from './product-except-self-238-step-compiler';

export function renderProductCanvas(container: HTMLElement, step: ProductStep): void {
  const isFinish = step.phase === 'finish';
  const isSuffix = step.phase === 'suffix_pass';

  const cardsHtml = step.nums
    .map((v, i) => {
      const isCur = step.currentIndex === i && !isFinish;
      let border = 'border: 1.5px solid #cbd5e1;';
      let bg = '#ffffff';
      let shadow = 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
      let indicator = '&nbsp;';

      if (isCur) {
        border = isSuffix ? 'border: 2px solid #f59e0b;' : 'border: 2px solid #0ea5e9;';
        bg = isSuffix ? '#fef3c7;' : '#e0f2fe;';
        shadow = isSuffix ? 'box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);' : 'box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);';
        indicator = isSuffix
          ? '<span style="color: #b45309; font-weight: 700; font-size: 11px;">后缀合成 ➔</span>'
          : '<span style="color: #0369a1; font-weight: 700; font-size: 11px;">前缀扫描 ➔</span>';
      }

      return `
      <div style="
        padding: 12px 16px;
        border-radius: 12px;
        ${border}
        background: ${bg};
        ${shadow}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 80px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${indicator}</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">nums[ ${i} ]</div>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 4px 0;">${v}</div>
        <div style="
          font-size: 12px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #a7f3d0;
          margin-top: 6px;
        ">res: ${step.res[i]}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 700; color: #1e293b;">🔄 双向扫描状态沙盘 (Prefix & Suffix Product)</span>
            <span style="padding: 2px 8px; font-size: 11px; border-radius: 6px; background: #eff6ff; color: #1d4ed8; font-weight: 700; border: 1px solid #bfdbfe;">
              ${step.phase === 'prefix_pass' ? '正向前缀积阶段' : step.phase === 'suffix_pass' ? '逆向后缀积阶段' : step.phase === 'finish' ? '计算完成' : '准备扫描'}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
            <span style="color: #b45309; font-weight: 700; background: #fef3c7; padding: 2px 8px; border-radius: 6px; border: 1px solid #fde68a;">
              当前右侧累计积 R: ${step.rightProduct}
            </span>
          </div>
        </div>

        <!-- 数组元素卡片列表 -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; align-items: center; min-height: 120px;">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderProductAuxiliary(container: HTMLElement, step: ProductStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #bfdbfe; background: #eff6ff;">
          <div style="font-size: 12px; font-weight: 700; color: #1d4ed8;">1. 左侧前缀积一趟存</div>
          <div style="font-size: 11px; color: #3b82f6; margin-top: 4px; line-height: 1.5;">res[i] 暂时存放 i 左侧所有数的乘积，无需额外数组，就地复用输出缓存。</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #fde68a; background: #fefce8;">
          <div style="font-size: 12px; font-weight: 700; color: #b45309;">2. 右侧后缀积常数乘</div>
          <div style="font-size: 11px; color: #d97706; margin-top: 4px; line-height: 1.5;">倒序遍历时用单变量 R 累乘右边元素，res[i] *= R 瞬间完成左右乘积合成。</div>
        </div>
        <div style="padding: 12px; border-radius: 10px; border: 1px solid #a7f3d0; background: #ecfdf5;">
          <div style="font-size: 12px; font-weight: 700; color: #047857;">3. 零除法与 O(1) 空间</div>
          <div style="font-size: 11px; color: #059669; margin-top: 4px; line-height: 1.5;">完美规避除零异常（含 0 数组天然兼容），达到工业级安全与极致时空性能。</div>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 11px; color: #475569; line-height: 1.6;">
        <span style="font-weight: 700; color: #1e293b;">💡 实时推演：</span>
        ${step.decision || step.message}
      </div>
    </div>
  `;
}
