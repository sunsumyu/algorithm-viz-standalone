import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneStateDepTree } from './tree-clone';
import { KnapsackStepMatrixCompiler } from './knapsack-step-matrix-compiler';

/** 目标和 (Target Sum, LeetCode 494) 第 73 课轻量策略 (Stage 1-2 树展开, Stage 3 平移表, Stage 4 背包压缩) */
export class TargetSumStandardStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'target-sum-standard';
  public canHandle(modelId: string): boolean { return modelId === 'target-sum-standard' || modelId === 'target-sum'; }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;
    const rawNums = (model.defaultParams as any)?.nums || [1, 1, 1, 1, 1];
    const nums: number[] = (Array.isArray(rawNums) ? rawNums : String(rawNums).split(',')).map(Number);
    const target = Number((model.defaultParams as any)?.target ?? 3);

    if (stage === 1 || stage === 2) return this.generateRecursion(nums, target, Boolean(isMemo || stage === 2), anchorMap);
    if (stage === 3) return this.generateOffset2D(nums, target, anchorMap);
    if (stage === 4) return this.generateBag1D(nums, target, anchorMap);
    return [];
  }

  private generateRecursion(nums: number[], target: number, isMemo: boolean, map?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [], n = nums.length;
    let nodeCount = 0;
    const root: UniversalTreeNode = { id: `node-${++nodeCount}`, r: 0, c: 0, val: 'f(0, 0)', status: 'current', children: [] };
    const stack: Array<{ i: number; curSum: number; label: string }> = [], memo = new Map<string, number>();

    const push = (data: Partial<UniversalStep>, node: UniversalTreeNode) => {
      if (steps.length >= 800) return;
      const slot = Math.min(Math.max(0, node.r), Math.max(0, n - 1));
      steps.push({
        flowPhase: 'forward', actorState: { currentSlot: slot, action: 'walk' },
        activeSlot: slot, highlightSlots: [slot], ...data, activeNodeId: node.id,
        treeRoot: cloneStateDepTree(root),
        callStack: stack.map(f => ({ label: f.label, coord: `${f.i},${f.curSum}` })),
        activeStack: stack.map(f => `${f.i},${f.curSum}`),
      });
    };

    push({ line: map?.callRoot ?? 1, tag: '入口', msg: `🚀 启动${isMemo ? 'HashMap 记忆化' : '暴力'}递归：目标 target=${target}` }, root);

    const dfs = (i: number, sum: number, node: UniversalTreeNode): number => {
      if (steps.length >= 800) return 0;
      stack.push({ i, curSum: sum, label: `f(i=${i}, sum=${sum})` });
      node.status = 'current';

      if (i === n) {
        const ways = sum === target ? 1 : 0;
        node.status = 'base'; node.tag = ways === 1 ? '🎯=1' : '=0';
        push({ flowPhase: 'terminal', line: map?.baseCheck ?? 4, tag: ways ? '触底达成' : '触底不合', msg: `累加和 ${sum} ${ways ? '== target' : '!= target'}，返回 ${ways}` }, node);
        stack.pop(); return ways;
      }

      push({ line: map?.fnEnter ?? 6, tag: '进入', msg: `📥 进入栈帧 f(i=${i}, sum=${sum})，尝试 nums[${i}]=${nums[i]} 分支` }, node);

      const memoKey = `${i},${sum}`;
      if (isMemo && memo.has(memoKey)) {
        const res = memo.get(memoKey)!;
        node.status = 'pruned'; node.tag = `⚡=${res}`;
        push({ line: map?.memoCheck ?? 11, tag: '命中缓存', msg: `⚡ 缓存命中：HashMap[${i}][${sum}] = ${res}` }, node);
        stack.pop(); return res;
      }

      const branch = (sign: number, label: string, lineKey: string, lineFallback: number) => {
        const nextSum = sum + sign * nums[i];
        const child: UniversalTreeNode = { id: `node-${++nodeCount}`, r: i + 1, c: nextSum, val: `f(${i + 1}, ${nextSum})`, edgeLabel: `${sign > 0 ? '+' : '-'}${nums[i]}`, status: 'current', children: [] };
        node.children.push(child);
        push({ line: map?.[lineKey] ?? lineFallback, tag: `${label}分支`, msg: `${label}分支：探访 f(i=${i + 1}, sum=${nextSum})` }, child);
        return dfs(i + 1, nextSum, child);
      };

      const ways1 = branch(1, '+', 'branch1', isMemo ? 14 : 10), ways2 = branch(-1, '−', 'branch2', isMemo ? 15 : 13);
      const res = ways1 + ways2;
      if (isMemo) { memo.set(memoKey, res); push({ line: map?.memoStore ?? 17, tag: '写入缓存', msg: `💾 写入缓存：HashMap[${i}][${sum}] = ${res}` }, node); }
      node.status = 'visited'; node.tag = `=${res}`;
      push({ flowPhase: 'backtrack', line: map?.returnSum ?? map?.return ?? (isMemo ? 18 : 15), tag: '返回', msg: `↩️ 栈帧 f(i=${i}, sum=${sum}) 返回方案数 ${res}` }, node);
      stack.pop(); return res;
    };

    dfs(0, 0, root);
    return steps;
  }

  private generateOffset2D(nums: number[], target: number, map?: Record<string, number>): UniversalStep[] {
    const steps: UniversalStep[] = [], n = nums.length, offset = nums.reduce((a, b) => a + Math.abs(b), 0), cols = 2 * offset + 1;
    const dp = Array.from({ length: n + 1 }, () => new Array(cols).fill(0));
    dp[0][offset] = 1;
    steps.push({ flowPhase: 'forward', line: map?.initDp ?? 7, tag: '初始化', msg: `🚀 初始化二维状态表，offset=${offset}` });

    for (let i = 1; i <= n; i++) {
      const num = nums[i - 1];
      steps.push({ flowPhase: 'forward', line: map?.outerLoopI ?? 9, tag: '外层循环', msg: `📦 外层考察第 ${i} 个数字 nums[${i - 1}]=${num}` });
      for (let j = 0; j < cols; j++) {
        const w1 = j >= num ? dp[i - 1][j - num] : 0, w2 = j + num < cols ? dp[i - 1][j + num] : 0;
        dp[i][j] = w1 + w2;
        steps.push({ flowPhase: 'forward', line: map?.updateCell ?? 14, tag: '转移', msg: `✨ dp[${i}][${j}] = ${w1}+${w2}=${dp[i][j]}`, grid: dp.map(r => [...r]), i, j });
      }
    }
    const targetCol = target + offset, ans = targetCol >= 0 && targetCol < cols ? dp[n][targetCol] : 0;
    steps.push({ flowPhase: 'terminal', line: map?.returnAns ?? 16, tag: '返回', msg: `🏁 offset 填表完毕！答案 = ${ans}` });
    return steps;
  }

  private generateBag1D(nums: number[], target: number, map?: Record<string, number>): UniversalStep[] {
    const sum = nums.reduce((a, b) => a + b, 0), bag = Math.abs(target) <= sum && (sum + target) % 2 === 0 ? (sum + target) / 2 : 0;
    return KnapsackStepMatrixCompiler.compileStage4({
      modelId: 'target-sum-standard', kind: 'target-sum', items: nums.map((num, idx) => ({ index: idx, weight: num, value: 1 })),
      capacity: bag, anchorMap: map,
    });
  }
}
