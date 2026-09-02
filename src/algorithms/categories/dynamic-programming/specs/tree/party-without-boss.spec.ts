import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

/**
 * 没有上司的舞会 (Greatest Independent Set on Tree / Happy Party)
 * 洛谷 P1352 / 经典树型 DP 入门基石
 * 树型DP套路：每个节点向父节点汇报 [不来最大快乐值, 参加最大快乐值] 状态二元组
 */
export const PartyWithoutBossSpec: AlgorithmSpec = {
  id: 'party-without-boss',
  name: '没有上司的舞会 (Tree Max Independent Set)',
  category: '树型 DP',
  description:
    '树型DP独立集经典基石（洛谷 P1352）。某公司要举办舞会，每位员工有快乐指数，但直接上司与直接下属不能同时出席。求出席员工的最大快乐指数总和。每个节点汇报 [不参加, 参加] 状态二元组。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 0,
    leetcodeUrl: 'https://www.luogu.com.cn/problem/P1352',
    difficulty: 'medium',
    tags: ['动态规划', '树型 DP', '树形结构', '最大权独立集'],
    description:
      '某大学有 <code>n</code> 个职员，编号为 <code>1..n</code>。每位职员有快乐指数 <code>happy[i]</code>。<br/><br/>为了气氛融洽，<strong>直接上司与直接下属不能同时参加舞会</strong>。<br/><br/>求使所有出席职员的快乐指数之和最大的方案。',
    examples: [
      {
        input: 'n = 7, happy = [1, 1, 1, 1, 1, 1, 1], 关系: 1是2/3上司, 2是4/5上司, 3是6/7上司',
        output: '5',
        explanation: '选员工 1(根) 和 4, 5, 6, 7(叶子)，共 5 人参加，总快乐值 = 5。',
      },
    ],
    constraints: [
      '1 <= n <= 6000 (演示推荐 5~10 节点)',
      '-128 <= happy[i] <= 127',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 7, cpp: 8, python: 6, javascript: 5 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: {
      java: [8, 9, 10, 11, 12, 13],
      cpp: [9, 10, 11, 12, 13, 14],
      python: [7, 8, 9, 10, 11],
      javascript: [6, 7, 8, 9, 10, 11],
    },
    returnResult: { java: 17, cpp: 18, python: 15, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function maxHappy(n, happy, relations) {',
        '    const tree = Array.from({ length: n + 1 }, () => []);',
        '    const hasBoss = new Array(n + 1).fill(false);',
        '    relations.forEach(([sub, boss]) => { tree[boss].push(sub); hasBoss[sub] = true; });',
        '    let root = 1;',
        '    while (hasBoss[root]) root++; // 找到无上司的根节点',
        '    // 返回 [noJoin, join]',
        '    function dfs(u) {',
        '        let noJoin = 0; // u 不参加：下属可参加或不参加',
        '        let join = happy[u]; // u 参加：下属绝对不能参加',
        '        for (const v of tree[u]) {',
        '            const [vNo, vJoin] = dfs(v);',
        '            noJoin += Math.max(vNo, vJoin);',
        '            join += vNo;',
        '        }',
        '        return [noJoin, join];',
        '    }',
        '    const [noJoin, join] = dfs(root);',
        '    return Math.max(noJoin, join);',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxHappy(int n, int[] happy, int[][] relations) {',
        '        List<Integer>[] tree = new ArrayList[n + 1];',
        '        for (int i = 0; i <= n; i++) tree[i] = new ArrayList<>();',
        '        boolean[] hasBoss = new boolean[n + 1];',
        '        for (int[] r : relations) { tree[r[1]].add(r[0]); hasBoss[r[0]] = true; }',
        '        int root = 1;',
        '        while (hasBoss[root]) root++;',
        '        int[] res = dfs(root, tree, happy);',
        '        return Math.max(res[0], res[1]);',
        '    }',
        '    // 返回 int[] { 不参加最大值, 参加最大值 }',
        '    private int[] dfs(int u, List<Integer>[] tree, int[] happy) {',
        '        int noJoin = 0;',
        '        int join = happy[u];',
        '        for (int v : tree[u]) {',
        '            int[] sub = dfs(v, tree, happy);',
        '            noJoin += Math.max(sub[0], sub[1]);',
        '            join += sub[0];',
        '        }',
        '        return new int[]{ noJoin, join };',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxHappy(int n, vector<int>& happy, vector<vector<int>>& relations) {',
        '        vector<vector<int>> tree(n + 1);',
        '        vector<bool> hasBoss(n + 1, false);',
        '        for (auto& r : relations) { tree[r[1]].push_back(r[0]); hasBoss[r[0]] = true; }',
        '        int root = 1;',
        '        while (hasBoss[root]) root++;',
        '        auto [noJoin, join] = dfs(root, tree, happy);',
        '        return max(noJoin, join);',
        '    }',
        '    pair<int,int> dfs(int u, vector<vector<int>>& tree, vector<int>& happy) {',
        '        int noJoin = 0, join = happy[u];',
        '        for (int v : tree[u]) {',
        '            auto [vNo, vJoin] = dfs(v, tree, happy);',
        '            noJoin += max(vNo, vJoin);',
        '            join += vNo;',
        '        }',
        '        return {noJoin, join};',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxHappy(self, n: int, happy: List[int], relations: List[List[int]]) -> int:',
        '        tree = defaultdict(list)',
        '        has_boss = [False] * (n + 1)',
        '        for sub, boss in relations: tree[boss].append(sub); has_boss[sub] = True',
        '        root = next(i for i in range(1, n + 1) if not has_boss[i])',
        '        def dfs(u):',
        '            no_join, join = 0, happy[u]',
        '            for v in tree[u]:',
        '                v_no, v_join = dfs(v)',
        '                no_join += max(v_no, v_join)',
        '                join += v_no',
        '            return no_join, join',
        '        return max(dfs(root))',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        8: '寻找入度为 0 的最高领导（根节点 root）。',
        14: '后序遍历 dfs(u)：返回 [u不出席最大快乐值, u出席最大快乐值]。',
        15: '若 u 不出席，其下属 v 可自由选择【出席】或【不出席】，取最大值累加。',
        16: '若 u 出席，获得 happy[u]，且所有直接下属 v 绝对【不能出席】（只能累加 sub[0]）。',
        17: '向父节点汇报二元组。',
        21: '根节点两者取最大值即为全局最大快乐指数。',
      },
      javascript: {
        1: '🎯 <strong>主函数入口</strong>。',
        5: '定位最高上司根节点。',
        8: 'dfs 计算出席/不出席二元状态。',
        12: 'u 不来：下属可来可不来，取 max(vNo, vJoin)。',
        13: 'u 参加：下属一律不能来，累加 vNo。',
        17: '返回最终两者最大值。',
      },
      cpp: {
        1: '类定义。',
        4: '主函数。',
        11: '后序状态转移。',
        16: '返回 {noJoin, join}。',
      },
      python: {
        1: '类定义。',
        2: '主函数。',
        8: '状态转移累加。',
        13: '返回全局最大值。',
      },
    },
    keyPoints: {
      thinking:
        '树型DP选与不选二状态模型（打家劫舍III的多叉树通用版）：每个节点只有两种选择：1. 我不出席：下属可以出席也可以不出席，每个下属独立贡献 max(不出席, 出席)；2. 我出席：所有下属都不能出席，每个下属只能贡献 不出席。',
      state: 'dfs(u) 返回 [dp[u][0], dp[u][1]]，分别代表以 u 为根的子树在 u 不出席/出席时的最大快乐值。',
      equation: 'dp[u][0] = ∑ max(dp[v][0], dp[v][1])；dp[u][1] = happy[u] + ∑ dp[v][0]',
      initAndBounds: '叶子节点 dp[leaf][0] = 0, dp[leaf][1] = happy[leaf]。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '多叉树合并',
        question: '为什么多个下属之间可以直接独立累加？',
        answer:
          '因为在树形结构中，同一个上司的各个子树之间互不相交（彼此没有边相连），因此当上司做出固定决策后，各个子树的决策完全相互独立，满足最优子结构与贪心加法原理。',
      },
    ],
  },
  generateSteps: (input: { n?: number; happy?: number[]; relations?: number[][] }): DpTraceStep[] => {
    const n = input?.n || 7;
    const happy = input?.happy || [0, 4, 1, 2, 3, 2, 5, 1]; // 1-indexed
    const relations = input?.relations || (input as any)?.edges || [[2, 1], [3, 1], [4, 2], [5, 2], [6, 3], [7, 3]];
    const steps: DpTraceStep[] = [];

    const tree: number[][] = Array.from({ length: n + 1 }, () => []);
    const hasBoss = new Array(n + 1).fill(false);
    relations.forEach(([sub, boss]) => {
      if (tree[boss]) {
        tree[boss].push(sub);
      }
      if (sub <= n) {
        hasBoss[sub] = true;
      }
    });

    let root = 1;
    while (root <= n && hasBoss[root]) root++;
    if (root > n) root = 1;

    const resMap = new Map<number, [number, number]>();

    interface DpNode {
      id: string;
      val: number;
      happy: number;
      children: DpNode[];
    }

    function buildHierarchy(u: number): DpNode {
      const children = (tree[u] || []).map((v) => buildHierarchy(v));
      return { id: String(u), val: u, happy: happy[u] || 0, children };
    }

    const treeRoot = buildHierarchy(root);

    function toDpTree(node: DpNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const res = resMap.get(node.val);
      const label = res !== undefined
        ? `员工#${node.val}(乐${node.happy})\n不来:${res[0]}|来:${res[1]}`
        : `员工#${node.val}(乐${node.happy})`;

      return {
        id: node.id,
        label,
        value: res ? Math.max(res[0], res[1]) : node.happy,
        state: node.id === activeId ? 'active' : res !== undefined ? 'computed' : 'default',
        children: node.children.map((c) => toDpTree(c, activeId)).filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🌲 初始化公司层级树（最高上司为员工 #${root}），开始自底向上后序遍历计算每位员工 [不来, 来] 的最大快乐值`,
        log: `最高领导 root = #${root}, 启动后序遍历`,
        vars: [
          { name: '最高领导', value: `#${root}` },
          { name: '员工总数', value: String(n) },
        ],
        metrics: { maxHappy: 0 },
      })
    );

    function dfs(u: number): [number, number] {
      let noJoin = 0;
      let join = happy[u] || 0;

      for (const v of tree[u]) {
        const [vNo, vJoin] = dfs(v);
        noJoin += Math.max(vNo, vJoin);
        join += vNo;
      }

      const result: [number, number] = [noJoin, join];
      resMap.set(u, result);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, String(u)),
          message: `员工 #${u}(自身快乐=${happy[u]}): 若不出席累计=${noJoin}，若出席(下属均不来)累计=${join} → 当前子树最优快乐值=${Math.max(noJoin, join)}`,
          log: `节点 #${u}: noJoin=${noJoin}, join=${join}, best=${Math.max(noJoin, join)}`,
          formula: 'noJoin = ∑ max(vNo, vJoin) ; join = happy[u] + ∑ vNo',
          formulaSubstituted: `[不来:${noJoin}, 来:${join}]`,
          vars: [
            { name: '当前员工', value: `#${u}` },
            { name: '自身快乐值', value: String(happy[u]) },
            { name: '不出席最大收益', value: String(noJoin) },
            { name: '出席最大收益', value: String(join) },
            { name: '子树当前最优', value: String(Math.max(noJoin, join)) },
          ],
          metrics: { maxHappy: Math.max(noJoin, join) },
        })
      );

      return result;
    }

    const [rootNo, rootJoin] = dfs(root);
    const finalAns = Math.max(rootNo, rootJoin);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 遍历完成！最高上司 #${root} 决策：max(不来:${rootNo}, 来:${rootJoin}) = ${finalAns}，舞会最大快乐值为 ${finalAns}`,
        log: `最终全局最大快乐值 = ${finalAns}`,
        vars: [{ name: '最终最大快乐值', value: String(finalAns) }],
        metrics: { maxHappy: finalAns },
      })
    );

    return steps;
  },
};
