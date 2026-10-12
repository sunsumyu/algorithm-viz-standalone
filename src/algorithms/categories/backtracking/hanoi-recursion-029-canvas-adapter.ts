/**
 * Class 029: 经典暴力递归入门 (汉诺塔) 画布适配器
 * 负责渲染汉诺塔物理柱子演化与指标面板
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { Hanoi029Step } from './hanoi-recursion-029-step-compiler';

export function renderHanoiRecursion029Canvas(container: HTMLElement, step: Hanoi029Step): void {
  const renderPillar = (name: string, disks: number[]) => {
    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 180px; position: relative;">
        <!-- 垂直立柱 -->
        <div style="position: absolute; width: 8px; height: 150px; background: #cbd5e1; border-radius: 4px; bottom: 10px; z-index: 1;"></div>
        <!-- 底座 -->
        <div style="position: absolute; width: 90%; height: 10px; background: #94a3b8; border-radius: 4px; bottom: 0;"></div>
        
        <!-- 堆叠的圆盘 -->
        <div style="display: flex; flex-direction: column-reverse; align-items: center; gap: 4px; z-index: 2; margin-bottom: 12px; width: 100%;">
          ${disks.map((d) => {
            const width = 30 + d * 22;
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
            const bg = colors[(d - 1) % colors.length];
            return `
              <div style="width: ${width}px; height: 22px; background: ${bg}; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${d}
              </div>
            `;
          }).join('')}
        </div>

        <span style="position: absolute; bottom: -20px; font-weight: 800; font-size: 14px; color: #334155;">柱 ${name}</span>
      </div>
    `;
  };

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前移动圆盘</div>
          <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.movedDisk ? `圆盘 #${step.movedDisk}` : '准备中'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前搬迁轨迹</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.fromPillar} ➜ ${step.toPillar}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">已走步数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.moveCount} 步</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">总步数进度</div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.moveCount} / ${step.totalExpectedMoves}</div>
        </div>
      </div>

      <!-- 物理柱子演化展板 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 30px 20px 40px 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 20px; justify-content: space-around;">
          ${renderPillar('A', step.disksA)}
          ${renderPillar('B', step.disksB)}
          ${renderPillar('C', step.disksC)}
        </div>
      </div>

      <!-- 决策卡片 -->
      ${renderFormulaCard(
        '宏观递归三步推导',
        `1. hanoi(n-1, from, other, to) ➜ 2. 移底盘 n ➜ 3. hanoi(n-1, other, to, from)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
