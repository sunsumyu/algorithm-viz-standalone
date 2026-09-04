import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 扰乱字符串 (Scramble String)
 * LeetCode 87 / 左程云算法通关课 第069讲 三维DP Code05
 * 状态定义：将 4 个可变参数 (l1, r1, l2, r2) 压缩为 3 个状态 (l1, l2, len)。
 * dp[l1][l2][len] 表示 s1[l1...l1+len-1] 与 s2[l2...l2+len-1] 是否互为扰乱字符串。
 */
export const ScrambleStringSpec: AlgorithmSpec = {
  id: 'scramble-string',
  name: '扰乱字符串 (Scramble String)',
  category: '三维 DP',
  description:
    '使用二叉树递归划分和交错/不交错交换子树算法可以扰乱字符串 s 得到 t。给定长度相等的两个字符串 s1 和 s2，判断 s2 是否是 s1 的扰乱字符串。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 87,
    leetcodeUrl: 'https://leetcode.cn/problems/scramble-string/',
    difficulty: 'hard',
    tags: ['动态规划', '字符串', '三维DP', '区间划分'],
    description:
      '使用下面描述的算法可以扰乱字符串 <code>s</code> 得到字符串 <code>t</code> ：<br/>' +
      '1. 如果字符串的长度为 1 ，算法停止。<br/>' +
      '2. 如果字符串的长度 > 1 ，执行下述步骤：<br/>' +
      '&nbsp;&nbsp;• 在一个随机下标处将字符串分割成两个非空的子字符串 <code>x</code> 和 <code>y</code> (<code>s = x + y</code>)。<br/>' +
      '&nbsp;&nbsp;• 随机决定是要<strong>交换</strong>两个子字符串还是要<strong>保持</strong>其顺序（即 <code>s = x + y</code> 或 <code>s = y + x</code>）。<br/>' +
      '&nbsp;&nbsp;• 在 <code>x</code> 和 <code>y</code> 这两个子字符串上继续递归执行此算法。<br/><br/>' +
      '给你两个<strong>长度相等</strong>的字符串 <code>s1</code> 和 <code>s2</code>，判断 <code>s2</code> 是否是 <code>s1</code> 的扰乱字符串。如果是返回 <code>true</code>；否则返回 <code>false</code>。',
    examples: [
      {
        input: 's1 = "great", s2 = "rgeat"',
        output: 'true',
        explanation:
          '在 "great" 下标 2 处划分为 "gr" 和 "eat"；对 "gr" 内部交换得到 "rg"，对 "eat" 保持顺序，拼接为 "rgeat"。',
      },
      {
        input: 's1 = "abcde", s2 = "caebd"',
        output: 'false',
        explanation: '无论如何划分与交换，"caebd" 均无法由 "abcde" 扰乱生成。',
      },
      {
        input: 's1 = "a", s2 = "a"',
        output: 'true',
        explanation: '长度为 1 且字符相等，直接满足扰乱关系。',
      },
    ],
    constraints: [
      's1.length == s2.length',
      '1 <= s1.length <= 30',
      's1 和 s2 由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 4, cpp: 5, python: 3, javascript: 2 },
    init: { java: 8, cpp: 9, python: 6, javascript: 6 },
    loopCheck: { java: 12, cpp: 13, python: 9, javascript: 10 },
    innerLoopCheck: { java: 14, cpp: 15, python: 11, javascript: 12 },
    stateTransfer: {
      java: [16, 17, 18, 22, 23, 24],
      cpp: [17, 18, 19, 23, 24, 25],
      python: [13, 14, 15, 17, 18, 19],
      javascript: [14, 15, 16, 20, 21, 22],
    },
    loopExit: { java: 29, cpp: 28, python: 18, javascript: 28 },
    returnResult: { java: 30, cpp: 29, python: 19, javascript: 29 },
  },
  code: {
    languages: {
      javascript: [
        'function isScramble(s1, s2) {',
        '  if (s1 === s2) return true;',
        '  if (s1.length !== s2.length) return false;',
        '  const n = s1.length;',
        '  const dp = Array.from({ length: n }, () =>',
        '    Array.from({ length: n }, () => Array(n + 1).fill(false))',
        '  );',
        '  for (let l1 = 0; l1 < n; l1++) {',
        '    for (let l2 = 0; l2 < n; l2++) {',
        '      dp[l1][l2][1] = (s1[l1] === s2[l2]);',
        '    }',
        '  }',
        '  for (let len = 2; len <= n; len++) {',
        '    for (let l1 = 0; l1 <= n - len; l1++) {',
        '      for (let l2 = 0; l2 <= n - len; l2++) {',
        '        for (let k = 1; k < len; k++) {',
        '          if (dp[l1][l2][k] && dp[l1 + k][l2 + k][len - k]) {',
        '            dp[l1][l2][len] = true;',
        '            break;',
        '          }',
        '          if (dp[l1][l2 + len - k][k] && dp[l1 + k][l2][len - k]) {',
        '            dp[l1][l2][len] = true;',
        '            break;',
        '          }',
        '        }',
        '      }',
        '    }',
        '  }',
        '  return dp[0][0][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean isScramble(String str1, String str2) {',
        '        if (str1.equals(str2)) return true;',
        '        if (str1.length() != str2.length()) return false;',
        '        char[] s1 = str1.toCharArray(), s2 = str2.toCharArray();',
        '        int n = s1.length;',
        '        boolean[][][] dp = new boolean[n][n][n + 1];',
        '        for (int l1 = 0; l1 < n; l1++) {',
        '            for (int l2 = 0; l2 < n; l2++) {',
        '                dp[l1][l2][1] = (s1[l1] == s2[l2]);',
        '            }',
        '        }',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int l1 = 0; l1 <= n - len; l1++) {',
        '                for (int l2 = 0; l2 <= n - len; l2++) {',
        '                    for (int k = 1; k < len; k++) {',
        '                        if (dp[l1][l2][k] && dp[l1 + k][l2 + k][len - k]) {',
        '                            dp[l1][l2][len] = true;',
        '                            break;',
        '                        }',
        '                        if (dp[l1][l2 + len - k][k] && dp[l1 + k][l2][len - k]) {',
        '                            dp[l1][l2][len] = true;',
        '                            break;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return dp[0][0][n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool isScramble(string s1, string s2) {',
        '        if (s1 == s2) return true;',
        '        if (s1.size() != s2.size()) return false;',
        '        int n = s1.size();',
        '        vector<vector<vector<bool>>> dp(n, vector<vector<bool>>(n, vector<bool>(n + 1, false)));',
        '        for (int l1 = 0; l1 < n; l1++) {',
        '            for (int l2 = 0; l2 < n; l2++) {',
        '                dp[l1][l2][1] = (s1[l1] == s2[l2]);',
        '            }',
        '        }',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int l1 = 0; l1 <= n - len; l1++) {',
        '                for (int l2 = 0; l2 <= n - len; l2++) {',
        '                    for (int k = 1; k < len; k++) {',
        '                        if (dp[l1][l2][k] && dp[l1 + k][l2 + k][len - k]) {',
        '                            dp[l1][l2][len] = true;',
        '                            break;',
        '                        }',
        '                        if (dp[l1][l2 + len - k][k] && dp[l1 + k][l2][len - k]) {',
        '                            dp[l1][l2][len] = true;',
        '                            break;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return dp[0][0][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def isScramble(self, s1: str, s2: str) -> bool:',
        '        if s1 == s2: return True',
        '        if len(s1) != len(s2): return False',
        '        n = len(s1)',
        '        dp = [[[False] * (n + 1) for _ in range(n)] for _ in range(n)]',
        '        for l1 in range(n):',
        '            for l2 in range(n):',
        '                dp[l1][l2][1] = (s1[l1] == s2[l2])',
        '        for length in range(2, n + 1):',
        '            for l1 in range(n - length + 1):',
        '                for l2 in range(n - length + 1):',
        '                    for k in range(1, length):',
        '                        if dp[l1][l2][k] and dp[l1 + k][l2 + k][length - k]:',
        '                            dp[l1][l2][length] = True',
        '                            break',
        '                        if dp[l1][l2 + length - k][k] and dp[l1 + k][l2][length - k]:',
        '                            dp[l1][l2][length] = True',
        '                            break',
        '        return dp[0][0][n]',
      ],
    },
    keyPoints: {
      thinking:
        '状态参数化化简：初始暴力递归需要 4 个坐标 (l1, r1, l2, r2)。由于扰乱必须匹配等长串 (r1 - l1 == r2 - l2)，可优化为 3 个参数 (l1, l2, len)。' +
        '转移分支讨论：对于左侧划分长度 k (1 <= k < len)，存在两种可能：① 不交换：s1 左侧匹配 s2 左侧，s1 右侧匹配 s2 右侧；② 交换（交错）：s1 左侧匹配 s2 右侧，s1 右侧匹配 s2 左侧。任一为 true 则当前串为扰乱串。',
      state:
        'dp[l1][l2][len] 表示 s1 从下标 l1 开始长为 len 的子串与 s2 从下标 l2 开始长为 len 的子串是否互为扰乱字符串。',
      equation:
        'dp[l1][l2][len] = ⋁_{1 ≤ k < len} ( (dp[l1][l2][k] ∧ dp[l1+k][l2+k][len-k]) ∨ (dp[l1][l2+len-k][k] ∧ dp[l1+k][l2][len-k]) )',
      initAndBounds:
        '当 len=1 时，只需比较单个字符是否相同：dp[l1][l2][1] = (s1[l1] == s2[l2])。外层按子串长度 len 从 2 递增填表。',
      complexity: '时间复杂度 O(n^4)，空间复杂度 O(n^3)。在 n <= 30 的数据规模下性能优越。',
    },
    faqList: [
      {
        tag: '交错与不交错',
        question: '为什么划分时有两种对照方式？',
        answer:
          '扰乱操作允许交换两个非空子串或保持原有顺序。如果不交换，s1 的前 k 个字符对应 s2 的前 k 个字符；如果交换，s1 的前 k 个字符将被甩到 s2 的后部（即起点为 l2 + len - k）。因此两类匹配都要枚举。',
      },
    ],
  },
  generateSteps: (input: { s1?: string; s2?: string } = {}): DpTraceStep[] => {
    const s1 = input?.s1 || 'great';
    const s2 = input?.s2 || 'rgeat';
    const n = s1.length;
    const steps: DpTraceStep[] = [];

    const dp: boolean[][][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Array(n + 1).fill(false))
    );

    const toDp2d = (lenLayer: number, activeL1?: number, activeL2?: number) =>
      Array.from({ length: n }, (_, l1) =>
        Array.from({ length: n }, (_, l2) => {
          const val = dp[l1][l2][lenLayer] ? 1 : 0;
          return {
            value: val,
            state:
              l1 === activeL1 && l2 === activeL2
                ? ('active' as const)
                : val === 1
                ? ('computed' as const)
                : ('default' as const),
          };
        })
      );

    // len = 1 初始化
    for (let l1 = 0; l1 < n; l1++) {
      for (let l2 = 0; l2 < n; l2++) {
        dp[l1][l2][1] = s1[l1] === s2[l2];
      }
    }

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(1),
        current: { row: 0, col: 0 },
        message: `🏁 初始化 len = 1 层：比对 s1 和 s2 的单字符相等性。字符串长度 n = ${n}。`,
        log: `完成 len=1 字符匹配初始化`,
        vars: [
          { name: '字符串 s1', value: s1 },
          { name: '字符串 s2', value: s2 },
          { name: '子串长度 len', value: '1' },
        ],
        metrics: { isScramble: dp[0][0][n] ? 1 : 0 },
      })
    );

    // len 从 2 到 n
    for (let len = 2; len <= n; len++) {
      for (let l1 = 0; l1 <= n - len; l1++) {
        for (let l2 = 0; l2 <= n - len; l2++) {
          let found = false;
          let splitMethod = '';

          for (let k = 1; k < len; k++) {
            // 不交错
            if (dp[l1][l2][k] && dp[l1 + k][l2 + k][len - k]) {
              found = true;
              splitMethod = `不交错划分 (k=${k})`;
              break;
            }
            // 交错
            if (dp[l1][l2 + len - k][k] && dp[l1 + k][l2][len - k]) {
              found = true;
              splitMethod = `交错交换划分 (k=${k})`;
              break;
            }
          }

          dp[l1][l2][len] = found;

          const sub1 = s1.substring(l1, l1 + len);
          const sub2 = s2.substring(l2, l2 + len);

          steps.push(
            makeTraceStep({
              dp2d: toDp2d(len, l1, l2),
              current: { row: l1, col: l2 },
              message: `🔍 考察 len=${len}: s1[${l1}..${l1 + len - 1}]("${sub1}") 与 s2[${l2}..${l2 + len - 1}]("${sub2}") -> ${
                found ? `✅ 匹配成功 (${splitMethod})` : '❌ 无有效扰乱划分'
              }`,
              log: `dp[${l1}][${l2}][${len}] = ${found}`,
              vars: [
                { name: '子串长度 len', value: String(len) },
                { name: 's1 子串', value: sub1 },
                { name: 's2 子串', value: sub2 },
                { name: '扰乱判定', value: found ? 'true' : 'false' },
              ],
              metrics: { isScramble: dp[0][0][n] ? 1 : 0 },
            })
          );
        }
      }
    }

    const finalResult = dp[0][0][n];
    steps.push(
      makeTraceStep({
        dp2d: toDp2d(n, 0, 0),
        current: { row: 0, col: 0 },
        message: `🎉 三维 DP 求解完毕！"${s2}" ${finalResult ? '是' : '不是'} "${s1}" 的扰乱字符串（结果：${finalResult}）。`,
        log: `算法终结，输出 dp[0][0][${n}] = ${finalResult}`,
        vars: [
          { name: '最终判定', value: finalResult ? 'true (是扰乱字符串)' : 'false' },
          { name: '最终 dp[0][0][n]', value: String(finalResult) },
        ],
        metrics: { isScramble: finalResult ? 1 : 0 },
      })
    );

    return steps;
  },
};
