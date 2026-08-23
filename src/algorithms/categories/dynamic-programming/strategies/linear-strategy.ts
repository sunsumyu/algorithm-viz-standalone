/**
 * Linear 1D DP Evolution Strategy (一维递推与状态压缩策略)
 * 覆盖：爬楼梯 (climb-stairs), 斐波那契 (fibonacci), 最小花费爬楼梯 (min-cost-climbing-stairs), 打家劫舍 (house-robber) 等
 */

import { DpDemoStep, DpTreeNode } from '../dp-demo-visualizer';
import { IEvolutionStrategy, EvolutionCodeContext, EvolutionStepContext, StageCodeConfig, AlgoCategory } from './types';

export class LinearEvolutionStrategy implements IEvolutionStrategy {
  canHandle(category: AlgoCategory): boolean {
    return category === 'fib-or-climb' || category === 'min-cost' || category === 'robber';
  }

  getCodeConfig(ctx: EvolutionCodeContext): StageCodeConfig | null {
    const { category, stage, algoTitle } = ctx;
    const isMinCost = category === 'min-cost';
    const isRobber = category === 'robber';
    const isFibOrClimb = category === 'fib-or-climb';

    if (stage === 'space-optimized') {
      let javaCode: string[];
      let pyCode: string[];
      let cppCode: string[];
      let jsCode: string[];

      if (isFibOrClimb) {
        javaCode = [
          'class Solution {',
          '    public int solve(int n) { // @step:entry',
          '        // 4. 空间压缩优化：O(1) 滚动变量',
          '        int prev2 = 1, prev1 = 1; // @step:init',
          '        for (int i = 2; i <= n; i++) { // @step:loop',
          '            int curr = prev1 + prev2; // @step:update',
          '            prev2 = prev1; // @step:slide 滑动窗口前移',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, n: int) -> int: # @step:entry',
          '        prev2, prev1 = 1, 1 # @step:init',
          '        for i in range(2, n + 1): # @step:loop',
          '            curr = prev1 + prev2 # @step:update',
          '            prev2, prev1 = prev1, curr # @step:slide',
          '        return prev1 # @step:return',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(int n) { // @step:entry',
          '        int prev2 = 1, prev1 = 1; // @step:init',
          '        for (int i = 2; i <= n; i++) { // @step:loop',
          '            int curr = prev1 + prev2; // @step:update',
          '            prev2 = prev1; // @step:slide',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(n) { // @step:entry',
          '    let prev2 = 1, prev1 = 1; // @step:init',
          '    for (let i = 2; i <= n; i++) { // @step:loop',
          '        const curr = prev1 + prev2; // @step:update',
          '        prev2 = prev1; // @step:slide',
          '        prev1 = curr;',
          '    }',
          '    return prev1; // @step:return',
          '}',
        ];
      } else if (isRobber) {
        javaCode = [
          'class Solution {',
          '    public int solve(int[] nums) { // @step:entry',
          '        int prev2 = 0, prev1 = 0; // @step:init',
          '        for (int x : nums) { // @step:loop',
          '            int curr = Math.max(prev1, prev2 + x); // @step:update',
          '            prev2 = prev1; // @step:slide',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, nums: List[int]) -> int: # @step:entry',
          '        prev2, prev1 = 0, 0 # @step:init',
          '        for x in nums: # @step:loop',
          '            curr = max(prev1, prev2 + x) # @step:update',
          '            prev2, prev1 = prev1, curr # @step:slide',
          '        return prev1 # @step:return',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(vector<int>& nums) { // @step:entry',
          '        int prev2 = 0, prev1 = 0; // @step:init',
          '        for (int x : nums) { // @step:loop',
          '            int curr = max(prev1, prev2 + x); // @step:update',
          '            prev2 = prev1; // @step:slide',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(nums) { // @step:entry',
          '    let prev2 = 0, prev1 = 0; // @step:init',
          '    for (const x of nums) { // @step:loop',
          '        const curr = Math.max(prev1, prev2 + x); // @step:update',
          '        prev2 = prev1; // @step:slide',
          '        prev1 = curr;',
          '    }',
          '    return prev1; // @step:return',
          '}',
        ];
      } else {
        javaCode = [
          'class Solution {',
          '    public int solve(int[] cost) { // @step:entry',
          '        int prev2 = 0, prev1 = 0; // @step:init',
          '        for (int i = 2; i <= cost.length; i++) { // @step:loop',
          '            int curr = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]); // @step:update',
          '            prev2 = prev1; // @step:slide',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, cost: List[int]) -> int: # @step:entry',
          '        prev2, prev1 = 0, 0 # @step:init',
          '        for i in range(2, len(cost) + 1): # @step:loop',
          '            curr = min(prev1 + cost[i - 1], prev2 + cost[i - 2]) # @step:update',
          '            prev2, prev1 = prev1, curr # @step:slide',
          '        return prev1 # @step:return',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(vector<int>& cost) { // @step:entry',
          '        int prev2 = 0, prev1 = 0; // @step:init',
          '        for (int i = 2; i <= cost.size(); i++) { // @step:loop',
          '            int curr = min(prev1 + cost[i - 1], prev2 + cost[i - 2]); // @step:update',
          '            prev2 = prev1; // @step:slide',
          '            prev1 = curr;',
          '        }',
          '        return prev1; // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(cost) { // @step:entry',
          '    let prev2 = 0, prev1 = 0; // @step:init',
          '    for (let i = 2; i <= cost.length; i++) { // @step:loop',
          '        const curr = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]); // @step:update',
          '        prev2 = prev1; // @step:slide',
          '        prev1 = curr;',
          '    }',
          '    return prev1; // @step:return',
          '}',
        ];
      }

      return {
        lines: javaCode,
        languages: { java: javaCode, python: pyCode, cpp: cppCode, javascript: jsCode },
        lineExplanations: {
          2: '🎯 <strong>空间压缩主入口</strong>：初始化滚动变量。',
          4: '🎬 <strong>状态变量初始化</strong>：仅保留直接前驱状态。',
          6: '🔄 <strong>线性状态推进</strong>：计算当前最优解 curr。',
          8: '⚡ <strong>滑动窗口覆写</strong>：prev2 接管 prev1，prev1 接管 curr。',
          10: '🏁 <strong>返回最优解</strong>：返回最新状态变量 prev1。',
        },
        keyPoints: {
          title: `🎯 ${algoTitle} · 空间状态压缩核心要点`,
          summary: '无后效性空间优化：将空间复杂度压缩至极限 O(1)。',
          points: [
            { label: '一、滚动复用原理', desc: '每一步仅依赖前若干项，无需保留历史全量数组。', icon: '💾', badge: '空间 O(1)' },
            { label: '二、时空复杂度', desc: '时间复杂度 <code>O(n)</code>，空间复杂度 <code>O(1)</code>。', icon: '⏱️', badge: '最优解' },
          ],
        },
      };
    }

    if (stage === 'naive-recursive') {
      let javaCode: string[];
      let pyCode: string[];
      let cppCode: string[];
      let jsCode: string[];

      if (isFibOrClimb) {
        javaCode = [
          'class Solution {',
          '    public int solve(int n) { // @step:entry',
          '        return helper(n);',
          '    }',
          '    private int helper(int i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        int left = helper(i - 1); // @step:branch-left',
          '        int right = helper(i - 2); // @step:branch-right',
          '        return left + right; // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, n: int) -> int: # @step:entry',
          '        def helper(i: int) -> int:',
          '            if i <= 2: return i # @step:base-case',
          '            return helper(i - 1) + helper(i - 2) # @step:return',
          '        return helper(n)',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(int n) { return helper(n); } // @step:entry',
          '    int helper(int i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        return helper(i - 1) + helper(i - 2); // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(n) { // @step:entry',
          '    function helper(i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        return helper(i - 1) + helper(i - 2); // @step:return',
          '    }',
          '    return helper(n);',
          '}',
        ];
      } else if (isRobber) {
        javaCode = [
          'class Solution {',
          '    public int solve(int[] nums) { // @step:entry',
          '        return helper(nums, nums.length - 1);',
          '    }',
          '    private int helper(int[] nums, int i) {',
          '        if (i < 0) return 0; // @step:base-case',
          '        if (i == 0) return nums[0];',
          '        int left = helper(nums, i - 1); // @step:branch-left',
          '        int right = helper(nums, i - 2) + nums[i]; // @step:branch-right',
          '        return Math.max(left, right); // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, nums: List[int]) -> int: # @step:entry',
          '        def helper(i: int) -> int:',
          '            if i < 0: return 0 # @step:base-case',
          '            if i == 0: return nums[0]',
          '            return max(helper(i - 1), helper(i - 2) + nums[i]) # @step:return',
          '        return helper(len(nums) - 1)',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(vector<int>& nums) { return helper(nums, nums.size() - 1); } // @step:entry',
          '    int helper(vector<int>& nums, int i) {',
          '        if (i < 0) return 0; // @step:base-case',
          '        if (i == 0) return nums[0];',
          '        return max(helper(nums, i - 1), helper(nums, i - 2) + nums[i]); // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(nums) { // @step:entry',
          '    function helper(i) {',
          '        if (i < 0) return 0; // @step:base-case',
          '        if (i == 0) return nums[0];',
          '        return Math.max(helper(i - 1), helper(i - 2) + nums[i]); // @step:return',
          '    }',
          '    return helper(nums.length - 1);',
          '}',
        ];
      } else {
        javaCode = [
          'class Solution {',
          '    public int solve(int[] cost) { // @step:entry',
          '        return helper(cost, cost.length);',
          '    }',
          '    private int helper(int[] cost, int i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        int left = helper(cost, i - 1) + cost[i - 1]; // @step:branch-left',
          '        int right = helper(cost, i - 2) + cost[i - 2]; // @step:branch-right',
          '        return Math.min(left, right); // @step:return',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, cost: List[int]) -> int: # @step:entry',
          '        def helper(i: int) -> int:',
          '            if i <= 1: return 0 # @step:base-case',
          '            return min(helper(i - 1) + cost[i - 1], helper(i - 2) + cost[i - 2]) # @step:return',
          '        return helper(len(cost))',
        ];
        cppCode = [
          'class Solution {',
          'public:',
          '    int solve(vector<int>& cost) { return helper(cost, cost.size()); } // @step:entry',
          '    int helper(vector<int>& cost, int i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        return min(helper(cost, i - 1) + cost[i - 1], helper(cost, i - 2) + cost[i - 2]); // @step:return',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(cost) { // @step:entry',
          '    function helper(i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        return Math.min(helper(i - 1) + cost[i - 1], helper(i - 2) + cost[i - 2]); // @step:return',
          '    }',
          '    return helper(cost.length);',
          '}',
        ];
      }

      return {
        lines: javaCode,
        languages: { java: javaCode, python: pyCode, cpp: cppCode, javascript: jsCode },
        lineExplanations: {
          2: '🚀 <strong>函数入口</strong>：调用自顶向下递归 helper。',
          6: '🍃 <strong>Base Case</strong>：到达叶子边界直接返回。',
          7: '👈 <strong>左递归分支</strong>：求解第一个子问题。',
          8: '👉 <strong>右递归分支</strong>：求解第二个子问题。',
          9: '✨ <strong>合并子问题解</strong>：归并决策并返回。',
        },
        keyPoints: {
          title: `🎯 ${algoTitle} · 朴素递归核心要点`,
          summary: '自顶向下分治展开：存在指数级 O(2ⁿ) 重叠子问题。',
          points: [
            { label: '一、递归分治', desc: '依据数学递推关系自顶向下分解为子问题。', icon: '🌲', badge: 'Top-Down' },
            { label: '二、重叠子问题', desc: '存在大量重复状态计算，时间复杂度高达 <code>O(2ⁿ)</code>。', icon: '⏱️', badge: '指数级' },
          ],
        },
      };
    }

    if (stage === 'memo-topdown') {
      let javaCode: string[];
      let pyCode: string[];
      let cppCode: string[];
      let jsCode: string[];

      if (isFibOrClimb) {
        javaCode = [
          'class Solution {',
          '    private Integer[] memo;',
          '    public int solve(int n) { // @step:entry',
          '        memo = new Integer[n + 1]; // @step:init',
          '        return helper(n);',
          '    }',
          '    private int helper(int i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        if (memo[i] != null) return memo[i]; // ⚡ O(1) 查表剪枝 @step:memo-hit',
          '        return memo[i] = helper(i - 1) + helper(i - 2); // @step:memo-write',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, n: int) -> int: # @step:entry',
          '        memo = {} # @step:init',
          '        def helper(i: int) -> int:',
          '            if i <= 2: return i # @step:base-case',
          '            if i in memo: return memo[i] # @step:memo-hit',
          '            memo[i] = helper(i - 1) + helper(i - 2) # @step:memo-write',
          '            return memo[i]',
          '        return helper(n)',
        ];
        cppCode = [
          'class Solution {',
          '    vector<int> memo;',
          'public:',
          '    int solve(int n) { // @step:entry',
          '        memo.assign(n + 1, -1); // @step:init',
          '        return helper(n);',
          '    }',
          '    int helper(int i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        if (memo[i] != -1) return memo[i]; // @step:memo-hit',
          '        return memo[i] = helper(i - 1) + helper(i - 2); // @step:memo-write',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(n) { // @step:entry',
          '    const memo = new Array(n + 1).fill(null); // @step:init',
          '    function helper(i) {',
          '        if (i <= 2) return i; // @step:base-case',
          '        if (memo[i] !== null) return memo[i]; // @step:memo-hit',
          '        return memo[i] = helper(i - 1) + helper(i - 2); // @step:memo-write',
          '    }',
          '    return helper(n);',
          '}',
        ];
      } else {
        javaCode = [
          'class Solution {',
          '    private Integer[] memo;',
          '    public int solve(int[] cost) { // @step:entry',
          '        memo = new Integer[cost.length + 1]; // @step:init',
          '        return helper(cost, cost.length);',
          '    }',
          '    private int helper(int[] cost, int i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        if (memo[i] != null) return memo[i]; // ⚡ O(1) 剪枝 @step:memo-hit',
          '        int left = helper(cost, i - 1) + cost[i - 1]; // @step:branch-left',
          '        int right = helper(cost, i - 2) + cost[i - 2]; // @step:branch-right',
          '        return memo[i] = Math.min(left, right); // @step:memo-write',
          '    }',
          '}',
        ];
        pyCode = [
          'class Solution:',
          '    def solve(self, cost: List[int]) -> int: # @step:entry',
          '        memo = {} # @step:init',
          '        def helper(i: int) -> int:',
          '            if i <= 1: return 0 # @step:base-case',
          '            if i in memo: return memo[i] # @step:memo-hit',
          '            memo[i] = min(helper(i - 1) + cost[i - 1], helper(i - 2) + cost[i - 2]) # @step:memo-write',
          '            return memo[i]',
          '        return helper(len(cost))',
        ];
        cppCode = [
          'class Solution {',
          '    vector<int> memo;',
          'public:',
          '    int solve(vector<int>& cost) { // @step:entry',
          '        memo.assign(cost.size() + 1, -1); // @step:init',
          '        return helper(cost, cost.size());',
          '    }',
          '    int helper(vector<int>& cost, int i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        if (memo[i] != -1) return memo[i]; // @step:memo-hit',
          '        return memo[i] = min(helper(cost, i - 1) + cost[i - 1], helper(cost, i - 2) + cost[i - 2]); // @step:memo-write',
          '    }',
          '};',
        ];
        jsCode = [
          'function solve(cost) { // @step:entry',
          '    const memo = new Array(cost.length + 1).fill(null); // @step:init',
          '    function helper(i) {',
          '        if (i <= 1) return 0; // @step:base-case',
          '        if (memo[i] !== null) return memo[i]; // @step:memo-hit',
          '        return memo[i] = Math.min(helper(i - 1) + cost[i - 1], helper(i - 2) + cost[i - 2]); // @step:memo-write',
          '    }',
          '    return helper(cost.length);',
          '}',
        ];
      }

      return {
        lines: javaCode,
        languages: { java: javaCode, python: pyCode, cpp: cppCode, javascript: jsCode },
        lineExplanations: {
          4: '🗺️ <strong>开辟备忘录缓存</strong>：分配 memo 数组。',
          8: '🍃 <strong>Base Case</strong>：边界直接返回。',
          9: '⚡ <strong>O(1) 备忘录命中剪枝</strong>：已计算过直接查表返回！',
          12: '💾 <strong>写入缓存并返回</strong>：记录计算结果。',
        },
        keyPoints: {
          title: `🎯 ${algoTitle} · 记忆化搜索核心要点`,
          summary: '自顶向下 + 线性备忘录：将指数复杂度 O(2ⁿ) 降至线性 O(n)。',
          points: [
            { label: '一、剪枝加速', desc: '借助 memo 数组缓存已求解状态，避免子树重复计算。', icon: '📝', badge: '查表 O(1)' },
            { label: '二、时空复杂度', desc: '时间复杂度 <code>O(n)</code>，空间复杂度 <code>O(n)</code>。', icon: '⚡', badge: '线性优化' },
          ],
        },
      };
    }

    return null;
  }

  buildSteps(ctx: EvolutionStepContext): DpDemoStep[] | null {
    const { algoId, category, stage, baseSteps, params } = ctx;
    const lastStep = baseSteps[baseSteps.length - 1];
    const finalAnswer: string | number =
      lastStep.metrics?.answer ??
      (lastStep.dp1d && lastStep.dp1d[lastStep.dp1d.length - 1] != null
        ? (lastStep.dp1d[lastStep.dp1d.length - 1] as string | number)
        : 0);
    const dp1d = lastStep.dp1d;
    const n = dp1d ? dp1d.length - 1 : 5;

    const isStaircaseAlgo = algoId.includes('climb') || algoId.includes('stair');
    const isMinCost = category === 'min-cost';

    const sourceArr: number[] =
      baseSteps.find((s) => s.staircase?.costs)?.staircase?.costs ||
      (params && (params.cost || params.nums || params.weights)) ||
      (Array.isArray(params) ? params : []);

    function getStageMeta(idx: number): Partial<DpDemoStep> {
      const meta: Partial<DpDemoStep> = {};
      if (isStaircaseAlgo) {
        const curStep = Math.min(n, Math.max(0, idx));
        meta.staircase = {
          totalSteps: n,
          costs: sourceArr,
          dp: dp1d ? [...dp1d] : [],
          currentStep: curStep,
          characterPosition: curStep,
        };
      }
      const matchingBase = baseSteps.find((s) => s.current?.index === idx || s.current?.i === idx) || baseSteps[Math.min(idx, baseSteps.length - 1)];
      if (matchingBase?.thematicMeta) {
        meta.thematicMeta = matchingBase.thematicMeta;
      }
      return meta;
    }

    if (stage === 'space-optimized') {
      const steps: DpDemoStep[] = [];
      let prev2: number = (dp1d && dp1d[0] !== '-' && dp1d[0] != null) ? Number(dp1d[0]) : 0;
      let prev1: number = (dp1d && dp1d[1] !== '-' && dp1d[1] != null) ? Number(dp1d[1]) : (isMinCost ? 0 : 1);

      steps.push({
        ...getStageMeta(0),
        rollingVars: { prev2: '-', prev1: '-', curr: '-', activeCard: 'none', rule: 'solve()' },
        message: `🚀 【主函数入口】初始化滚动变量 prev2 = 1, prev1 = 1，准备 O(1) 空间递推。`,
        log: `entry: solve()`,
        codeLine: { java: 4, python: 3, cpp: 4, javascript: 2 },
        metrics: { '当前执行阶段': '🚀 主函数入口', '空间复杂度': 'O(1) 常数空间' },
        vars: [
          { name: '输入规模 n', value: String(n), type: 'number' },
          { name: '阶段', value: '主函数入口 solve', type: 'string' },
        ],
      });

      for (let i = 2; i <= n; i++) {
        let currVal: number;
        if (isMinCost) {
          const cost1 = sourceArr[i - 1] ?? 0;
          const cost2 = sourceArr[i - 2] ?? 0;
          currVal = Math.min(prev1 + cost1, prev2 + cost2);
        } else {
          currVal = (dp1d && dp1d[i] !== '-' && dp1d[i] != null) ? Number(dp1d[i]) : (prev1 + prev2);
        }

        // Step A: loop condition check
        steps.push({
          ...getStageMeta(i),
          rollingVars: { prev2, prev1, curr: '-', activeCard: 'none', rule: `for i = ${i} <= ${n}` },
          message: `🔄 【循环条件判断】推进到第 ${i} 步 (i <= ${n})，准备根据前两项递推计算当前项。`,
          log: `for i = ${i}`,
          codeLine: {
            java: { primary: 5, context: 4 },
            python: { primary: 4, context: 3 },
            cpp: { primary: 5, context: 4 },
            javascript: { primary: 3, context: 2 },
          },
          metrics: { prev2, prev1, i, '空间复杂度': 'O(1)' },
          vars: [
            { name: 'i (当前步)', value: String(i), type: 'number', changed: true },
            { name: 'prev2', value: String(prev2), type: 'number' },
            { name: 'prev1', value: String(prev1), type: 'number' },
          ],
        });

        // Step B: compute curr
        steps.push({
          ...getStageMeta(i),
          rollingVars: { prev2, prev1, curr: currVal, activeCard: 'curr', rule: `curr = ${currVal}` },
          message: `✨ 【计算当前最优解 curr】推进到第 ${i} 步：curr = prev1 (${prev1}) + prev2 (${prev2}) = ${currVal}。`,
          log: `step ${i}: curr = ${currVal}`,
          codeLine: {
            java: { primary: 6, context: 5 },
            python: { primary: 5, context: 4 },
            cpp: { primary: 6, context: 5 },
            javascript: { primary: 4, context: 3 },
          },
          metrics: { prev2, prev1, curr: currVal, i, '空间复杂度': 'O(1)' },
          vars: [
            { name: 'i (当前步)', value: String(i), type: 'number' },
            { name: 'prev2', value: String(prev2), type: 'number' },
            { name: 'prev1', value: String(prev1), type: 'number' },
            { name: 'curr', value: String(currVal), type: 'number', changed: true },
          ],
        });

        // Step C: slide variables
        steps.push({
          ...getStageMeta(i),
          rollingVars: { prev2: prev1, prev1: currVal, curr: currVal, activeCard: 'prev1', rule: `prev2=${prev1}, prev1=${currVal}` },
          message: `🔄 【滚动覆写前移】滑动窗口前移：prev2 = ${prev1}; prev1 = ${currVal};。`,
          log: `slide: prev2=${prev1}, prev1=${currVal}`,
          codeLine: {
            java: { primary: [7, 8], context: 5 },
            python: { primary: 6, context: 4 },
            cpp: { primary: [7, 8], context: 5 },
            javascript: { primary: [5, 6], context: 3 },
          },
          metrics: { prev2: prev1, prev1: currVal, i, '空间复杂度': 'O(1)' },
          vars: [
            { name: 'prev2 (前移更新)', value: String(prev1), type: 'number', changed: true },
            { name: 'prev1 (前移更新)', value: String(currVal), type: 'number', changed: true },
          ],
        });

        prev2 = prev1;
        prev1 = currVal;
      }

      steps.push({
        ...getStageMeta(n),
        rollingVars: { prev2, prev1, curr: finalAnswer, activeCard: 'prev1', rule: `return ${finalAnswer};` },
        message: `🏁 【计算完毕返回】执行 return prev1 (${finalAnswer})，全程仅使用 O(1) 常数额外空间。`,
        log: `return: ${finalAnswer}`,
        codeLine: { java: 10, python: 7, cpp: 10, javascript: 7 },
        metrics: { answer: finalAnswer, '空间复杂度': 'O(1) 常数空间' },
        vars: [
          { name: '最终最优解', value: String(finalAnswer), type: 'number', changed: true },
        ],
      });

      return steps;
    }

    if (stage === 'naive-recursive' || stage === 'memo-topdown') {
      const steps: DpDemoStep[] = [];
      let nodeIdCounter = 0;
      let calls = 0;
      const isMemo = stage === 'memo-topdown';
      const memoCache = new Map<number, number>();

      function createTreeNode(k: number): DpTreeNode {
        return {
          id: 'tree_node_' + (nodeIdCounter++),
          val: `f(${k})`,
          status: 'current',
          children: [],
        };
      }

      function cloneTree(node: DpTreeNode | null): DpTreeNode | null {
        if (!node) return null;
        return {
          id: node.id,
          val: node.val,
          status: node.status,
          tag: node.tag,
          children: node.children ? node.children.map(cloneTree).filter((c): c is DpTreeNode => c !== null) : [],
        };
      }

      const problemScale = Math.min(n, 5);
      const rootTree = createTreeNode(problemScale);

      // Step 0: Main entry
      steps.push({
        ...getStageMeta(problemScale),
        tree: cloneTree(rootTree),
        message: `🚀 【主函数入口】准备自顶向下分治递归求解 f(${problemScale})。`,
        log: `entry: f(${problemScale})`,
        codeLine: isMemo
          ? { java: 4, python: 9, cpp: 6, javascript: 8 }
          : { java: 3, python: 6, cpp: 3, javascript: 6 },
        metrics: { '当前执行阶段': '🚀 主函数入口', '目标规模': `f(${problemScale})`, '总函数调用': 0 },
        vars: [
          { name: 'i (子问题规模)', value: String(problemScale), type: 'number' },
          { name: '目标规模', value: `f(${problemScale})`, type: 'string' },
          { name: 'n (目标规模)', value: String(n), type: 'number' },
        ],
      });

      function recurseLinear(k: number, currentSubtree: DpTreeNode, depth: number): number {
        calls++;
        currentSubtree.status = 'current';

        // 1. Enter function header
        steps.push({
          ...getStageMeta(k),
          tree: cloneTree(rootTree),
          message: `📥 【进入 helper 函数】求解 f(i = ${k})，当前递归深度 depth = ${depth}。`,
          log: `helper(${k}) [调用 #${calls}]`,
          codeLine: isMemo
            ? { java: 7, python: 4, cpp: 8, javascript: 3 }
            : { java: 5, python: 3, cpp: 4, javascript: 2 },
          metrics: { '当前子问题': `f(${k})`, '递归深度': depth, '总函数调用': calls },
          vars: [
            { name: 'i (子问题规模)', value: String(k), type: 'number', changed: true },
            { name: '递归深度', value: `第 ${depth} 层`, type: 'string' },
            { name: 'n (目标规模)', value: String(n), type: 'number' },
          ],
        });

        // 2. Base case
        const isBaseCase = algoId.includes('fib') ? k <= 1 : k <= 2;
        if (isBaseCase) {
          const val = isMinCost ? 0 : (algoId.includes('fib') && k === 0 ? 0 : (k === 0 ? 0 : k));
          currentSubtree.tag = '=' + val;
          currentSubtree.status = 'visited';
          steps.push({
            ...getStageMeta(k),
            tree: cloneTree(rootTree),
            message: `🍃 【Base Case 命中】子问题规模 i = ${k} <= 2，直接返回基础值 ${val}。`,
            log: `base: f(${k}) ➔ ${val}`,
            codeLine: isMemo
              ? { java: 8, python: 5, cpp: 9, javascript: 4 }
              : { java: 6, python: 4, cpp: 5, javascript: 3 },
            metrics: { '当前子问题': `f(${k})`, '返回值': val, '总函数调用': calls },
            vars: [
              { name: 'i (子问题规模)', value: String(k), type: 'number' },
              { name: 'Base Case 结果', value: String(val), type: 'number', changed: true },
              { name: 'n (目标规模)', value: String(n), type: 'number' },
            ],
          });
          return val;
        }

        // 3. Memo check
        if (isMemo && memoCache.has(k)) {
          const cached = memoCache.get(k)!;
          currentSubtree.tag = `=${cached} (HIT)`;
          currentSubtree.status = 'visited';
          steps.push({
            ...getStageMeta(k),
            tree: cloneTree(rootTree),
            message: `⚡ 【备忘录命中剪枝】memo[${k}] 命中缓存 ${cached}！直接 O(1) 查表返回。`,
            log: `memo hit: memo[${k}] = ${cached}`,
            codeLine: { java: 9, python: 6, cpp: 10, javascript: 5 },
            metrics: { '当前子问题': `f(${k})`, '命中缓存': cached, '剪枝效率': 'O(1)' },
            vars: [
              { name: 'i (子问题规模)', value: String(k), type: 'number' },
              { name: 'memo 缓存命中', value: String(cached), type: 'number', changed: true },
              { name: 'n (目标规模)', value: String(n), type: 'number' },
            ],
          });
          return cached;
        }

        // 4. Branch 1: helper(k - 1)
        steps.push({
          ...getStageMeta(k),
          tree: cloneTree(rootTree),
          message: `👈 【执行左分支调用】准备调用 helper(i - 1) 即 helper(${k - 1})。`,
          log: `call left: helper(${k - 1})`,
          codeLine: isMemo
            ? { java: 10, python: 7, cpp: 11, javascript: 6 }
            : { java: 7, python: 5, cpp: 6, javascript: 4 },
          metrics: { '当前子问题': `f(${k})`, '执行动作': '👈 左分支递归' },
          vars: [
            { name: 'i (子问题规模)', value: String(k), type: 'number' },
            { name: '分支指令', value: `helper(${k - 1})`, type: 'string', changed: true },
            { name: 'n (目标规模)', value: String(n), type: 'number' },
          ],
        });

        const leftNode = createTreeNode(k - 1);
        currentSubtree.children = [leftNode];
        const leftVal = recurseLinear(k - 1, leftNode, depth + 1);

        // 5. Branch 2: helper(k - 2)
        steps.push({
          ...getStageMeta(k),
          tree: cloneTree(rootTree),
          message: `👉 【执行右分支调用】准备调用 helper(i - 2) 即 helper(${k - 2})。`,
          log: `call right: helper(${k - 2})`,
          codeLine: isMemo
            ? { java: 10, python: 7, cpp: 11, javascript: 6 }
            : { java: 8, python: 5, cpp: 6, javascript: 4 },
          metrics: { '当前子问题': `f(${k})`, '执行动作': '👉 右分支递归' },
          vars: [
            { name: 'i (子问题规模)', value: String(k), type: 'number' },
            { name: '分支指令', value: `helper(${k - 2})`, type: 'string', changed: true },
            { name: 'n (目标规模)', value: String(n), type: 'number' },
          ],
        });

        const rightNode = createTreeNode(k - 2);
        currentSubtree.children.push(rightNode);
        const rightVal = recurseLinear(k - 2, rightNode, depth + 1);

        // 6. Merge and return
        const total = leftVal + rightVal;
        if (isMemo) memoCache.set(k, total);

        currentSubtree.tag = '=' + total;
        currentSubtree.status = 'visited';

        steps.push({
          ...getStageMeta(k),
          tree: cloneTree(rootTree),
          message: isMemo
            ? `💾 【写入备忘录并返回】回溯至 f(${k})：memo[${k}] = ${leftVal} + ${rightVal} = ${total}，return ${total}。`
            : `🔄 【回溯归并】回溯至 f(${k})：合并 left (${leftVal}) + right (${rightVal}) ➔ return ${total}。`,
          log: `merge: f(${k}) = ${total}`,
          codeLine: isMemo
            ? { java: 10, python: 8, cpp: 11, javascript: 6 }
            : { java: 9, python: 5, cpp: 6, javascript: 4 },
          metrics: { '当前子问题': `f(${k})`, '合并结果': total },
          vars: [
            { name: 'i (子问题规模)', value: String(k), type: 'number' },
            { name: 'left 左分支解', value: String(leftVal), type: 'number' },
            { name: 'right 右分支解', value: String(rightVal), type: 'number' },
            { name: isMemo ? '写入 memo 缓存' : '当前解', value: String(total), type: 'number', changed: true },
            { name: 'n (目标规模)', value: String(n), type: 'number' },
          ],
        });

        return total;
      }

      const finalLinearAns = recurseLinear(problemScale, rootTree, 1);

      // Final Algorithm Completion Step
      steps.push({
        ...getStageMeta(problemScale),
        tree: cloneTree(rootTree),
        message: `🏁 【全局推演完毕】自顶向下分治求解完成！最终求得 f(${problemScale}) = ${finalLinearAns}。`,
        log: `final return: solve(${problemScale}) = ${finalLinearAns}`,
        codeLine: isMemo
          ? { java: 4, python: 9, cpp: 6, javascript: 8 }
          : { java: 3, python: 6, cpp: 3, javascript: 6 },
        metrics: { '最终计算结果': finalLinearAns, '算法状态': '🏁 推演完成' },
        vars: [
          { name: '最终计算结果', value: String(finalLinearAns), type: 'number', changed: true },
        ],
      });

      return steps;
    }

    return null;
  }
}
