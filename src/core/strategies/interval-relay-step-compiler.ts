/**
 * 区间接力与覆盖通用步进编译器 (IntervalRelayStepCompiler)
 * 核心深模块 (Deep Module) —— 统领全库区间贪心、跳跃游戏与边界接力覆盖族群：
 * - LeetCode 45: 跳跃游戏 II (Jump Game II)
 * - LeetCode 1326: 灌溉花园的最少水龙头数目 (Min Taps to Water Garden)
 * - LeetCode 1024: 视频拼接 (Video Stitching)
 * 
 * 状态机核心三元组：[curIdx 探针, curEnd 当前确认边界, nextReach 最远探测前沿]
 * 全面支持 4 阶段演化与顺逆推双向流转：
 * - Stage 1 & Stage 4: 双边界接力贪心推进 (O(n) 时间, O(1) / O(n) 空间)
 * - Stage 2: 记忆化区间搜索 (带 UniversalTreeNode 调用树与剪枝)
 * - Stage 3: 一维 DP 表区间松弛填表
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem, UniversalTreeNode } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';
import { cloneStateDepTree } from './tree-clone';

export interface IntervalRelayDomainContext {
  unitName?: string;       // e.g. '水龙头' / '跳跃' / '视频片段'
  unitLabel?: string;      // e.g. '辐射半径' / '最大跨度' / '时长'
  targetName?: string;     // e.g. '花园终点' / '终点' / '完整视频'
  sourceArray?: number[];  // 原始输入数组 (如 ranges)
  sourceName?: string;     // 原始输入数组名 (如 'ranges')
}

export interface IntervalRelayCompileOptions {
  target: number;                       // 目标覆盖终点 (0..target)
  rightReach: number[];                 // 每个左端点起点的最远到达右边界
  jumpSpans?: number[];                 // 对应的跳跃跨度
  domainContext?: IntervalRelayDomainContext;
  anchorMap?: Record<string, number>;
  direction?: 'forward' | 'reverse';
  allowUnreachable?: boolean;           // 是否允许中间不可达 (返回 -1，如 min-taps)
}

export class IntervalRelayStepCompiler {
  /**
   * 门面编译入口
   */
  public static compile(
    model: IYamlAlgorithmModel,
    options: IntervalRelayCompileOptions,
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
   * 便捷适配器：从纯跳跃数组 (如 Jump Game II nums) 启动
   */
  public static compileFromJumps(
    model: IYamlAlgorithmModel,
    nums: number[],
    options?: Partial<IntervalRelayCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    const target = Math.max(0, nums.length - 1);
    const rightReach = nums.map((jump, i) => Math.min(target, i + jump));
    return this.compile(
      model,
      {
        target,
        rightReach,
        jumpSpans: nums,
        domainContext: {
          unitName: '跳跃',
          unitLabel: '最大跳力',
          targetName: '终点',
          sourceArray: nums,
          sourceName: 'nums',
          ...options?.domainContext,
        },
        anchorMap: options?.anchorMap,
        direction: options?.direction,
        allowUnreachable: options?.allowUnreachable ?? false,
      },
      stage
    );
  }

  /**
   * 便捷适配器：从水龙头辐射半径 (ranges) 启动
   */
  public static compileFromTaps(
    model: IYamlAlgorithmModel,
    n: number,
    ranges: number[],
    options?: Partial<IntervalRelayCompileOptions>,
    stage: number = 1
  ): UniversalStep[] {
    const rightReach = new Array(n + 1).fill(0);
    for (let i = 0; i <= n; i++) {
      const r = ranges[i] ?? 0;
      const l = Math.max(0, i - r);
      const right = Math.min(n, i + r);
      rightReach[l] = Math.max(rightReach[l], right);
    }

    const jumpSpans = new Array(n + 1).fill(0);
    for (let i = 0; i <= n; i++) {
      jumpSpans[i] = Math.max(0, rightReach[i] - i);
    }

    return this.compile(
      model,
      {
        target: n,
        rightReach,
        jumpSpans,
        domainContext: {
          unitName: '水龙头',
          unitLabel: '辐射半径',
          targetName: '花园终点',
          sourceArray: ranges,
          sourceName: 'ranges',
          ...options?.domainContext,
        },
        anchorMap: options?.anchorMap,
        direction: options?.direction,
        allowUnreachable: true,
      },
      stage
    );
  }

  /**
   * Stage 1 & Stage 4: 贪心双边界接力推进
   */
  public static compileStage1(
    model: IYamlAlgorithmModel,
    options: IntervalRelayCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    const { target, rightReach, domainContext } = options;
    const unit = domainContext?.unitName || '区间';
    const targetName = domainContext?.targetName || '目标终点';
    const sourceArr = domainContext?.sourceArray;
    const sourceName = domainContext?.sourceName || 'nums';

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
    const lineBuild = getLine('build', 5);
    const lineInit = getLine('init', 7);
    const lineLoop = getLine('loop', 8);
    const lineExplore = getLine('explore', 9);
    const lineFail = getLine('fail', 11);
    const lineJump = getLine('jump', 12);
    const lineDone = getLine('done', 16);

    const createCells = (curIdx: number, curEnd: number, nextReach: number, isDone: boolean = false) => [
      Array.from({ length: target + 1 }, (_, idx) => {
        let state = 'normal';
        if (isDone && idx <= curEnd) state = 'matched';
        else if (idx === curIdx) state = 'active';
        else if (idx === curEnd) state = 'selected';
        else if (idx <= curEnd) state = 'visited';
        else if (idx <= nextReach) state = 'candidate';
        else if (idx === target) state = 'target';

        const val = sourceArr ? sourceArr[idx] ?? rightReach[idx] : rightReach[idx];
        return {
          value: val,
          state,
          label:
            idx === curIdx
              ? '探针 i'
              : idx === curEnd
              ? '覆盖边界'
              : idx === target
              ? targetName
              : `[${idx}]`,
        };
      }),
    ];

    const createStateArrays = (
      curIdx: number,
      curEnd: number,
      nextReach: number
    ): StateArrayItem[] => {
      const arrays: StateArrayItem[] = [];
      if (sourceArr) {
        arrays.push({
          id: sourceName,
          name: sourceName,
          label: `${unit}原始参数`,
          indices: sourceArr.map((_, i) => i),
          values: sourceArr,
          activeIdx: curIdx >= 0 ? curIdx : undefined,
        });
      }
      arrays.push({
        id: 'rightReach',
        name: 'rightReach',
        label: '左端点最远接力边界',
        indices: rightReach.map((_, i) => i),
        values: rightReach,
        activeIdx: curIdx >= 0 ? curIdx : undefined,
        highlightIndices: [curEnd, Math.min(nextReach, target)],
      });
      return arrays;
    };

    const createDecisions = (
      curIdx: number,
      curEnd: number,
      nextReach: number,
      stepsCount: number,
      isRelay: boolean,
      isFailed: boolean
    ) => [
      {
        label: '当前探针位置 i',
        title: '当前探针位置 i',
        formula: 'i',
        value: curIdx >= 0 ? `坐标 [${curIdx}]` : '初始入口',
        val: curIdx >= 0 ? curIdx : 0,
        isSelected: false,
      },
      {
        label: '已确认覆盖右边界 curEnd',
        title: '已确认覆盖右边界 curEnd',
        formula: 'curEnd',
        value: `[0, ${curEnd}]`,
        val: curEnd,
        isSelected: false,
      },
      {
        label: '最远可扩展前沿 nextReach',
        title: '最远可扩展前沿 nextReach',
        formula: 'max(nextReach, rightReach[i])',
        value: `最远可探达 [${nextReach}]`,
        val: nextReach,
        isSelected: isRelay,
      },
      {
        label: `已选用${unit}数`,
        title: `已选用${unit}数`,
        formula: 'steps',
        value: isFailed ? '无法覆盖全域 (-1)' : `${stepsCount} 个`,
        val: stepsCount,
        isSelected: isRelay || curEnd >= target,
      },
    ];

    // Step 0: 入口帧
    const desc0 = `🚀 启动区间接力模型：覆盖目标区间 [0, ${target}]，统一使用双边界推进贪心。`;
    steps.push({
      stepIndex: 0,
      flowPhase: 'forward',
      line: lineEntry,
      codeLine: lineEntry,
      tag: '函数入口',
      msg: desc0,
      description: desc0,
      vars: [
        { name: 'target', value: String(target) },
        { name: 'totalUnits', value: String(rightReach.length) },
      ],
      cells: createCells(-1, 0, 0),
      actorState: { currentSlot: 0, action: 'idle' },
      stateArrays: createStateArrays(-1, 0, 0),
      decisions: createDecisions(-1, 0, 0, 0, false, false),
    });

    // Step 1: 预处理完成帧
    const desc1 = `📌 状态空间就绪：已将各起点最远接力右端点归约为 rightReach=[${rightReach.join(', ')}]。`;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineBuild,
      codeLine: lineBuild,
      tag: '区间归约',
      msg: desc1,
      description: desc1,
      vars: [
        { name: 'rightReach[0]', value: String(rightReach[0] ?? 0) },
        { name: 'target', value: String(target) },
      ],
      cells: createCells(0, 0, rightReach[0] ?? 0),
      actorState: { currentSlot: 0, action: 'idle' },
      stateArrays: createStateArrays(0, 0, rightReach[0] ?? 0),
      decisions: createDecisions(0, 0, rightReach[0] ?? 0, 0, false, false),
    });

    let curEnd = 0;
    let nextReach = 0;
    let stepsCount = 0;
    let failed = false;

    // Step 2: 变量初始化帧
    const descInit = `📌 循环初始化：当前已确认边界 curEnd=0，最远探索 nextReach=0，步数 steps=0。`;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '变量就绪',
      msg: descInit,
      description: descInit,
      vars: [
        { name: 'curEnd', value: '0' },
        { name: 'nextReach', value: '0' },
        { name: 'steps', value: '0' },
      ],
      cells: createCells(0, 0, 0),
      actorState: { currentSlot: 0, action: 'walk' },
      stateArrays: createStateArrays(0, 0, 0),
      decisions: createDecisions(0, 0, 0, 0, false, false),
    });

    const loopLimit = options.allowUnreachable ? target : target;
    for (let i = 0; i < loopLimit; i++) {
      const oldNext = nextReach;
      nextReach = Math.max(nextReach, rightReach[i] ?? 0);

      const descExplore = `🔍 探针到达位置 i=[${i}]：从该左端点最远可延伸至 [${rightReach[i] ?? 0}]，更新 nextReach = max(${oldNext}, ${rightReach[i] ?? 0}) = ${nextReach}。`;
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineExplore,
        codeLine: lineExplore,
        tag: '前沿探测',
        msg: descExplore,
        description: descExplore,
        vars: [
          { name: 'i', value: String(i) },
          { name: `rightReach[${i}]`, value: String(rightReach[i] ?? 0) },
          { name: 'nextReach', value: String(nextReach) },
          { name: 'curEnd', value: String(curEnd) },
        ],
        cells: createCells(i, curEnd, nextReach),
        actorState: { currentSlot: i, action: 'walk' },
        stateArrays: createStateArrays(i, curEnd, nextReach),
        decisions: createDecisions(i, curEnd, nextReach, stepsCount, false, false),
      });

      if (i === curEnd) {
        if (options.allowUnreachable && nextReach <= i) {
          failed = true;
          const descFail = `❌ 覆盖断裂！当前位置 i=${i} 触碰边界，但最远探测 nextReach=${nextReach} <= i，无法跨越断层，返回 -1！`;
          steps.push({
            stepIndex: steps.length,
            flowPhase: 'terminal',
            line: lineFail,
            codeLine: lineFail,
            tag: '接力断裂',
            msg: descFail,
            description: descFail,
            vars: [
              { name: 'nextReach', value: String(nextReach) },
              { name: 'curEnd', value: String(curEnd) },
              { name: 'return', value: '-1' },
            ],
            cells: createCells(i, curEnd, nextReach),
            actorState: { currentSlot: i, action: 'idle' },
            stateArrays: createStateArrays(i, curEnd, nextReach),
            decisions: createDecisions(i, curEnd, nextReach, stepsCount, false, true),
          });
          break;
        }

        curEnd = nextReach;
        stepsCount++;

        const descJump = `🚰 触碰当前已确认边界！贪心接力触发，开启第 ${stepsCount} 个${unit}，将覆盖前沿推进至 [0, ${curEnd}]！`;
        steps.push({
          stepIndex: steps.length,
          flowPhase: 'forward',
          line: lineJump,
          codeLine: lineJump,
          tag: '接力推进',
          msg: descJump,
          description: descJump,
          vars: [
            { name: 'curEnd', value: String(curEnd) },
            { name: 'steps', value: String(stepsCount) },
          ],
          cells: createCells(i, curEnd, nextReach),
          actorState: { currentSlot: Math.min(target, curEnd), action: 'jump' },
          stateArrays: createStateArrays(i, curEnd, nextReach),
          decisions: createDecisions(i, curEnd, nextReach, stepsCount, true, false),
        });
      }
    }

    if (!failed) {
      const descDone = `🎉 成功完全覆盖全域 [0, ${target}]！最少需要 ${stepsCount} 个${unit}。`;
      steps.push({
        stepIndex: steps.length,
        flowPhase: 'terminal',
        line: lineDone,
        codeLine: lineDone,
        tag: '求解达成',
        msg: descDone,
        description: descDone,
        vars: [
          { name: 'curEnd', value: String(curEnd) },
          { name: 'return', value: String(stepsCount) },
        ],
        cells: createCells(target, target, target, true),
        actorState: { currentSlot: target, action: 'idle' },
        stateArrays: createStateArrays(target, target, target),
        decisions: createDecisions(target, target, target, stepsCount, false, false),
      });
    }

    return steps;
  }

  /**
   * Stage 2: 记忆化区间搜索 (带 UniversalTreeNode 调用树与剪枝)
   */
  public static compileStage2(
    model: IYamlAlgorithmModel,
    options: IntervalRelayCompileOptions
  ): UniversalStep[] {
    const { target, rightReach, domainContext } = options;
    const unit = domainContext?.unitName || '区间';
    const sourceArr = domainContext?.sourceArray;

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
    const lineEntry = getLine('entry', 4);
    const lineBoundary = getLine('boundary', 7);
    const lineCacheHit = getLine('cache_hit', 8);
    const lineBranch = getLine('branch', 11);
    const lineMemoStore = getLine('memo_store', 15);

    let nodeIdCounter = 0;
    const rootNode: UniversalTreeNode = {
      id: 'node-0',
      r: 0,
      c: 0,
      val: 'dfs(0)',
      status: 'active',
      tag: '覆盖起点 0',
      children: [],
    };

    const callStack: Array<{ label: string; coord: string }> = [];
    const memo: Map<number, number> = new Map();

    const pushStep = (
      phase: 'forward' | 'backtrack' | 'terminal',
      lineNum: number,
      tag: string,
      msg: string,
      curPos: number,
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
        description: msg,
        vars,
        activeNodeId: activeId,
        treeRoot: cloneStateDepTree(rootNode),
        callStack: callStack.map(s => ({ ...s })),
        cells: [
          Array.from({ length: target + 1 }, (_, idx) => ({
            value: sourceArr ? sourceArr[idx] ?? 0 : rightReach[idx] ?? 0,
            state: idx === curPos ? 'active' : memo.has(idx) ? 'visited' : 'normal',
            label: idx === curPos ? `覆盖至 ${curPos}` : `[${idx}]`,
          })),
        ],
        actorState: { currentSlot: Math.min(target, Math.max(0, curPos)), action: 'walk' },
      });
    };

    // Step 0: 入口
    steps.push({
      stepIndex: 0,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '函数入口',
      msg: `🚀 记忆化搜索入口：dfs(cur) 表示当前覆盖到边界 cur 时，覆盖剩余区间 [cur, ${target}] 所需的最少${unit}数。`,
      vars: [{ name: 'cur', value: '0' }, { name: 'target', value: String(target) }],
      activeNodeId: rootNode.id,
      treeRoot: cloneStateDepTree(rootNode),
      callStack: [],
    });

    const dfs = (cur: number, parentNode: UniversalTreeNode | null, branchIdx: number): number => {
      const myId = parentNode === null ? 'node-0' : `node-${++nodeIdCounter}`;
      const myNode: UniversalTreeNode =
        parentNode === null
          ? rootNode
          : {
              id: myId,
              r: cur,
              c: 0,
              val: `dfs(${cur})`,
              edgeLabel: `${unit}#${branchIdx}`,
              status: 'active',
              tag: `覆盖到 ${cur}`,
              children: [],
            };

      if (parentNode !== null) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(myNode);
      }

      callStack.push({
        label: `dfs(cur=${cur})`,
        coord: `${cur}`,
      });

      pushStep(
        'forward',
        lineEntry,
        '进入递归',
        `📥 进入调用帧 dfs(cur=${cur})，考察能否选取${unit}将覆盖向右推进。`,
        cur,
        myId,
        [{ name: 'cur', value: String(cur) }, { name: 'target', value: String(target) }]
      );

      if (cur >= target) {
        myNode.status = 'computed';
        myNode.tag = '✅ 0 (已完全覆盖)';
        pushStep(
          'terminal',
          lineBoundary,
          '完全覆盖',
          `🎯 达成全覆盖！cur=${cur} >= target=${target}，无需额外${unit}，返回 0。`,
          cur,
          myId,
          [{ name: 'cur', value: String(cur) }, { name: 'return', value: '0' }]
        );
        callStack.pop();
        return 0;
      }

      if (memo.has(cur)) {
        const cached = memo.get(cur)!;
        myNode.status = 'pruned';
        myNode.tag = cached < 10000 ? `⚡ 缓存: ${cached}个` : '⚡ 不可达';
        pushStep(
          'backtrack',
          lineCacheHit,
          '记忆化剪枝',
          `⚡ 记忆化缓存命中：从位置 ${cur} 出发的最少${unit}数为 ${cached < 10000 ? cached : -1}，无需重复计算！`,
          cur,
          myId,
          [{ name: 'memo[cur]', value: String(cached < 10000 ? cached : -1) }]
        );
        callStack.pop();
        return cached;
      }

      let minCount = 10000;

      if (sourceArr) {
        for (let i = 0; i <= target; i++) {
          const left = Math.max(0, i - sourceArr[i]);
          const right = Math.min(target, i + sourceArr[i]);
          if (left <= cur && right > cur) {
            pushStep(
              'forward',
              lineBranch,
              '尝试接力',
              `🚰 尝试选取${unit} #${i} (覆盖 [${left}, ${right}])，将覆盖边界推进至 ${right}。`,
              cur,
              myId,
              [{ name: 'unit', value: String(i) }, { name: 'newReach', value: String(right) }]
            );

            const sub = dfs(right, myNode, i);
            if (sub < 10000) {
              minCount = Math.min(minCount, 1 + sub);
            }
          }
        }
      } else {
        const maxReach = rightReach[cur] ?? cur;
        for (let next = cur + 1; next <= Math.min(target, maxReach); next++) {
          pushStep(
            'forward',
            lineBranch,
            '尝试跳跃',
            `🦘 从位置 ${cur} 尝试跳跃至 ${next}。`,
            cur,
            myId,
            [{ name: 'from', value: String(cur) }, { name: 'to', value: String(next) }]
          );

          const sub = dfs(next, myNode, next);
          if (sub < 10000) {
            minCount = Math.min(minCount, 1 + sub);
          }
        }
      }

      memo.set(cur, minCount);
      myNode.status = 'computed';
      myNode.tag = minCount < 10000 ? `✅ ${minCount}个` : '❌ 不可达';

      pushStep(
        minCount < 10000 ? 'forward' : 'backtrack',
        lineMemoStore,
        '记录缓存',
        minCount < 10000
          ? `🎉 位置 ${cur} 的最少${unit}数为 ${minCount} 个，落盘 memo 并回溯。`
          : `🚫 从位置 ${cur} 无法完全覆盖全域，记录不可达并回溯。`,
        cur,
        myId,
        [{ name: `memo[${cur}]`, value: String(minCount < 10000 ? minCount : -1) }]
      );

      callStack.pop();
      return minCount;
    };

    dfs(0, null, 0);

    return steps;
  }

  /**
   * Stage 3: 一维 DP 表区间松弛推导 (dp[i] 表示覆盖 [0, i] 所需最少单位数)
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    options: IntervalRelayCompileOptions
  ): UniversalStep[] {
    const { target, rightReach, domainContext } = options;
    const unit = domainContext?.unitName || '区间';
    const sourceArr = domainContext?.sourceArray;

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

    const lineInit = getLine('init', 2);
    const lineBase = getLine('base', 4);
    const lineOuter = getLine('outer_loop', 5);
    const lineTransfer = getLine('transfer', 9);
    const lineReturn = getLine('return', 12);

    const INF = target + 2;
    const dp: (number | null)[] = new Array(target + 1).fill(INF);

    const createCells = (curIdx: number) => [
      Array.from({ length: target + 1 }, (_, idx) => ({
        value: sourceArr ? sourceArr[idx] ?? 0 : rightReach[idx] ?? 0,
        state: idx === curIdx ? 'active' : dp[idx] !== INF && dp[idx] !== null ? 'matched' : 'normal',
        label: idx === curIdx ? `${unit} #${curIdx}` : `[${idx}]`,
      })),
    ];

    const createStateArrays = (curIdx: number): StateArrayItem[] => [
      {
        id: 'dp',
        name: 'dp',
        label: `一维 DP 状态表 (覆盖 [0, i] 所需最少${unit}数)`,
        indices: dp.map((_, i) => i),
        values: dp.map(v => (v === INF ? '∞' : v === null ? '-' : String(v))),
        activeIdx: curIdx >= 0 ? curIdx : undefined,
      },
    ];

    // Step 0: 初始化 DP 表
    steps.push({
      stepIndex: 0,
      flowPhase: 'forward',
      line: lineInit,
      codeLine: lineInit,
      tag: '初始化 DP 表',
      msg: `📌 初始化 dp[0..${target}] = ∞，dp[i] 表示完全覆盖区间 [0, i] 所需的最少${unit}数。`,
      description: `📌 初始化 dp[0..${target}] = ∞`,
      vars: [{ name: 'dp.length', value: String(target + 1) }],
      dp1d: [...dp],
      cells: createCells(-1),
      stateArrays: createStateArrays(-1),
    });

    // Step 1: 边界基底 dp[0] = 0
    dp[0] = 0;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'forward',
      line: lineBase,
      codeLine: lineBase,
      tag: '基准状态',
      msg: `🎯 基底设定：覆盖长度为 0 的区间无需额外${unit}，设置 dp[0] = 0。`,
      description: `🎯 基底设定：dp[0] = 0`,
      vars: [{ name: 'dp[0]', value: '0' }],
      dp1d: [...dp],
      cells: createCells(0),
      actorState: { currentSlot: 0, action: 'idle' },
      stateArrays: createStateArrays(0),
    });

    // Step 2: 逐单元推进松弛
    const len = sourceArr ? sourceArr.length : rightReach.length;
    for (let i = 0; i < len; i++) {
      let left = i;
      let right = rightReach[i] ?? i;
      if (sourceArr) {
        left = Math.max(0, i - sourceArr[i]);
        right = Math.min(target, i + sourceArr[i]);
      }

      steps.push({
        stepIndex: steps.length,
        flowPhase: 'forward',
        line: lineOuter,
        codeLine: lineOuter,
        tag: `考察${unit}`,
        msg: `🔍 考察${unit} #${i}：覆盖区间 [${left}, ${right}]。`,
        description: `🔍 考察${unit} #${i}`,
        vars: [
          { name: 'i', value: String(i) },
          { name: 'cover', value: `[${left}, ${right}]` },
        ],
        dp1d: [...dp],
        cells: createCells(i),
        actorState: { currentSlot: i, action: 'walk' },
        stateArrays: createStateArrays(i),
      });

      let updated = false;
      for (let j = left; j <= right; j++) {
        if (dp[j] !== null && dp[j] !== INF) {
          const candidate = dp[j]! + 1;
          if (candidate < dp[right]!) {
            dp[right] = candidate;
            updated = true;
          }
        }
      }

      if (updated) {
        steps.push({
          stepIndex: steps.length,
          flowPhase: 'forward',
          line: lineTransfer,
          codeLine: lineTransfer,
          tag: '状态落盘',
          msg: `✅ 通过${unit} #${i}，成功松弛推进：覆盖到 [0, ${right}] 最少${unit}数更新为 dp[${right}] = ${dp[right]}！`,
          description: `✅ dp[${right}] = ${dp[right]}`,
          vars: [
            { name: `dp[${right}]`, value: String(dp[right]) },
            { name: 'unit', value: String(i) },
          ],
          dp1d: [...dp],
          cells: createCells(right),
          actorState: { currentSlot: right, action: 'jump' },
          stateArrays: createStateArrays(right),
        });
      }
    }

    const ans = dp[target]! > target + 1 ? -1 : dp[target]!;
    steps.push({
      stepIndex: steps.length,
      flowPhase: 'terminal',
      line: lineReturn,
      codeLine: lineReturn,
      tag: '求解完成',
      msg:
        ans !== -1
          ? `🏁 填表完成！完全覆盖 [0, ${target}] 的最少${unit}数为 ${ans} 个。`
          : `❌ 填表完成！dp[${target}] 仍为 ∞，区间无法完全覆盖，返回 -1。`,
      description: `求解完成：${ans}`,
      vars: [{ name: `dp[${target}]`, value: String(ans) }],
      dp1d: [...dp],
      cells: createCells(target),
      actorState: { currentSlot: target, action: 'idle' },
      stateArrays: createStateArrays(target),
    });

    return steps;
  }
}
