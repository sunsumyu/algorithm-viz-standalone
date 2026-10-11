/**
 * Class 032: 位运算实现加减乘除 (Bitwise Arithmetic Operations) - 视觉适配器
 * 左程云算法通关课入门篇 Class 032
 */

import { BitwiseArithmeticStep } from './bitwise-arithmetic-032-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderBitwiseCanvas(container: HTMLElement, step: BitwiseArithmeticStep) {
  const { a, b, xorSum, carry, currentResult, iter, op } = step;

  const toBinary8 = (val: number) => {
    return (val >>> 0).toString(2).padStart(8, '0').slice(-8);
  };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">运算符</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${op === 'add' ? '加法 (ADD)' : op === 'minus' ? '减法 (SUB)' : '乘法 (MUL)'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前 A</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${a} (${toBinary8(a)})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前 B / 进位</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${b} (${toBinary8(b)})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前结果</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${currentResult} (${toBinary8(currentResult)})
          </div>
        </div>
      </div>

      <!-- 二进制直观对齐模拟 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-family: monospace; display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <div style="font-size: 13px; color: #94a3b8;">第 ${iter} 轮二进制位运算拆解:</div>
        <div style="display: flex; gap: 12px; font-size: 18px; color: #f8fafc;">
          <span style="color: #f59e0b;">A:  ${toBinary8(a)}</span>
        </div>
        <div style="display: flex; gap: 12px; font-size: 18px; color: #ec4899;">
          <span style="color: #ec4899;">B:  ${toBinary8(b)}</span>
        </div>
        ${xorSum !== undefined && carry !== undefined ? `
          <div style="width: 240px; height: 1px; background: rgba(255,255,255,0.2); margin: 4px 0;"></div>
          <div style="display: flex; gap: 12px; font-size: 16px; color: #38bdf8;">
            <span>XOR(无进位): ${toBinary8(xorSum)}</span>
          </div>
          <div style="display: flex; gap: 12px; font-size: 16px; color: #a855f7;">
            <span>CARRY(进位):   ${toBinary8(carry)}</span>
          </div>
        ` : ''}
      </div>

      <!-- 核心数学与位运算逻辑卡片 -->
      ${renderFormulaCard(
        '位运算算术四则运算底层公理',
        'a + b = (a ^ b) + ((a & b) << 1)；相反数 -b = (~b + 1)；乘法利用二进制每一位的权值 (1 << k) 移位相加',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
