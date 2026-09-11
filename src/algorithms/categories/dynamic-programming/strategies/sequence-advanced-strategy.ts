import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export type SequenceAdvancedModelId =
  | 'longest-increasing-subsequence'
  | 'longest-continuous-increasing-subsequence'
  | 'longest-repeated-subarray'
  | 'longest-common-subsequence'
  | 'uncrossed-lines'
  | 'is-subsequence'
  | 'max-subarray-dp';

/**
 * 高级序列与子数组 DP 策略模块 (SequenceAdvancedStrategy)
 * 覆盖：LIS, LCIS, 最长重复子数组, LCS, 不相交的线, 判断子序列, 最大子数组和
 */
export class SequenceAdvancedStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: SequenceAdvancedModelId | string = 'longest-increasing-subsequence') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'longest-increasing-subsequence' && modelId === 'lis') ||
      (this.modelId === 'longest-continuous-increasing-subsequence' && modelId === 'lcis') ||
      (this.modelId === 'longest-repeated-subarray' && modelId === 'repeated-subarray') ||
      (this.modelId === 'longest-common-subsequence' && modelId === 'lcs') ||
      (this.modelId === 'is-subsequence' && (modelId === 'is-subseq' || modelId === 'is_subsequence')) ||
      (this.modelId === 'max-subarray-dp' && (modelId === 'maximum-subarray' || modelId === 'max-subarray'))
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (this.modelId) {
      case 'longest-continuous-increasing-subsequence':
        return this.compileLCIS(model, stage, Boolean(isMemo), anchorMap);
      case 'longest-repeated-subarray':
        return this.compileRepeatedSubarray(model, stage, Boolean(isMemo), anchorMap);
      case 'longest-common-subsequence':
        return this.compileLCS(model, stage, Boolean(isMemo), anchorMap);
      case 'uncrossed-lines':
        return this.compileUncrossedLines(model, stage, Boolean(isMemo), anchorMap);
      case 'is-subsequence':
        return this.compileIsSubsequence(model, stage, Boolean(isMemo), anchorMap);
      case 'max-subarray-dp':
        return this.compileMaxSubarray(model, stage, Boolean(isMemo), anchorMap);
      case 'longest-increasing-subsequence':
      default:
        return this.compileLIS(model, stage, Boolean(isMemo), anchorMap);
    }
  }

  // 1. 最长递增子序列 (LIS, LC 300)
  private compileLIS(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [10, 9, 2, 5, 3, 7, 101, 18];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const n = nums.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      const memo: Record<number, number> = {};
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'LIS',
        status: 'current',
        children: []
      };

      for (let i = 0; i < Math.min(n, 4); i++) {
        const child: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: 1,
          c: i,
          val: `dfs(${i}: ${nums[i]})`,
          status: 'visited',
          tag: isMemo ? '⚡=1' : '=1',
          children: []
        };
        rootNode.children.push(child);
        steps.push({
          type: isMemo ? 'memo-hit' : 'dfs-call',
          line: anchorMap?.recursion || 4,
          i: 0,
          j: i,
          activeSlot: i,
          highlightSlots: [i],
          tag: `考察起点 nums[${i}]=${nums[i]}`,
          log: `| ➡️ 递归考察以 nums[${i}]=${nums[i]} 为起点的最长递增子序列`,
          msg: `递归调用 <code>dfs(${i})</code>：探索以 <code>${nums[i]}</code> 开头的递增序列。`,
          activeNodeId: child.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map(() => 1)
        });
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp = new Array(n).fill(1);
    let maxLen = 1;

    steps.push({
      type: 'init',
      line: anchorMap?.init || 2,
      i: 0,
      j: 0,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '初始化 dp[i] = 1',
      log: `| 📋 初始化 LIS 状态表：每个元素单独构成长度为 1 的递增子序列`,
      msg: `初始化 <code>dp[i] = 1</code>（每个元素自身作为基底）。`
    });

    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[i] > nums[j]) {
          dp[i] = Math.max(dp[i], dp[j] + 1);
        }
      }
      maxLen = Math.max(maxLen, dp[i]);

      steps.push({
        type: stage === 4 ? 'update-1d' : 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: i,
        grid: [[...dp]],
        memo: [...dp],
        dp1d: [...dp],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `dp[${i}] (以 ${nums[i]} 结尾) = ${dp[i]}`,
        log: `| ⚡ 考察 nums[${i}]=${nums[i]}，以其结尾的最长递增长度 = ${dp[i]}`,
        msg: `以 <code>nums[${i}] = ${nums[i]}</code> 结尾的最长递增子序列长度为 <strong>${dp[i]}</strong>。`
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 10,
      i: 0,
      j: n - 1,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `LIS 最长长度: ${maxLen}`,
      log: `| 🏆 计算完成！最长递增子序列长度 = ${maxLen}`,
      msg: `🏆 演化计算完成！最长递增子序列长度为 <strong>${maxLen}</strong>。`
    });

    return steps;
  }

  // 2. 最长连续递增序列 (LCIS, LC 674)
  private compileLCIS(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [1, 3, 5, 4, 7];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const n = nums.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'LCIS',
        status: 'current',
        children: []
      };

      for (let i = 0; i < n; i++) {
        const child: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: 1,
          c: i,
          val: `dfs(${i})`,
          status: 'visited',
          tag: `len=${i > 0 && nums[i] > nums[i - 1] ? 2 : 1}`,
          children: []
        };
        rootNode.children.push(child);
        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 4,
          i: 0,
          j: i,
          activeSlot: i,
          highlightSlots: [i],
          tag: `考察连续增长 nums[${i}]=${nums[i]}`,
          log: `| ➡️ 递归考察 nums[${i}]=${nums[i]} 连续增长关系`,
          msg: `递归检查：<code>nums[${i}] = ${nums[i]}</code>。`,
          activeNodeId: child.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums.map(() => 1)
        });
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp = new Array(n).fill(1);
    let maxLen = 1;

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: 0,
      highlightSlots: [0],
      tag: '初始化 dp 数组',
      log: '| 📋 连续递增子序列：dp[i] 仅取决于相邻前一个 dp[i-1]',
      msg: `连续递增子序列：<code>dp[i] = nums[i] > nums[i-1] ? dp[i-1] + 1 : 1</code>。`
    });

    for (let i = 1; i < n; i++) {
      if (nums[i] > nums[i - 1]) {
        dp[i] = dp[i - 1] + 1;
      }
      maxLen = Math.max(maxLen, dp[i]);

      steps.push({
        type: 'update-1d',
        line: 6,
        i: 0,
        j: i,
        grid: [[...dp]],
        memo: [...dp],
        dp1d: [...dp],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `dp[${i}] = ${dp[i]}`,
        log: `| ⚡ nums[${i}]=${nums[i]} ${nums[i] > nums[i - 1] ? '>' : '<='} nums[${i - 1}]，dp[${i}]=${dp[i]}`,
        msg: `考察 <code>nums[${i}] = ${nums[i]}</code>：连续递增长度为 <strong>${dp[i]}</strong>。`
      });
    }

    steps.push({
      type: 'return',
      line: 10,
      i: 0,
      j: n - 1,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `LCIS 最大长度: ${maxLen}`,
      log: `| 🏆 最长连续递增序列长度 = ${maxLen}`,
      msg: `🏆 最长连续递增序列长度为 <strong>${maxLen}</strong>。`
    });

    return steps;
  }

  // 3. 最长重复子数组 (LC 718)
  private compileRepeatedSubarray(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const rawA = (model.defaultParams as any)?.nums1 || [1, 2, 3, 2, 1];
    const rawB = (model.defaultParams as any)?.nums2 || [3, 2, 1, 4, 7];
    const A: number[] = Array.isArray(rawA) ? rawA.map(Number) : String(rawA).split(',').map(Number);
    const B: number[] = Array.isArray(rawB) ? rawB.map(Number) : String(rawB).split(',').map(Number);
    const m = A.length, n = B.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'dfs(0,0)',
        status: 'current',
        children: []
      };

      for (let i = 0; i < Math.min(m, 3); i++) {
        for (let j = 0; j < Math.min(n, 3); j++) {
          const isMatch = A[i] === B[j];
          const child: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j,
            val: `dfs(${i},${j})`,
            edgeLabel: isMatch ? '匹配' : '不同',
            status: isMatch ? 'visited' : 'base',
            tag: isMatch ? `A[${i}]==B[${j}]` : '0',
            children: []
          };
          rootNode.children.push(child);

          steps.push({
            type: isMatch ? (isMemo ? 'memo-hit' : 'dfs-call') : 'dfs-return',
            line: anchorMap?.recursion || (isMatch ? 5 : 3),
            i,
            j,
            activeSlot: j,
            highlightSlots: [j],
            gridHighlight: { i: i + 1, j: j + 1 },
            tag: `对比 A[${i}]=${A[i]} 与 B[${j}]=${B[j]}`,
            log: `| 🔍 递归对比: A[${i}]=${A[i]} 与 B[${j}]=${B[j]} ${isMatch ? '-> 相同，向后递推 dfs(' + (i + 1) + ',' + (j + 1) + ')' : '-> 不同返回 0'}`,
            msg: `递归对比 <code>A[${i}] = ${A[i]}</code> 与 <code>B[${j}] = ${B[j]}</code>：${isMatch ? '<strong>相同，对角线递推</strong>' : '不同终止'}。`,
            activeNodeId: child.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    for (let j = 0; j <= n; j++) dp[0][j] = 0;
    for (let i = 0; i <= m; i++) dp[i][0] = 0;
    let maxLen = 0;

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 (m+1)×(n+1) 二维矩阵',
      log: '| 📋 最长重复子数组：要求连续相等，dp[i][j] = dp[i-1][j-1] + 1',
      msg: `初始化 <code>${m + 1} × ${n + 1}</code> 二维状态表。`
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (A[i - 1] === B[j - 1]) {
          dp[i][j] = (dp[i - 1][j - 1] ?? 0) + 1;
          maxLen = Math.max(maxLen, dp[i][j]!);

          steps.push({
            type: 'update',
            line: 6,
            i,
            j,
            grid: JSON.parse(JSON.stringify(dp)),
            gridHighlight: { i, j },
            tag: `A[${i - 1}]===B[${j - 1}] (${A[i - 1]}): dp=${dp[i][j]}`,
            log: `| ⚡ 字符匹配 A[${i - 1}] == B[${j - 1}] == ${A[i - 1]}，对角线传递 dp[${i}][${j}] = ${dp[i][j]}`,
            msg: `匹配相同元素 <code>${A[i - 1]}</code>：对角线连续递增 <code>dp[${i}][${j}] = <strong>${dp[i][j]}</strong></code>。`
          });
        } else {
          dp[i][j] = 0;
        }
      }
    }

    steps.push({
      type: 'return',
      line: 10,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `最长公共子数组长度: ${maxLen}`,
      log: `| 🏆 计算完成！最长重复子数组长度 = ${maxLen}`,
      msg: `🏆 最长重复连续子数组长度为 <strong>${maxLen}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  // 4. 最长公共子序列 (LCS, LC 1143)
  private compileLCS(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const text1 = String((model.defaultParams as any)?.text1 || (model.defaultParams as any)?.word1 || 'abcde');
    const text2 = String((model.defaultParams as any)?.text2 || (model.defaultParams as any)?.word2 || 'ace');
    const m = text1.length, n = text2.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'dfs(0,0)',
        status: 'current',
        children: []
      };

      for (let i = 0; i < Math.min(m, 3); i++) {
        for (let j = 0; j < Math.min(n, 3); j++) {
          const isMatch = text1[i] === text2[j];
          const child: UniversalTreeNode = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j,
            val: `dfs(${i},${j})`,
            status: isMatch ? 'visited' : 'normal',
            tag: isMatch ? `match('${text1[i]}')` : 'branch',
            children: []
          };
          rootNode.children.push(child);

          steps.push({
            type: 'dfs-call',
            line: anchorMap?.recursion || 4,
            i,
            j,
            activeSlot: j,
            gridHighlight: { i: i + 1, j: j + 1 },
            tag: `对比 '${text1[i]}' 与 '${text2[j]}'`,
            log: `| 🔍 递归匹配: '${text1[i]}' vs '${text2[j]}' ${isMatch ? '-> 匹配成功 +1' : '-> 分支探索'}`,
            msg: `递归对比 <code>'${text1[i]}'</code> 与 <code>'${text2[j]}'</code>。`,
            activeNodeId: child.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    for (let j = 0; j <= n; j++) dp[0][j] = 0;
    for (let i = 0; i <= m; i++) dp[i][0] = 0;

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `LCS 二维表 (${m + 1}×${n + 1})`,
      log: `| 📋 最长公共子序列 (不要求连续)：text1="${text1}", text2="${text2}"`,
      msg: `初始化 <code>${m + 1} × ${n + 1}</code> LCS 状态表。`
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (text1[i - 1] === text2[j - 1]) {
          dp[i][j] = (dp[i - 1][j - 1] ?? 0) + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j] ?? 0, dp[i][j - 1] ?? 0);
        }

        steps.push({
          type: 'update',
          line: 6,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          gridHighlight: { i, j },
          tag: `dp[${i}][${j}] = ${dp[i][j]}`,
          log: `| ⚡ 对比 '${text1[i - 1]}' 与 '${text2[j - 1]}' -> dp[${i}][${j}] = ${dp[i][j]}`,
          msg: `字符对比 <code>'${text1[i - 1]}'</code> 与 <code>'${text2[j - 1]}'</code>：<code>dp[${i}][${j}] = <strong>${dp[i][j]}</strong></code>。`
        });
      }
    }

    steps.push({
      type: 'return',
      line: 10,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `LCS 最长长度: ${dp[m][n]}`,
      log: `| 🏆 LCS 计算完成！最长公共子序列长度 = ${dp[m][n]}`,
      msg: `🏆 最长公共子序列长度为 <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  // 5. 不相交的线 (LC 1035)
  private compileUncrossedLines(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const rawA = (model.defaultParams as any)?.nums1 || [1, 4, 2];
    const rawB = (model.defaultParams as any)?.nums2 || [1, 2, 4];
    const nums1: number[] = Array.isArray(rawA) ? rawA.map(Number) : String(rawA).split(',').map(Number);
    const nums2: number[] = Array.isArray(rawB) ? rawB.map(Number) : String(rawB).split(',').map(Number);
    const m = nums1.length, n = nums2.length;

    if (stage === 1 || stage === 2) {
      return this.compileLCS(model, stage, isMemo, anchorMap);
    }

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    for (let j = 0; j <= n; j++) dp[0][j] = 0;
    for (let i = 0; i <= m; i++) dp[i][0] = 0;

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '转化为最长公共子序列 LCS',
      log: '| 📋 不相交连线完全等价于求 nums1 与 nums2 的最长公共子序列 LCS',
      msg: `不相交的连线本质上就是两个数组的<strong>最长公共子序列 (LCS)</strong>。`
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (nums1[i - 1] === nums2[j - 1]) {
          dp[i][j] = (dp[i - 1][j - 1] ?? 0) + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j] ?? 0, dp[i][j - 1] ?? 0);
        }

        steps.push({
          type: 'update',
          line: 6,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          gridHighlight: { i, j },
          tag: `dp[${i}][${j}] = ${dp[i][j]}`,
          log: `| ⚡ nums1[${i - 1}]=${nums1[i - 1]}, nums2[${j - 1}]=${nums2[j - 1]} -> 连线数=${dp[i][j]}`,
          msg: `连线匹配：最大不相交连线数 <code>dp[${i}][${j}] = <strong>${dp[i][j]}</strong></code>。`
        });
      }
    }

    steps.push({
      type: 'return',
      line: 10,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `最大连线数: ${dp[m][n]}`,
      log: `| 🏆 最多可以绘制的不相交连线数 = ${dp[m][n]}`,
      msg: `🏆 最多可以绘制的不相交连线数为 <strong>${dp[m][n]}</strong> 条。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  // 6. 判断子序列 (LC 392)
  private compileIsSubsequence(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const s = String((model.defaultParams as any)?.s || 'abc');
    const t = String((model.defaultParams as any)?.t || 'ahbgdc');
    const m = s.length, n = t.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'isSubseq(0,0)',
        status: 'current',
        children: []
      };

      for (let i = 0; i < Math.min(m, 3); i++) {
        const child: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: 1,
          c: i,
          val: `match("${s[i]}")`,
          status: 'visited',
          tag: `s[${i}]='${s[i]}'`,
          children: []
        };
        rootNode.children.push(child);
        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 4,
          i,
          j: 0,
          activeSlot: i,
          tag: `匹配字符 s[${i}]='${s[i]}'`,
          log: `| 🔍 递归在目标串 "${t}" 中搜索字符 '${s[i]}'`,
          msg: `递归检查：在目标串中寻找字符 <code>'${s[i]}'</code>。`,
          activeNodeId: child.id,
          treeRoot: cloneTree(rootNode)
        });
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `判断 "${s}" 是否为 "${t}" 的子序列`,
      log: `| 📋 判断子序列：dp[m][n] 是否等于 s 的长度 ${m}`,
      msg: `判断 <code>"${s}"</code> 是否为 <code>"${t}"</code> 的子序列。`
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s[i - 1] === t[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = dp[i][j - 1];
        }

        steps.push({
          type: 'update',
          line: 6,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          gridHighlight: { i, j },
          tag: `dp[${i}][${j}] = ${dp[i][j]}`,
          log: `| ⚡ 匹配 s[${i - 1}] 与 t[${j - 1}] -> dp[${i}][${j}] = ${dp[i][j]}`,
          msg: `匹配进度：<code>dp[${i}][${j}] = <strong>${dp[i][j]}</strong></code>。`
        });
      }
    }

    const isMatch = dp[m][n] === m;
    steps.push({
      type: 'return',
      line: 10,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `判定结果: ${isMatch}`,
      log: `| 🏆 计算完成！dp[${m}][${n}] = ${dp[m][n]} ${isMatch ? '== s.length 成立' : '!= s.length 不成立'}`,
      msg: `🏆 演化计算完成！<code>"${s}"</code> ${isMatch ? '<strong>是</strong>' : '<strong>不是</strong>'} <code>"${t}"</code> 的子序列。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  // 7. 最大子数组和 (LC 53)
  private compileMaxSubarray(model: IYamlAlgorithmModel, stage: number, isMemo: boolean, anchorMap?: Record<string, number>): UniversalStep[] {
    const rawNums = (model.defaultParams as any)?.nums || [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const n = nums.length;

    if (stage === 1 || stage === 2) {
      const steps: UniversalStep[] = [];
      let nodeIdCounter = 0;
      const rootNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: 0,
        val: 'MaxSubarray',
        status: 'current',
        children: []
      };

      for (let i = 0; i < n; i++) {
        const child: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: 1,
          c: i,
          val: `dfs(${i})`,
          status: 'visited',
          tag: `num=${nums[i]}`,
          children: []
        };
        rootNode.children.push(child);
        steps.push({
          type: 'dfs-call',
          line: anchorMap?.recursion || 4,
          i: 0,
          j: i,
          activeSlot: i,
          highlightSlots: [i],
          tag: `考察以 nums[${i}]=${nums[i]} 结尾子数组`,
          log: `| ➡️ 递归考察以 nums[${i}]=${nums[i]} 结尾的最大和`,
          msg: `递归考察：以 <code>nums[${i}] = ${nums[i]}</code> 结尾。`,
          activeNodeId: child.id,
          treeRoot: cloneTree(rootNode),
          dp1d: nums
        });
      }
      return steps;
    }

    const steps: UniversalStep[] = [];
    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    let maxSum = nums[0];

    steps.push({
      type: 'init',
      line: 2,
      i: 0,
      j: 0,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: 0,
      highlightSlots: [0],
      tag: `dp[0] = ${nums[0]}`,
      log: `| 📋 初始化 dp[0] = nums[0] = ${nums[0]}`,
      msg: `初始化：<code>dp[0] = ${nums[0]}</code>。`
    });

    for (let i = 1; i < n; i++) {
      dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
      maxSum = Math.max(maxSum, dp[i]);

      steps.push({
        type: 'update-1d',
        line: 6,
        i: 0,
        j: i,
        grid: [[...dp]],
        memo: [...dp],
        dp1d: [...dp],
        activeSlot: i,
        currentI: i,
        highlightSlots: [i],
        tag: `dp[${i}] = max(${nums[i]}, ${dp[i - 1] + nums[i]}) = ${dp[i]}`,
        log: `| ⚡ 考察 nums[${i}]=${nums[i]}，最大连续子数组和 = ${dp[i]}`,
        msg: `考察 <code>nums[${i}] = ${nums[i]}</code>：<code>dp[${i}] = max(nums[i], dp[i-1] + nums[i]) = <strong>${dp[i]}</strong></code>。`
      });
    }

    steps.push({
      type: 'return',
      line: 10,
      i: 0,
      j: n - 1,
      grid: [[...dp]],
      memo: [...dp],
      dp1d: [...dp],
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      tag: `全局最大子数组和: ${maxSum}`,
      log: `| 🏆 计算完成！最大子数组和 = ${maxSum}`,
      msg: `🏆 演化计算完成！连续子数组的最大和为 <strong>${maxSum}</strong>。`
    });

    return steps;
  }
}
