import { describe, it, expect } from 'vitest';

/**
 * 顶层抽象与架构血缘自省门禁测试 (Top-Level Abstraction Gate Test)
 * 
 * 专为 LLM 与开发者设计的「架构看门狗」：
 * 当发生以下违规时，在控制台抛出具备明确因果、反例和纠偏指引的自愈式报错：
 * 1. [PRIVATE_COMPILER_BLOAT] 擅自为单一题目新建私有 StepCompiler（如 min-taps-compiler.ts）
 * 2. [STRATEGY_OVERSIZED] 业务策略类 (Strategy) 代码量超过 120 行（策略类只应是薄适配器）
 * 3. [INTERVAL_RELAY_REDUCTION] 区间接力/贪心族群算法未复用 IntervalRelayStepCompiler
 */

// 全库已核准的官方核心编译器基建白名单
const AUTHORIZED_CORE_COMPILERS = new Set([
  'abstract-interval-recursion-compiler.ts',
  'abstract-interval-table-compiler.ts',
  'abstract-knapsack-recursion-compiler.ts',
  'abstract-sequence-recursion-compiler.ts',
  'abstract-sequence-table-compiler.ts',
  'dependency-tree-compiler.ts',
  'interval-relay-step-compiler.ts',
  'interval-scheduling-step-compiler.ts',
  'jump-game-ii-compiler.ts',
  'can-jump-compiler.ts',
  'knapsack-step-matrix-compiler.ts',
  'linear-step-matrix-compiler.ts',
  'linear-compile-stage12.ts',
  'linear-compile-stage3.ts',
  'linear-compile-stage4.ts',
  'linear-compile-stage5.ts',
  'sequence-step-matrix-compiler.ts',
  'sequence-distinctsubsequences-compiler.ts',
  'sequence-deletedistance-compiler.ts',
  'sequence-editdistance-compiler.ts',
  'sequence-interleavingstring-compiler.ts',
  'sequence-lcs-compiler.ts',
  'sequence-longestpalindromic-compiler.ts',
  'sequence-mindeletetobesubstring-compiler.ts',
  'sequence-palindromicsubstrings-compiler.ts',
  'partition-dp-compiler.ts',
  'table-step-engine.ts',
  'step-matrix-compiler-primitives.ts',
  'two-pass-neighbor-step-compiler.ts',
  'two-sequence-greedy-step-compiler.ts',
]);

// 利用 Vite 零 DOM、零 Node 依赖的 import.meta.glob 加载当前目录策略源码
const compilerRawModules = import.meta.glob<string>('./*-compiler.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const strategyRawModules = import.meta.glob<string>('./*-strategy.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
});

describe('顶层抽象与架构血缘自省门禁 (Top-Level Abstraction Gates)', () => {
  it('门禁 1: 严禁为单一业务算法私建未经核准的私有编译器 (Anti-Private-Compiler Gate)', () => {
    const unauthorizedCompilers: string[] = [];

    for (const rawPath of Object.keys(compilerRawModules)) {
      const fileName = rawPath.replace('./', '');
      if (!AUTHORIZED_CORE_COMPILERS.has(fileName)) {
        unauthorizedCompilers.push(fileName);
      }
    }

    if (unauthorizedCompilers.length > 0) {
      const errorMsg = `
================================================================================
❌ [TOP-LEVEL ABSTRACTION VIOLATION: PRIVATE_COMPILER_BLOAT]
【违规文件】${unauthorizedCompilers.join(', ')}
【违规原因】检测到为单一业务算法私自编写了全新 StepCompiler，严重违反顶层深模块抽象原则！
【核心教训】LeetCode 1326 (min-taps)、1024 (video-stitching) 等均属于已有算法族群，禁止重复造轮子。
【官方族群字典】详见 CONTEXT.md 中的 CanonicalCompilerTaxonomy：
  - 线性 1D DP 族       -> LinearStepMatrixCompiler
  - 背包族             -> KnapsackStepMatrixCompiler
  - 双序列矩阵 DP 族    -> SequenceStepMatrixCompiler
  - 区间接力与覆盖族    -> IntervalRelayStepCompiler
  - 网格探索 DP 族      -> GridUniquePathsCompiler
  - 状态依赖树展开族    -> StateDependencyTreeCompiler
【纠偏指引】
  1. 立即删除未核准的私有编译器文件: ${unauthorizedCompilers.join(', ')}；
  2. 在对应的 *Strategy.ts 中，通过数学归约（Mathematical Reduction）转换入参；
  3. 将状态机推演全权委托给官方核心编译器 (如 IntervalRelayStepCompiler)！
================================================================================
`;
      expect(unauthorizedCompilers, errorMsg).toEqual([]);
    }
  });

  it('门禁 2: 业务策略类 (Strategy) 必须为轻量领域适配器，体积严禁超过 120 行 (Thin Strategy Gate)', () => {
    // 历史遗留待重构的单体策略豁免清单（禁止向此清单添加新文件！）
    const LEGACY_STRATEGY_EXEMPTIONS = new Set([
      'house-robber-strategy.ts', // 历史遗留打家劫舍全量实现 (~1000行)，待收归 LinearStepMatrixCompiler
      'knapsack-combination-sum4-strategy.ts', // 历史遗留组合总和 IV，待收归 KnapsackStepMatrixCompiler
      'target-sum-standard-strategy.ts', // 历史遗留第 73 课标准版，待收归 KnapsackStepMatrixCompiler
    ]);

    const bloatedStrategies: Array<{ file: string; lines: number }> = [];

    for (const [rawPath, content] of Object.entries(strategyRawModules)) {
      const fileName = rawPath.replace('./', '');
      if (
        fileName.includes('family') ||
        fileName.includes('advanced') ||
        fileName.includes('stock') ||
        LEGACY_STRATEGY_EXEMPTIONS.has(fileName)
      ) {
        continue;
      }

      const lineCount = content.split('\n').length;
      if (lineCount > 120) {
        bloatedStrategies.push({ file: fileName, lines: lineCount });
      }
    }

    if (bloatedStrategies.length > 0) {
      const details = bloatedStrategies
        .map((s) => `  - ${s.file}: ${s.lines} 行 (超出上限 ${s.lines - 120} 行)`)
        .join('\n');
      const errorMsg = `
================================================================================
❌ [TOP-LEVEL ABSTRACTION VIOLATION: STRATEGY_OVERSIZED]
【违规文件】
${details}
【违规原因】策略类 (IAlgorithmStrategy) 的唯一职责是「参数提取 + 数学归约 + 委托调用」，严禁在 Strategy 内内联实现复杂状态机或编译器循环！
【纠偏指引】
  1. 将内部私有实现剥离或重构为数学规约；
  2. 委托至对应的统一编译器 (如 IntervalRelayStepCompiler、LinearStepMatrixCompiler 等)；
  3. 精简代码使策略文件控制在 120 行以内！
================================================================================
`;
      expect(bloatedStrategies, errorMsg).toEqual([]);
    }
  });

  it('门禁 3: 区间接力与跳跃覆盖族群必须复用 IntervalRelayStepCompiler (Interval Relay Deduplication Gate)', () => {
    const minTapsContent = strategyRawModules['./min-taps-strategy.ts'];
    expect(minTapsContent).toBeDefined();

    const usesIntervalRelay = minTapsContent?.includes('IntervalRelayStepCompiler') ?? false;

    if (!usesIntervalRelay) {
      const errorMsg = `
================================================================================
❌ [TOP-LEVEL ABSTRACTION VIOLATION: INTERVAL_RELAY_REDUCTION_MISSING]
【违规文件】src/core/strategies/min-taps-strategy.ts
【违规原因】MinTaps (灌溉花园的水龙头) 数学上完全等价于区间贪心接力，必须直接引用并委托给 IntervalRelayStepCompiler！
【纠偏指引】
  import { IntervalRelayStepCompiler } from './interval-relay-step-compiler';
  // 在 generateSteps 中调用 IntervalRelayStepCompiler.compileFromTaps(...)
================================================================================
`;
      expect(usesIntervalRelay, errorMsg).toBe(true);
    }
  });
});
