/**
 * 跳跃游戏 II 顶层步进编译器 (Jump Game II Step Compiler)
 * 生成标准 UniversalStep，全面支持四阶段演化：
 * - Stage 1: 贪心双边界接力 (O(n) 时间，O(1) 空间)
 * - Stage 2: 记忆化递归搜索 (带 UniversalTreeNode 调用树与剪枝)
 * - Stage 3: 严格一维 DP 逆序填表 (dp[i] 表示从 i 到达终点的最小步数)
 * - Stage 4: 空间优化贪心推进
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';

export interface JumpGameIICompileOptions {
  nums: number[];
  anchorMap?: Record<string, number>;
}

export class JumpGameIIStepCompiler {
  public static compile(
    model: IYamlAlgorithmModel,
    options: JumpGameIICompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    if (stage === 2) {
      return this.compileStage2(model, options);
    }
    if (stage === 3) {
      return this.compileStage3(model, options);
    }
    return this.compileStage1(model, options, stage);
  }

  /**
   * 阶段 1 & 阶段 4：贪心双边界接力推进
   */
  public static compileStage1(
    model: IYamlAlgorithmModel,
    options: JumpGameIICompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];

    const stageKey = stage === 4 ? 'stage-4' : 'stage-1';
    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet =
        model.stages?.[stageKey]?.code?.forward?.source ||
        model.stages?.[stageKey]?.variants?.['standard']?.code?.forward?.source ||
        model.stages?.['stage-1']?.code?.forward?.source;
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
    const lineCheck = getLine('check', 6);
    const lineJump = getLine('jump', 7);
    const lineDone = getLine('done', 10);

    const createCells1D = (curIdx: number, curEnd: number, nextReach: number, isDone: boolean = false) => {
      return [
        nums.map((val, idx) => {
          let state = 'normal';
          if (isDone && idx === n - 1) state = 'matched';
          else if (idx === curIdx) state = 'active';
          else if (idx === curEnd) state = 'selected';
          else if (idx <= curEnd) state = 'visited';
          else if (idx <= nextReach) state = 'candidate';

          return {
            value: val,
            state,
            label: idx === curIdx ? '探针 i' : idx === curEnd ? '边界' : idx === n - 1 ? '终点' : `[${idx}]`,
          };
        }),
      ];
    };

    const createStateArrays = (curIdx: number, curEnd: number, nextReach: number): StateArrayItem[] => [
      {
        id: 'nums',
        name: 'nums',
        label: '跳跃数组',
        indices: nums.map((_, idx) => idx),
        values: nums,
        activeIdx: curIdx >= 0 ? curIdx : undefined,
        highlightIndices: [curEnd, Math.min(nextReach, n - 1)],
        color: 'emerald',
      },
    ];

    // Step 0: 入口帧
    const desc0 = `主函数入口：接收数组 nums=[${nums.join(', ')}]，起点位置 0，终点位置 ${n - 1}`;
    steps.push({
      stepIndex: 0,
      description: desc0,
      msg: desc0,
      tag: '入口',
      flowPhase: 'forward',
      line: lineEntry,
      codeLine: lineEntry,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(-1, 0, 0),
      stateArrays: createStateArrays(-1, 0, 0),
      actor: { i: 0, j: 0, label: '🦘' },
      actorState: { currentSlot: 0, action: 'idle' },
      activeSlot: 0,
      highlightSlots: [0],
      vars: [
        { name: 'nums.length', value: String(n) },
      ],
      phase: 'entry',
      metrics: {
        'cur-pos': '[0]',
        'cur-boundary': '[0]',
        'next-boundary': '[0]',
        jumps: '0 步',
        action: '初始化',
      },
      decisions: [
        {
          label: '边界接力初始化',
          title: '边界接力机制',
          tag: '贪心策略',
          action: '初始化',
          formula: 'curEnd = 0, nextReach = 0, steps = 0',
          value: '0 步',
          val: '0 步',
          isSelected: true,
        },
      ],
    });

    if (n <= 1) {
      const descDone = `特判：数组长度 n=${n} <= 1，已经在终点，无需跳跃，返回 0 步`;
      steps.push({
        stepIndex: steps.length,
        description: descDone,
        msg: descDone,
        tag: '特判达成',
        flowPhase: 'terminal',
        line: lineDone,
        codeLine: lineDone,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(0, 0, 0, true),
        stateArrays: createStateArrays(0, 0, 0),
        actor: { i: 0, j: 0, label: '🏁' },
        actorState: { currentSlot: 0, action: 'idle' },
        activeSlot: 0,
        highlightSlots: [0],
        vars: [
          { name: 'steps', value: '0' },
        ],
        phase: 'complete',
        metrics: {
          'cur-pos': '[0]',
          'cur-boundary': '[0]',
          'next-boundary': '[0]',
          jumps: '0 步',
          action: '🏁 已达终点',
        },
      });
      return steps;
    }

    let curEnd = 0;
    let nextReach = 0;
    let jumps = 0;

    // 变量初始化帧
    const descInit = `初始化状态：当前跳跃边界 curEnd=0，下一步最远 nextReach=0，跳跃次数 steps=0`;
    steps.push({
      stepIndex: steps.length,
      description: descInit,
      msg: descInit,
      tag: '初始化',
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(0, curEnd, nextReach),
      stateArrays: createStateArrays(0, curEnd, nextReach),
      actor: { i: 0, j: 0, label: '🦘' },
      actorState: { currentSlot: 0, action: 'walk' },
      activeSlot: 0,
      highlightSlots: [0],
      vars: [
        { name: 'curEnd', value: String(curEnd) },
        { name: 'nextReach', value: String(nextReach) },
        { name: 'steps', value: String(jumps) },
      ],
      phase: 'init',
      metrics: {
        'cur-pos': '[0]',
        'cur-boundary': `[${curEnd}]`,
        'next-boundary': `[${nextReach}]`,
        jumps: `${jumps} 步`,
        action: '初始化',
      },
    });

    for (let i = 0; i < n - 1; i++) {
      const reach = i + nums[i];

      // 循环头判定帧
      const descLoop = `循环推进：探针 i=${i} < nums.length - 1 (${n - 1})，检查该点可达最远范围`;
      steps.push({
        stepIndex: steps.length,
        description: descLoop,
        msg: descLoop,
        tag: '扫描推进',
        flowPhase: 'forward',
        line: lineLoop,
        codeLine: lineLoop,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: '🔍' },
        actorState: { currentSlot: i, action: 'walk' },
        activeSlot: i,
        highlightSlots: [curEnd, Math.min(nextReach, n - 1)],
        vars: [
          { name: 'i', value: String(i) },
          { name: 'nums[i]', value: String(nums[i]) },
          { name: 'curEnd', value: String(curEnd) },
          { name: 'nextReach', value: String(nextReach) },
          { name: 'steps', value: String(jumps) },
        ],
        phase: 'explore',
        metrics: {
          'cur-pos': `[${i}]`,
          'cur-boundary': `[${curEnd}]`,
          'next-boundary': `[${nextReach}]`,
          jumps: `${jumps} 步`,
          action: '🔍 扫描边界内节点',
        },
      });

      // 探索并更新 nextReach
      const prevNextReach = nextReach;
      nextReach = Math.max(nextReach, reach);

      const descExplore = `探测跳跃：从下标 ${i} (nums[${i}]=${nums[i]}) 最远可达 ${reach} ➔ nextReach = max(${prevNextReach}, ${reach}) = ${nextReach}`;
      steps.push({
        stepIndex: steps.length,
        description: descExplore,
        msg: descExplore,
        tag: reach > prevNextReach ? '更新最远' : '探测',
        flowPhase: 'forward',
        line: lineExplore,
        codeLine: lineExplore,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: '🦘' },
        actorState: { currentSlot: i, action: 'walk' },
        activeSlot: i,
        highlightSlots: [curEnd, Math.min(nextReach, n - 1)],
        vars: [
          { name: 'i', value: String(i) },
          { name: 'reach', value: String(reach) },
          { name: 'nextReach', value: String(nextReach) },
          { name: 'curEnd', value: String(curEnd) },
          { name: 'steps', value: String(jumps) },
        ],
        phase: 'explore',
        metrics: {
          'cur-pos': `[${i}]`,
          'cur-boundary': `[${curEnd}]`,
          'next-boundary': `[${nextReach}]`,
          jumps: `${jumps} 步`,
          action: '🔍 更新下一步最远',
        },
        decisions: [
          {
            label: reach > prevNextReach ? '更新最远探测' : '保持原有最远',
            title: `下标 ${i} 贪心最远探测`,
            tag: '最远覆盖',
            action: reach > prevNextReach ? '更新最远边界' : '维持原有最远',
            formula: `max(nextReach=${prevNextReach}, ${i} + nums[${i}]=${reach})`,
            value: `最远 ${nextReach}`,
            val: String(nextReach),
            isSelected: true,
          },
        ],
      });

      // 边界检查帧
      const hitBoundary = i === curEnd;
      const descCheck = `边界判定：当前位置 i=${i}，当前步覆盖边界 curEnd=${curEnd}。${hitBoundary ? '触碰边界，必须接力跳跃！' : '尚未触碰边界，继续向前探测。'}`;
      steps.push({
        stepIndex: steps.length,
        description: descCheck,
        msg: descCheck,
        tag: hitBoundary ? '触碰边界' : '继续探测',
        flowPhase: 'forward',
        line: lineCheck,
        codeLine: lineCheck,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: hitBoundary ? '⚡' : '🔍' },
        actorState: { currentSlot: i, action: 'compare' },
        activeSlot: i,
        highlightSlots: [curEnd, Math.min(nextReach, n - 1)],
        vars: [
          { name: 'i', value: String(i) },
          { name: 'curEnd', value: String(curEnd) },
          { name: 'isBoundary', value: String(hitBoundary) },
          { name: 'steps', value: String(jumps) },
        ],
        phase: 'explore',
        metrics: {
          'cur-pos': `[${i}]`,
          'cur-boundary': `[${curEnd}]`,
          'next-boundary': `[${nextReach}]`,
          jumps: `${jumps} 步`,
          action: hitBoundary ? '⚡ 触碰边界' : '继续探测',
        },
      });

      if (hitBoundary) {
        const prevBoundary = curEnd;
        curEnd = nextReach;
        jumps++;

        const jumpTarget = Math.min(curEnd, n - 1);
        const descJump = `⚡ 接力跳跃触发：从原边界 [${prevBoundary}] 推进到新边界 [${curEnd}]，完成第 ${jumps} 次跳跃！`;
        steps.push({
          stepIndex: steps.length,
          description: descJump,
          msg: descJump,
          tag: `第${jumps}次跳跃`,
          flowPhase: 'forward',
          line: lineJump,
          codeLine: lineJump,
          grid: [nums],
          dp1d: nums,
          cells: createCells1D(i, curEnd, nextReach),
          stateArrays: createStateArrays(i, curEnd, nextReach),
          actor: { i: 0, j: jumpTarget, label: '🦘' },
          actorState: { currentSlot: jumpTarget, jumpFrom: i, action: 'jump' },
          activeSlot: jumpTarget,
          highlightSlots: [curEnd, Math.min(nextReach, n - 1)],
          vars: [
            { name: 'i', value: String(i) },
            { name: 'curEnd', value: String(curEnd) },
            { name: 'steps', value: String(jumps) },
          ],
          phase: 'transition',
          metrics: {
            'cur-pos': `[${i}]`,
            'cur-boundary': `[${curEnd}]`,
            'next-boundary': `[${nextReach}]`,
            jumps: `${jumps} 步`,
            action: '🦘 边界接力跳跃',
          },
          decisions: [
            {
              label: `跳跃接力至 [${jumpTarget}]`,
              title: `第 ${jumps} 次贪心跳跃接力`,
              tag: '触发跳跃',
              action: `推进边界至 [${curEnd}]`,
              formula: `curEnd = nextReach (${curEnd}); steps++`,
              value: `${jumps} 步`,
              val: `${jumps} 步`,
              isSelected: true,
            },
          ],
        });
      }
    }

    // 收敛与最终答案帧
    const descDone = `🎉 到达终点收敛！从起点跳跃至末尾所需的最少跳跃次数为 ${jumps} 次。`;
    steps.push({
      stepIndex: steps.length,
      description: descDone,
      msg: descDone,
      tag: '完结',
      flowPhase: 'terminal',
      line: lineDone,
      codeLine: lineDone,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(n - 1, curEnd, nextReach, true),
      stateArrays: createStateArrays(n - 1, curEnd, nextReach),
      actor: { i: 0, j: n - 1, label: '🏆' },
      actorState: { currentSlot: n - 1, action: 'idle' },
      activeSlot: n - 1,
      highlightSlots: [n - 1],
      vars: [
        { name: 'return steps', value: String(jumps) },
      ],
      phase: 'complete',
      metrics: {
        'cur-pos': `[${n - 1}]`,
        'cur-boundary': `[${curEnd}]`,
        'next-boundary': `[${nextReach}]`,
        jumps: `${jumps} 步`,
        action: '🏁 已达终点',
      },
      decisions: [
        {
          label: '贪心最优解',
          title: '全局最优解',
          tag: '贪心最优',
          action: '返回最少跳跃步数',
          formula: 'ans = steps',
          value: `${jumps} 步`,
          val: `${jumps} 步`,
          isSelected: true,
        },
      ],
    });

    return steps;
  }

  /**
   * 阶段 2：记忆化搜索 (带 UniversalTreeNode 树与剪枝)
   */
  public static compileStage2(
    model: IYamlAlgorithmModel,
    options: JumpGameIICompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];
    const maxSteps = 800;

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet =
        model.stages?.['stage-2']?.code?.forward?.source ||
        model.stages?.['stage-2']?.variants?.['standard']?.code?.forward?.source;
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
    const lineFill = getLine('fill', 3);
    const lineEntry = getLine('entry', 4);
    const lineBoundary = getLine('boundary', 7);
    const lineCacheHit = getLine('cache_hit', 8);
    const lineMinInit = getLine('min_init', 9);
    const lineLoop = getLine('loop', 10);
    const lineBranch = getLine('branch', 11);
    const lineTransfer = getLine('transfer', 13);
    const lineMemoStore = getLine('memo_store', 16);
    const lineReturn = getLine('return', 17);

    const memo = new Array(n).fill(-1);

    let nodeIdCounter = 0;
    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: 0,
      val: 'dfs(0)',
      status: 'current',
      children: [],
    };

    const stack: Array<{ i: number; label: string }> = [];

    const pushStep = (
      stepData: Partial<UniversalStep>,
      currentNode: UniversalTreeNode
    ) => {
      if (steps.length >= maxSteps) return;
      const slot = Math.min(currentNode.r, n - 1);
      steps.push({
        flowPhase: 'forward',
        actorState: { currentSlot: slot, action: 'walk' },
        activeSlot: slot,
        highlightSlots: [slot],
        grid: [memo.map((v) => (v === -1 ? null : v))],
        dp1d: memo.map((v) => (v === -1 ? null : v)),
        activeNodeId: currentNode.id,
        treeRoot: cloneStateDepTree(rootNode),
        callStack: stack.map((f) => ({ label: f.label, coord: `${f.i}` })),
        activeStack: stack.map((f) => `${f.i}`),
        ...stepData,
      });
    };

    // 初始化 memo
    pushStep({
      line: lineInit,
      codeLine: lineInit,
      tag: '初始化缓存',
      msg: `🚀 初始化 memo 数组长度 ${n}，用于记忆化搜索`,
      vars: [{ name: 'nums.length', value: String(n) }],
    }, rootNode);

    pushStep({
      line: lineFill,
      codeLine: lineFill,
      tag: '填充-1',
      msg: `📦 将 memo 全部填为 -1（表示未计算）`,
      vars: [{ name: 'memo', value: '[-1, ...]' }],
    }, rootNode);

    // 主函数启动
    pushStep({
      line: lineEntry,
      codeLine: lineEntry,
      tag: '启动递归',
      msg: `🚀 从下标 0 启动记忆化 DFS：dfs(nums, 0, memo)`,
      vars: [{ name: 'i', value: '0' }],
    }, rootNode);

    const dfs = (i: number, node: UniversalTreeNode): number => {
      if (steps.length >= maxSteps) return 0;

      const frameLabel = `dfs(${i})`;
      stack.push({ i, label: frameLabel });
      node.status = 'current';

      // 触底判定
      if (i >= n - 1) {
        node.status = 'base';
        node.tag = '🎯=0';
        pushStep({
          flowPhase: 'terminal',
          line: lineBoundary,
          codeLine: lineBoundary,
          tag: '触底终点',
          msg: `✅ 已到达或越过终点 (i=${i} >= ${n - 1})，无需再跳跃，返回 0`,
          vars: [{ name: 'i', value: String(i) }, { name: 'return', value: '0' }],
        }, node);
        stack.pop();
        return 0;
      }

      // 缓存命中
      if (memo[i] !== -1) {
        node.status = 'pruned';
        node.tag = `⚡=${memo[i]}`;
        pushStep({
          flowPhase: 'forward',
          line: lineCacheHit,
          codeLine: lineCacheHit,
          tag: '缓存命中',
          msg: `🎯 缓存命中！memo[${i}] = ${memo[i]}，直接剪枝复用`,
          vars: [{ name: 'i', value: String(i) }, { name: 'memo[i]', value: String(memo[i]) }],
        }, node);
        stack.pop();
        return memo[i];
      }

      // 初始化 minSteps
      let minSteps = 1000000;
      pushStep({
        flowPhase: 'forward',
        line: lineMinInit,
        codeLine: lineMinInit,
        tag: '初始化极值',
        msg: `📥 下标 ${i} 准备考察最大跳跃范围 nums[${i}]=${nums[i]}`,
        vars: [{ name: 'i', value: String(i) }, { name: 'nums[i]', value: String(nums[i]) }],
      }, node);

      // 分支循环
      const maxJump = nums[i];
      for (let j = 1; j <= maxJump && i + j < n; j++) {
        const nextI = i + j;
        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: nextI,
          c: 0,
          val: `dfs(${nextI})`,
          edgeLabel: `+${j}`,
          status: 'current',
          children: [],
        };
        node.children.push(childNode);

        pushStep({
          flowPhase: 'forward',
          line: lineBranch,
          codeLine: lineBranch,
          tag: `尝试跳${j}步`,
          msg: `🌿 从下标 ${i} 尝试跳跃 ${j} 步至下标 ${nextI}，进入子递归`,
          vars: [{ name: 'i', value: String(i) }, { name: 'j', value: String(j) }, { name: 'nextI', value: String(nextI) }],
        }, childNode);

        const sub = dfs(nextI, childNode);

        if (sub !== 1000000) {
          const candidate = sub + 1;
          if (candidate < minSteps) {
            minSteps = candidate;
            pushStep({
              flowPhase: 'forward',
              line: lineTransfer,
              codeLine: lineTransfer,
              tag: '更新最优步数',
              msg: `✨ 找到更优方案：从 ${i} 跳至 ${nextI} 后续需 ${sub} 步，总步数 = ${minSteps}`,
              vars: [{ name: 'minSteps', value: String(minSteps) }],
            }, node);
          }
        }
      }

      memo[i] = minSteps === 1000000 ? 0 : minSteps;
      node.status = 'visited';
      node.tag = `=${memo[i]}`;

      pushStep({
        flowPhase: 'forward',
        line: lineMemoStore,
        codeLine: lineMemoStore,
        tag: '写入缓存',
        msg: `💾 写入缓存：memo[${i}] = ${memo[i]}`,
        vars: [{ name: 'memo[i]', value: String(memo[i]) }],
      }, node);

      pushStep({
        flowPhase: 'backtrack',
        line: lineReturn,
        codeLine: lineReturn,
        tag: '返回',
        msg: `↩️ 栈帧 dfs(${i}) 返回最少跳跃步数 ${memo[i]}`,
        vars: [{ name: 'return', value: String(memo[i]) }],
      }, node);

      stack.pop();
      return memo[i];
    };

    const finalAns = dfs(0, rootNode);

    pushStep({
      flowPhase: 'terminal',
      line: lineEntry,
      codeLine: lineEntry,
      tag: '完结',
      msg: `🎉 记忆化搜索完成！从起点到达终点的最少跳跃次数为 ${finalAns} 步`,
      vars: [{ name: 'return', value: String(finalAns) }],
    }, rootNode);

    return steps;
  }

  /**
   * 阶段 3：严格一维 DP 逆序填表 (dp[i] 表示从 i 到达终点的最小步数)
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    options: JumpGameIICompileOptions
  ): UniversalStep[] {
    const rawNums = options.nums && options.nums.length > 0 ? options.nums : [2, 3, 1, 1, 4];
    const nums = [...rawNums];
    const n = nums.length;
    const steps: UniversalStep[] = [];
    const INF = 1000000;

    let rawMap = options.anchorMap;
    if (!rawMap) {
      const codeSnippet =
        model.stages?.['stage-3']?.code?.forward?.source ||
        model.stages?.['stage-3']?.variants?.['standard']?.code?.forward?.source;
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
    const lineFill = getLine('fill', 4);
    const lineBase = getLine('base', 5);
    const lineOuter = getLine('outer_loop', 6);
    const lineInner = getLine('inner_loop', 7);
    const lineTransfer = getLine('transfer', 9);
    const lineReturn = getLine('return', 13);

    const dp = new Array(n).fill(INF);

    const pushStep = (stepData: Partial<UniversalStep>, curI: number) => {
      const displayDp = dp.map((v) => (v >= INF ? null : v));
      steps.push({
        flowPhase: 'forward',
        actorState: { currentSlot: Math.max(0, curI), action: 'walk' },
        activeSlot: Math.max(0, curI),
        highlightSlots: [Math.max(0, curI)],
        grid: [displayDp],
        dp1d: displayDp,
        i: curI,
        j: 0,
        ...stepData,
      });
    };

    // 1. 初始化数组
    pushStep({
      line: lineInit,
      codeLine: lineInit,
      tag: '创建DP表',
      msg: `🚀 创建长度为 ${n} 的 dp 表，dp[i] 表示从位置 i 到达末尾的最小跳跃步数`,
      vars: [{ name: 'n', value: String(n) }],
    }, -1);

    // 2. 填充 INF
    pushStep({
      line: lineFill,
      codeLine: lineFill,
      tag: '初始化正无穷',
      msg: `📦 将 dp 表填充为最大值 (INF)，表示初始不可达`,
      vars: [{ name: 'dp', value: '[INF, ...]' }],
    }, -1);

    // 3. 基底条件
    dp[n - 1] = 0;
    pushStep({
      line: lineBase,
      codeLine: lineBase,
      tag: '基底归纳',
      msg: `🎯 基底设定：终点位置无需跳跃，dp[${n - 1}] = 0`,
      vars: [{ name: `dp[${n - 1}]`, value: '0' }],
    }, n - 1);

    // 4. 从右向左倒序填表
    for (let i = n - 2; i >= 0; i--) {
      pushStep({
        line: lineOuter,
        codeLine: lineOuter,
        tag: '考察节点',
        msg: `📦 外层倒序考察下标 i=${i}，nums[${i}]=${nums[i]}`,
        vars: [{ name: 'i', value: String(i) }, { name: 'nums[i]', value: String(nums[i]) }],
      }, i);

      const maxJump = nums[i];
      for (let j = 1; j <= maxJump && i + j < n; j++) {
        const nextPos = i + j;

        pushStep({
          line: lineInner,
          codeLine: lineInner,
          tag: '探测分支',
          msg: `🔍 从下标 ${i} 尝试跳跃 ${j} 步至 ${nextPos} (其 dp 值为 ${dp[nextPos] >= INF ? 'INF' : dp[nextPos]})`,
          vars: [
            { name: 'i', value: String(i) },
            { name: 'j', value: String(j) },
            { name: 'nextPos', value: String(nextPos) },
            { name: `dp[${nextPos}]`, value: dp[nextPos] >= INF ? 'INF' : String(dp[nextPos]) },
          ],
        }, i);

        if (dp[nextPos] !== INF) {
          const candidate = dp[nextPos] + 1;
          if (candidate < dp[i]) {
            dp[i] = candidate;
            pushStep({
              line: lineTransfer,
              codeLine: lineTransfer,
              tag: '状态转移',
              msg: `✨ dp[${i}] 状态更新：min(dp[${i}], dp[${nextPos}] + 1) = ${dp[i]}`,
              vars: [
                { name: 'i', value: String(i) },
                { name: `dp[${i}]`, value: String(dp[i]) },
              ],
            }, i);
          }
        }
      }
    }

    // 5. 最终返回答案
    const finalAns = dp[0] >= INF ? 0 : dp[0];
    pushStep({
      flowPhase: 'terminal',
      line: lineReturn,
      codeLine: lineReturn,
      tag: '完结',
      msg: `🎉 DP 填表推导完成！从起点 0 到达终点的最少跳跃次数为 dp[0] = ${finalAns} 步`,
      vars: [{ name: 'return dp[0]', value: String(finalAns) }],
    }, 0);

    return steps;
  }
}
