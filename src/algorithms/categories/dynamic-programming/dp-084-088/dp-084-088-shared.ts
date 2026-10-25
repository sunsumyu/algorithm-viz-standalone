/**
 * 左神算法通关课 Class 084 ~ 088 进阶动态规划专题（第二弹）共享沙盘与渲染助手
 * 提供：错排计数递推沙盘、极大极小博弈沙盘、SOS高维前缀和沙盘、环形项链倍长沙盘、树上背包泛化物品沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Dp084Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  line?: number;
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
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>🔢</span> 错排递推状态演化 (规模 N = ${n})
        </span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #064e3b; color: #34d399; font-weight: 800; border: 1px solid #059669;">
          D(${curI}) = ${curAns}
        </span>
      </div>

      <!-- 递推历史状态卡片 -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; padding: 10px 0; background: #020617; border-radius: 10px; border: 1px solid #1e293b;">
        ${history.map((h) => {
          const isCur = h.i === curI;
          return `
            <div style="padding: 8px 14px; border-radius: 8px; border: 1.5px solid ${isCur ? '#a855f7' : '#334155'}; background: ${isCur ? '#581c8740' : '#1e293b60'}; text-align: center; min-width: 60px;">
              <div style="font-size: 10px; color: ${isCur ? '#d8b4fe' : '#94a3b8'}; font-family: monospace;">D(${h.i})</div>
              <div style="font-size: 16px; font-weight: 800; color: ${isCur ? '#c084fc' : '#f1f5f9'}; font-family: monospace;">${h.val}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #cbd5e1; text-align: center; line-height: 1.6;">
        💡 <strong>错排递推关系</strong>：$D(i) = (i - 1) \\times [D(i - 1) + D(i - 2)]$。第 $i$ 个元素有 $i-1$ 个放置位置，分为互相交换与不互相交换两类。
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
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>🎮</span> 极大极小石子博弈 (当前可选石子区间: [${i}, ${j}])
        </span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: ${bestDiff >= 0 ? '#064e3b' : '#881337'}; color: ${bestDiff >= 0 ? '#34d399' : '#fda4af'}; font-weight: 800; border: 1px solid ${bestDiff >= 0 ? '#059669' : '#e11d48'};">
          先手相对净得分: ${bestDiff >= 0 ? '+' : ''}${bestDiff} (${bestDiff >= 0 ? '先手必胜' : '后手必胜'})
        </span>
      </div>

      <!-- 石子列表 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; padding: 10px 0; background: #020617; border-radius: 10px; border: 1px solid #1e293b;">
        ${nums.map((v, idx) => {
          const inRange = idx >= i && idx <= j;
          const isLeft = idx === i;
          const isRight = idx === j;
          return `
            <div style="padding: 8px 14px; border-radius: 8px; border: 1.5px solid ${isLeft || isRight ? '#f59e0b' : inRange ? '#3b82f6' : '#334155'}; background: ${isLeft || isRight ? '#78350f40' : inRange ? '#1e3a8a40' : '#1e293b40'}; text-align: center;">
              <div style="font-size: 15px; font-weight: 800; color: ${isLeft || isRight ? '#fbbf24' : inRange ? '#93c5fd' : '#64748b'}; font-family: monospace;">${v}</div>
              <div style="font-size: 9px; color: ${isLeft || isRight ? '#fcd34d' : '#94a3b8'};">[${idx}] ${isLeft ? '👈左拿' : isRight ? '👉右拿' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; font-size: 11px; color: #93c5fd; text-align: center;">
          选择左端 nums[${i}]=${nums[i]} ➔ 净得分: <b style="color: #60a5fa;">${pickLeftScore}</b>
        </div>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; font-size: 11px; color: #93c5fd; text-align: center;">
          选择右端 nums[${j}]=${nums[j]} ➔ 净得分: <b style="color: #60a5fa;">${pickRightScore}</b>
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
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>🌐</span> SOS DP 超立方体高维前缀和 (正在处理维度 bit = ${curBit})
        </span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #3b0764; color: #d8b4fe; border: 1px solid #7e22ce; font-family: monospace;">
          全维度: 0..${dim - 1} (${1 << dim} 个状态)
        </span>
      </div>

      <!-- 掩码状态阵列 -->
      <div style="display: grid; grid-template-columns: repeat(${1 << dim}, 1fr); gap: 4px; margin-bottom: 12px; padding: 8px; background: #020617; border-radius: 10px; border: 1px solid #1e293b;">
        ${dp.map((val, mask) => {
          const isFocus = mask === focusMask;
          const hasBit = (mask & (1 << curBit)) !== 0;
          return `
            <div style="padding: 6px 4px; border-radius: 6px; border: 1px solid ${isFocus ? '#f43f5e' : hasBit ? '#a855f7' : '#334155'}; background: ${isFocus ? '#88133740' : hasBit ? '#581c8740' : '#1e293b40'}; text-align: center;">
              <div style="font-size: 9px; color: ${hasBit ? '#d8b4fe' : '#64748b'}; font-family: monospace;">${mask.toString(2).padStart(dim, '0')}</div>
              <div style="font-size: 12px; font-weight: 800; color: ${isFocus ? '#fda4af' : '#f1f5f9'}; margin-top: 2px; font-family: monospace;">${val}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #cbd5e1; text-align: center; line-height: 1.6;">
        💡 <strong>SOS 转移</strong>：若当前 mask 包含第 ${curBit} 位，则累加 $dp[mask \\oplus 2^{${curBit}}]$；复杂度由暴力 $O(3^N)$ 飞跃至 $O(N \\cdot 2^N)$！
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
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>📿</span> 环形能量项链破环成链倍长沙盘 (长度 2N = ${2 * n})
        </span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #064e3b; color: #34d399; font-weight: 800; border: 1px solid #059669;">
          全局最大释放能量: ${maxEnergy}
        </span>
      </div>

      <!-- 倍长珠子标记 -->
      <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; padding: 10px; background: #020617; border-radius: 10px; border: 1px solid #1e293b;">
        ${a.map((v, idx) => {
          const isBestWindow = idx >= bestStart && idx < bestStart + n;
          return `
            <div style="padding: 6px 10px; border-radius: 6px; border: 1.5px solid ${isBestWindow ? '#10b981' : '#334155'}; background: ${isBestWindow ? '#064e3b50' : '#1e293b40'}; text-align: center; min-width: 36px;">
              <div style="font-size: 12px; font-weight: 800; color: ${isBestWindow ? '#34d399' : '#f1f5f9'}; font-family: monospace;">${v}</div>
              <div style="font-size: 9px; color: ${isBestWindow ? '#6ee7b7' : '#64748b'}; font-family: monospace;">[${idx}]</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #cbd5e1; text-align: center; line-height: 1.6;">
        💡 <strong>破环成链</strong>：环上任意长度为 $N$ 的切断方案均对应倍长数组中 $[start, start + N - 1]$ 的线性区间 DP，遍历最优起点为 <b>${bestStart}</b>。
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
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>🌳</span> 树形依赖背包 (正在处理节点 u = ${curU}, 课程上限 M = ${m})
        </span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #1e1b4b; color: #a5b4fc; font-weight: 800; border: 1px solid #3730a3;">
          当前最大学分: ${Math.max(...dpRow)}
        </span>
      </div>

      <!-- 节点与当前背包容量分配 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; padding: 10px; background: #020617; border-radius: 10px; border: 1px solid #1e293b;">
        ${nodes.map((n) => `
          <div style="padding: 6px 10px; border-radius: 6px; border: 1.5px solid ${n.id === curU ? '#3b82f6' : '#334155'}; background: ${n.id === curU ? '#1e3a8a50' : '#1e293b40'}; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: ${n.id === curU ? '#60a5fa' : '#f1f5f9'};">课 ${n.id} ${n.id === 0 ? '(根)' : ''}</div>
            <div style="font-size: 9px; color: #94a3b8;">学分: ${n.score}</div>
          </div>
        `).join('')}
      </div>

      <!-- 背包容量分配表 -->
      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 6px;">节点 ${curU} 选修不同门数的最大学分:</div>
        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
          ${dpRow.map((val, cap) => `
            <div style="padding: 4px 8px; border-radius: 6px; background: #0f172a; border: 1px solid #1e293b; font-size: 11px; text-align: center;">
              <span style="color: #94a3b8;">修${cap}门:</span> <b style="color: #38bdf8;">${val}</b>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
