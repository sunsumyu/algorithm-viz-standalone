/**
 * 和为 K 的子数组 (Subarray Sum Equals K)
 * LeetCode 560 (Medium / 大厂高频前缀和与哈希表母题)
 * 核心原语:
 *  给你一个整数数组 nums 和一个整数 k，请你统计并返回该数组中和为 k 的子数组的个数。
 *  前缀和 + 哈希表神级技巧：
 *   连续子数组 sum(nums[i..j]) = prefixSum[j] - prefixSum[i - 1] = k
 *   移项可得：prefixSum[i - 1] = prefixSum[j] - k。
 *   在从左向右遍历过程中，累加当前前缀和 curSum，查找哈希表中【历史前缀和等于 curSum - k】出现过的频次！
 *   初始条件：prefixMap.put(0, 1) 代表空前缀。
 *  时间复杂度 O(N)，空间复杂度 O(N)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface SubarraySumStep extends StepBase {
  nums: number[];
  k: number;
  currentIdx: number;
  currentPrefixSum: number;
  targetPrefix: number;
  matchedCount: number;
  totalCount: number;
  prefixMap: Record<number, number>;
  phase: 'init' | 'compute-sum' | 'match-found' | 'update-map' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const SUBARRAY_SUM_CODES = {
  java: `public class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1); // 基础空前缀
        int count = 0, pre = 0;
        
        for (int x : nums) {
            pre += x;
            // 寻找历史前缀和使得 pre - target = k => target = pre - k
            if (map.containsKey(pre - k)) {
                count += map.get(pre - k);
            }
            map.put(pre, map.getOrDefault(pre, 0) + 1);
        }
        return count;
    }
}`,
  cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> mp;
        mp[0] = 1;
        int count = 0, pre = 0;
        for (int x : nums) {
            pre += x;
            if (mp.count(pre - k)) {
                count += mp[pre - k];
            }
            mp[pre]++;
        }
        return count;
    }
};`,
  python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        mp = {0: 1}
        count = 0
        pre = 0
        for x in nums:
            pre += x
            if pre - k in mp:
                count += mp[pre - k]
            mp[pre] = mp.get(pre, 0) + 1
        return count`,
};

export function buildSubarraySumSteps(nums: number[] = [1, 2, 3, -2, 1, 4], k: number = 3): SubarraySumStep[] {
  const steps: SubarraySumStep[] = [];
  const map: Record<number, number> = { 0: 1 };
  let count = 0;
  let pre = 0;

  // Step 0: Init
  steps.push({
    nums: [...nums],
    k,
    currentIdx: -1,
    currentPrefixSum: 0,
    targetPrefix: 0 - k,
    matchedCount: 0,
    totalCount: 0,
    prefixMap: { ...map },
    phase: 'init',
    message: `算法启动：寻找和为 k = ${k} 的子数组。初始化前缀和哈希表 map.put(0, 1) 代表空前缀。`,
    log: `初始化前缀和 map: { 0: 1 }, 目标 k=${k}`,
    codeLine: 4,
  });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    pre += x;
    const target = pre - k;
    const match = map[target] || 0;

    steps.push({
      nums: [...nums],
      k,
      currentIdx: i,
      currentPrefixSum: pre,
      targetPrefix: target,
      matchedCount: match,
      totalCount: count,
      prefixMap: { ...map },
      phase: 'compute-sum',
      message: `处理 nums[${i}] = ${x}：累计当前前缀和 pre = ${pre}。需寻找的历史前缀为 target = pre - k = ${pre} - ${k} = ${target}。`,
      log: `前缀和 pre=${pre}, 检索 target=${target}`,
      codeLine: 9,
    });

    if (match > 0) {
      count += match;
      steps.push({
        nums: [...nums],
        k,
        currentIdx: i,
        currentPrefixSum: pre,
        targetPrefix: target,
        matchedCount: match,
        totalCount: count,
        prefixMap: { ...map },
        phase: 'match-found',
        message: `🎯 命中子数组！哈希表中存在 ${match} 个前缀和为 ${target} 的切分点！累加计数 count += ${match} -> ${count}。`,
        log: `命中前缀和 ${target} (${match}次), 累加后 count=${count}`,
        codeLine: 12,
      });
    }

    map[pre] = (map[pre] || 0) + 1;
    steps.push({
      nums: [...nums],
      k,
      currentIdx: i,
      currentPrefixSum: pre,
      targetPrefix: target,
      matchedCount: match,
      totalCount: count,
      prefixMap: { ...map },
      phase: 'update-map',
      message: `记录前缀和：将当前 pre = ${pre} 写入哈希表，该前缀和出现频次更新为 ${map[pre]}。`,
      log: `更新 map[${pre}] = ${map[pre]}`,
      codeLine: 14,
    });
  }

  // Finish
  steps.push({
    nums: [...nums],
    k,
    currentIdx: nums.length,
    currentPrefixSum: pre,
    targetPrefix: pre - k,
    matchedCount: 0,
    totalCount: count,
    prefixMap: { ...map },
    phase: 'finish',
    message: `全数组扫描完毕！数组中累计和为 k = ${k} 的连续子数组总数为 ${count} 个。`,
    log: `算法执行完毕，返回 count=${count}`,
    codeLine: 16,
  });

  return steps;
}

function renderSubarraySumCanvas(step: SubarraySumStep): string {
  const { nums, k, currentIdx, currentPrefixSum, targetPrefix, matchedCount, totalCount, prefixMap, phase } = step;

  // 数组元素渲染
  const elements = nums
    .map((val, idx) => {
      const isCur = idx === currentIdx && phase !== 'finish';
      const isProcessed = idx <= currentIdx;

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.35)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (isProcessed) {
        bg = 'rgba(56, 189, 248, 0.15)';
        border = '1px solid rgba(56, 189, 248, 0.4)';
        color = '#bae6fd';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 16px;
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  // 哈希表渲染
  const mapBadges = Object.entries(prefixMap)
    .map(([sumVal, cnt]) => {
      const isTarget = Number(sumVal) === targetPrefix && matchedCount > 0;
      let bg = 'rgba(255, 255, 255, 0.04)';
      let border = '1px solid rgba(255, 255, 255, 0.08)';
      let color = '#94a3b8';

      if (isTarget) {
        bg = 'rgba(16, 185, 129, 0.3)';
        border = '2px solid #10b981';
        color = '#34d399';
      }

      return `
      <div style="display: flex; justify-content: space-between; padding: 4px 10px; background: ${bg}; border: ${border}; border-radius: 6px; font-size: 12px;">
        <span style="color: ${color}; font-weight: 600;">前缀和 ${sumVal}</span>
        <span style="color: #fbbf24; font-weight: 700;">${cnt} 次</span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px;">
        <!-- 左侧 元素序列 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">扫描数组与累计前缀</div>
            <div style="font-size: 11px; color: #fbbf24;">当前累计 pre = ${currentPrefixSum}</div>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; min-height: 65px;">
            ${elements}
          </div>
        </div>

        <!-- 右侧 前缀和频次哈希表 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            前缀和频次哈希表 map[pre]
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
            ${mapBadges}
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标子数组和 k</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${k}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">需检索历史前缀 target</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${targetPrefix}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">本轮命中子数组数</div>
          <div style="font-size: 16px; font-weight: 700; color: ${matchedCount > 0 ? '#34d399' : '#94a3b8'};">
            +${matchedCount}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">累积合格子数组总数</div>
          <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${totalCount}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'subarray-sum-equals-k',
  name: '和为 K 的子数组',
  category: 'hash-table',
  difficulty: 2,
  learningGoal: 'LeetCode 560: 统计连续子数组和等于 k 的个数。利用前缀和移项与哈希表频次统计，将 O(N^2) 暴力枚举优化为 O(N) 线性推演。',
  codeLanguages: SUBARRAY_SUM_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    const rawK = Number(inputs?.k ?? 3);
    let arr = [1, 2, 3, -2, 1, 4];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 3, -2, 1, 4];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildSubarraySumSteps(arr, isNaN(rawK) ? 3 : rawK);
  },
  renderCanvas: (container: HTMLElement, step: SubarraySumStep) => {
    container.innerHTML = renderSubarraySumCanvas(step);
  },
  inputs: [
    {
      id: 'nums',
      label: '输入整数数组',
      type: 'text',
      defaultValue: '1, 2, 3, -2, 1, 4',
      placeholder: '逗号分隔整数',
    },
    {
      id: 'k',
      label: '目标和 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '目标和',
    },
  ],
});
