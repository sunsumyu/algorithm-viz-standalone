import { ParenthesesStep } from './longest-valid-parentheses-step-compiler';

export function renderParenthesesCanvas(container: HTMLElement, step: ParenthesesStep): void {
  const { s, currentIndex, stack, validRange } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: space-around; gap: 14px; width: 100%; height: 100%; padding: 12px 16px; box-sizing: border-box;">
      <!-- 1. 括号字符序列与游标扫描轨 -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 620px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>🔤</span> 括号序列扫描轨 (长度: ${s.length})
          </span>
          ${
            validRange
              ? `<span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px;">
                  连续有效区间: [${validRange[0]}..${validRange[1]}] (长度: ${validRange[1] - validRange[0] + 1})
                </span>`
              : `<span style="font-size: 11px; color: #94a3b8;">暂无连续匹配区间</span>`
          }
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; flex-wrap: wrap; padding: 8px 0; min-height: 85px;">
          ${s.split('').map((char, idx) => {
            const isCur = idx === currentIndex;
            const inValidRange = validRange && idx >= validRange[0] && idx <= validRange[1];

            let bgColor = '#ffffff';
            let borderColor = '#cbd5e1';
            let textColor = '#334155';
            let shadow = '0 1px 3px rgba(0, 0, 0, 0.04)';

            if (isCur) {
              bgColor = '#eff6ff';
              borderColor = '#0284c7';
              textColor = '#0369a1';
              shadow = '0 0 0 3px rgba(2, 132, 199, 0.18), 0 2px 6px rgba(2, 132, 199, 0.15)';
            } else if (inValidRange) {
              bgColor = '#ecfdf5';
              borderColor = '#10b981';
              textColor = '#047857';
              shadow = '0 0 0 2px rgba(16, 185, 129, 0.16)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <div style="font-size: 10px; height: 16px; font-weight: 800; display: flex; align-items: center;">
                  ${isCur ? '<span style="color: #0284c7; background: #e0f2fe; padding: 1px 5px; border-radius: 4px;">CUR</span>' : inValidRange ? '<span style="color: #059669; background: #dcfce7; padding: 1px 5px; border-radius: 4px;">✓</span>' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 22px;
                  font-weight: 800;
                  font-family: 'JetBrains Mono', monospace;
                  color: ${textColor};
                  box-shadow: ${shadow};
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                ">
                  ${char}
                </div>
                <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; font-weight: 600;">
                  #${idx}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. 匹配基准栈 (真实索引栈架) -->
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 620px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
            <span>📚</span> 匹配基准栈 (底 ➔ 顶)
          </span>
          <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; font-weight: 600;">
            栈内深度: ${stack.length}
          </span>
        </div>

        <div style="
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          min-height: 46px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
        ">
          ${
            stack.length === 0
              ? '<span style="font-size: 12px; color: #94a3b8; font-style: italic;">（栈当前为空）</span>'
              : stack.map((idxVal, i) => {
                  const isTop = i === stack.length - 1;
                  if (idxVal === -1) {
                    return `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        background: #fef2f2;
                        border: 1px solid #f87171;
                        border-radius: 6px;
                        padding: 5px 10px;
                        font-size: 12px;
                        font-family: 'JetBrains Mono', monospace;
                        font-weight: 700;
                        color: #991b1b;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                      ">
                        <span style="font-size: 9px; background: #ef4444; color: #ffffff; padding: 1px 4px; border-radius: 3px;">哨兵</span>
                        <span>-1 (初始断点)</span>
                        ${isTop ? '<span style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 1px 4px; border-radius: 3px;">TOP</span>' : ''}
                      </div>
                    `;
                  }
                  return `
                    <div style="
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      background: #eff6ff;
                      border: 1px solid #60a5fa;
                      border-radius: 6px;
                      padding: 5px 10px;
                      font-size: 12px;
                      font-family: 'JetBrains Mono', monospace;
                      font-weight: 700;
                      color: #1e40af;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                    ">
                      <span style="font-size: 9px; background: #3b82f6; color: #ffffff; padding: 1px 4px; border-radius: 3px;">左括号</span>
                      <span>#${idxVal} ('${s[idxVal]}')</span>
                      ${isTop ? '<span style="font-size: 9px; background: #0284c7; color: #ffffff; padding: 1px 4px; border-radius: 3px;">TOP</span>' : ''}
                    </div>
                  `;
                }).join('')
          }
        </div>
      </div>
    </div>
  `;
}
