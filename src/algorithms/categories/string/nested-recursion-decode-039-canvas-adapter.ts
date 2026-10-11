/**
 * Class 039: 嵌套结构递归解法母题 (Nested Recursion Decode String)
 * Canvas Adapter
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { DecodeStep } from './nested-recursion-decode-039-step-compiler';

export function renderDecodeCanvas(container: HTMLElement, step: DecodeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前递归嵌套深度 (Depth)</div>
          <div style="font-size: 22px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            第 ${step.depth} 层递归
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前累积倍数 (Count)</div>
          <div style="font-size: 22px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            ${step.multiplier > 0 ? `${step.multiplier} 倍` : '待定'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前展开结果 (Decoded)</div>
          <div style="font-size: 18px; font-family: monospace; font-weight: bold; color: #34d399; margin-top: 6px;">
            "${step.decodedResult}"
          </div>
        </div>
      </div>

      <!-- 字符串扫描标尺沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          字符序列扫描卡尺 (游标 i 指向当前正在解析的字符)
        </div>

        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0;">
          ${step.inputStr.split('').map((char, idx) => {
            const isCurrent = idx === step.charIndex;
            const isPassed = idx < step.charIndex;
            return `
              <div style="
                min-width: 36px;
                height: 44px;
                background: ${isCurrent ? '#0284c7' : isPassed ? '#1e293b' : 'rgba(30,41,59,0.5)'};
                border: ${isCurrent ? '2px solid #38bdf8' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isCurrent ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
              ">
                <div style="font-size: 15px; font-weight: bold; color: ${isCurrent ? '#fff' : isPassed ? '#94a3b8' : '#cbd5e1'};">${char}</div>
                <div style="font-size: 9px; color: #64748b;">${idx}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '嵌套结构递归大一统模型',
        '任何包含括号或层级嵌套的问题（字符串解码、带括号四则运算、化学分子式展开、嵌套 JSON 语法解析），均可使用统一套路：递归函数从当前位置出发，遇到左嵌套符号递归深入下一层，遇到右嵌套符号连同最新游标一同返回，主过程将子串乘以倍数后接续扫描！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
