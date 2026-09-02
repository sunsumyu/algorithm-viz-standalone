import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

/**
 * 到达首都的最少油耗 (Minimum Fuel Cost to Report to the Capital)
 * LeetCode 2477 / 左程云算法通关课 第079讲 树型DP下 Code01
 * 树型DP套路：自底向上统计子树人数 size，每条边消耗油量 = ceil(size / seats)
 */
export const MinimumFuelCostSpec: AlgorithmSpec = {
  id: 'minimum-fuel-cost',
  name: '到达首都的最少油耗 (Minimum Fuel Cost to Capital)',
  category: '树型 DP',
  description:
    '树型DP子树人数汇聚。n 个城市构成一棵以 0 为根（首都）的树，每座城市有 1 名代表，每辆车最多坐 seats 个人。自底向上汇总子树代表数，每条边油耗 = ⌈子树人数 / seats⌉。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 2477,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-fuel-cost-to-report-to-the-capital/',
    difficulty: 'medium',
    tags: ['树', '深度优先搜索', '广度优先搜索', '动态规划', '树型DP'],
    description:
      '给你一棵 <code>n</code> 个节点的树（城市编号 <code>0</code> 到 <code>n - 1</code>），以 <code>0</code> 号城市（首都）为根。每个城市有 1 名代表要前往首都。每辆车最多可坐 <code>seats</code> 人。<br/><br/><strong>核心结论：</strong>后序遍历每个子树，以节点 <code>u</code> 为根的子树共有 <code>size</code> 人，他们驶向 <code>u</code> 的父节点至少需要 <code>⌈size / seats⌉</code> 辆车（即消耗等量升汽油）。累加所有非根节点的跨边油耗即为全局最少油耗。',
    examples: [
      {
        input: 'roads = [[0,1],[0,2],[0,3]], seats = 5',
        output: '3',
        explanation: '代表 1、2、3 各走 1 步直达首都，耗油 1+1+1 = 3 升。',
      },
      {
        input: 'roads = [[3,1],[3,2],[1,0],[0,4],[0,5],[4,6]], seats = 2',
        output: '7',
        explanation: '3 号城市拼车到 1 号（耗油 1），1 号汇集 3 人拼 2 辆车到首都（耗油 2），右侧分支耗油 4，总耗油 7。',
      },
    ],
    constraints: [
      '1 <= n <= 10^5 (演示推荐 5~10 节点)',
      '1 <= seats <= 10^5',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 8, cpp: 9, python: 7, javascript: 6 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: {
      java: [9, 10, 11, 12, 13],
      cpp: [10, 11, 12, 13, 14],
      python: [8, 9, 10, 11, 12],
      javascript: [7, 8, 9, 10, 11],
    },
    returnResult: { java: 17, cpp: 18, python: 15, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function minimumFuelCost(roads, seats) {',
        '    const n = roads.length + 1;',
        '    const tree = Array.from({ length: n }, () => []);',
        '    roads.forEach(([u, v]) => { tree[u].push(v); tree[v].push(u); });',
        '    let totalFuel = 0;',
        '    function dfs(u, p) {',
        '        let people = 1; // 当前城市有 1 名代表',
        '        for (const v of tree[u]) {',
        '            if (v === p) continue;',
        '            people += dfs(v, u); // 汇聚子树人数',
        '        }',
        '        if (u !== 0) {',
        '            // 子树所有人驶向父节点所需油耗 = ceil(people / seats)',
        '            totalFuel += Math.ceil(people / seats);',
        '        }',
        '        return people;',
        '    }',
        '    dfs(0, -1);',
        '    return totalFuel;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private long totalFuel = 0;',
        '    public long minimumFuelCost(int[][] roads, int seats) {',
        '        int n = roads.length + 1;',
        '        List<Integer>[] tree = new ArrayList[n];',
        '        for (int i = 0; i < n; i++) tree[i] = new ArrayList<>();',
        '        for (int[] r : roads) { tree[r[0]].add(r[1]); tree[r[1]].add(r[0]); }',
        '        dfs(0, -1, tree, seats);',
        '        return totalFuel;',
        '    }',
        '    private int dfs(int u, int p, List<Integer>[] tree, int seats) {',
        '        int people = 1;',
        '        for (int v : tree[u]) {',
        '            if (v != p) people += dfs(v, u, tree, seats);',
        '        }',
        '        if (u != 0) {',
        '            totalFuel += (people + seats - 1) / seats; // 向上取整',
        '        }',
        '        return people;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    long long totalFuel = 0;',
        'public:',
        '    long long minimumFuelCost(vector<vector<int>>& roads, int seats) {',
        '        int n = roads.size() + 1;',
        '        vector<vector<int>> tree(n);',
        '        for (auto& r : roads) { tree[r[0]].push_back(r[1]); tree[r[1]].push_back(r[0]); }',
        '        dfs(0, -1, tree, seats);',
        '        return totalFuel;',
        '    }',
        '    int dfs(int u, int p, vector<vector<int>>& tree, int seats) {',
        '        int people = 1;',
        '        for (int v : tree[u]) {',
        '            if (v != p) people += dfs(v, u, tree, seats);',
        '        }',
        '        if (u != 0) {',
        '            totalFuel += (people + seats - 1) / seats;',
        '        }',
        '        return people;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minimumFuelCost(self, roads: List[List[int]], seats: int) -> int:',
        '        n = len(roads) + 1',
        '        tree = defaultdict(list)',
        '        for u, v in roads: tree[u].append(v); tree[v].append(u)',
        '        self.total_fuel = 0',
        '        def dfs(u, p):',
        '            people = 1',
        '            for v in tree[u]:',
        '                if v != p:',
        '                    people += dfs(v, u)',
        '            if u != 0:',
        '                self.total_fuel += ceil(people / seats)',
        '            return people',
        '        dfs(0, -1)',
        '        return self.total_fuel',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局累加量 totalFuel 记录总耗油量。',
        3: '🎯 <strong>函数主入口</strong>。',
        11: '后序遍历 dfs(u, p)：返回以 u 为根的子树总人数。',
        12: '初始每个城市有 1 名代表（自身）。',
        14: '遍历子节点 v，递归累加各子树代表人数。',
        16: '💡 <strong>油耗转移</strong>：非首都节点驶向父节点跨越 1 条边，需要 ⌈people / seats⌉ 辆车（耗油等量）。',
        19: '向父节点汇报当前子树总人数。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        2: '建立邻接表树。',
        5: '初始化全局油耗 totalFuel 为 0。',
        7: '当前城市代表数基础值为 1。',
        10: '汇聚所有子节点的代表总数。',
        13: '非首都节点跨边油耗 = Math.ceil(people / seats)。',
        19: '返回最终最少油耗。',
      },
      cpp: {
        1: '类定义。',
        4: '主函数入口。',
        11: '后序递归函数。',
        15: '跨边车数向上取整计算并累加。',
      },
      python: {
        1: '类定义。',
        2: '主函数。',
        6: '后序递归计算人数与油耗。',
        11: '向上取整油耗累加。',
      },
    },
    keyPoints: {
      thinking:
        '树型DP自底向上贪心汇聚：由于所有人最终都要汇集到 0 号首都，以任何节点 u 为根的子树中的所有人，必须全部跨过 (u, parent) 这条边。因此这条边上的乘客数恰好就是 u 子树的总人数 size，所需车数必然为 ⌈size / seats⌉。',
      state: 'dfs(u) 返回以 u 为根的子树中的代表总人数 size。',
      equation: 'edgeFuel(u → parent) = ⌈size(u) / seats⌉；totalFuel = ∑_{u ≠ 0} edgeFuel(u)',
      initAndBounds: '叶子节点 size = 1，驶向父节点耗油 ⌈1 / seats⌉ = 1；首都 0 不向外跨边。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '拼车策略',
        question: '为什么不需要在中途复杂的车站换乘决策？',
        answer:
          '因为无论如何换乘，子树 u 内的所有人都必须通过 (u, parent) 这条唯一的桥梁边到达首都。在通过该边时，将所有人尽可能塞满每辆车（每车 seats 人）是最优策略，所需最少车数就是 ⌈size / seats⌉，具有完美的子问题独立性。',
      },
    ],
  },
  generateSteps: (input: { roads?: number[][]; seats?: number }): DpTraceStep[] => {
    const roads = input?.roads || [[3, 1], [3, 2], [1, 0], [0, 4], [0, 5], [4, 6]];
    const seats = input?.seats || 2;
    const steps: DpTraceStep[] = [];

    // 建树
    const n = 7;
    const tree: number[][] = Array.from({ length: n }, () => []);
    roads.forEach(([u, v]) => {
      if (u < n && v < n) {
        tree[u].push(v);
        tree[v].push(u);
      }
    });

    let totalFuel = 0;
    const sizeMap = new Map<number, number>();
    const fuelMap = new Map<number, number>();

    interface DpNode {
      id: string;
      val: number;
      children: DpNode[];
    }

    function buildHierarchy(u: number, p: number): DpNode {
      const children: DpNode[] = [];
      for (const v of tree[u]) {
        if (v !== p) {
          children.push(buildHierarchy(v, u));
        }
      }
      return { id: String(u), val: u, children };
    }

    const treeRoot = buildHierarchy(0, -1);

    function toDpTree(node: DpNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const sz = sizeMap.get(node.val);
      const fuel = fuelMap.get(node.val);
      const label = sz !== undefined
        ? `市#${node.val}\n${sz}人|耗油${fuel ?? 0}`
        : `市#${node.val}`;

      return {
        id: node.id,
        label,
        value: sz ?? 1,
        state: node.id === activeId ? 'active' : sz !== undefined ? 'computed' : 'default',
        children: node.children.map((c) => toDpTree(c, activeId)).filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🌲 初始化以 0 为首都的城市树（每车最多坐 ${seats} 人），开始后序遍历汇总子树人数并计算跨边油耗`,
        log: `初始化完成：seats = ${seats}, totalFuel = 0`,
        vars: [
          { name: '座位数 seats', value: String(seats) },
          { name: '当前总耗油', value: '0' },
        ],
        metrics: { totalFuel: 0 },
      })
    );

    function dfs(u: number, p: number): number {
      let people = 1;
      for (const v of tree[u]) {
        if (v !== p) {
          people += dfs(v, u);
        }
      }

      const cars = u !== 0 ? Math.ceil(people / seats) : 0;
      if (u !== 0) {
        totalFuel += cars;
        fuelMap.set(u, cars);
      }
      sizeMap.set(u, people);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, String(u)),
          message: u === 0
            ? `👑 首都城市 #0：汇总全树总人数 ${people} 人，全国各分支跨边油耗累计完成！`
            : `城市 #${u}：子树共 ${people} 名代表，驶向父城市 #${p} 需 ⌈${people}/${seats}⌉ = ${cars} 辆车（耗油 ${cars} 升），总油耗累计至 ${totalFuel} 升`,
          log: `节点 #${u}: people=${people}, edgeFuel=${cars}, totalFuel=${totalFuel}`,
          formula: u !== 0 ? 'edgeFuel = ceil(people / seats)' : '首都终点无需跨边',
          formulaSubstituted: u !== 0 ? `${cars} = ceil(${people} / ${seats})` : '—',
          vars: [
            { name: '当前城市', value: `#${u}` },
            { name: '子树人数', value: String(people) },
            { name: '跨边车数/油耗', value: `${cars} 升` },
            { name: '累计总油耗', value: `${totalFuel} 升` },
          ],
          metrics: { totalFuel },
        })
      );

      return people;
    }

    dfs(0, -1);

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 遍历完成！所有代表到达首都的最少总油耗为 ${totalFuel} 升`,
        log: `最终最少油耗 = ${totalFuel}`,
        vars: [{ name: '最终最少油耗', value: `${totalFuel} 升` }],
        metrics: { totalFuel },
      })
    );

    return steps;
  },
};
