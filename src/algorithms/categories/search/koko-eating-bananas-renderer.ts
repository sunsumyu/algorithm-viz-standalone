/**
 * 爱吃香蕉的珂珂 (Koko Eating Bananas)
 * LeetCode 875 (Medium / 左程云通关课 Class 056 二分答案法母题)
 * 核心原语:
 *  二分答案法（Binary Search on Answer）。
 *  单调性质：若以速度 k 能在 h 小时内吃完全部香蕉，则任何速度 k' > k 也必定能在 h 小时内吃完。
 *  答案区间：k ∈ [1, max(piles)]。
 *  对每个测试速度 mid，统计总耗时 sum(ceil(pile / mid))，耗时 <= h 则向左收缩搜索更小速度，反之向右提速。
 *  时间复杂度 O(N * log(max(piles)))，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface KokoStep extends StepBase {
  piles: number[];
  h: number;
  left: number;
  right: number;
  mid: number;
  totalHours: number;
  phase: 'init' | 'test-speed' | 'shrink-speed' | 'boost-speed' | 'finish';
  bestSpeed: number | null;
  message: string;
  log: string;
  codeLine: number;
}

export const KOKO_BANANAS_CODES = {
  java: `public class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = 0;
        for (int p : piles) right = Math.max(right, p);
        int ans = right;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (canFinish(piles, h, mid)) {
                ans = mid;        // 达标，尝试更慢速度
                right = mid - 1;
            } else {
                left = mid + 1;   // 超时，必须提速
            }
        }
        return ans;
    }
    private boolean canFinish(int[] piles, int h, int k) {
        long hours = 0;
        for (int p : piles) {
            hours += (p + k - 1) / k; // 上取整
        }
        return hours <= h;
    }
}`,
  cpp: `class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int left = 1, right = *max_element(piles.begin(), piles.end());
        int ans = right;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + mid - 1) / mid;
            if (hours <= h) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }
};`,
  python: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        left, right = 1, max(piles)
        ans = right
        while left <= right:
            mid = left + (right - left) // 2
            hours = sum((p + mid - 1) // mid for p in piles)
            if hours <= h:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans`,
};

export function buildKokoSteps(piles: number[] = [3, 6, 7, 11], h: number = 8): KokoStep[] {
  const steps: KokoStep[] = [];

  let left = 1;
  let right = Math.max(...piles, 1);
  let ans = right;

  // Step 0: Init
  steps.push({
    piles: [...piles],
    h,
    left,
    right,
    mid: Math.floor((left + right) / 2),
    totalHours: 0,
    phase: 'init',
    bestSpeed: null,
    message: `算法启动：香蕉堆 [${piles.join(', ')}]，警察到达时限 h = ${h} 小时。速度二分区间设定为 [1 .. ${right}]。`,
    log: `初始化二分答案区间: [1 .. ${right}], 目标时限 h=${h}`,
    codeLine: 4,
  });

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    let hours = 0;
    for (const p of piles) {
      hours += Math.ceil(p / mid);
    }

    steps.push({
      piles: [...piles],
      h,
      left,
      right,
      mid,
      totalHours: hours,
      phase: 'test-speed',
      bestSpeed: ans,
      message: `检验速度 k = ${mid} 根/小时：吃完全部堆累计耗时 ${hours} 小时（时限 ${h} 小时）。`,
      log: `测试速度 k=${mid}: 耗时 ${hours}h / 限时 ${h}h`,
      codeLine: 9,
    });

    if (hours <= h) {
      ans = mid;
      steps.push({
        piles: [...piles],
        h,
        left,
        right,
        mid,
        totalHours: hours,
        phase: 'shrink-speed',
        bestSpeed: ans,
        message: `耗时 ${hours} <= ${h} 达标！记录可行解 ans = ${mid}，并尝试收缩上限求更慢速度：right = ${mid - 1}。`,
        log: `可行解 ans=${mid}, 收缩右边界 right=${mid - 1}`,
        codeLine: 11,
      });
      right = mid - 1;
    } else {
      steps.push({
        piles: [...piles],
        h,
        left,
        right,
        mid,
        totalHours: hours,
        phase: 'boost-speed',
        bestSpeed: ans,
        message: `耗时 ${hours} > ${h} 超时！说明速度太慢，必须向右提速：left = ${mid + 1}。`,
        log: `超时！提高最低速度 left=${mid + 1}`,
        codeLine: 14,
      });
      left = mid + 1;
    }
  }

  // Finish
  steps.push({
    piles: [...piles],
    h,
    left,
    right,
    mid: ans,
    totalHours: 0,
    phase: 'finish',
    bestSpeed: ans,
    message: `二分判定收敛：珂珂能在 ${h} 小时内吃完所有香蕉的最小吃速为 k = ${ans} 根/小时！`,
    log: `二分收敛：最优最小吃速 k=${ans}`,
    codeLine: 17,
  });

  return steps;
}

function renderKokoCanvas(step: KokoStep): string {
  const { piles, h, left, right, mid, totalHours, phase, bestSpeed } = step;

  const maxPile = Math.max(...piles, 1);

  const pileBars = piles
    .map((p, idx) => {
      const hoursForPile = phase !== 'init' && phase !== 'finish' ? Math.ceil(p / mid) : 0;
      const height = Math.max(26, Math.round((p / maxPile) * 110));

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 56px; margin: 0 6px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px; color: #fbbf24;">
          ${hoursForPile > 0 ? `${hoursForPile}h` : ''}
        </div>
        <div style="
          width: 100%;
          height: ${height}px;
          background: rgba(234, 179, 8, 0.22);
          border: 2px solid #eab308;
          border-radius: 6px 6px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 4px;
          color: #fef08a;
          font-weight: 700;
          font-size: 13px;
        ">
          <div>🍌 ${p}</div>
        </div>
        <div style="
          width: 100%;
          text-align: center;
          background: rgba(15, 23, 42, 0.6);
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          color: #64748b;
          padding: 2px 0;
        ">堆 [${idx}]</div>
      </div>`;
    })
    .join('');

  const isSuccess = totalHours > 0 && totalHours <= h;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">各香蕉堆分布与单堆消化时间（限时 ${h} 小时）</div>
          <div style="font-size: 11px; color: ${isSuccess ? '#34d399' : '#f87171'}; font-weight: 700;">
            ${totalHours > 0 ? `当前总耗时: ${totalHours}h (${isSuccess ? '✓ 达标' : '✗ 超时'})` : ''}
          </div>
        </div>
        <div style="display: flex; align-items: flex-end; justify-content: center; min-height: 160px; padding-bottom: 8px;">
          ${pileBars}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最低吃速 Left</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${left}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前探测吃速 Mid</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${mid} 根/h</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最高吃速 Right</div>
          <div style="font-size: 16px; font-weight: 700; color: #a78bfa;">${right}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前记录最小解 Ans</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">
            ${bestSpeed !== null ? `${bestSpeed} 根/h` : '探索中...'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'koko-eating-bananas',
  name: '爱吃香蕉的珂珂',
  category: 'search',
  difficulty: 2,
  learningGoal: 'LeetCode 875: 二分答案法母题。利用耗时关于速度的单调不增性质，在 O(N log(max)) 时间内求解最小可行吃速。',
  codeLanguages: KOKO_BANANAS_CODES,
  generateSteps: (inputs) => {
    const rawPiles = inputs?.piles as string | number[] | undefined;
    const rawH = Number(inputs?.h ?? 8);
    let piles = [3, 6, 7, 11];
    if (typeof rawPiles === 'string') {
      try {
        piles = rawPiles.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        piles = [3, 6, 7, 11];
      }
    } else if (Array.isArray(rawPiles) && rawPiles.length > 0) {
      piles = rawPiles.map(Number);
    }
    return buildKokoSteps(piles, isNaN(rawH) ? 8 : rawH);
  },
  renderCanvas: (container: HTMLElement, step: KokoStep) => {
    container.innerHTML = renderKokoCanvas(step);
  },
  inputs: [
    {
      id: 'piles',
      label: '香蕉堆数组',
      type: 'text',
      defaultValue: '3, 6, 7, 11',
      placeholder: '用逗号分隔的每堆香蕉数',
    },
    {
      id: 'h',
      label: '允许最大耗时 (小时)',
      type: 'number',
      defaultValue: 8,
      placeholder: '最大小时数',
    },
  ],
});
