import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneStateDepTree } from './tree-clone';

/**
 * 目标和 (Target Sum, LeetCode 494) 第 73 课标准版策略模块
 * 支持四种方法：
 * 1. 暴力递归 (+/− 分治)
 * 2. HashMap 记忆化
 * 3. offset 平移二维 DP
 * 4. 01 背包转化（空间压缩）
 */
export class TargetSumStandardStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'target-sum-standard';

  public canHandle(modelId: string): boolean {
    return modelId === 'target-sum-standard';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    const rawNums = (model.defaultParams as any)?.nums || [1, 1, 1, 1, 1];
    const nums: number[] = Array.isArray(rawNums)
      ? rawNums.map(Number)
      : String(rawNums).split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    const target = Number((model.defaultParams as any)?.target ?? 3);

    const n = nums.length;
    const totalSum = nums.reduce((a, b) => a + Math.abs(b), 0);

    switch (stage) {
      case 1:
        return this.generateStage1(nums, target, anchorMap);
      case 2:
        return this.generateStage2(nums, target, anchorMap);
      case 3:
        return this.generateStage3(nums, target, anchorMap);
      case 4:
        return this.generateStage4(nums, target, anchorMap);
      default:
        return [];
    }
  }

  private generateStage1(nums: number[], target: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const maxSteps = 800;

    let nodeIdCounter = 0;
    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: 0,
      val: 'f(0, 0)',
      status: 'current',
      children: [],
    };

    const stack: Array<{ i: number; curSum: number; label: string }> = [];

    const pushStep = (
      stepData: Partial<UniversalStep>,
      currentNode: UniversalTreeNode
    ) => {
      if (steps.length >= maxSteps) return;
      const slotIndex = Math.min(Math.max(0, currentNode.r), Math.max(0, n - 1));
      steps.push({
        flowPhase: 'forward',
        actorState: { currentSlot: slotIndex, action: 'walk' },
        activeSlot: slotIndex,
        highlightSlots: [slotIndex],
        ...stepData,
        activeNodeId: currentNode.id,
        treeRoot: cloneStateDepTree(rootNode),
        callStack: stack.map((frame) => ({
          label: frame.label,
          coord: `${frame.i},${frame.curSum}`,
        })),
        activeStack: stack.map((frame) => `${frame.i},${frame.curSum}`),
      });
    };

    // Step 0: 入口
    pushStep({
      flowPhase: 'forward',
      line: anchorMap?.callRoot ?? 1,
      tag: '入口',
      msg: `🚀 启动目标和暴力递归：对每个 nums[i] 依次尝试 '+' / '−'，目标 target=${target}`,
      vars: [
        { name: 'nums', value: `[${nums.join(', ')}]` },
        { name: 'target', value: String(target) },
        { name: 'i', value: '0' },
        { name: 'sum', value: '0' },
      ],
    }, rootNode);

    // 递归生成步骤
    const dfs = (i: number, curSum: number, node: UniversalTreeNode): number => {
      if (steps.length >= maxSteps) return 0;

      const frameLabel = `f(i=${i}, sum=${curSum})`;
      stack.push({ i, curSum, label: frameLabel });
      node.status = 'current';

      if (i === n) {
        const ways = curSum === target ? 1 : 0;
        node.status = 'base';
        node.tag = ways === 1 ? '🎯=1' : '=0';

        pushStep({
          flowPhase: 'terminal',
          line: anchorMap?.baseCheck ?? 4,
          tag: ways === 1 ? '触底达成' : '触底不合',
          msg: ways === 1
            ? `✅ 累加和恰好等于 target=${target}！返回 1 种有效表达式。`
            : `❌ 累加和 ${curSum} ≠ target=${target}，返回 0。`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'curSum', value: String(curSum) },
            { name: 'return', value: String(ways) },
          ],
        }, node);

        stack.pop();
        return ways;
      }

      // 进入栈帧
      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.fnEnter ?? 6,
        tag: '进入',
        msg: `📥 进入栈帧 f(i=${i}, sum=${curSum})，准备对 nums[${i}]=${nums[i]} 做 +/− 分支。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
          { name: 'nums[i]', value: String(nums[i]) },
        ],
      }, node);

      // 分支 1: +nums[i]
      const nodePlus: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i + 1,
        c: curSum + nums[i],
        val: `f(${i + 1}, ${curSum + nums[i]})`,
        edgeLabel: `+${nums[i]}`,
        status: 'current',
        children: [],
      };
      node.children.push(nodePlus);

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.branch1 ?? 9,
        tag: '+分支',
        msg: `🌿 '+' 分支：给 nums[${i}]=${nums[i]} 添加正号，深入探访 f(i=${i + 1}, sum=${curSum + nums[i]})`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
          { name: 'curSum + nums[i]', value: String(curSum + nums[i]) },
        ],
      }, nodePlus);

      const ways1 = dfs(i + 1, curSum + nums[i], nodePlus);

      // 分支 2: -nums[i]
      const nodeMinus: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i + 1,
        c: curSum - nums[i],
        val: `f(${i + 1}, ${curSum - nums[i]})`,
        edgeLabel: `-${nums[i]}`,
        status: 'current',
        children: [],
      };
      node.children.push(nodeMinus);

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.branch2 ?? 11,
        tag: '−分支',
        msg: `💥 '−' 分支：给 nums[${i}]=${nums[i]} 添加负号，深入探访 f(i=${i + 1}, sum=${curSum - nums[i]})`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
          { name: 'curSum - nums[i]', value: String(curSum - nums[i]) },
        ],
      }, nodeMinus);

      const ways2 = dfs(i + 1, curSum - nums[i], nodeMinus);

      const totalWays = ways1 + ways2;
      node.status = 'visited';
      node.tag = `=${totalWays}`;

      pushStep({
        flowPhase: 'backtrack',
        line: anchorMap?.returnSum ?? 12,
        tag: '返回',
        msg: ` 栈帧 f(i=${i}, sum=${curSum}) 汇聚：+ 分支 (${ways1}) + − 分支 (${ways2}) = ${totalWays} 种。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
          { name: 'ways1', value: String(ways1) },
          { name: 'ways2', value: String(ways2) },
          { name: 'return', value: String(totalWays) },
        ],
      }, node);

      stack.pop();
      return totalWays;
    };

    const finalAns = dfs(0, 0, rootNode);

    pushStep({
      flowPhase: 'terminal',
      line: anchorMap?.callRoot ?? 1,
      tag: '完结',
      msg: `🎉 暴力递归推导完毕！凑出 target=${target} 的不同表达式总数 = ${finalAns}`,
      vars: [
        { name: 'target', value: String(target) },
        { name: 'return', value: String(finalAns) },
      ],
    }, rootNode);

    return steps;
  }

  private generateStage2(nums: number[], target: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const maxSteps = 800;

    let nodeIdCounter = 0;
    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: 0,
      val: 'f(0, 0)',
      status: 'current',
      children: [],
    };

    const stack: Array<{ i: number; curSum: number; label: string }> = [];

    const pushStep = (
      stepData: Partial<UniversalStep>,
      currentNode: UniversalTreeNode
    ) => {
      if (steps.length >= maxSteps) return;
      const slotIndex = Math.min(Math.max(0, currentNode.r), Math.max(0, n - 1));
      steps.push({
        flowPhase: 'forward',
        actorState: { currentSlot: slotIndex, action: 'walk' },
        activeSlot: slotIndex,
        highlightSlots: [slotIndex],
        ...stepData,
        activeNodeId: currentNode.id,
        treeRoot: cloneStateDepTree(rootNode),
        callStack: stack.map((frame) => ({
          label: frame.label,
          coord: `${frame.i},${frame.curSum}`,
        })),
        activeStack: stack.map((frame) => `${frame.i},${frame.curSum}`),
      });
    };

    // Step 0: 入口
    pushStep({
      flowPhase: 'forward',
      line: anchorMap?.callRoot ?? 1,
      tag: '入口',
      msg: `🚀 启动 HashMap 记忆化搜索：用嵌套 HashMap 缓存 (i, curSum) → 方案数`,
      vars: [
        { name: 'nums', value: `[${nums.join(', ')}]` },
        { name: 'target', value: String(target) },
      ],
    }, rootNode);

    const memo = new Map<number, Map<number, number>>();
    for (let k = 0; k <= n; k++) memo.set(k, new Map());

    const dfs = (i: number, curSum: number, node: UniversalTreeNode): number => {
      if (steps.length >= maxSteps) return 0;

      const frameLabel = `f(i=${i}, sum=${curSum})`;
      stack.push({ i, curSum, label: frameLabel });
      node.status = 'current';

      if (i === n) {
        const ways = curSum === target ? 1 : 0;
        node.status = 'base';
        node.tag = ways === 1 ? '🎯=1' : '=0';

        pushStep({
          flowPhase: 'terminal',
          line: anchorMap?.baseCheck ?? 4,
          tag: ways === 1 ? '触底达成' : '触底不合',
          msg: ways === 1 ? `✅ curSum=${curSum} == target=${target}，返回 1。` : `❌ curSum=${curSum} ≠ target=${target}，返回 0。`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'curSum', value: String(curSum) },
            { name: 'return', value: String(ways) }
          ],
        }, node);

        stack.pop();
        return ways;
      }

      // 函数入口
      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.fnEnter ?? 4,
        tag: '进入',
        msg: `📥 进入栈帧 f(i=${i}, sum=${curSum})，准备检查记忆化缓存。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
        ],
      }, node);

      const inner = memo.get(i)!;
      if (inner.has(curSum)) {
        const val = inner.get(curSum)!;
        node.status = 'pruned';
        node.tag = `⚡=${val}`;

        pushStep({
          flowPhase: 'forward',
          line: anchorMap?.memoCheck ?? 11,
          tag: '缓存命中',
          msg: `🎯 缓存命中！(i=${i}, curSum=${curSum}) 已计算过，复用方案数 ${val}`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'curSum', value: String(curSum) },
            { name: 'memo[i][curSum]', value: String(val) },
            { name: 'return', value: String(val) },
          ],
        }, node);

        stack.pop();
        return val;
      }

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.memoCheck ?? 11,
        tag: '缓存未命中',
        msg: `⚪ 缓存未命中：(i=${i}, curSum=${curSum}) 首次探访，开始递归展开。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
        ],
      }, node);

      // 分支 1: +nums[i]
      const nodePlus: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i + 1,
        c: curSum + nums[i],
        val: `f(${i + 1}, ${curSum + nums[i]})`,
        edgeLabel: `+${nums[i]}`,
        status: 'current',
        children: [],
      };
      node.children.push(nodePlus);

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.branch1 ?? 14,
        tag: '+分支',
        msg: `🌿 '+' 分支：给 nums[${i}]=${nums[i]} 添加正号，调用 f(i=${i + 1}, sum=${curSum + nums[i]})`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
        ],
      }, nodePlus);

      const ways1 = dfs(i + 1, curSum + nums[i], nodePlus);

      // 分支 2: -nums[i]
      const nodeMinus: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i + 1,
        c: curSum - nums[i],
        val: `f(${i + 1}, ${curSum - nums[i]})`,
        edgeLabel: `-${nums[i]}`,
        status: 'current',
        children: [],
      };
      node.children.push(nodeMinus);

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.branch2 ?? 15,
        tag: '−分支',
        msg: `💥 '−' 分支：给 nums[${i}]=${nums[i]} 添加负号，调用 f(i=${i + 1}, sum=${curSum - nums[i]})`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
        ],
      }, nodeMinus);

      const ways2 = dfs(i + 1, curSum - nums[i], nodeMinus);

      const res = ways1 + ways2;
      inner.set(curSum, res);
      node.status = 'visited';
      node.tag = `=${res}`;

      pushStep({
        flowPhase: 'forward',
        line: anchorMap?.memoStore ?? 17,
        tag: '写入缓存',
        msg: `💾 写入缓存：HashMap[${i}][${curSum}] = ${res}`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curSum', value: String(curSum) },
          { name: 'res', value: String(res) },
        ],
      }, node);

      pushStep({
        flowPhase: 'backtrack',
        line: anchorMap?.returnSum ?? 16,
        tag: '返回',
        msg: ` 栈帧 f(i=${i}, sum=${curSum}) 返回方案总数 ${res}`,
        vars: [
          { name: 'return', value: String(res) },
        ],
      }, node);

      stack.pop();
      return res;
    };

    const finalAns = dfs(0, 0, rootNode);

    pushStep({
      flowPhase: 'terminal',
      line: anchorMap?.callRoot ?? 1,
      tag: '完结',
      msg: `🎉 HashMap 记忆化搜索完成！凑出 target=${target} 的不同表达式总数 = ${finalAns}`,
      vars: [
        { name: 'target', value: String(target) },
        { name: 'return', value: String(finalAns) },
      ],
    }, rootNode);

    return steps;
  }

  private generateStage3(nums: number[], target: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const n = nums.length;
    const offset = nums.reduce((a, b) => a + Math.abs(b), 0);
    const cols = 2 * offset + 1;

    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(cols).fill(0));
    dp[0][offset] = 1;

    steps.push({
      flowPhase: 'forward',
      line: anchorMap?.initDp ?? 7,
      tag: '初始化',
      msg: `🚀 初始化二维状态表 dp[${n + 1}][${cols}]，offset=${offset}，dp[0][${offset}]=1`,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'offset', value: String(offset) },
        { name: 'cols', value: String(cols) },
      ],
    });

    for (let i = 1; i <= n; i++) {
      const num = nums[i - 1];
      steps.push({
        flowPhase: 'forward',
        line: anchorMap?.outerLoopI ?? 9,
        tag: '外层循环',
        msg: `📦 外层考察第 ${i} 个数字 nums[${i - 1}]=${num}`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'num', value: String(num) },
        ],
      });

      for (let j = 0; j < cols; j++) {
        const actualSum = j - offset;
        const plusCol = j - num;
        const minusCol = j + num;
        const ways1 = plusCol >= 0 && plusCol < cols ? dp[i - 1][plusCol] : 0;
        const ways2 = minusCol >= 0 && minusCol < cols ? dp[i - 1][minusCol] : 0;
        dp[i][j] = ways1 + ways2;

        steps.push({
          flowPhase: 'forward',
          line: anchorMap?.updateCell ?? 14,
          tag: '转移',
          msg: `✨ dp[${i}][${j}] = ${ways1}(+${num}) + ${ways2}(−${num}) = ${dp[i][j]} 种方案（实际和 = ${actualSum}）`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'j', value: String(j) },
            { name: 'actualSum', value: String(actualSum) },
            { name: 'ways1', value: String(ways1) },
            { name: 'ways2', value: String(ways2) },
            { name: 'dp[i][j]', value: String(dp[i][j]) },
          ],
          grid: dp.map(row => [...row]),
          i,
          j,
        });
      }
    }

    const targetCol = target + offset;
    const ans = targetCol >= 0 && targetCol < cols ? dp[n][targetCol] : 0;
    steps.push({
      flowPhase: 'terminal',
      line: anchorMap?.returnAns ?? 16,
      tag: '返回',
      msg: ` offset 二维 DP 填表完毕！dp[${n}][${targetCol}] = ${ans}`,
      vars: [
        { name: 'n', value: String(n) },
        { name: 'targetCol', value: String(targetCol) },
        { name: 'return', value: String(ans) },
      ],
    });

    return steps;
  }

  private generateStage4(nums: number[], target: number, anchorMap?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const sum = nums.reduce((a, b) => a + b, 0);

    steps.push({
      flowPhase: 'forward',
      line: anchorMap?.callRoot ?? 1,
      tag: '入口',
      msg: `🚀 启动 01 背包转化：sum=${sum}, target=${target}`,
      vars: [
        { name: 'nums', value: `[${nums.join(', ')}]` },
        { name: 'sum', value: String(sum) },
        { name: 'target', value: String(target) },
      ],
    });

    const isValid = Math.abs(target) <= sum && (sum + target) % 2 === 0;
    if (!isValid) {
      steps.push({
        flowPhase: 'terminal',
        line: anchorMap?.check ?? 3,
        tag: '无解',
        msg: `🛑 奇偶性或绝对值不满足，返回 0`,
        vars: [{ name: 'return', value: '0' }],
      });
      return steps;
    }

    const t = (sum + target) / 2;
    steps.push({
      flowPhase: 'forward',
      line: anchorMap?.delegate ?? 4,
      tag: '转化',
      msg: `📐 转化公式：sum(P) = (target + sum) / 2 = (${target} + ${sum}) / 2 = ${t}`,
      vars: [
        { name: 't', value: String(t) },
      ],
    });

    const dp = new Array(t + 1).fill(0);
    dp[0] = 1;

    steps.push({
      flowPhase: 'forward',
      line: anchorMap?.subsets_init ?? 7,
      tag: '初始化',
      msg: `📦 初始化 dp[${t + 1}]，dp[0]=1`,
      vars: [
        { name: 't', value: String(t) },
        { name: 'dp[0]', value: '1' },
      ],
    });

    for (const num of nums) {
      steps.push({
        flowPhase: 'forward',
        line: anchorMap?.subsets_outer ?? 9,
        tag: '物品',
        msg: ` 考察物品 num=${num}`,
        vars: [{ name: 'num', value: String(num) }],
      });

      for (let j = t; j >= num; j--) {
        const oldDpJ = dp[j];
        const oldDpJMinusNum = dp[j - num];
        dp[j] += dp[j - num];

        steps.push({
          flowPhase: 'forward',
          line: anchorMap?.subsets_transfer ?? 11,
          tag: '转移',
          msg: `✨ dp[${j}] += dp[${j - num}]: ${oldDpJ} + ${oldDpJMinusNum} = ${dp[j]}`,
          vars: [
            { name: 'j', value: String(j) },
            { name: 'num', value: String(num) },
            { name: 'dp[j]', value: String(dp[j]) },
          ],
          dp1d: [...dp],
          j,
        });
      }
    }

    steps.push({
      flowPhase: 'terminal',
      line: anchorMap?.subsets_return ?? 13,
      tag: '返回',
      msg: `🎉 01 背包方案计数完毕！dp[${t}] = ${dp[t]}`,
      vars: [
        { name: 't', value: String(t) },
        { name: 'return', value: String(dp[t]) },
      ],
    });

    return steps;
  }
}
