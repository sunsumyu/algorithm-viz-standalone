/**
 * 左神算法通关课 Class 084 ~ 088 进阶动态规划专题（第二弹）共享沙盘与渲染助手
 * 提供：错排计数递推沙盘、极大极小博弈沙盘、SOS高维前缀和沙盘、环形项链倍长沙盘、树上背包泛化物品沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Dp084Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 错排计数沙盘 (Class 084)
// ----------------------------------------------------
export function renderCountingDpBoard(
  n: number,
  curI: number,
  history: { i: number; val: number }[],
  curAns: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔢 错排递推状态演化 (规模 N = ${n})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          D(${curI}) = ${curAns}
        </span>
      </div>

      <!-- 递推历史状态卡片 -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${history.map((h) => {
          const isCur = h.i === curI;
          return `
            <div style="padding: 8px 14px; border-radius: 8px; border: 2px solid ${isCur ? '#8b5cf6' : '#cbd5e1'}; background: ${isCur ? '#f5f3ff' : '#f8fafc'}; text-align: center; min-width: 60px;">
              <div style="font-size: 11px; color: #64748b;">D(${h.i})</div>
              <div style="font-size: 16px; font-weight: 800; color: ${isCur ? '#7c3aed' : '#1e293b'};">${h.val}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        递推关系：$D(i) = (i - 1) \\times [D(i - 1) + D(i - 2)]$，第 $i$ 个元素有 $i-1$ 个错误落点，分别拆分为互相交换与不互相交换两类。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 极大极小博弈沙盘 (Class 085)
// ----------------------------------------------------
export function renderGameProbabilityBoard(
  nums: number[],
  i: number,
  j: number,
  pickLeftScore: number,
  pickRightScore: number,
  bestDiff: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎮 极大极小石子博弈 (当前可选石子区间: [${i}, ${j}])</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: ${bestDiff >= 0 ? '#ecfdf5' : '#fee2e2'}; color: ${bestDiff >= 0 ? '#047857' : '#b91c1c'}; font-weight: 800;">
          先手相对净得分: ${bestDiff >= 0 ? '+' : ''}${bestDiff} (${bestDiff >= 0 ? '先手必胜' : '后手必胜'})
        </span>
      </div>

      <!-- 石子列表 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${nums.map((v, idx) => {
          const inRange = idx >= i && idx <= j;
          const isLeft = idx === i;
          const isRight = idx === j;
          return `
            <div style="padding: 8px 14px; border-radius: 8px; border: 2px solid ${isLeft || isRight ? '#f59e0b' : inRange ? '#3b82f6' : '#cbd5e1'}; background: ${isLeft || isRight ? '#fef3c7' : inRange ? '#eff6ff' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 15px; font-weight: 800; color: #1e293b;">${v}</div>
              <div style="font-size: 9px; color: #64748b;">[${idx}] ${isLeft ? '👈左拿' : isRight ? '👉右拿' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px; font-size: 11px; color: #1e40af; text-align: center;">
          选择左端 nums[${i}]=${nums[i]} ➔ 净得分: ${pickLeftScore}
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px; font-size: 11px; color: #1e40af; text-align: center;">
          选择右端 nums[${j}]=${nums[j]} ➔ 净得分: ${pickRightScore}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. SOS DP 高维前缀和沙盘 (Class 086)
// ----------------------------------------------------
export function renderSosDpBoard(
  dim: number,
  curBit: number,
  dp: number[],
  focusMask: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌐 SOS DP 超立方体高维前缀和 (正在处理维度 bit = ${curBit})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          全维度: 0..${dim - 1} (${1 << dim} 个状态)
        </span>
      </div>

      <!-- 掩码状态阵列 -->
      <div style="display: grid; grid-template-columns: repeat(${1 << dim}, 1fr); gap: 4px; margin-bottom: 12px;">
        ${dp.map((val, mask) => {
          const isFocus = mask === focusMask;
          const hasBit = (mask & (1 << curBit)) !== 0;
          return `
            <div style="padding: 6px 4px; border-radius: 6px; border: 1px solid ${isFocus ? '#ef4444' : hasBit ? '#a855f7' : '#cbd5e1'}; background: ${isFocus ? '#fef2f2' : hasBit ? '#f5f3ff' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 9px; color: #64748b;">${mask.toString(2).padStart(dim, '0')}</div>
              <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-top: 2px;">${val}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        SOS 转移：若当前 mask 包含第 ${curBit} 位，则累加 $dp[mask \\oplus 2^{${curBit}}]$；复杂度由暴力 $O(3^N)$ 飞跃至 $O(N \\cdot 2^N)$！
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 环形区间 DP 能量项链沙盘 (Class 087)
// ----------------------------------------------------
export function renderCircularIntervalBoard(
  a: number[],
  n: number,
  bestStart: number,
  maxEnergy: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📿 环形能量项链破环成链倍长沙盘 (长度 2N = ${2 * n})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          全局最大释放能量: ${maxEnergy}
        </span>
      </div>

      <!-- 倍长珠子标记 -->
      <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${a.map((v, idx) => {
          const isBestWindow = idx >= bestStart && idx < bestStart + n;
          return `
            <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${isBestWindow ? '#10b981' : '#cbd5e1'}; background: ${isBestWindow ? '#d1fae5' : '#f8fafc'}; text-align: center; min-width: 36px;">
              <div style="font-size: 12px; font-weight: 800; color: #1e293b;">${v}</div>
              <div style="font-size: 9px; color: ${isBestWindow ? '#047857' : '#64748b'};">[${idx}]</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        破环成链：环上任意长度为 $N$ 的切断方案均对应倍长数组中 $[start, start + N - 1]$ 的线性区间 DP，遍历最优起点为 ${bestStart}。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 树上背包泛化物品沙盘 (Class 088)
// ----------------------------------------------------
export function renderTreeKnapsackBoard(
  nodes: { id: number; score: number }[],
  m: number,
  curU: number,
  dpRow: number[]
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 树形依赖背包 (正在处理节点 u = ${curU}, 课程上限 M = ${m})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 800;">
          当前最大学分: ${Math.max(...dpRow)}
        </span>
      </div>

      <!-- 节点与当前背包容量分配 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${nodes.map((n) => `
          <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${n.id === curU ? '#3b82f6' : '#cbd5e1'}; background: ${n.id === curU ? '#eff6ff' : '#f8fafc'}; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #1e293b;">课 ${n.id} ${n.id === 0 ? '(根)' : ''}</div>
            <div style="font-size: 9px; color: #64748b;">学分: ${n.score}</div>
          </div>
        `).join('')}
      </div>

      <!-- 背包容量分配表 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 4px;">节点 ${curU} 选修不同门数的最大学分:</div>
        <div style="display: flex; gap: 6px; justify-content: center;">
          ${dpRow.map((val, cap) => `
            <div style="padding: 4px 8px; border-radius: 4px; background: #ffffff; border: 1px solid #cbd5e1; font-size: 11px; text-align: center;">
              <span style="color: #64748b;">修${cap}门:</span> <b>${val}</b>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
