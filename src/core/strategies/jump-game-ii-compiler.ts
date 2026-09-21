/**
 * 跳跃游戏 II 顶层步进编译器 (Jump Game II Step Compiler)
 * 生成标准 UniversalStep，包含动态变量与结构化决策数据。
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, StateArrayItem } from '../universal-stage-engine';
import { YamlModelLoader } from '../yaml-model-loader';

export interface JumpGameIICompileOptions {
  nums: number[];
  anchorMap?: Record<string, number>;
}

export class JumpGameIIStepCompiler {
  public static compile(
    model: IYamlAlgorithmModel,
    options: JumpGameIICompileOptions
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
    const lineCheck = getLine('check', 6);
    const lineJump = getLine('jump', 7);
    const lineDone = getLine('done', 10);

    // 辅助生成 1D 网格单元数据 (用于沙盘高亮渲染)
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

    // Step 0: 入口帧 (纯净初始化，无预填脏状态)
    steps.push({
      stepIndex: 0,
      description: `主函数入口：接收数组 nums=[${nums.join(', ')}]，起点位置 0，终点位置 ${n - 1}`,
      codeLine: lineEntry,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(-1, 0, 0),
      stateArrays: createStateArrays(-1, 0, 0),
      actor: { i: 0, j: 0, label: '🦘' },
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
          title: '边界接力机制',
          tag: '贪心策略',
          action: '初始化',
          formula: 'curEnd = 0, nextReach = 0, steps = 0',
          val: '准备开始扫描',
        },
      ],
    });

    if (n <= 1) {
      steps.push({
        stepIndex: steps.length,
        description: `特判：数组长度 n=${n} <= 1，已经在终点，无需跳跃，返回 0 步`,
        codeLine: lineDone,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(0, 0, 0, true),
        stateArrays: createStateArrays(0, 0, 0),
        actor: { i: 0, j: 0, label: '🏁' },
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
    steps.push({
      stepIndex: steps.length,
      description: `初始化状态：当前跳跃边界 curEnd=0，下一步最远 nextReach=0，跳跃次数 steps=0`,
      codeLine: lineInit,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(0, curEnd, nextReach),
      stateArrays: createStateArrays(0, curEnd, nextReach),
      actor: { i: 0, j: 0, label: '🦘' },
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
      steps.push({
        stepIndex: steps.length,
        description: `循环推进：探针 i=${i} < nums.length - 1 (${n - 1})，检查该点可达最远范围`,
        codeLine: lineLoop,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: '🔍' },
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

      steps.push({
        stepIndex: steps.length,
        description: `探测跳跃：从下标 ${i} (nums[${i}]=${nums[i]}) 最远可达 ${reach} ➔ nextReach = max(${prevNextReach}, ${reach}) = ${nextReach}`,
        codeLine: lineExplore,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: '🦘' },
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
            title: `下标 ${i} 贪心最远探测`,
            tag: '最远覆盖',
            action: reach > prevNextReach ? '更新最远边界' : '维持原有最远',
            formula: `max(nextReach=${prevNextReach}, ${i} + nums[${i}]=${reach})`,
            val: String(nextReach),
          },
        ],
      });

      // 边界检查帧
      const hitBoundary = i === curEnd;
      steps.push({
        stepIndex: steps.length,
        description: `边界判定：当前位置 i=${i}，当前步覆盖边界 curEnd=${curEnd}。${hitBoundary ? '触碰边界，必须接力跳跃！' : '尚未触碰边界，继续向前探测。'}`,
        codeLine: lineCheck,
        grid: [nums],
        dp1d: nums,
        cells: createCells1D(i, curEnd, nextReach),
        stateArrays: createStateArrays(i, curEnd, nextReach),
        actor: { i: 0, j: i, label: hitBoundary ? '⚡' : '🔍' },
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

        steps.push({
          stepIndex: steps.length,
          description: `⚡ 接力跳跃触发：从原边界 [${prevBoundary}] 推进到新边界 [${curEnd}]，完成第 ${jumps} 次跳跃！`,
          codeLine: lineJump,
          grid: [nums],
          dp1d: nums,
          cells: createCells1D(i, curEnd, nextReach),
          stateArrays: createStateArrays(i, curEnd, nextReach),
          actor: { i: 0, j: curEnd >= n - 1 ? n - 1 : curEnd, label: '🦘' },
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
              title: `第 ${jumps} 次贪心跳跃接力`,
              tag: '触发跳跃',
              action: `推进边界至 [${curEnd}]`,
              formula: `curEnd = nextReach (${curEnd}); steps++`,
              val: `${jumps} 步`,
            },
          ],
        });
      }
    }

    // 收敛与最终答案帧
    steps.push({
      stepIndex: steps.length,
      description: `🎉 到达终点收敛！从起点跳跃至末尾所需的最少跳跃次数为 ${jumps} 次。`,
      codeLine: lineDone,
      grid: [nums],
      dp1d: nums,
      cells: createCells1D(n - 1, curEnd, nextReach, true),
      stateArrays: createStateArrays(n - 1, curEnd, nextReach),
      actor: { i: 0, j: n - 1, label: '🏆' },
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
          title: '全局最优解',
          tag: '贪心最优',
          action: '返回最少跳跃步数',
          formula: 'ans = steps',
          val: `${jumps} 步`,
        },
      ],
    });

    return steps;
  }
}
