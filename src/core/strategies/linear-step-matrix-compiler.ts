import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build1DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export interface LinearCompileOptions {
  modelId: string;
  stage: number;
  n: number;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  customData?: any;
}

/**
 * 基础线性 DP 统一步骤矩阵流水线编译器 (LinearStepMatrixCompiler Deep Module)
 * 遵循流水线模式 (Pipeline) 与策略模式 (Strategy Pattern)，统一编译：
 * 1. Stage 1: 暴力递归树 (DFS Recursion Tree & Subproblem Overlap)
 * 2. Stage 2: 记忆化搜索 (Memoization Pruning & O(1) Cache Hit)
 * 3. Stage 3: 一维 DP 状态表递推 (Bottom-Up Tabulation)
 * 4. Stage 4: 空间压缩与滚动变量 (Rolling Variable Space Optimization)
 * 5. Stage 5: 数学极值进阶与封闭解 (Closed-form Math / Matrix Exponentiation / Greedy)
 */
export class LinearStepMatrixCompiler {
  /**
   * 统一编译入口
   */
  public static compile(model: IYamlAlgorithmModel, options: LinearCompileOptions): UniversalStep[] {
    const { stage, n, isMemo, anchorMap } = options;
    const modelId = model.id;

    switch (stage) {
      case 1:
      case 2:
        return this.compileStage1or2(model, n, Boolean(isMemo), anchorMap);
      case 3:
        return this.compileStage3(model, n, anchorMap);
      case 4:
        return this.compileStage4(model, n, anchorMap);
      case 5:
        return this.compileStage5(model, n, anchorMap);
      default:
        return [];
    }
  }

  /**
   * Stage 1 & 2: 递归树与记忆化剪枝
   */
  public static compileStage1or2(
    model: IYamlAlgorithmModel,
    nVal: number,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const modelId = model.id;
    const generated: UniversalStep[] = [];
    const memoCache: Record<number, number> = {};
    let callCount = 0;
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 1);
    const lineBoundary = anchorMap?.boundary || (isMemo ? 8 : 2);
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 9 : 3);
    const lineBranchLeft = anchorMap?.branch_left || (isMemo ? 10 : 3);
    const lineBranchRight = anchorMap?.branch_right || (isMemo ? 11 : 4);
    const lineCombine = anchorMap?.combine || (isMemo ? 12 : 5);
    const lineReturn = anchorMap?.return || (isMemo ? 5 : 5);

    // 针对不同算法配置元数据
    let funcName = 'solve';
    let maxSafeN = 6;
    if (modelId === 'fibonacci') {
      funcName = 'fib';
      maxSafeN = 6;
    } else if (modelId === 'climb-stairs') {
      funcName = 'climbStairs';
      maxSafeN = 5;
    } else if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
      funcName = 'minCost';
      maxSafeN = 4;
    } else if (modelId === 'integer-break') {
      funcName = 'integerBreak';
      maxSafeN = 6;
    } else if (modelId === 'unique-bst') {
      funcName = 'numTrees';
      maxSafeN = 4;
    } else if (modelId === 'decode-ways') {
      funcName = 'numDecodings';
      maxSafeN = 4;
    }

    const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), maxSafeN);
    const dpState: number[] = new Array(n + 1).fill(null);

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: n,
      c: 0,
      val: `${funcName}(${n})`,
      status: 'current',
      children: []
    };

    function isBase(k: number): boolean {
      if (modelId === 'fibonacci') return k <= 0 || k === 1;
      if (modelId === 'climb-stairs') return k <= 1;
      if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') return k <= 1;
      if (modelId === 'integer-break') return k <= 2;
      if (modelId === 'unique-bst') return k <= 1;
      if (modelId === 'decode-ways') return k <= 1;
      return k <= 1;
    }

    function getBaseVal(k: number): number {
      if (modelId === 'fibonacci') return k <= 0 ? 0 : 1;
      if (modelId === 'climb-stairs') return 1;
      if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') return 0;
      if (modelId === 'integer-break') return 1;
      if (modelId === 'unique-bst') return 1;
      if (modelId === 'decode-ways') return 1;
      return 1;
    }

    function dfs(k: number, currentNode: UniversalTreeNode): number {
      callCount++;
      const isRepeated = !isMemo && memoCache[k] !== undefined;
      currentNode.status = 'current';
      if (isRepeated) {
        currentNode.tag = '⚠️重复';
      }

      generated.push({
        type: 'dfs-call',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineEntry,
        tag: `调用 #${callCount} (${funcName}(${k}))`,
        log: `| 📥 进入 ${funcName}(n=${k}) [调用 #${callCount}]`,
        msg: `📥 进入 <code>${funcName}(${k})</code>，向下展开子状态分支。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (isBase(k)) {
        const baseVal = getBaseVal(k);
        dpState[k] = baseVal;
        currentNode.status = 'base';
        currentNode.tag = `= ${baseVal}`;

        generated.push({
          type: 'boundary',
          i: 0,
          j: k,
          activeSlot: k,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineBoundary,
          tag: 'Base Case',
          log: `| 🎬 满足 Base Case: ${funcName}(${k}) = ${baseVal}`,
          msg: `🎬 达到基础边界条件：<code>${funcName}(${k}) = <strong>${baseVal}</strong></code>，直接返回。`,
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        return baseVal;
      }

      if (isMemo && memoCache[k] !== undefined) {
        currentNode.status = 'pruned';
        currentNode.tag = `⚡=${memoCache[k]}`;

        generated.push({
          type: 'cache-hit',
          i: 0,
          j: k,
          activeSlot: k,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${k}] 已缓存 ${memoCache[k]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${k}]</code> 已命中缓存 <strong>${memoCache[k]}</strong>，无需重复递归！`,
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        return memoCache[k];
      }

      memoCache[k] = (memoCache[k] || 0) + 1;

      let res = 0;

      if (modelId === 'integer-break') {
        // 整数拆分多分支枚举
        let maxProd = 0;
        for (let j = 1; j <= Math.floor(k / 2); j++) {
          const childNode: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: k - j,
            c: j,
            val: `拆分 ${j}+(${k - j})`,
            status: 'normal',
            children: []
          };
          currentNode.children.push(childNode);

          generated.push({
            type: 'branch-left',
            i: 0,
            j: k,
            activeSlot: k,
            grid: [JSON.parse(JSON.stringify(dpState))],
            memo: [...dpState],
            line: lineBranchLeft,
            tag: `拆出 ${j}`,
            log: `| ↙️ 枚举拆出 ${j}，剩余 ${k - j}`,
            msg: `枚举拆出 <code>j = ${j}</code>，子问题为拆分 <code>${k - j}</code>。`,
            activeNodeId: currentNode.id,
            treeRoot: cloneTree(rootNode)
          });

          const subVal = dfs(k - j, childNode);
          const currentProd = Math.max(j * (k - j), j * subVal);
          maxProd = Math.max(maxProd, currentProd);
        }
        res = maxProd;
      } else if (modelId === 'unique-bst') {
        // BST 笛卡尔积枚举
        let totalWays = 0;
        for (let j = 1; j <= k; j++) {
          const childLeft: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: j - 1,
            c: 0,
            val: `左子树(${j - 1})`,
            status: 'normal',
            children: []
          };
          const childRight: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: k - j,
            c: 0,
            val: `右子树(${k - j})`,
            status: 'normal',
            children: []
          };
          currentNode.children.push(childLeft, childRight);

          const leftWays = dfs(j - 1, childLeft);
          const rightWays = dfs(k - j, childRight);
          totalWays += leftWays * rightWays;
        }
        res = totalWays;
      } else {
        // 标准二分支 (Fibonacci, ClimbStairs, MinCost, DecodeWays)
        const leftNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: k - 1,
          c: 0,
          val: `${funcName}(${k - 1})`,
          status: 'normal',
          children: []
        };
        currentNode.children.push(leftNode);

        generated.push({
          type: 'branch-left',
          i: 0,
          j: k,
          activeSlot: k,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineBranchLeft,
          tag: `计算 ${funcName}(${k - 1})`,
          log: `| ↙️ 递归求解左分支 ${funcName}(${k - 1})`,
          msg: `↙️ 执行 <code>${funcName}(${k - 1})</code>，进入左子分支计算。`,
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const leftVal = dfs(k - 1, leftNode);

        const rightNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: k - 2,
          c: 0,
          val: `${funcName}(${k - 2})`,
          status: 'normal',
          children: []
        };
        currentNode.children.push(rightNode);

        generated.push({
          type: 'branch-right',
          i: 0,
          j: k,
          activeSlot: k,
          grid: [JSON.parse(JSON.stringify(dpState))],
          memo: [...dpState],
          line: lineBranchRight,
          tag: `计算 ${funcName}(${k - 2})`,
          log: `| ↘️ 递归求解右分支 ${funcName}(${k - 2}) [左分支已得 ${leftVal}]`,
          msg: `↘️ 执行 <code>${funcName}(${k - 2})</code>，左分支已得 ${leftVal}，进入右子分支。`,
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const rightVal = dfs(k - 2, rightNode);

        if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
          const cost = [10, 15, 20, 25, 30];
          const cost1 = cost[k - 1] || 10;
          const cost2 = cost[k - 2] || 15;
          res = Math.min(leftVal + cost1, rightVal + cost2);
        } else {
          res = leftVal + rightVal;
        }
      }

      if (isMemo) memoCache[k] = res;
      dpState[k] = res;
      currentNode.status = 'visited';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i: 0,
        j: k,
        activeSlot: k,
        grid: [JSON.parse(JSON.stringify(dpState))],
        memo: [...dpState],
        line: lineCombine,
        tag: '合并子问题',
        log: `| ✨ 合并: ${funcName}(${k}) = ${res}${isMemo ? ' [写入备忘录]' : ''}`,
        msg: `✨ 汇总子问题：<code>${funcName}(${k}) = <strong>${res}</strong></code>${isMemo ? '，写入 memo' : ''}。`,
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      return res;
    }

    const total = dfs(n, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: n,
      activeSlot: n,
      grid: [JSON.parse(JSON.stringify(dpState))],
      memo: [...dpState],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 最终答案: ${funcName}(${n}) = ${total}`,
      msg: `🏆 演化计算完成！最终结果: <code>${funcName}(${n}) = <strong>${total}</strong></code>。`,
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  /**
   * Stage 3: 一维自底向上 DP 表递推
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const modelId = model.id;
    const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];
    const dp = new Array(n + 1).fill(null);

    const lineInit = anchorMap?.init || 3;
    const lineInitVal = anchorMap?.init_val || 4;
    const lineLoopInner = anchorMap?.loop_j || (anchorMap?.transfer ? anchorMap.transfer - 1 : 5);
    const lineTransfer = anchorMap?.transfer || 7;
    const lineReturn = anchorMap?.return || 9;

    // 为所有线性 DP 统一构建二维状态网格 (nCols 列排列)，将一维索引 k 映射为 (row, col)
    const nCols = Math.max(n + 1, 3); // 列数 = dp 数组长度
    const mRows = 1;                  // 单行展示
    const matrix2d: (number | null)[][] = [new Array(nCols).fill(null)];

    /** 将一维 dp 索引 k 映射为二维网格坐标 */
    const toRC = (k: number): { r: number; c: number } => ({ r: 0, c: Math.min(k, nCols - 1) });

    /** 同步 dp 数组到二维矩阵 */
    const syncMatrix = (): void => {
      for (let k = 0; k <= n; k++) {
        matrix2d[0][k] = dp[k];
      }
    };

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: '初始化 DP 数组',
      log: `| 📦 创建一维 DP 状态数组 dp[0..${n}]`,
      msg: `创建长度为 ${n + 1} 的一维 DP 数组，准备自底向上顺序填表。`
    });

    if (modelId === 'fibonacci') {
      dp[0] = 0;
      syncMatrix();
      const rc0 = toRC(0);
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: rc0.r,
        j: rc0.c,
        activeSlot: 0,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'Base Case dp[0]=0',
        log: `| 🎬 初始化 Base Case: dp[0] = 0`,
        msg: `初始化 <code>dp[0] = 0</code>。`
      });
      if (n >= 1) {
        dp[1] = 1;
        syncMatrix();
        const rc1 = toRC(1);
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: rc1.r,
          j: rc1.c,
          activeSlot: 1,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code>。`
        });
      }
      for (let i = 2; i <= n; i++) {
        const sum = dp[i - 1] + dp[i - 2];
        dp[i] = sum;
        syncMatrix();
        const rc = toRC(i);
        const rcPrev1 = toRC(i - 1);
        const rcPrev2 = toRC(i - 2);
        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: rc.r,
          j: rc.c,
          topI: rcPrev2.r,
          topJ: rcPrev2.c,
          leftI: rcPrev1.r,
          leftJ: rcPrev1.c,
          activeSlot: i,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${sum}`,
          log: `| 🔄 dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]}) = ${sum}`,
          msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = <strong>${sum}</strong></code>。`
        });
      }
    } else if (modelId === 'climb-stairs') {
      dp[0] = 1;
      dp[1] = 1;
      syncMatrix();
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'Base Case dp[0]=1',
        log: `| 🎬 初始化 Base Case: dp[0] = 1`,
        msg: `初始化 <code>dp[0] = 1</code>。`
      });
      if (n >= 1) {
        const rc1 = toRC(1);
        steps.push({
          type: 'init-val',
          line: lineInitVal,
          i: rc1.r,
          j: rc1.c,
          activeSlot: 1,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: 'Base Case dp[1]=1',
          log: `| 🎬 初始化 Base Case: dp[1] = 1`,
          msg: `初始化 <code>dp[1] = 1</code>。`
        });
      }
      for (let i = 2; i <= n; i++) {
        const sum = dp[i - 1] + dp[i - 2];
        dp[i] = sum;
        syncMatrix();
        const rc = toRC(i);
        const rcPrev1 = toRC(i - 1);
        const rcPrev2 = toRC(i - 2);
        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: rc.r,
          j: rc.c,
          topI: rcPrev2.r,
          topJ: rcPrev2.c,
          leftI: rcPrev1.r,
          leftJ: rcPrev1.c,
          activeSlot: i,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${sum}`,
          log: `| 🔄 dp[${i}] = dp[${i - 1}](${dp[i - 1]}) + dp[${i - 2}](${dp[i - 2]}) = ${sum}`,
          msg: `状态转移：<code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = <strong>${sum}</strong></code>。`
        });
      }
    } else if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
      const cost = [10, 15, 20, 25, 30, 35, 40];
      dp[0] = 0;
      dp[1] = 0;
      syncMatrix();
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'dp[0]=0, dp[1]=0',
        log: `| 🎬 自由起跳: dp[0] = 0, dp[1] = 0`,
        msg: `初始化第 0 阶与第 1 阶自由起跳花费为 <code>0</code>。`
      });
      for (let i = 2; i <= n; i++) {
        const c1 = dp[i - 1] + (cost[i - 1] || 10);
        const c2 = dp[i - 2] + (cost[i - 2] || 15);
        dp[i] = Math.min(c1, c2);
        syncMatrix();
        const rc = toRC(i);
        const rcPrev1 = toRC(i - 1);
        const rcPrev2 = toRC(i - 2);
        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: rc.r,
          j: rc.c,
          topI: rcPrev2.r,
          topJ: rcPrev2.c,
          leftI: rcPrev1.r,
          leftJ: rcPrev1.c,
          activeSlot: i,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${dp[i]}`,
          log: `| 🔄 dp[${i}] = min(dp[${i - 1}]+cost[${i - 1}], dp[${i - 2}]+cost[${i - 2}]) = min(${c1}, ${c2}) = ${dp[i]}`,
          msg: `状态转移：<code>dp[${i}] = min(${c1}, ${c2}) = <strong>${dp[i]}</strong></code>。`
        });
      }
    } else if (modelId === 'integer-break') {
      dp[2] = 1;
      syncMatrix();
      const rcBase = toRC(2);
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: rcBase.r,
        j: rcBase.c,
        activeSlot: 2,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'Base Case dp[2]=1',
        log: `| 🎬 初始化 Base Case: dp[2] = 1 (2=1+1, 1*1=1)`,
        msg: `初始化 <code>dp[2] = 1</code>。`
      });

      for (let i = 3; i <= n; i++) {
        let maxVal = 0;
        for (let j = 1; j <= Math.floor(i / 2); j++) {
          const cur = Math.max(j * (i - j), j * (dp[i - j] || 0));
          maxVal = Math.max(maxVal, cur);
        }
        dp[i] = maxVal;
        syncMatrix();
        const rc = toRC(i);
        const rcPrev = toRC(i - 1);
        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: rc.r,
          j: rc.c,
          leftI: rcPrev.r,
          leftJ: rcPrev.c,
          activeSlot: i,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${maxVal}`,
          log: `| 🔄 拆分整数 ${i}: 最大乘积 dp[${i}] = ${maxVal}`,
          msg: `状态转移：拆分正整数 <code>${i}</code> 获得最大乘积 <code>dp[${i}] = <strong>${maxVal}</strong></code>。`
        });
      }
    } else if (modelId === 'unique-bst') {
      dp[0] = 1;
      dp[1] = 1;
      syncMatrix();
      steps.push({
        type: 'init-val',
        line: lineInitVal,
        i: 0,
        j: 0,
        activeSlot: 0,
        grid: JSON.parse(JSON.stringify(matrix2d)),
        dp1d: [...dp],
        memo: [...dp],
        tag: 'dp[0]=1, dp[1]=1',
        log: `| 🎬 空树与单节点树基础形态: dp[0] = 1, dp[1] = 1`,
        msg: `初始化空树与单节点 BST 数量 <code>dp[0] = 1, dp[1] = 1</code>。`
      });
      for (let i = 2; i <= n; i++) {
        let total = 0;
        for (let j = 1; j <= i; j++) {
          total += (dp[j - 1] || 1) * (dp[i - j] || 1);
        }
        dp[i] = total;
        syncMatrix();
        const rc = toRC(i);
        const rcPrev = toRC(i - 1);
        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: rc.r,
          j: rc.c,
          leftI: rcPrev.r,
          leftJ: rcPrev.c,
          activeSlot: i,
          grid: JSON.parse(JSON.stringify(matrix2d)),
          dp1d: [...dp],
          memo: [...dp],
          tag: `dp[${i}] = ${total}`,
          log: `| 🔄 ${i} 个节点 BST 笛卡尔积分形态: dp[${i}] = ${total}`,
          msg: `状态转移：<code>${i}</code> 个节点的不同二叉搜索树形态总数 <code>dp[${i}] = <strong>${total}</strong></code>。`
        });
      }
    }

    const rcFinal = toRC(n);
    steps.push({
      type: 'return',
      line: lineReturn,
      i: rcFinal.r,
      j: rcFinal.c,
      activeSlot: n,
      grid: JSON.parse(JSON.stringify(matrix2d)),
      dp1d: [...dp],
      memo: [...dp],
      tag: '最终答案',
      log: `| 🏆 填表计算完成！最终结果 dp[${n}] = ${dp[n]}`,
      msg: `🏆 递推填表完成！最终答案: <code>dp[${n}] = <strong>${dp[n]}</strong></code>。`
    });

    for (const step of steps) {
      step.treeRoot = build1DDPDependencyTree(n, modelId, step.dp1d, step.activeSlot ?? step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, 0, step.activeSlot ?? step.j);
    }

    return steps;
  }

  /**
   * Stage 4: 空间滚动压缩 (O(1) Rolling Variable Space)
   */
  public static compileStage4(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const modelId = model.id;
    const n = Math.min(Math.max(nVal || (modelId === 'fibonacci' ? 6 : 5), 1), 10);
    const steps: UniversalStep[] = [];

    const lineInit = anchorMap?.init || 3;
    const lineAccumulate = anchorMap?.accumulate || 5;
    const lineFetchDown = anchorMap?.fetch_down || 6;
    const lineFetchRight = anchorMap?.fetch_right || 7;
    const lineReturn = anchorMap?.return || 9;

    let p = modelId === 'fibonacci' ? 0 : 1;
    let q = 1;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      down: p,
      right: q,
      memoj: p,
      tag: '初始化滚动变量',
      log: `| 📦 初始化滚动状态: p = ${p}, q = ${q} [空间复杂度 O(1)]`,
      msg: `初始化双滚动变量 <code>p = ${p}, q = ${q}</code>，空间复杂度降至 <strong>O(1)</strong>。`
    });

    for (let i = 2; i <= n; i++) {
      let r = p + q;
      if (modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs') {
        const cost = [10, 15, 20, 25, 30];
        r = Math.min(q + (cost[i - 1] || 10), p + (cost[i - 2] || 15));
      }

      steps.push({
        type: 'accumulate',
        line: lineAccumulate,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'updated',
        down: p,
        right: q,
        memoj: r,
        tag: `计算当前值 i=${i}`,
        log: `| ✨ 计算当前项: r = ${r}`,
        msg: `计算当前项：<code>r = <strong>${r}</strong></code>。`
      });

      p = q;
      steps.push({
        type: 'fetch-down',
        line: lineFetchDown,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'down',
        down: p,
        right: q,
        memoj: r,
        tag: '滑动更新 p = q',
        log: `| ⬇️ 滑动状态: p = q (${p})`,
        msg: `滚动变量前移：<code>p = q (${p})</code>。`
      });

      q = r;
      steps.push({
        type: 'fetch-right',
        line: lineFetchRight,
        i,
        j: 0,
        activeSlot: i,
        slotMode: 'right',
        down: p,
        right: q,
        memoj: q,
        tag: '滑动更新 q = r',
        log: `| ➡️ 滑动状态: q = r (${q})`,
        msg: `滚动变量前移：<code>q = r (${q})</code>。`
      });
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: n,
      j: 0,
      activeSlot: n,
      slotMode: 'final',
      down: p,
      right: q,
      memoj: q,
      tag: '最终答案',
      log: `| 🏆 O(1) 滚动完成！最终答案 = ${q}`,
      msg: `🏆 O(1) 滚动压缩计算完成！最终结果: <strong>${q}</strong>。`
    });

    return steps;
  }

  /**
   * Stage 5: 数学封闭解与极限进阶推导
   */
  public static compileStage5(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const modelId = model.id;
    const n = Math.min(Math.max(nVal || 5, 1), 10);
    const steps: UniversalStep[] = [];

    if (modelId === 'fibonacci' || modelId === 'climb-stairs') {
      // 矩阵快速幂推导
      steps.push({
        type: 'init',
        line: 1,
        i: 0,
        j: 0,
        tag: '矩阵快速幂 O(log N)',
        log: `| 📐 状态转移矩阵: [[1, 1], [1, 0]]^${n}`,
        msg: `使用矩阵快速幂，将状态转移转化为特征矩阵乘方，时间复杂度降至 <strong>O(log N)</strong>。`
      });
      steps.push({
        type: 'return',
        line: 5,
        i: n,
        j: 0,
        tag: '快速幂完成',
        log: `| 🏆 快速幂计算完成，直接输出结果`,
        msg: `🏆 矩阵快速幂完成！`
      });
    } else if (modelId === 'integer-break') {
      // 数学贪心 O(1) 拆分
      steps.push({
        type: 'init',
        line: 1,
        i: 0,
        j: 0,
        tag: '数学极值分析 (均值不等式与数 e 导数)',
        log: `| 📐 证明: 当拆分因子为 e ≈ 2.718 时乘积最大，离散整数最优基底为 3`,
        msg: `数学证明：根据均值不等式与导数极值分析，尽可能拆分为 <strong>3</strong> 可使乘积最大化。`
      });
      let ans = 1;
      if (n === 2) ans = 1;
      else if (n === 3) ans = 2;
      else {
        const mod = n % 3;
        const count3 = Math.floor(n / 3);
        if (mod === 0) ans = Math.pow(3, count3);
        else if (mod === 1) ans = Math.pow(3, count3 - 1) * 4;
        else ans = Math.pow(3, count3) * 2;
      }
      steps.push({
        type: 'return',
        line: 5,
        i: n,
        j: 0,
        tag: `数学 O(1) 答案 = ${ans}`,
        log: `| 🏆 O(1) 闭式解: integerBreak(${n}) = ${ans}`,
        msg: `🏆 数学 O(1) 贪心计算完成！最终乘积: <strong>${ans}</strong>。`
      });
    } else if (modelId === 'unique-bst') {
      // 卡特兰数封闭解
      steps.push({
        type: 'init',
        line: 1,
        i: 0,
        j: 0,
        tag: '卡特兰数 (Catalan Number) 通项公式',
        log: `| 📐 封闭公式: C_n = (1 / (n + 1)) * (2n)! / (n! * n!)`,
        msg: `根据组合数学，n 节点不同 BST 数量严格等于第 n 项<strong>卡特兰数</strong>。`
      });
      let c = 1;
      for (let i = 0; i < n; i++) {
        c = (c * 2 * (2 * i + 1)) / (i + 2);
      }
      steps.push({
        type: 'return',
        line: 5,
        i: n,
        j: 0,
        tag: `卡特兰数 C_${n} = ${c}`,
        log: `| 🏆 卡特兰数计算完成: numTrees(${n}) = ${c}`,
        msg: `🏆 卡特兰数 O(N) 线性推导完成！总形态数: <strong>${c}</strong>。`
      });
    }

    return steps;
  }
}
