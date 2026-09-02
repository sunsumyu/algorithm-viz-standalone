import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 火柴拼正方形 (Matchsticks to Square)
 * LeetCode 473 / 左程云算法通关课 第080讲 状压DP上 Code02
 * 状压DP：用位掩码记录哪些火柴已使用，尝试将所有火柴恰好填入 4 条等长的边。
 */
export const MatchsticksToSquareSpec: AlgorithmSpec = {
  id: 'matchsticks-to-square',
  name: '火柴拼正方形 (Matchsticks to Square)',
  category: '状压 DP',
  description:
    '给一组火柴长度，判断能否恰好拼成一个正方形。用位掩码枚举子集和 ≡ 边长的倍数，逐边匹配。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 473,
    leetcodeUrl: 'https://leetcode.cn/problems/matchsticks-to-square/',
    difficulty: 'medium',
    tags: ['位运算', '状压DP', '回溯', '动态规划'],
    description:
      '给定 <code>matchsticks</code> 数组，每个元素是一根火柴的长度。判断能否恰好拼成一个正方形。<br/><br/><strong>核心思路：</strong>总长度必须是 4 的倍数，令 side = 总长/4。用位掩码 <code>status</code> 表示哪些火柴已被使用。枚举每根未使用的火柴加入当前边，若当前边累加和恰好等于 <code>side</code> 则开始拼下一条边。',
    examples: [
      {
        input: 'matchsticks = [1,1,2,2,2]',
        output: 'true',
        explanation: '可以拼成边长为 2 的正方形。',
      },
      {
        input: 'matchsticks = [3,3,3,3,4]',
        output: 'false',
        explanation: '总长度 16，边长需 4，但无法恰好分成 4 组长度为 4 的子集。',
      },
    ],
    constraints: [
      '1 <= matchsticks.length <= 15',
      '1 <= matchsticks[i] <= 10^8',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 5, cpp: 6, python: 4, javascript: 3 },
    init: { java: 8, cpp: 9, python: 7, javascript: 6 },
    stateTransfer: {
      java: [13, 14, 15, 16, 17],
      cpp: [14, 15, 16, 17, 18],
      python: [10, 11, 12, 13, 14],
      javascript: [9, 10, 11, 12, 13],
    },
    returnResult: { java: 22, cpp: 23, python: 18, javascript: 17 },
  },
  code: {
    languages: {
      javascript: [
        'function makesquare(matchsticks) {',
        '    const sum = matchsticks.reduce((a, b) => a + b, 0);',
        '    if (sum % 4 !== 0) return false;',
        '    const side = sum / 4;',
        '    matchsticks.sort((a, b) => b - a); // 大的先放，剪枝',
        '    const sides = [0, 0, 0, 0];',
        '    return dfs(matchsticks, sides, 0, side);',
        '}',
        'function dfs(m, sides, idx, side) {',
        '    if (idx === m.length) {',
        '        return sides[0] === side && sides[1] === side',
        '               && sides[2] === side;',
        '    }',
        '    for (let i = 0; i < 4; i++) {',
        '        if (sides[i] + m[idx] > side) continue;',
        '        // 剪枝：跳过相同长度的边',
        '        if (i > 0 && sides[i] === sides[i - 1]) continue;',
        '        sides[i] += m[idx];',
        '        if (dfs(m, sides, idx + 1, side)) return true;',
        '        sides[i] -= m[idx];',
        '    }',
        '    return false;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean makesquare(int[] matchsticks) {',
        '        int sum = 0;',
        '        for (int m : matchsticks) sum += m;',
        '        if (sum % 4 != 0) return false;',
        '        int side = sum / 4;',
        '        Arrays.sort(matchsticks);',
        '        // 倒序让大的先放，加速剪枝',
        '        for (int l = 0, r = matchsticks.length - 1; l < r; l++, r--) {',
        '            int t = matchsticks[l]; matchsticks[l] = matchsticks[r]; matchsticks[r] = t;',
        '        }',
        '        return dfs(matchsticks, new int[4], 0, side);',
        '    }',
        '    boolean dfs(int[] m, int[] sides, int idx, int side) {',
        '        if (idx == m.length) return sides[0] == side && sides[1] == side && sides[2] == side;',
        '        for (int i = 0; i < 4; i++) {',
        '            if (sides[i] + m[idx] > side) continue;',
        '            if (i > 0 && sides[i] == sides[i - 1]) continue;',
        '            sides[i] += m[idx];',
        '            if (dfs(m, sides, idx + 1, side)) return true;',
        '            sides[i] -= m[idx];',
        '        }',
        '        return false;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool makesquare(vector<int>& matchsticks) {',
        '        int sum = accumulate(matchsticks.begin(), matchsticks.end(), 0);',
        '        if (sum % 4 != 0) return false;',
        '        int side = sum / 4;',
        '        sort(matchsticks.rbegin(), matchsticks.rend());',
        '        vector<int> sides(4, 0);',
        '        return dfs(matchsticks, sides, 0, side);',
        '    }',
        '    bool dfs(vector<int>& m, vector<int>& sides, int idx, int side) {',
        '        if (idx == (int)m.size()) return sides[0] == side && sides[1] == side && sides[2] == side;',
        '        for (int i = 0; i < 4; i++) {',
        '            if (sides[i] + m[idx] > side) continue;',
        '            if (i > 0 && sides[i] == sides[i-1]) continue;',
        '            sides[i] += m[idx];',
        '            if (dfs(m, sides, idx + 1, side)) return true;',
        '            sides[i] -= m[idx];',
        '        }',
        '        return false;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def makesquare(self, matchsticks: List[int]) -> bool:',
        '        total = sum(matchsticks)',
        '        if total % 4 != 0: return False',
        '        side = total // 4',
        '        matchsticks.sort(reverse=True)',
        '        sides = [0] * 4',
        '        def dfs(idx):',
        '            if idx == len(matchsticks):',
        '                return sides[0] == sides[1] == sides[2] == side',
        '            for i in range(4):',
        '                if sides[i] + matchsticks[idx] > side: continue',
        '                if i > 0 and sides[i] == sides[i-1]: continue',
        '                sides[i] += matchsticks[idx]',
        '                if dfs(idx + 1): return True',
        '                sides[i] -= matchsticks[idx]',
        '            return False',
        '        return dfs(0)',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>函数入口</strong>。',
        5: '总长度不是 4 的倍数，直接 false。',
        12: '递归回溯：将每根火柴尝试放入 4 条边之一。',
        17: '💡 <strong>剪枝</strong>：两条边当前长度相同时跳过，避免重复搜索。',
        19: '放入后递归尝试下一根，失败则回溯。',
      },
      javascript: {
        1: '🎯 <strong>函数入口</strong>。',
        3: '总长度不是 4 的倍数，直接 false。',
        5: '降序排列加速剪枝。',
        15: '💡 <strong>核心</strong>：累加不超过 side 且跳过重复边。',
        19: '递归成功返回 true，否则回溯。',
      },
      cpp: {
        3: '主函数。',
        7: '降序排列。',
        15: '剪枝跳过。',
      },
      python: {
        2: '主函数。',
        6: '降序排列加速。',
        13: '剪枝跳过相同长度的边。',
      },
    },
    keyPoints: {
      thinking:
        '火柴拼正方形 = 将数组划分为 4 个等和子集。先排序再回溯，大的先放能尽早剪枝。状压DP 的思路是用二进制位记录哪些火柴已被使用。',
      state: 'sides[0..3] 记录 4 条边当前累积长度，idx 表示正在放置第几根火柴。',
      equation: '对每根火柴 m[idx]，尝试放入 sides[0..3] 中任一条不超过 side 的边。',
      initAndBounds: 'sides 全零开始，side = totalSum / 4，idx 从 0 到 n-1。',
    },
  },

  generateSteps: (input: { matchsticks?: number[] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const matchsticks = input?.matchsticks || [1, 1, 2, 2, 2];
    const sum = matchsticks.reduce((a, b) => a + b, 0);
    const side = sum / 4;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `火柴: [${matchsticks.join(',')}]，总长=${sum}，边长=${side}`,
      highlights: [],
    }));

    if (sum % 4 !== 0) {
      steps.push(makeTraceStep({
        phase: 'result',
        description: `总长 ${sum} 不是 4 的倍数 → false`,
        highlights: [],
        result: false,
      }));
      return steps;
    }

    matchsticks.sort((a, b) => b - a);
    steps.push(makeTraceStep({
      phase: 'init',
      description: `降序排列: [${matchsticks.join(',')}]，开始回溯搜索`,
      highlights: [],
    }));

    const sides = [0, 0, 0, 0];
    let stepCount = 0;
    const maxSteps = 25;

    function dfs(idx: number): boolean {
      if (stepCount >= maxSteps) return false;
      if (idx === matchsticks.length) {
        const ok = sides[0] === side && sides[1] === side && sides[2] === side;
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `所有火柴已放完，四边=[${sides.join(',')}] → ${ok ? '✓' : '✗'}`,
          highlights: [],
        }));
        stepCount++;
        return ok;
      }
      for (let i = 0; i < 4; i++) {
        if (sides[i] + matchsticks[idx] > side) continue;
        if (i > 0 && sides[i] === sides[i - 1]) continue;
        if (stepCount >= maxSteps) break;
        sides[i] += matchsticks[idx];
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `火柴${matchsticks[idx]} → 边${i}，四边=[${sides.join(',')}]`,
          highlights: [],
        }));
        stepCount++;
        if (dfs(idx + 1)) return true;
        sides[i] -= matchsticks[idx];
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `回溯：火柴${matchsticks[idx]} 从边${i}取出，四边=[${sides.join(',')}]`,
          highlights: [],
        }));
        stepCount++;
      }
      return false;
    }

    const result = dfs(0);
    steps.push(makeTraceStep({
      phase: 'result',
      description: `最终结果：${result ? '能拼成正方形 ✓ → true' : '不能拼成正方形 ✗ → false'}`,
      highlights: [],
      result,
    }));
    return steps;
  },
};
