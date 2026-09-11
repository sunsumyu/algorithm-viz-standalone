/**
 * 最长连续序列 (Longest Consecutive Sequence)
 * LeetCode 128 (Medium / 大厂高频哈希与并查集经典)
 * 核心原语:
 *  给定未排序整数数组 nums，找出数字连续的最长序列长度。要求时间复杂度 O(N)。
 *  哈希表优化精髓：
 *   1. 将所有数字加入 HashSet。
 *   2. 遍历集合中的每个数 x，【仅当 x - 1 不存在时】，x 才是某个连续序列的“起点”！
 *   3. 从起点 x 开始不断向后探测 x + 1, x + 2... 并统计长度。
 *   每个数字最多被内层 while 访问一次，保证严格严格 O(N)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface LongestConsecutiveStep extends StepBase {
  nums: number[];
  numSet: number[];
  currentNum: number;
  isStreakStart: boolean;
  currentStreak: number[];
  longestStreak: number[];
  maxLen: number;
  phase: 'init' | 'check-start' | 'expand' | 'update-max' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const LONGEST_CONSECUTIVE_CODES = {
  java: `public class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int longestStreak = 0;
        
        for (int num : set) {
            // 只有当前数字是连续序列的起点时才展开探索
            if (!set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                while (set.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }
        return longestStreak;
    }
}`,
  cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longestStreak = 0;
        for (int num : numSet) {
            if (!numSet.count(num - 1)) {
                int cur = num;
                int streak = 1;
                while (numSet.count(cur + 1)) {
                    cur++;
                    streak++;
                }
                longestStreak = max(longestStreak, streak);
            }
        }
        return longestStreak;
    }
};`,
  python: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        num_set = set(nums)
        longest = 0
        for num in num_set:
            if num - 1 not in num_set:
                cur = num
                streak = 1
                while cur + 1 in num_set:
                    cur += 1
                    streak += 1
                longest = max(longest, streak)
        return longest`,
};

export function buildLongestConsecutiveSteps(
  nums: number[] = [100, 4, 200, 1, 3, 2]
): LongestConsecutiveStep[] {
  const steps: LongestConsecutiveStep[] = [];
  const set = new Set(nums);
  const uniqueNums = Array.from(set).sort((a, b) => a - b);

  let maxLen = 0;
  let bestStreak: number[] = [];

  // Step 0: Init
  steps.push({
    nums: [...nums],
    numSet: [...uniqueNums],
    currentNum: -1,
    isStreakStart: false,
    currentStreak: [],
    longestStreak: [],
    maxLen: 0,
    phase: 'init',
    message: `算法启动：原数组有 ${nums.length} 个数，去重后哈希集合有 ${uniqueNums.length} 个元素。`,
    log: `初始化 HashSet: {${uniqueNums.join(', ')}}`,
    codeLine: 4,
  });

  for (const num of uniqueNums) {
    const isStart = !set.has(num - 1);

    steps.push({
      nums: [...nums],
      numSet: [...uniqueNums],
      currentNum: num,
      isStreakStart: isStart,
      currentStreak: isStart ? [num] : [],
      longestStreak: [...bestStreak],
      maxLen,
      phase: 'check-start',
      message: `考察数字 ${num}：检查 ${num - 1} 是否存在于哈希表。${isStart ? `不存在！确认 ${num} 是连续序列的“起点”！` : `存在 ${num - 1}，说明 ${num} 只是中途点，直接跳过以保 O(N)！`}`,
      log: `判断起点 num=${num}: ${num - 1} 在集合? ${!isStart}`,
      codeLine: 9,
    });

    if (isStart) {
      let cur = num;
      const curStreak = [cur];

      while (set.has(cur + 1)) {
        cur += 1;
        curStreak.push(cur);
        steps.push({
          nums: [...nums],
          numSet: [...uniqueNums],
          currentNum: cur,
          isStreakStart: true,
          currentStreak: [...curStreak],
          longestStreak: [...bestStreak],
          maxLen,
          phase: 'expand',
          message: `连续递增命中：集合中存在 ${cur}！当前连续链条扩展为 [${curStreak.join(' -> ')}] (长度 ${curStreak.length})。`,
          log: `链条延伸: 找到 ${cur}, 当前长度=${curStreak.length}`,
          codeLine: 13,
        });
      }

      if (curStreak.length > maxLen) {
        maxLen = curStreak.length;
        bestStreak = [...curStreak];
        steps.push({
          nums: [...nums],
          numSet: [...uniqueNums],
          currentNum: num,
          isStreakStart: true,
          currentStreak: [...curStreak],
          longestStreak: [...bestStreak],
          maxLen,
          phase: 'update-max',
          message: `刷新最长连续序列！序列 [${bestStreak.join(', ')}]，最大长度更新为 ${maxLen}。`,
          log: `更新最长连续序列: len=${maxLen}`,
          codeLine: 17,
        });
      }
    }
  }

  // Finish
  steps.push({
    nums: [...nums],
    numSet: [...uniqueNums],
    currentNum: -1,
    isStreakStart: false,
    currentStreak: [],
    longestStreak: [...bestStreak],
    maxLen,
    phase: 'finish',
    message: `算法完成：全集合扫描完毕。最长数字连续序列为 [${bestStreak.join(' ➔ ')}]，长度为 ${maxLen}。`,
    log: `算法收敛完成，最大长度=${maxLen}`,
    codeLine: 20,
  });

  return steps;
}

function renderLongestConsecutiveCanvas(step: LongestConsecutiveStep): string {
  const { numSet, currentNum, isStreakStart, currentStreak, longestStreak, maxLen, phase } = step;

  // 渲染所有去重数字徽章
  const badges = numSet
    .map((val) => {
      const isCur = val === currentNum && phase !== 'finish';
      const inCurStreak = currentStreak.includes(val);
      const inBestStreak = longestStreak.includes(val);

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (isCur) {
        bg = 'rgba(245, 158, 11, 0.4)';
        border = '2px solid #f59e0b';
        color = '#fbbf24';
      } else if (inCurStreak) {
        bg = 'rgba(56, 189, 248, 0.3)';
        border = '2px solid #38bdf8';
        color = '#bae6fd';
      } else if (inBestStreak && phase === 'finish') {
        bg = 'rgba(16, 185, 129, 0.3)';
        border = '2px solid #10b981';
        color = '#34d399';
      }

      return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 46px;
        height: 40px;
        background: ${bg};
        border: ${border};
        border-radius: 8px;
        color: ${color};
        font-weight: 700;
        font-size: 14px;
        transition: all 0.2s;
        padding: 0 8px;
      ">
        ${val}
      </div>`;
    })
    .join('');

  // 当前链条可视化
  let streakChain = '<span style="color: #64748b; font-size: 12px;">当前没有连续探索链</span>';
  if (currentStreak.length > 0) {
    streakChain = currentStreak
      .map((n) => `<span style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 4px; padding: 3px 8px; color: #bae6fd; font-weight: 700;">${n}</span>`)
      .join(' <span style="color: #64748b;">➔</span> ');
  }

  // 最佳链条可视化
  let bestChain = '<span style="color: #64748b; font-size: 12px;">暂无记录</span>';
  if (longestStreak.length > 0) {
    bestChain = longestStreak
      .map((n) => `<span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 3px 8px; color: #34d399; font-weight: 700;">${n}</span>`)
      .join(' <span style="color: #64748b;">➔</span> ');
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 哈希集合分布 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">去重数字哈希集合 (HashSet)</div>
          <div style="font-size: 11px; display: flex; gap: 10px;">
            <span style="color: #fbbf24;">● 当前探测</span>
            <span style="color: #38bdf8;">● 链条探索中</span>
            <span style="color: #34d399;">● 最优连续序列</span>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 50px; align-items: center;">
          ${badges}
        </div>
      </div>

      <!-- 中部 序列链推演面板 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">当前考察序列链</div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 36px;">
            ${streakChain}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">历史最长连续链 (Max)</div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 36px;">
            ${bestChain}
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前考察数</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentNum !== -1 ? currentNum : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">是否为序列起点</div>
          <div style="font-size: 16px; font-weight: 700; color: ${isStreakStart ? '#34d399' : '#94a3b8'};">
            ${isStreakStart ? '✓ 起点 (num-1不存在)' : '否 (已包含)'}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前链长度</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">${currentStreak.length}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最长长度</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${maxLen}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'longest-consecutive-sequence',
  name: '最长连续序列',
  category: 'hash-table',
  difficulty: 2,
  learningGoal: 'LeetCode 128: 在未排序数组中以 O(N) 时间找出数字连续的最长序列长度。利用哈希表高效跳过非起点数字，达成真正线性复杂度。',
  codeLanguages: LONGEST_CONSECUTIVE_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [100, 4, 200, 1, 3, 2];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [100, 4, 200, 1, 3, 2];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildLongestConsecutiveSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: LongestConsecutiveStep) => {
    container.innerHTML = renderLongestConsecutiveCanvas(step);
  },
  inputs: [
    {
      id: 'nums',
      label: '整数序列',
      type: 'text',
      defaultValue: '100, 4, 200, 1, 3, 2',
      placeholder: '用逗号分隔的整数序列',
    },
  ],
});
