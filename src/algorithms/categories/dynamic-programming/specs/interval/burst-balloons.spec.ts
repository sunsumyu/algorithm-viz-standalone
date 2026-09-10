import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const BurstBalloonsSpec: AlgorithmSpec = {
  id: 'burst-balloons',
  name: '戳气球 (Burst Balloons)',
  category: '区间 DP',
  description: '经典区间动态规划。戳破第 i 个气球可获得 coins[left] * coins[i] * coins[right] 分数，求戳破所有气球能获得的最大硬币数量。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 312,
    leetcodeUrl: 'https://leetcode.cn/problems/burst-balloons/',
    difficulty: 'hard',
    tags: ['动态规划', '区间 DP', '分治'],
    description: '有 <code>n</code> 个气球，编号为 <code>0</code> 到 <code>n - 1</code>，每个气球上都标有一个数字，这些数字存在数组 <code>nums</code> 中。<br/><br/>现在要求你戳破所有的气球。戳破第 <code>i</code> 个气球，你可以获得 <code>nums[i - 1] * nums[i] * nums[i + 1]</code> 枚硬币。这里的 <code>i - 1</code> 和 <code>i + 1</code> 代表和 <code>i</code> 相邻的两个气球的序号。如果 <code>i - 1</code> 或 <code>i + 1</code> 超出了数组的边界，那么就当它是一个数字为 <code>1</code> 的气球。<br/><br/>求所能获得硬币的最大数量。',
    examples: [
      {
        input: 'nums = [3, 1, 5, 8]',
        output: '167',
        explanation: 'nums = [3,1,5,8] --> [3,5,8] --> [3,8] --> [8] --> []<br/>coins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15 + 120 + 24 + 8 = 167',
      },
      {
        input: 'nums = [1, 5]',
        output: '10',
        explanation: '1*5*1 + 1*1*1 = 5 + 5 = 10',
      },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 300 (演示推荐 <= 6)',
      '0 <= nums[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6, 7], cpp: [6, 7, 8], python: [5, 6, 7], javascript: [4, 5, 6] },
    loopCheck: { java: 9, cpp: 10, python: 9, javascript: 8 },
    innerLoopCheck: { java: 10, cpp: 11, python: 10, javascript: 9 },
    stateTransfer: { java: [12, 13], cpp: [13, 14], python: [12, 13], javascript: [11, 12] },
    loopExit: { java: 9, cpp: 10, python: 9, javascript: 8 },
    returnResult: { java: 17, cpp: 18, python: 15, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function maxCoins(nums) {',
        '    const n = nums.length;',
        '    const val = [1, ...nums, 1]; // 首尾添加虚拟边界 1',
        '    const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));',
        '    // 逆向思考：len 为开区间 (i, j) 长度，从 2 到 n + 1',
        '    for (let len = 2; len <= n + 1; len++) {',
        '        for (let i = 0; i <= n + 1 - len; i++) {',
        '            const j = i + len;',
        '            // 枚举 (i, j) 开区间中最后一个被戳破的气球 k',
        '            for (let k = i + 1; k < j; k++) {',
        '                const gain = val[i] * val[k] * val[j];',
        '                dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k][j] + gain);',
        '            }',
        '        }',
        '    }',
        '    return dp[0][n + 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxCoins(int[] nums) {',
        '        int n = nums.length;',
        '        int[] val = new int[n + 2];',
        '        val[0] = val[n + 1] = 1;',
        '        System.arraycopy(nums, 0, val, 1, n);',
        '        int[][] dp = new int[n + 2][n + 2];',
        '        for (let len = 2; len <= n + 1; len++) {',
        '            for (int i = 0; i <= n + 1 - len; i++) {',
        '                int j = i + len;',
        '                for (int k = i + 1; k < j; k++) {',
        '                    int gain = val[i] * val[k] * val[j];',
        '                    dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k][j] + gain);',
        '                }',
        '            }',
        '        }',
        '        return dp[0][n + 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxCoins(vector<int>& nums) {',
        '        int n = nums.size();',
        '        vector<int> val(n + 2, 1);',
        '        for (int i = 0; i < n; i++) val[i + 1] = nums[i];',
        '        vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));',
        '        for (int len = 2; len <= n + 1; len++) {',
        '            for (int i = 0; i <= n + 1 - len; i++) {',
        '                int j = i + len;',
        '                for (int k = i + 1; k < j; k++) {',
        '                    int gain = val[i] * val[k] * val[j];',
        '                    dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j] + gain);',
        '                }',
        '            }',
        '        }',
        '        return dp[0][n + 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxCoins(self, nums: List[int]) -> int:',
        '        val = [1] + nums + [1]',
        '        n = len(nums)',
        '        dp = [[0] * (n + 2) for _ in range(n + 2)]',
        '        for length in range(2, n + 2):',
        '            for i in range(n + 2 - length):',
        '                j = i + length',
        '                dp[i][j] = max(',
        '                    dp[i][k] + dp[k][j] + val[i] * val[k] * val[j]',
        '                    for k in range(i + 1, j)',
        '                )',
        '        return dp[0][n + 1]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：计算戳破气球可获得的最大金币数。',
        4: '创建扩容数组 val，长度为 $n+2$。',
        5: '首尾哨兵设为 1，解决气球戳破出界的边界计算。',
        6: '将原数组 nums 拷贝到 val 的下标 $[1..n]$。',
        7: '创建 DP 状态表，开区间 $(i, j)$ 内气球全部戳破的最大得分。',
        8: '🌟 <strong>区间 DP 核心</strong>：按开区间跨度 $len = j - i$ 递增。',
        9: '枚举开区间左边界 $i$。',
        10: '确定右边界 $j = i + len$。',
        11: '💡 <strong>逆向思维</strong>：枚举在 $(i, j)$ 内【最后一个】被戳破的气球 $k$。',
        12: '因为 $k$ 是最后一个戳破的，其左右相邻存留气球必然是开区间两端 $val[i]$ 和 $val[j]$！',
        13: '状态转移方程：$dp[i][j] = \\max(dp[i][j], dp[i][k] + dp[k][j] + val[i] \\times val[k] \\times val[j])$。',
        17: '返回 $dp[0][n+1]$，即开区间 $(0, n+1)$ 即所有原始气球的最优总得分。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：计算戳破所有气球能得到的最大得分。',
        3: '左右添加虚拟气球 1，构造扩展数组 val。',
        4: '初始化 $(n+2) \\times (n+2)$ 的 DP 数组。',
        6: '外层按开区间跨度 $len$ 递增推进。',
        10: '枚举最后戳破的气球位置 $k$。',
        11: '得分贡献 $gain = val[i] \\times val[k] \\times val[j]$。',
        12: '合并子区间最优解并更新 $dp[i][j]$。',
        16: '返回全局最优值 $dp[0][n+1]$。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        5: '构造填充 1 的扩展数组 val。',
        7: '二维 dp 表初始化。',
        8: '区间长度推进。',
        11: '枚举最后被戳破的气球 $k$。',
        13: '取最大化得分并填表。',
        18: '返回 $dp[0][n+1]$。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        3: '构造含首尾 1 哨兵的新列表 val。',
        5: '初始化二维 dp 表。',
        6: '遍历开区间长度。',
        9: '推导所有可能最后戳破的气球 k 并取最大值。',
        13: '返回 dp[0][n+1]。',
      },
    },
    keyPoints: {
      thinking: '直接正向枚举第一个戳破的气球会导致左右两边产生动态关联，破坏子问题独立性。反向思考：枚举开区间 (i, j) 中【最后一个】被戳破的气球 k，此时 k 的左右边界必然是 i 和 j，左右子问题彻底独立！',
      state: 'dp[i][j] 表示戳破开区间 (i, j) 内所有气球所能获得的最大硬币数量（不包括 i 和 j 本身）。',
      equation: 'dp[i][j] = \\max_{i < k < j} (dp[i][k] + dp[k][j] + val[i] \\times val[k] \\times val[j])',
      initAndBounds: '区间跨度 len = 2...n+1。当 len=1 时开区间内没有气球，dp[i][i+1] = 0。',
      complexity: '时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。',
    },
    faqList: [
      {
        tag: '逆向思维',
        question: '为什么正向考虑第一个戳破的气球不可行？',
        answer: '如果正向戳破 k，k 消失后其左边和右边的气球会在后续操作中相邻，导致左边子问题和右边子问题的计算相互依赖，违背了最优子结构性质。而逆向假设 k 是最后一个戳破的，则左边 (i, k) 和右边 (k, j) 的气球都在 k 之前被戳破，左右互不影响。',
      },
      {
        tag: '开区间设计',
        question: '为什么采用开区间 (i, j) 而非闭区间 [i, j]？',
        answer: '因为首尾哨兵 1 是永远不被戳破的支撑点，开区间 (0, n+1) 恰好对应戳破下标 1 到 n 的全部真实气球。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[] }): DpTraceStep[] => {
    const rawNums = input?.nums && input.nums.length > 0 ? input.nums : [3, 1, 5, 8];
    const nums = rawNums.slice(0, 6);
    const n = nums.length;
    const val = [1, ...nums, 1];
    const totalLen = n + 2;
    const steps: DpTraceStep[] = [];

    const dp: Array<Array<{ value: number; state: string }>> = Array.from({ length: totalLen }, () =>
      Array.from({ length: totalLen }, () => ({
        value: 0,
        state: 'empty',
      }))
    );

    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        message: `初始化气球序列: [${nums.join(', ')}]，扩展首尾哨兵后: [${val.join(', ')}]`,
        log: '初始化二维 DP 状态表，开区间跨度 len=1 时得分为 0',
        vars: [
          { name: 'n', value: String(n) },
          { name: 'val', value: `[${val.join(', ')}]` },
        ],
        metrics: { maxCoins: 0 },
      })
    );

    for (let len = 2; len <= n + 1; len++) {
      for (let i = 0; i <= totalLen - 1 - len; i++) {
        const j = i + len;
        let maxCoin = 0;
        let bestK = i + 1;

        dp[i][j].state = 'current';

        for (let k = i + 1; k < j; k++) {
          const gain = val[i] * val[k] * val[j];
          const total = Number(dp[i][k].value) + Number(dp[k][j].value) + gain;
          if (total > maxCoin) {
            maxCoin = total;
            bestK = k;
          }
        }

        dp[i][j].value = maxCoin;
        dp[i][j].state = 'computed';

        const lastBurstGain = val[i] * val[bestK] * val[j];
        steps.push(
          makeTraceStep({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [
              { row: i, col: bestK },
              { row: bestK, col: j },
            ],
            message: `计算开区间 (${i}, ${j}): 最佳最后戳破气球为 k=${bestK}(值=${val[bestK]})，左区(${i},${bestK})=${dp[i][bestK].value} + 右区(${bestK},${j})=${dp[bestK][j].value} + 碰撞得分(${val[i]}*${val[bestK]}*${val[j]}=${lastBurstGain}) = ${maxCoin}`,
            log: `dp[${i}][${j}] = dp[${i}][${bestK}](${dp[i][bestK].value}) + dp[${bestK}][${j}](${dp[bestK][j].value}) + ${lastBurstGain} = ${maxCoin}`,
            formula: 'dp[i][j] = max(dp[i][k] + dp[k][j] + val[i]*val[k]*val[j])',
            formulaSubstituted: `dp[${i}][${j}] = ${dp[i][bestK].value} + ${dp[bestK][j].value} + ${lastBurstGain} = ${maxCoin}`,
            vars: [
              { name: 'len', value: String(len) },
              { name: 'i', value: String(i) },
              { name: 'j', value: String(j) },
              { name: 'bestK', value: String(bestK) },
              { name: 'maxCoin', value: String(maxCoin) },
            ],
            metrics: { maxCoins: maxCoin },
          })
        );
      }
    }

    const answer = Number(dp[0][n + 1].value);
    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        current: { row: 0, col: n + 1 },
        message: `🎉 戳气球完成！戳破全部气球获得的最大硬币数为 ${answer}`,
        log: `最终结果 dp[0][${n + 1}] = ${answer}`,
        vars: [
          { name: '最终最大金币数', value: String(answer) },
        ],
        metrics: { maxCoins: answer },
      })
    );

    return steps;
  },
};
