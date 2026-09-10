import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 俄罗斯套娃信封问题 (Russian Doll Envelopes)
 * LeetCode 354 / 左程云算法通关课 第072讲 LIS 最长递增子序列扩展
 * 2D 排序 + 二分 LIS：宽度升序、同宽高度降序，在高度序列上做 $O(N \log N)$ 的最长递增子序列。
 */
export const RussianDollEnvelopesSpec: AlgorithmSpec = {
  id: 'russian-doll-envelopes',
  name: '俄罗斯套娃信封问题 (Russian Doll Envelopes)',
  category: '子数组与 LIS 扩展 DP',
  description:
    '给定二维整数数组 envelopes，envelopes[i] = [wi, hi] 分别表示第 i 个信封的宽度和高度。当一个信封的宽和高都严格大于另一个信封时，才能将其套入。求最多能有多少个信封组成一组“俄罗斯套娃”嵌套。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 354,
    leetcodeUrl: 'https://leetcode.cn/problems/russian-doll-envelopes/',
    difficulty: 'hard',
    tags: ['数组', '二分查找', '动态规划', '排序', '最长递增子序列'],
    description:
      '给你一个二维整数数组 <code>envelopes</code> ，其中 <code>envelopes[i] = [wi, hi]</code> 表示第 <code>i</code> 个信封的宽度和高度。<br/><br/>当另一个信封的宽度和高度都<strong>严格大于</strong>当前信封时，这个信封就可以放入另一个信封里，如同俄罗斯套娃一样。<br/><br/>请计算最多能有多少个信封能组成一组“俄罗斯套娃”信封（即可以把一个信封嵌套在另一个信封里面）。<br/><br/>注意：不允许旋转信封。<br/><br/><strong>排序 + 一维二分 LIS 降维法：</strong><br/>1. <strong>排序策略：</strong>宽度 <code>w</code> 升序；若 <code>w</code> 相同，高度 <code>h</code> <strong>降序</strong>。<br/>2. <strong>为何降序：</strong>当宽度相同时，因为高度是降序排列的，在后续对高度求严格单调递增子序列（LIS）时，相同宽度的信封至多只能被选取 1 个，完美避免了“同宽信封互相嵌套”的非法情况！<br/>3. 在排序后的高度序列上，运行 Patience Sorting / 二分查找 $O(N \\log N)$ 的 LIS 算法。',
    examples: [
      {
        input: 'envelopes = [[5,4],[6,4],[6,7],[2,3]]',
        output: '3',
        explanation: '最多可嵌套 3 个信封：[2,3] => [5,4] => [6,7]。',
      },
      {
        input: 'envelopes = [[1,1],[1,1],[1,1]]',
        output: '1',
        explanation: '所有信封尺寸相同，无法相互嵌套，最多 1 个。',
      },
    ],
    constraints: [
      '1 <= envelopes.length <= 10^5',
      'envelopes[i].length == 2',
      '1 <= wi, hi <= 10^5',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 4, cpp: 5, python: 4, javascript: 3 },
    loopCheck: { java: 7, cpp: 9, python: 8, javascript: 5 },
    stateTransfer: {
      java: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      cpp: [10, 11, 12, 13, 14],
      python: [9, 10, 11, 12, 13],
      javascript: [6, 7, 8, 9, 10, 11, 12, 13],
    },
    loopExit: { java: 17, cpp: 14, python: 13, javascript: 14 },
    returnResult: { java: 18, cpp: 15, python: 14, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function maxEnvelopes(envelopes) {',
        '  if (!envelopes || envelopes.length === 0) return 0;',
        '  envelopes.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]);',
        '  const tails = [];',
        '  for (const [, h] of envelopes) {',
        '    let left = 0, right = tails.length;',
        '    while (left < right) {',
        '      const mid = (left + right) >> 1;',
        '      if (tails[mid] >= h) right = mid;',
        '      else left = mid + 1;',
        '    }',
        '    if (left === tails.length) tails.push(h);',
        '    else tails[left] = h;',
        '  }',
        '  return tails.length;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxEnvelopes(int[][] envelopes) {',
        '        if (envelopes == null || envelopes.length == 0) return 0;',
        '        Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);',
        '        int[] tails = new int[envelopes.length];',
        '        int len = 0;',
        '        for (int[] env : envelopes) {',
        '            int h = env[1];',
        '            int left = 0, right = len;',
        '            while (left < right) {',
        '                int mid = (left + right) >>> 1;',
        '                if (tails[mid] >= h) right = mid;',
        '                else left = mid + 1;',
        '            }',
        '            tails[left] = h;',
        '            if (left == len) len++;',
        '        }',
        '        return len;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxEnvelopes(vector<vector<int>>& envelopes) {',
        '        if (envelopes.empty()) return 0;',
        '        sort(envelopes.begin(), envelopes.end(), [](const vector<int>& a, const vector<int>& b) {',
        '            return a[0] < b[0] || (a[0] == b[0] && a[1] > b[1]);',
        '        });',
        '        vector<int> tails;',
        '        for (const auto& env : envelopes) {',
        '            int h = env[1];',
        '            auto it = lower_bound(tails.begin(), tails.end(), h);',
        '            if (it == tails.end()) tails.push_back(h);',
        '            else *it = h;',
        '        }',
        '        return tails.size();',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:',
        '        if not envelopes:',
        '            return 0',
        '        envelopes.sort(key=lambda x: (x[0], -x[1]))',
        '        tails = []',
        '        import bisect',
        '        for _, h in envelopes:',
        '            idx = bisect.bisect_left(tails, h)',
        '            if idx == len(tails):',
        '                tails.append(h)',
        '            else:',
        '                tails[idx] = h',
        '        return len(tails)',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入信封二维数组 envelopes。',
        3: '核心双关键字排序：宽度 w 升序；同宽时高度 h 逆序降序。',
        4: 'tails[i] 记录长度为 i+1 的递增子序列的最小结尾高度。',
        5: '遍历排序后的信封高度序列。',
        6: '二分查找 tails 中第一个大于等于当前高度 h 的位置（lower_bound）。',
        12: '若 h 大于所有已知结尾，拓展 LIS 长度。',
        13: '否则用更小的 h 更新该长度下的结尾（贪心让未来更容易接长）。',
        15: '返回 tails 的长度，即最长合法嵌套信封数。',
      },
      java: {
        2: '方法入口。',
        4: 'Lambda 双关键字定制排序。',
        5: '初始化 tails 紧凑数组。',
        10: '二分查找插入位置。',
        15: '更新 tails 极小结尾。',
        18: '返回 LIS 最大长度。',
      },
      cpp: {
        3: '函数入口。',
        5: 'std::sort 定制比较算子。',
        10: '使用 std::lower_bound 二分加速。',
        14: '返回嵌套最大层数。',
      },
      python: {
        2: '方法入口。',
        5: '双关键字 lambda 排序。',
        9: 'bisect_left 二分查找。',
        14: '返回 tails 长度。',
      },
    },
    keyPoints: {
      thinking:
        '二维偏序转一维 LIS 经典模板：如果直接按 w 升序、h 升序排序，在 [3,3] 和 [3,4] 时会被误认为可以嵌套；如果让同宽的 h 降序排列，[3,4] 会排在 [3,3] 前面，在求严格递增序列时，同一个 w 对应的多个 h 绝不可能同时被选中，从而完美将二维嵌套降维为一维二分 LIS。',
      state: 'tails[i] 存储长度为 i+1 的合法上升子序列的末尾最小高度。',
      equation: 'idx = lower_bound(tails, h); tails[idx] = h;',
      initAndBounds: 'tails 为空，随遍历自适应增长。',
      complexity: '时间复杂度 $O(N \\log N)$，空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '同宽降序的精髓',
        question: '为什么同宽的信封高度必须从大到小降序排列？',
        answer:
          '严格嵌套要求 w2 > w1 且 h2 > h1。如果同宽升序（如 [6,4], [6,7]），在对高度提取递增子序列时会选出 4 -> 7（误以为 6x4 能装入 6x7）。若同宽降序（变为 [6,7], [6,4]），在递增子序列中 7 之后不可能再选 4，同宽信封至多只能选 1 个，完全符合物理约束。',
      },
    ],
  },
  generateSteps: (input: { envelopes?: number[][] } = {}): DpTraceStep[] => {
    const rawEnvs = input?.envelopes || [
      [5, 4],
      [6, 4],
      [6, 7],
      [2, 3],
    ];
    const steps: DpTraceStep[] = [];

    const envs = [...rawEnvs].sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));

    steps.push(
      makeTraceStep({
        message: `✉️ 原始信封列表：${rawEnvs.map((e) => `[${e[0]},${e[1]}]`).join(', ')}。<br/>✨ 执行双关键字排序（<strong>宽升序，同宽高度降序</strong>）：<br/><code>${envs.map((e) => `[${e[0]},${e[1]}]`).join(' → ')}</code>。`,
        log: `排序完成: ${envs.map((e) => `[${e[0]},${e[1]}]`).join(', ')}`,
        vars: [
          { name: '信封总数', value: String(envs.length) },
          { name: '排序后序列', value: envs.map((e) => `[${e[0]},${e[1]}]`).join(' ') },
        ],
        metrics: { maxEnvelopes: 0 },
      })
    );

    const tails: number[] = [];

    for (let i = 0; i < envs.length; i++) {
      const [w, h] = envs[i];
      let left = 0;
      let right = tails.length;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (tails[mid] >= h) right = mid;
        else left = mid + 1;
      }

      const isExtend = left === tails.length;
      if (isExtend) tails.push(h);
      else tails[left] = h;

      steps.push(
        makeTraceStep({
          dp1d: tails.map((th, idx) => ({
            value: th,
            label: `len=${idx + 1}(h=${th})`,
            state: idx === left ? 'active' : 'computed',
          })),
          message: `📬 考虑信封 <strong>[${w}, ${h}]</strong>（高度 h=${h}）：<br/>${isExtend ? `🌲 h=${h} 大于当前所有最小结尾，tails 拓展至长度 <strong>${tails.length}</strong>。` : `🔄 二分替换 tails[${left}] 为更小高度 <strong>${h}</strong>，使后续更容易嵌套接长。`}`,
          log: `env [${w},${h}]: idx=${left}, isExtend=${isExtend}, tails=[${tails.join(', ')}]`,
          vars: [
            { name: '当前信封 [w, h]', value: `[${w}, ${h}]` },
            { name: '插入/替换位置', value: `tails[${left}]` },
            { name: '当前最长嵌套深度', value: String(tails.length) },
          ],
          metrics: { maxEnvelopes: tails.length },
        })
      );
    }

    steps.push(
      makeTraceStep({
        dp1d: tails.map((th, idx) => ({ value: th, label: `len=${idx + 1}`, state: 'computed' })),
        message: `🏆 俄罗斯套娃信封计算完成！最多能形成 <strong>${tails.length}</strong> 层嵌套。`,
        log: `计算结束：最多嵌套信封数 = ${tails.length}`,
        vars: [
          { name: '最大套娃层数', value: String(tails.length) },
        ],
        metrics: { maxEnvelopes: tails.length },
      })
    );

    return steps;
  },
};
