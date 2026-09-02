import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export interface CourseInput {
  n?: number;
  m?: number;
  courses?: Array<{ id: number; cost: number; score: number; parent: number }>;
}

export const CourseSelectionSpec: AlgorithmSpec = {
  id: 'course-selection',
  name: '选课 (Course Selection / 树上背包 DP)',
  category: '树型 DP',
  description: '经典树上背包动态规划。大学有 n 门课程，每门课程有先修课依赖关系形成一棵树。每门课有学分，最多选 m 门课，求能获得的最大最大学分。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 0,
    leetcodeUrl: 'https://www.luogu.com.cn/problem/P2014',
    difficulty: 'hard',
    tags: ['动态规划', '树型 DP', '树上背包', '分组背包'],
    description: '学校有 <code>n</code> 门课程，编号为 <code>1..n</code>。某些课程有先修课要求，若选修某门课，必须先选修其先修课。每门课消耗 <code>1</code> 个选课名额并带来对应的学分 <code>score</code>。<br/><br/>假设所有依赖关系构成一棵以虚拟节点 <code>0</code> 为根的树。你最多只能选修 <code>m</code> 门课，求所能获得的最大学分。',
    examples: [
      {
        input: 'n = 3, m = 2, 课程1(学分2,先修0), 课程2(学分3,先修1), 课程3(学分4,先修0)',
        output: '6',
        explanation: '选修课程 1 (学分2) 和 课程 3 (学分4)，总消耗 2 门课，获得最大学分 = 2 + 4 = 6。',
      },
    ],
    constraints: [
      '1 <= n <= 300 (演示推荐 <= 8)',
      '1 <= m <= n',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6, 7], cpp: [6, 7, 8], python: [5, 6], javascript: [4, 5] },
    stateTransfer: { java: [12, 13, 14, 15], cpp: [13, 14, 15, 16], python: [11, 12, 13, 14], javascript: [11, 12, 13, 14] },
    returnResult: { java: 19, cpp: 20, python: 17, javascript: 18 },
  },
  code: {
    languages: {
      javascript: [
        'function maxCourseScore(n, m, courses) {',
        '    // 建立树形邻接表，0 为虚拟超级根节点',
        '    const tree = Array.from({ length: n + 1 }, () => []);',
        '    const score = new Array(n + 1).fill(0);',
        '    courses.forEach(c => {',
        '        tree[c.parent].push(c.id);',
        '        score[c.id] = c.score;',
        '    });',
        '    // dp[u][j] 表示以 u 为根的子树中，选择 j 门课获得的最大学分',
        '    const dp = Array.from({ length: n + 1 }, () => new Array(m + 2).fill(0));',
        '    function dfs(u) {',
        '        dp[u][1] = score[u]; // 只要选了当前根节点 u，消耗 1 门课名额获得 score[u]',
        '        for (const v of tree[u]) {',
        '            dfs(v);',
        '            // 树上分组背包逆序转移',
        '            for (let j = m + 1; j >= 1; j--) {',
        '                for (let k = 0; k < j; k++) {',
        '                    dp[u][j] = Math.max(dp[u][j], dp[u][j - k] + dp[v][k]);',
        '                }',
        '            }',
        '        }',
        '    }',
        '    dfs(0);',
        '    return dp[0][m + 1]; // 虚拟节点 0 占 1 额度，总共选 m + 1 个节点',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxCourseScore(int n, int m, int[][] courses) {',
        '        List<Integer>[] tree = new ArrayList[n + 1];',
        '        for (int i = 0; i <= n; i++) tree[i] = new ArrayList<>();',
        '        int[] score = new int[n + 1];',
        '        for (int[] c : courses) {',
        '            tree[c[2]].add(c[0]); // c[2] 为 parent, c[0] 为 id',
        '            score[c[0]] = c[1]; // c[1] 为 score',
        '        }',
        '        int[][] dp = new int[n + 1][m + 2];',
        '        dfs(0, m + 1, tree, score, dp);',
        '        return dp[0][m + 1];',
        '    }',
        '    private void dfs(int u, int maxCap, List<Integer>[] tree, int[] score, int[][] dp) {',
        '        dp[u][1] = score[u];',
        '        for (int v : tree[u]) {',
        '            dfs(v, maxCap, tree, score, dp);',
        '            for (int j = maxCap; j >= 1; j--) {',
        '                for (int k = 0; k < j; k++) {',
        '                    dp[u][j] = Math.max(dp[u][j], dp[u][j - k] + dp[v][k]);',
        '                }',
        '            }',
        '        }',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxCourseScore(int n, int m, vector<vector<int>>& courses) {',
        '        vector<vector<int>> tree(n + 1);',
        '        vector<int> score(n + 1, 0);',
        '        for (auto& c : courses) {',
        '            tree[c[2]].push_back(c[0]);',
        '            score[c[0]] = c[1];',
        '        }',
        '        vector<vector<int>> dp(n + 1, vector<int>(m + 2, 0));',
        '        dfs(0, m + 1, tree, score, dp);',
        '        return dp[0][m + 1];',
        '    }',
        '    void dfs(int u, int maxCap, vector<vector<int>>& tree, vector<int>& score, vector<vector<int>>& dp) {',
        '        dp[u][1] = score[u];',
        '        for (int v : tree[u]) {',
        '            dfs(v, maxCap, tree, score, dp);',
        '            for (int j = maxCap; j >= 1; j--) {',
        '                for (int k = 0; k < j; k++) {',
        '                    dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);',
        '                }',
        '            }',
        '        }',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxCourseScore(self, n: int, m: int, courses: List[Tuple[int, int, int]]) -> int:',
        '        tree = [[] for _ in range(n + 1)]',
        '        score = [0] * (n + 1)',
        '        for cid, sc, p in courses:',
        '            tree[p].append(cid)',
        '            score[cid] = sc',
        '        dp = [[0] * (m + 2) for _ in range(n + 1)]',
        '        def dfs(u):',
        '            dp[u][1] = score[u]',
        '            for v in tree[u]:',
        '                dfs(v)',
        '                for j in range(m + 1, 0, -1):',
        '                    for k in range(j):',
        '                        dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k])',
        '        dfs(0)',
        '        return dp[0][m + 1]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        3: '构建树形图结构 tree。',
        7: '建立父子边并记录各课程分值。',
        10: '定义二维 DP 状态表：$dp[u][j]$ 表示子树 $u$ 中选择 $j$ 门课的最大学分。',
        14: '后序 DFS 树上背包遍历。',
        15: '当前根节点 $u$ 如果入选，容量为 1 时获得分值 $score[u]$。',
        16: '遍历 $u$ 的每一个子节点 $v$。',
        18: '🌟 <strong>树上背包倒序枚举</strong>：容量 $j$ 逆序递减，避免当前子树信息被重复叠加。',
        19: '枚举分配给子节点 $v$ 的课程配额 $k \\in [0, j-1]$。',
        20: '状态转移方程：$dp[u][j] = \\max(dp[u][j], dp[u][j-k] + dp[v][k])$。',
        12: '虚拟根节点 0 占 1 门课容量，返回 $dp[0][m+1]$。',
      },
      javascript: {
        1: '🎯 <strong>主函数</strong>。',
        3: '树邻接表。',
        10: 'DP 数组初始化。',
        12: '选当前根节点。',
        16: '背包容量倒序。',
        17: '子树配额枚举合并。',
        23: '返回虚拟根节点容积 m+1 时的最大学分。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        10: '状态表定义。',
        17: '树上背包核心转移。',
        23: '返回全局最优。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        9: 'DFS 定义。',
        13: '倒序容量更新。',
        16: '最终返回 dp[0][m+1]。',
      },
    },
    keyPoints: {
      thinking: '树上背包问题是将树型 DP 与分组背包深度结合。若要选子节点 v 中的课程，必须先选父节点 u。因此 u 是所有子树方案的前提。每个子节点 v 可以看作一个物品组，组内包含“选 0 门、选 1 门...选 k 门”等互斥方案。',
      state: 'dp[u][j] 表示在以 u 为根的子树中总共选修 j 门课（包含根节点 u 自身）所能获得的最大学分。',
      equation: 'dp[u][j] = \\max_{0 \\le k < j} (dp[u][j - k] + dp[v][k])',
      initAndBounds: 'dp[u][1] = score[u]；虚拟根节点 0 学分为 0，总容量为 m + 1。',
      complexity: '时间复杂度 $O(N \\cdot M^2)$，空间复杂度 $O(N \\cdot M)$。',
    },
    faqList: [
      {
        tag: '虚拟根节点0',
        question: '为什么需要建立一个学分为 0 的虚拟根节点 0？',
        answer: '因为原图中可能存在多个没有先修课的独立根节点（森林结构）。通过将所有无先修课的课程挂在虚拟超级节点 0 之下，森林就转化成了一棵标准的树，统一了 DP 逻辑。',
      },
      {
        tag: '倒序枚举原因',
        question: '为什么外层循环 j 必须倒序从 m+1 到 1？',
        answer: '这与 01 背包逆序原理一致。每个子节点 v 是一整个物品组，逆序枚举容量可以确保每个子树组内的决策在本次合并中最多只被使用一次，防止状态自身覆盖。',
      },
    ],
  },
  generateSteps: (input: CourseInput): DpTraceStep[] => {
    const n = input?.n ?? 3;
    const m = input?.m ?? 2;
    const rawCourses = input?.courses ?? [
      { id: 1, cost: 1, score: 2, parent: 0 },
      { id: 2, cost: 1, score: 3, parent: 1 },
      { id: 3, cost: 1, score: 4, parent: 0 },
    ];

    const steps: DpTraceStep[] = [];
    const tree: number[][] = Array.from({ length: n + 1 }, () => []);
    const score = new Array(n + 1).fill(0);
    rawCourses.forEach((c) => {
      tree[c.parent].push(c.id);
      score[c.id] = c.score;
    });

    const maxCap = m + 1;
    const dp: DpCell[][] = Array.from({ length: n + 1 }, () =>
      Array.from({ length: maxCap + 1 }, () => ({
        value: 0,
        state: 'empty',
      }))
    );

    function buildDpTree(u: number, activeU?: number): DpTreeNode {
      return {
        id: String(u),
        label: u === 0 ? '虚拟根#0' : `课#${u}(分=${score[u]})`,
        value: Number(dp[u][maxCap].value),
        state: u === activeU ? 'active' : 'default',
        children: tree[u].map((v) => buildDpTree(v, activeU)),
      };
    }

    steps.push(
      makeTraceStep({
        tree: buildDpTree(0),
        dp2d: clone2d(dp),
        message: `初始化树上背包：${n} 门课程，最多选 ${m} 门课（加虚拟根后总容量 ${maxCap}）`,
        log: '后序遍历启动，初始化 dp[u][j]',
        vars: [
          { name: 'n', value: String(n) },
          { name: 'm', value: String(m) },
          { name: 'maxCap', value: String(maxCap) },
        ],
        metrics: { maxScore: 0 },
      })
    );

    function dfs(u: number) {
      dp[u][1].value = score[u];
      dp[u][1].state = 'computed';

      for (const v of tree[u]) {
        dfs(v);

        for (let j = maxCap; j >= 1; j--) {
          let bestVal = Number(dp[u][j].value);
          let bestK = 0;

          for (let k = 0; k < j; k++) {
            const candidate = Number(dp[u][j - k].value) + Number(dp[v][k].value);
            if (candidate > bestVal) {
              bestVal = candidate;
              bestK = k;
            }
          }

          dp[u][j].value = bestVal;
          dp[u][j].state = 'computed';

          if (bestVal > 0) {
            steps.push(
              makeTraceStep({
                tree: buildDpTree(0, u),
                dp2d: clone2d(dp),
                current: { row: u, col: j },
                dependencies: [
                  { row: u, col: j - bestK },
                  { row: v, col: bestK },
                ],
                message: `子树合并: 节点#${u} 合并子节点#${v} (容量 j=${j}): 分配给子树#${v} ${bestK} 门课 -> 最大学分=${bestVal}`,
                log: `dp[${u}][${j}] = dp[${u}][${j - bestK}] + dp[${v}][${bestK}] = ${bestVal}`,
                formula: 'dp[u][j] = max(dp[u][j-k] + dp[v][k])',
                formulaSubstituted: `dp[${u}][${j}] = ${dp[u][j - bestK].value} + ${dp[v][bestK].value} = ${bestVal}`,
                vars: [
                  { name: '节点u', value: `#${u}` },
                  { name: '子节点v', value: `#${v}` },
                  { name: '容量j', value: String(j) },
                  { name: '子树配额k', value: String(bestK) },
                  { name: '当前最大学分', value: String(bestVal) },
                ],
                metrics: { maxScore: bestVal },
              })
            );
          }
        }
      }
    }

    dfs(0);

    const answer = Number(dp[0][maxCap].value);
    steps.push(
      makeTraceStep({
        tree: buildDpTree(0),
        dp2d: clone2d(dp),
        current: { row: 0, col: maxCap },
        message: `🎉 选课树上背包求解完成！最多选 ${m} 门课获得的最大学分为 ${answer}`,
        log: `最终结果 dp[0][${maxCap}] = ${answer}`,
        vars: [
          { name: '最终最大学分', value: String(answer) },
        ],
        metrics: { maxScore: answer },
      })
    );

    return steps;
  },
};
