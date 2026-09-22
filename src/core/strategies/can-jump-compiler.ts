/**
 * 跳跃游戏 I 顶层步进编译器 (Can Jump / Jump Game Step Compiler)
 * 生成标准 UniversalStep，全面支持四阶段演化与顶层抽象：
 * - Stage 1: 贪心最大覆盖范围扩张 (O(n) 时间，O(1) 空间)
 * - Stage 2: 记忆化递归搜索 (带 UniversalTreeNode 调用树与剪枝)
 * - Stage 3: 严格一维 DP 逆序填表 (dp[i] 表示从 i 出发是否能到达终点)
 * - Stage 4: 空间优化逆向贪心收缩 (lastPos 向左寻底，O(n) 时间，O(1) 空间)
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';

export interface CanJumpCompileOptions {
  nums: number[];
  anchorMap?: Record<string, number>;
  direction?: 'forward' | 'reverse';
}

export class CanJumpStepCompiler {
  public static compile(
    model: IYamlAlgorithmModel,
    options: CanJumpCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    if (stage === 2) {
      return this.compileStage2(model, options);
    }
    if (stage === 3) {
      return this.compileStage3(model, options);
    }
    if (stage === 4 || options.direction === 'reverse') {
      return this.compileStage4(model, options);
    }
    return this.compileStage1(model, options);
  }

  /**
   * 阶段 1：贪心最大覆盖范围扩张 (O(n) 时间，O(1) 空间)
   */
  public static compileStage1(
    model: IYamlAlgorithmModel,
    options: CanJumpCompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet =
        model.stages?.['stage-1']?.code?.forward?.source ||
        model.stages?.['stage-1']?.variants?.['standard']?.code?.forward?.source;
      if (codeSnippet) {
        rawMap = YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap;
      }
    }
    rawMap = rawMap || {};

    const getLine = (anchor: string, fallback: number): number => {
      const v = rawMap?.[anchor];
      return typeof v === 'number' ? v : fallback;
    };

    const lineEntry = getLine('entry', 2);
    const lineInit = getLine('init', 3);
    const lineLoop = getLine('loop', 4);
    const lineExplore = getLine('explore', 5);
    const lineSuccess = getLine('success', 6);
    const lineBlocked = getLine('blocked', 8);

    const createCells1D = (curIdx: number, cover: number, isSuccess: boolean = false) => {
      return [
        nums.map((val, idx) => {
          let state = 'normal';
          if (isSuccess && idx === n - 1) state = 'matched';
          else if (idx === curIdx) state = 'active';
          else if (idx === cover) state = 'selected';
          else if (idx <= cover) state = 'visited';
          else if (idx === n - 1) state = 'target';

          return {
            value: val,
            state,
            label: idx === curIdx ? '探针 i' : idx === cover ? '最远' : idx === n - 1 ? '终点' : `[${idx}]`,
          };
        }),
      ];
    };

    const createStateArrays = (curIdx: number, cover: number): StateArrayItem[] => [
      {
        id: 'nums',
        name: 'nums',
        label: '跳跃数组',
        indices: nums.map((_, idx) => idx),
        values: nums,
        activeIdx: curIdx >= 0 ? curIdx : undefined,
        highlightIndices: [cover],
      },
    ];

    const createDecisions = (
      curIdx: number,
      reach: number,
      cover: number,
      isExtend: boolean,
      isGoal: boolean
    ) => [
      {
        label: '当前扫描格 i',
        title: '当前扫描格 i',
        formula: 'i',
        value: curIdx >= 0 ? `下标 [${curIdx}] (跳跃力 ${nums[curIdx] ?? 0})` : '初始就绪',
        val: curIdx >= 0 ? curIdx : 0,
        isSelected: false,
      },
      {
        label: '单步最远探测 reach',
        title: '单步最远探测 reach',
        formula: 'i + nums[i]',
        value: curIdx >= 0 ? `${curIdx} + ${nums[curIdx]} = ${reach}` : '0',
        val: reach,
        isSelected: isExtend,
      },
      {
        label: '全局最大覆盖 cover',
        title: '全局最大覆盖 cover',
        formula: 'max(cover, i + nums[i])',
        value: `覆盖至下标 [${cover}]`,
        val: cover,
        isSelected: isExtend,
      },
      {
        label: '终点可达性判定',
        title: '终点可达性判定',
        formula: 'cover >= n - 1',
        value: isGoal ? '🎉 已覆盖终点 (返回 true)' : `终点 [${n - 1}] 尚在前方`,
        val: isGoal ? 1 : 0,
        isSelected: isGoal,
      },
    ];

    // Step 0: 入口
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineEntry,
      codeLine: lineEntry,
      tag: '函数入口',
      msg: `🚀 主函数入口：nums=[${nums.join(', ')}]，起点下标 0，终点目标下标 ${n - 1}`,
      vars: [
        { name: 'nums.length', value: String(n) },
        { name: 'cover', value: '0' },
      ],
      cells: createCells1D(0, 0),
      actorState: { currentSlot: 0, action: 'idle' },
      stateArrays: createStateArrays(0, 0),
      decisions: createDecisions(0, nums[0], 0, false, false),
    });

    if (n <= 1) {
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'terminal',
        line: lineEntry,
        codeLine: lineEntry,
        tag: '特判可达',
        msg: `✅ 数组长度 <= 1，起始即在终点，直接返回 true！`,
        vars: [{ name: 'return', value: 'true' }],
        cells: createCells1D(0, 0, true),
        actorState: { currentSlot: 0, action: 'idle' },
        stateArrays: createStateArrays(0, 0),
        decisions: createDecisions(0, 0, 0, false, true),
      });
      return steps;
    }

    let cover = 0;
    let canReach = false;

    // Step 1: 初始化 cover = 0
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '初始覆盖',
      msg: `📌 初始化最大覆盖范围 cover = 0，仅在已覆盖的有效区间 [0, cover] 内遍历探查。`,
      vars: [
        { name: 'cover', value: '0' },
        { name: 'target', value: String(n - 1) },
      ],
      cells: createCells1D(0, 0),
      actorState: { currentSlot: 0, action: 'walk' },
      stateArrays: createStateArrays(0, 0),
      decisions: createDecisions(0, 0, 0, false, false),
    });

    for (let i = 0; i <= cover; i++) {
      const reach = i + nums[i];
      const oldCover = cover;

      // 考察探针当前格
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineLoop,
        codeLine: lineLoop,
        tag: '考察探针',
        msg: `🔍 考察下标 i=[${i}]，跳跃力 nums[${i}]=${nums[i]}，从该格最远可延伸至下标 ${reach}。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'nums[i]', value: String(nums[i]) },
          { name: 'reach', value: String(reach) },
          { name: 'cover', value: String(cover) },
        ],
        cells: createCells1D(i, cover),
        actorState: { currentSlot: i, action: 'walk' },
        stateArrays: createStateArrays(i, cover),
        decisions: createDecisions(i, reach, cover, false, false),
      });

      if (reach > cover) {
        cover = reach;
        steps.push({
          stepIndex: steps.length,
          flowPhase: 'forward',
          line: lineExplore,
          codeLine: lineExplore,
          tag: '扩张覆盖',
          msg: `🌐 发现更优跳跃！最大覆盖范围从 [${oldCover}] 贪心推进至 [${cover}]！`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'oldCover', value: String(oldCover) },
            { name: 'cover', value: String(cover) },
          ],
          cells: createCells1D(i, cover),
          actorState: { currentSlot: i, action: 'jump' },
          stateArrays: createStateArrays(i, cover),
          decisions: createDecisions(i, reach, cover, true, cover >= n - 1),
        });
      }

      if (cover >= n - 1) {
        canReach = true;
        steps.push({
          stepIndex: steps.length,
          flowPhase: 'terminal',
          line: lineSuccess,
          codeLine: lineSuccess,
          tag: '覆盖终点',
          msg: `🎉 最大覆盖范围 cover=${cover} >= 终点下标 ${n - 1}，成功覆盖终点！立即返回 true。`,
          vars: [
            { name: 'cover', value: String(cover) },
            { name: 'target', value: String(n - 1) },
            { name: 'return', value: 'true' },
          ],
          cells: createCells1D(i, cover, true),
          actorState: { currentSlot: n - 1, action: 'idle' },
          stateArrays: createStateArrays(i, cover),
          decisions: createDecisions(i, reach, cover, true, true),
        });
        break;
      }
    }

    if (!canReach) {
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'terminal',
        line: lineBlocked,
        codeLine: lineBlocked,
        tag: '不可达',
        msg: `❌ 遍历完所有合法覆盖点后，最大覆盖范围仅达到 [${cover}] < 终点 [${n - 1}]，无法跨越，返回 false！`,
        vars: [
          { name: 'maxCover', value: String(cover) },
          { name: 'target', value: String(n - 1) },
          { name: 'return', value: 'false' },
        ],
        cells: createCells1D(cover, cover),
        actorState: { currentSlot: cover, action: 'idle' },
        stateArrays: createStateArrays(cover, cover),
        decisions: createDecisions(cover, cover, cover, false, false),
      });
    }

    return steps;
  }

  /**
   * 阶段 2：记忆化搜索 (带 UniversalTreeNode 调用树与剪枝)
   */
  public static compileStage2(
    model: IYamlAlgorithmModel,
    options: CanJumpCompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet = model.stages?.['stage-2']?.code?.forward?.source;
      if (codeSnippet) {
        rawMap = YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap;
      }
    }
    rawMap = rawMap || {};

    const getLine = (anchor: string, fallback: number): number => {
      const v = rawMap?.[anchor];
      return typeof v === 'number' ? v : fallback;
    };

    const lineInit = getLine('init', 2);
    const lineEntry = getLine('entry', 3);
    const lineBoundary = getLine('boundary', 6);
    const lineCacheHit = getLine('cache_hit', 7);
    const lineLoop = getLine('loop', 8);
    const lineMemoTrue = getLine('memo_true', 10);
    const lineMemoFalse = getLine('memo_false', 14);

    let nodeCounter = 0;
    const rootNode: UniversalTreeNode = {
      id: `node_0`,
      r: 0,
      c: 0,
      val: `dfs(0)`,
      status: 'active',
      tag: '探索中',
      children: [],
    };

    const callStack: Array<{ label: string; coord: string }> = [];
    const memo: Map<number, boolean> = new Map();

    const pushStep = (
      phase: 'forward' | 'backtrack' | 'terminal',
      lineNum: number,
      tag: string,
      msg: string,
      curIdx: number,
      activeId: string,
      vars: Array<{ name: string; value: string }>
    ) => {
      steps.push({
        stepIndex: steps.length,
        flowPhase: phase,
        line: lineNum,
        codeLine: lineNum,
        tag,
        msg,
        vars,
        activeNodeId: activeId,
        treeRoot: cloneStateDepTree(rootNode),
        callStack: callStack.map(s => ({ ...s })),
        cells: [
          nums.map((v, idx) => ({
            value: v,
            state: idx === curIdx ? 'active' : memo.has(idx) ? (memo.get(idx) ? 'matched' : 'disabled') : 'normal',
            label: idx === curIdx ? '探针 i' : idx === n - 1 ? '终点' : `[${idx}]`,
          })),
        ],
        actorState: { currentSlot: Math.min(n - 1, Math.max(0, curIdx)), action: 'walk' },
      });
    };

    // Step 0: 入口
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '函数入口',
      msg: `🚀 记忆化搜索入口：初始化 memo 数组，dfs(i) 表示从下标 i 出发能否到达终点。`,
      vars: [
        { name: 'nums', value: `[${nums.join(', ')}]` },
        { name: 'memo', value: '全 0 (未计算)' },
      ],
      activeNodeId: rootNode.id,
      treeRoot: cloneStateDepTree(rootNode),
      callStack: [],
    });

    const dfs = (i: number, parentNode: UniversalTreeNode | null, stepFromParent: number): boolean => {
      const myId = parentNode === null ? 'node_0' : `node_${++nodeCounter}`;
      const myNode: UniversalTreeNode = parentNode === null
        ? rootNode
        : {
            id: myId,
            r: i,
            c: 0,
            val: `dfs(${i})`,
            edgeLabel: `+${stepFromParent}`,
            status: 'active',
            tag: '探索中',
            children: [],
          };

      if (parentNode !== null) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(myNode);
      }

      callStack.push({
        label: `dfs(i=${i})`,
        coord: `${i}`,
      });

      pushStep(
        'forward',
        lineEntry,
        '进入递归',
        `📥 进入调用帧 dfs(${i})，尝试从位置 ${i} 出发寻找可达终点的跳跃路径。`,
        i,
        myId,
        [{ name: 'i', value: String(i) }, { name: 'nums[i]', value: String(nums[i] ?? 0) }]
      );

      // Base case 1: 触碰或跨越终点
      if (i >= n - 1) {
        myNode.status = 'computed';
        myNode.tag = '✅ true (已达终点)';
        pushStep(
          'terminal',
          lineBoundary,
          '终点触底',
          `🎯 触达终点条件成立 (i=${i} >= ${n - 1})！返回 true。`,
          i,
          myId,
          [{ name: 'i', value: String(i) }, { name: 'return', value: 'true' }]
        );
        callStack.pop();
        return true;
      }

      // Base case 2: 记忆化剪枝
      if (memo.has(i)) {
        const cached = memo.get(i)!;
        myNode.status = 'pruned';
        myNode.tag = cached ? '⚡ 命中缓存 true' : '⚡ 命中剪枝 false';
        pushStep(
          'backtrack',
          lineCacheHit,
          '记忆化命中',
          `⚡ 记忆化缓存命中：memo[${i}] = ${cached}，无需重复深搜，直接返回！`,
          i,
          myId,
          [{ name: 'memo[i]', value: String(cached) }, { name: 'return', value: String(cached) }]
        );
        callStack.pop();
        return cached;
      }

      const maxSteps = nums[i];
      let reachable = false;

      // 倒序优先尝试跳最远
      for (let s = maxSteps; s >= 1; s--) {
        pushStep(
          'forward',
          lineLoop,
          '分支探测',
          `🔍 从 dfs(${i}) 尝试跳跃 ${s} 步 -> 前往下标 ${i + s}。`,
          i,
          myId,
          [{ name: 'i', value: String(i) }, { name: 'step', value: String(s) }, { name: 'next', value: String(i + s) }]
        );

        if (dfs(i + s, myNode, s)) {
          reachable = true;
          break;
        }
      }

      memo.set(i, reachable);
      myNode.status = 'computed';
      myNode.tag = reachable ? '✅ true' : '❌ false';

      pushStep(
        reachable ? 'forward' : 'backtrack',
        reachable ? lineMemoTrue : lineMemoFalse,
        reachable ? '结果落盘' : '无解回溯',
        reachable
          ? `🎉 下标 ${i} 存在有效跳跃达终点！记录 memo[${i}]=true 并向上回溯。`
          : `🚫 下标 ${i} 的所有跳跃分支均无法到达终点！记录 memo[${i}]=false 并回溯。`,
        i,
        myId,
        [{ name: `memo[${i}]`, value: String(reachable) }, { name: 'return', value: String(reachable) }]
      );

      callStack.pop();
      return reachable;
    };

    dfs(0, null, 0);

    return steps;
  }

  /**
   * 阶段 3：严格一维 DP 逆序填表 (dp[i] 表示从 i 出发是否能到达终点)
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    options: CanJumpCompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet = model.stages?.['stage-3']?.code?.forward?.source;
      if (codeSnippet) {
        rawMap = YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap;
      }
    }
    rawMap = rawMap || {};

    const getLine = (anchor: string, fallback: number): number => {
      const v = rawMap?.[anchor];
      return typeof v === 'number' ? v : fallback;
    };

    const lineInit = getLine('init', 3);
    const lineBase = getLine('base', 4);
    const lineOuter = getLine('outer_loop', 5);
    const lineInner = getLine('inner_loop', 6);
    const lineTransfer = getLine('transfer', 7);
    const lineReturn = getLine('return', 12);

    const dp: (number | null)[] = new Array(n).fill(null);

    const createCells1D = (curIdx: number) => [
      nums.map((v, idx) => ({
        value: v,
        state: idx === curIdx ? 'active' : dp[idx] === 1 ? 'matched' : dp[idx] === 0 ? 'disabled' : 'normal',
        label: idx === curIdx ? '填表中' : idx === n - 1 ? '终点' : `[${idx}]`,
      })),
    ];

    const createStateArrays = (curIdx: number): StateArrayItem[] => [
      {
        id: 'dp',
        name: 'dp',
        label: '一维 DP 状态表 (可达性: 1/0)',
        indices: nums.map((_, idx) => idx),
        values: dp.map(v => (v === null ? '-' : v === 1 ? 'true' : 'false')),
        activeIdx: curIdx >= 0 ? curIdx : undefined,
      },
    ];

    // Step 0: 初始化 DP 数组
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '初始化 DP',
      msg: `📌 初始化一维 DP 数组 dp[0..${n - 1}]，dp[i] 表示从位置 i 是否能跳达终点。`,
      vars: [{ name: 'n', value: String(n) }],
      dp1d: [...dp],
      cells: createCells1D(-1),
      stateArrays: createStateArrays(-1),
    });

    // Step 1: 边界基准 dp[n-1] = true
    dp[n - 1] = 1;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineBase,
      codeLine: lineBase,
      tag: '基准状态',
      msg: `🎯 终点自身显式可达：设置 dp[${n - 1}] = true 作为逆推基准点。`,
      vars: [{ name: `dp[${n - 1}]`, value: 'true' }],
      dp1d: [...dp],
      cells: createCells1D(n - 1),
      actorState: { currentSlot: n - 1, action: 'idle' },
      stateArrays: createStateArrays(n - 1),
    });

    // Step 2: 逆序填表
    for (let i = n - 2; i >= 0; i--) {
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineOuter,
        codeLine: lineOuter,
        tag: '逆序扫描',
        msg: `🔍 正在计算 dp[${i}]：nums[${i}]=${nums[i]}，考察从此格向右跳跃能到达的所有下一状态。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'nums[i]', value: String(nums[i]) },
        ],
        dp1d: [...dp],
        cells: createCells1D(i),
        actorState: { currentSlot: i, action: 'walk' },
        stateArrays: createStateArrays(i),
      });

      let canJumpEnd = false;
      const maxStep = Math.min(nums[i], n - 1 - i);

      for (let s = 1; s <= maxStep; s++) {
        const nextIdx = i + s;
        const targetReachable = dp[nextIdx] === 1;

        steps.push({
          stepIndex: steps.length,
          flowPhase: 'forward',
          line: lineInner,
          codeLine: lineInner,
          tag: '尝试步数',
          msg: `👉 考察跳跃 step=${s} -> 目标下标 [${nextIdx}]，其状态 dp[${nextIdx}]=${targetReachable ? 'true' : 'false'}。`,
          vars: [
            { name: 'step', value: String(s) },
            { name: 'nextIdx', value: String(nextIdx) },
            { name: `dp[${nextIdx}]`, value: String(targetReachable) },
          ],
          dp1d: [...dp],
          cells: createCells1D(i),
          stateArrays: createStateArrays(i),
        });

        if (targetReachable) {
          canJumpEnd = true;
          break;
        }
      }

      dp[i] = canJumpEnd ? 1 : 0;

      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineTransfer,
        codeLine: lineTransfer,
        tag: '状态落盘',
        msg: canJumpEnd
          ? `✅ 发现可通往终点的跳跃！设置 dp[${i}] = true。`
          : `🚫 下标 ${i} 的所有步数均无法到达终点，设置 dp[${i}] = false。`,
        vars: [{ name: `dp[${i}]`, value: canJumpEnd ? 'true' : 'false' }],
        dp1d: [...dp],
        cells: createCells1D(i),
        actorState: { currentSlot: i, action: 'idle' },
        stateArrays: createStateArrays(i),
      });
    }

    // Step 3: 返回 dp[0]
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'terminal',
      line: lineReturn,
      codeLine: lineReturn,
      tag: '求解完成',
      msg: `🏁 填表完成！起点状态 dp[0] = ${dp[0] === 1 ? 'true (可达)' : 'false (不可达)'}。`,
      vars: [{ name: 'dp[0]', value: dp[0] === 1 ? 'true' : 'false' }],
      dp1d: [...dp],
      cells: createCells1D(0),
      actorState: { currentSlot: 0, action: 'idle' },
      stateArrays: createStateArrays(0),
    });

    return steps;
  }

  /**
   * 阶段 4：空间优化逆向贪心收缩 (lastPos 向左寻底，O(n) 时间，O(1) 空间)
   */
  public static compileStage4(
    model: IYamlAlgorithmModel,
    options: CanJumpCompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet = model.stages?.['stage-4']?.code?.forward?.source;
      if (codeSnippet) {
        rawMap = YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap;
      }
    }
    rawMap = rawMap || {};

    const getLine = (anchor: string, fallback: number): number => {
      const v = rawMap?.[anchor];
      return typeof v === 'number' ? v : fallback;
    };

    const lineInit = getLine('init', 2);
    const lineLoop = getLine('loop', 3);
    const lineCheck = getLine('check', 4);
    const lineShrink = getLine('shrink', 5);
    const lineDone = getLine('done', 8);

    const createCells1D = (curIdx: number, lastPos: number, isDone: boolean = false) => [
      nums.map((v, idx) => ({
        value: v,
        state: isDone && lastPos === 0 && idx === 0
          ? 'matched'
          : idx === curIdx
          ? 'active'
          : idx === lastPos
          ? 'selected'
          : idx > lastPos
          ? 'visited'
          : 'normal',
        label: idx === curIdx ? '探针 i' : idx === lastPos ? '目标立足点' : `[${idx}]`,
      })),
    ];

    const createDecisions = (curIdx: number, lastPos: number, canReach: boolean) => [
      {
        label: '当前倒序扫描下标 i',
        title: '当前倒序扫描下标 i',
        formula: 'i',
        value: curIdx >= 0 ? `下标 [${curIdx}] (跳跃力 ${nums[curIdx] ?? 0})` : '初始',
        val: curIdx,
        isSelected: false,
      },
      {
        label: '该点最大向前跨越',
        title: '该点最大向前跨越',
        formula: 'i + nums[i]',
        value: curIdx >= 0 ? `${curIdx} + ${nums[curIdx]} = ${curIdx + nums[curIdx]}` : '-',
        val: curIdx >= 0 ? curIdx + nums[curIdx] : 0,
        isSelected: canReach,
      },
      {
        label: '当前目标立足点 lastPos',
        title: '当前目标立足点 lastPos',
        formula: 'lastPos',
        value: `下标 [${lastPos}]`,
        val: lastPos,
        isSelected: false,
      },
      {
        label: '能否跨越到立足点',
        title: '能否跨越到立足点',
        formula: 'i + nums[i] >= lastPos',
        value: canReach ? '✅ 可跨越，更新立足点 lastPos = i' : '❌ 无法跨越，立足点保持不变',
        val: canReach ? 1 : 0,
        isSelected: canReach,
      },
    ];

    // Step 0: 初始化 lastPos = n - 1
    let lastPos = n - 1;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '初始化立足点',
      msg: `🎯 逆向贪心启动：初始目标立足点 lastPos = ${lastPos} (终点)。只要前面某格能到达 lastPos，说明到达该格就足以到达终点！`,
      vars: [
        { name: 'lastPos', value: String(lastPos) },
        { name: 'n', value: String(n) },
      ],
      cells: createCells1D(n - 1, lastPos),
      actorState: { currentSlot: n - 1, action: 'idle' },
      decisions: createDecisions(n - 1, lastPos, true),
    });

    for (let i = n - 2; i >= 0; i--) {
      const reach = i + nums[i];
      const canReach = reach >= lastPos;

      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineLoop,
        codeLine: lineCheck,
        tag: '考察跨越力',
        msg: `🔍 考察下标 i=[${i}]：其最远跳跃 ${i} + ${nums[i]} = ${reach}，对比目标立足点 lastPos=${lastPos}。`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'reach', value: String(reach) },
          { name: 'lastPos', value: String(lastPos) },
        ],
        cells: createCells1D(i, lastPos),
        actorState: { currentSlot: i, action: 'walk' },
        decisions: createDecisions(i, lastPos, canReach),
      });

      if (canReach) {
        lastPos = i;
        steps.push({
          stepIndex: steps.length,
          flowPhase: 'forward',
          line: lineShrink,
          codeLine: lineShrink,
          tag: '立足点左移',
          msg: `📌 成功跨越！只要能到下标 ${i}，就必定能跳至原立足点，将目标左移至 lastPos = ${i}！`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'lastPos', value: String(lastPos) },
          ],
          cells: createCells1D(i, lastPos),
          actorState: { currentSlot: i, action: 'jump' },
          decisions: createDecisions(i, lastPos, true),
        });
      }
    }

    const success = lastPos === 0;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'terminal',
      line: lineDone,
      codeLine: lineDone,
      tag: '最终判定',
      msg: success
        ? `🎉 目标立足点成功收缩到起点 0 (lastPos == 0)！全盘可达，返回 true。`
        : `❌ 扫描完毕后立足点滞留在下标 ${lastPos} > 0，起点无法到达，返回 false！`,
      vars: [
        { name: 'lastPos', value: String(lastPos) },
        { name: 'return', value: String(success) },
      ],
      cells: createCells1D(0, lastPos, true),
      actorState: { currentSlot: 0, action: 'idle' },
      decisions: createDecisions(0, lastPos, success),
    });

    return steps;
  }
}
