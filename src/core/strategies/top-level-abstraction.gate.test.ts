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
  'resource-greedy-step-compiler.ts',
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

const rendererRawModules = import.meta.glob<string>(
  '../../algorithms/categories/**/*-renderer.ts',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  }
);

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
    // 历史遗留豁免清单已全部攻坚清零（ZERO EXEMPTIONS）！全库严禁添加任何新豁免！
    const LEGACY_STRATEGY_EXEMPTIONS = new Set<string>();

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

  it('门禁 4: 领域适配器身材红线 (LOC < 150 行) 与零回弹锁死 (Anti-Regression LOC Gate)', () => {
    const benchmarkFiles = [
      '../../algorithms/categories/tree/binary-tree-level-renderer.ts',
      '../../algorithms/categories/tree/trie-tree-017-renderer.ts',
      '../../algorithms/categories/tree/trie-xor-max-107-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/zigzag-level-order-036-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/width-of-binary-tree-036-renderer.ts',
      '../../algorithms/categories/tree/bottom-left-renderer.ts',
      '../../algorithms/categories/graph/jump-point-search-renderer.ts',
      '../../algorithms/categories/tree/binary-tree-maximum-path-sum-renderer.ts',
      '../../algorithms/categories/tree/sum-root-to-leaf-numbers-renderer.ts',
      '../../algorithms/categories/tree/tree-depth-renderer.ts',
      '../../algorithms/categories/tree/min-depth-renderer.ts',
      '../../algorithms/categories/tree/merge-trees-renderer.ts',
      '../../algorithms/categories/tree/lca-renderer.ts',
      '../../algorithms/categories/tree/all-paths-renderer.ts',
      '../../algorithms/categories/tree/tree-symmetric-renderer.ts',
      '../../algorithms/categories/tree/max-tree-renderer.ts',
      '../../algorithms/categories/tree/valid-bst-renderer.ts',
      '../../algorithms/categories/tree/build-tree-renderer.ts',
      '../../algorithms/categories/tree/find-duplicate-subtrees-renderer.ts',
      '../../algorithms/categories/tree/path-sum-renderer.ts',
      '../../algorithms/categories/tree/bst-delete-renderer.ts',
      '../../algorithms/categories/tree/bst-modes-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/balanced-binary-tree-037-renderer.ts',
      '../../algorithms/categories/tree/bst-search-renderer.ts',
      '../../algorithms/categories/tree/tree-invert-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/count-complete-tree-nodes-036-renderer.ts',
      '../../algorithms/categories/tree/bst-min-diff-renderer.ts',
      '../../algorithms/categories/tree/max-sum-bst-036-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/completeness-binary-tree-036-renderer.ts',
      '../../algorithms/categories/tree/left-leaves-renderer.ts',
      '../../algorithms/categories/tree/sorted-array-to-bst-renderer.ts',
      '../../algorithms/categories/tree/bst-to-gst-renderer.ts',
      '../../algorithms/categories/tree/tree-recursion-patterns-019-renderer.ts',
      '../../algorithms/categories/tree/paper-folding-040-renderer.ts',
      '../../algorithms/categories/tree/tree-traversal-iterative-020-renderer.ts',
      '../../algorithms/categories/tree/tree-traversal-renderer.ts',
      '../../algorithms/categories/tree/tree-serialization-037-renderer.ts',
      '../../algorithms/categories/tree/tree-serialization-021-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/house-robber-iii-037-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/trim-bst-037-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/lowest-common-ancestor-bst-037-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/preorder-serialize-036-renderer.ts',
      '../../algorithms/categories/tree/tree-036-037/levelorder-serialize-036-renderer.ts',
      '../../algorithms/categories/tree/tree-batch-7-renderer.ts',
      '../../algorithms/categories/tree/tree-batch-8-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/value-segment-tree-112-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/tree-difference-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/segment-tree-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/tree-diameter-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/hld-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/tree-lca-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/tree-centroid-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/dynamic-segment-tree-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/fenwick-tree-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/fenwick-inversion-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/sweep-line-renderer.ts',
      '../../algorithms/categories/tree/tree-108-116/interval-merge-segment-tree-renderer.ts',
      '../../algorithms/categories/tree/tree-117-123/sparse-table-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-067/longest-increasing-path-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-067/tree-count-height-m-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-067/word-search-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-066/min-cost-tickets-066-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-066/decode-ways-ii-066-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-066/ugly-number-ii-066-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-066/unique-substrings-wraparound-066-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/target-sum-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/last-stone-weight-ii-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/buy-goods-discount-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/dependent-knapsack-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-01-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/top-k-subsequence-sum-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-073/find-kth-sum-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/unbounded-knapsack-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/buying-hay-min-cost-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/partitioned-knapsack-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/coins-from-piles-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/regex-matching-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-074/wildcard-matching-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-naive-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-binary-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-monotonic-queue-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-075/cherry-blossom-viewing-renderer.ts',
      '../../algorithms/categories/dynamic-programming/knapsack-075/coins-change-kinds-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-071-072/number-of-lis-071-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-071-072/stacking-cuboids-072-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-071-072/k-increasing-array-072-renderer.ts',
      '../../algorithms/categories/dynamic-programming/recursion-to-dp-038-renderer.ts',
      '../../algorithms/categories/dynamic-programming/palindrome-partitioning-ii-renderer.ts',
      '../../algorithms/categories/dynamic-programming/word-break-ii-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-079-083/digit-dp-basic-079-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-079-083/rerooting-tree-dp-080-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-079-083/expected-value-dp-081-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-079-083/slope-optimization-dp-082-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-079-083/knuth-quadrangle-inequality-083-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-084-088/counting-dp-inclusion-exclusion-084-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-084-088/game-probability-dp-085-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-084-088/sos-profile-dp-086-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-084-088/circular-interval-dp-087-renderer.ts',
      '../../algorithms/categories/dynamic-programming/dp-084-088/tree-knapsack-dp-088-renderer.ts',
      '../../algorithms/categories/dynamic-programming/unique-paths-renderer.ts',
      '../../algorithms/categories/game/game-095/bash-game-renderer.ts',
      '../../algorithms/categories/game/game-095/prime-power-stones-renderer.ts',
      '../../algorithms/categories/game/game-095/nim-game-renderer.ts',
      '../../algorithms/categories/game/game-095/anti-nim-game-renderer.ts',
      '../../algorithms/categories/game/game-095/fibonacci-game-renderer.ts',
      '../../algorithms/categories/game/game-095/wythoff-game-renderer.ts',
      '../../algorithms/categories/game/game-096/bash-game-sg-renderer.ts',
      '../../algorithms/categories/game/game-096/nim-game-sg-renderer.ts',
      '../../algorithms/categories/game/game-096/two-stones-bash-renderer.ts',
      '../../algorithms/categories/game/game-096/three-stones-fibonacci-renderer.ts',
      '../../algorithms/categories/game/game-096/coin-flip-game-renderer.ts',
      '../../algorithms/categories/game/game-096/split-game-renderer.ts',
      '../../algorithms/categories/math/math-097/small-prime-renderer.ts',
      '../../algorithms/categories/math/math-097/large-prime-renderer.ts',
      '../../algorithms/categories/math/math-097/prime-factors-renderer.ts',
      '../../algorithms/categories/math/math-097/ehrlich-euler-sieve-renderer.ts',
      '../../algorithms/categories/math/math-098/quick-power-renderer.ts',
      '../../algorithms/categories/math/math-098/fibonacci-matrix-renderer.ts',
      '../../algorithms/categories/math/math-098/climbing-stairs-matrix-renderer.ts',
      '../../algorithms/categories/math/math-098/tribonacci-matrix-renderer.ts',
      '../../algorithms/categories/math/math-098/domino-tromino-matrix-renderer.ts',
      '../../algorithms/categories/math/math-098/count-vowels-matrix-renderer.ts',
      '../../algorithms/categories/math/math-098/attendance-record-matrix-renderer.ts',
      '../../algorithms/categories/math/math-099/inverse-single-renderer.ts',
      '../../algorithms/categories/math/math-099/inverse-serial-renderer.ts',
      '../../algorithms/categories/math/math-099/inverse-factorial-renderer.ts',
      '../../algorithms/categories/math/math-099/subset-gcd-k-renderer.ts',
      '../../algorithms/categories/math/math-099/coin-buy-ways-renderer.ts',
      '../../algorithms/categories/math/math-099/music-playlists-renderer.ts',
      '../../algorithms/categories/math/max-points-on-a-line-renderer.ts',
      '../../algorithms/categories/math/random-generator-035-renderer.ts',
      '../../algorithms/categories/greedy/greedy-093/jump-game-ii-renderer.ts',
      '../../algorithms/categories/greedy/greedy-093/min-taps-renderer.ts',
      '../../algorithms/categories/greedy/greedy-093/string-transforms-renderer.ts',
      '../../algorithms/categories/greedy/greedy-093/cross-river-renderer.ts',
      '../../algorithms/categories/greedy/greedy-093/super-washing-machines-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/eliminate-monsters-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/largest-palindromic-number-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/max-avg-pass-ratio-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/min-cost-hire-workers-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/cutting-tree-renderer.ts',
      '../../algorithms/categories/greedy/greedy-094/cooking-plan-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/minimize-deviation-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/rabbits-in-forest-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/min-operations-similar-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/quiz-score-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/divide-array-seq-renderer.ts',
      '../../algorithms/categories/greedy/greedy-092/min-refueling-stops-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/shortest-unsorted-subarray-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/smallest-range-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/group-buy-tickets-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/split-min-avg-sum-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/minimal-battery-power-renderer.ts',
      '../../algorithms/categories/greedy/greedy-091/longest-same-zeros-ones-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/cutting-bamboo-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/maximum-product-k-parts-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/meeting-monopoly-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/meeting-one-day-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/ipo-renderer.ts',
      '../../algorithms/categories/greedy/greedy-090/absolute-value-add-to-array-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/course-schedule-iii-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/largest-number-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/meeting-rooms-ii-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/minimum-cost-connect-sticks-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/minimum-eat-oranges-renderer.ts',
      '../../algorithms/categories/greedy/greedy-089/two-city-scheduling-renderer.ts',
      '../../algorithms/categories/greedy/task-scheduler-renderer.ts',
      '../../algorithms/categories/greedy/tree-cameras-renderer.ts',
      '../../algorithms/categories/greedy/lemonade-renderer.ts',
      '../../algorithms/categories/greedy/gas-station-renderer.ts',
      '../../algorithms/categories/greedy/best-time-stock-renderer.ts',
      '../../algorithms/categories/greedy/jump-game-renderer.ts',
      '../../algorithms/categories/greedy/wiggle-subsequence-renderer.ts',
      '../../algorithms/categories/greedy/max-subarray-renderer.ts',
      '../../algorithms/categories/greedy/assign-cookies-renderer.ts',
      '../../algorithms/categories/greedy/can-jump-renderer.ts',
      '../../algorithms/categories/greedy/maximize-sum-k-renderer.ts',
      '../../algorithms/categories/greedy/partition-labels-renderer.ts',
      '../../algorithms/categories/greedy/candy-renderer.ts',
      '../../algorithms/categories/greedy/min-arrows-renderer.ts',
      '../../algorithms/categories/greedy/non-overlapping-renderer.ts',
      '../../algorithms/categories/greedy/monotone-digits-renderer.ts',
      '../../algorithms/categories/greedy/merge-intervals-renderer.ts',
      '../../algorithms/categories/greedy/reconstruct-queue-renderer.ts',
      '../../algorithms/categories/graph/islands-bfs-renderer.ts',
      '../../algorithms/categories/graph/islands-renderer.ts',
      '../../algorithms/categories/graph/coastline-renderer.ts',
      '../../algorithms/categories/graph/make-largest-island-renderer.ts',
      '../../algorithms/categories/graph/max-island-area-renderer.ts',
      '../../algorithms/categories/graph/sink-islands-renderer.ts',
      '../../algorithms/categories/graph/total-island-area-renderer.ts',
      '../../algorithms/categories/graph/closed-islands-renderer.ts',
      '../../algorithms/categories/graph/sub-islands-renderer.ts',
      '../../algorithms/categories/graph/distinct-islands-renderer.ts',
      '../../algorithms/categories/graph/graph-062/as-far-from-land-062-renderer.ts',
      '../../algorithms/categories/graph/graph-062/minimum-obstacles-062-renderer.ts',
      '../../algorithms/categories/graph/graph-062/minimum-cost-valid-path-062-renderer.ts',
      '../../algorithms/categories/graph/graph-062/trapping-rain-water-ii-062-renderer.ts',
      '../../algorithms/categories/graph/graph-061/dijkstra-basic-061-renderer.ts',
      '../../algorithms/categories/graph/graph-061/dijkstra-heap-061-renderer.ts',
      '../../algorithms/categories/graph/graph-061/bellman-ford-061-renderer.ts',
      '../../algorithms/categories/graph/graph-061/spfa-061-renderer.ts',
      '../../algorithms/categories/graph/graph-061/floyd-061-renderer.ts',
      '../../algorithms/categories/graph/graph-061/negative-cycle-061-renderer.ts',
      '../../algorithms/categories/graph/graph-063/word-ladder-063-renderer.ts',
      '../../algorithms/categories/graph/graph-063/snacks-ways-buy-tickets-063-renderer.ts',
      '../../algorithms/categories/graph/graph-063/closest-subsequence-sum-063-renderer.ts',
      '../../algorithms/categories/graph/graph-063/partition-minimize-difference-063-renderer.ts',
      '../../algorithms/categories/graph/graph-064/path-min-effort-064-renderer.ts',
      '../../algorithms/categories/graph/graph-064/swim-in-rising-water-064-renderer.ts',
      '../../algorithms/categories/graph/graph-064/network-delay-time-064-renderer.ts',
      '../../algorithms/categories/graph/graph-064/layered-dijkstra-064-renderer.ts',
      '../../algorithms/categories/graph/graph-064/ev-charge-dijkstra-064-renderer.ts',
      '../../algorithms/categories/graph/graph-064/state-compression-bfs-064-renderer.ts',
      '../../algorithms/categories/graph/floyd-renderer.ts',
      '../../algorithms/categories/graph/water-flow-renderer.ts',
      '../../algorithms/categories/graph/path-min-effort-renderer.ts',
      '../../algorithms/categories/graph/swim-in-rising-water-renderer.ts',
      '../../algorithms/categories/graph/a-star-renderer.ts',
      '../../algorithms/categories/graph/a-star-journey-renderer.ts',
      '../../algorithms/categories/graph/trapping-water-ii-renderer.ts',
      '../../algorithms/categories/graph/dijkstra-basic-renderer.ts',
      '../../algorithms/categories/graph/dijkstra-heap-renderer.ts',
      '../../algorithms/categories/graph/dijkstra-index-heap-renderer.ts',
      '../../algorithms/categories/graph/network-delay-time-renderer.ts',
      '../../algorithms/categories/graph/layered-dijkstra-renderer.ts',
      '../../algorithms/categories/graph/ev-charge-dijkstra-renderer.ts',
      '../../algorithms/categories/graph/k-shortest-path-renderer.ts',
      '../../algorithms/categories/graph/limited-shortest-path-renderer.ts',
      '../../algorithms/categories/graph/shortest-path-summary-renderer.ts',
      '../../algorithms/categories/graph/redundant-edge-renderer.ts',
      '../../algorithms/categories/graph/redundant-edge-ii-renderer.ts',
      '../../algorithms/categories/graph/topological-sort-renderer.ts',
      '../../algorithms/categories/graph/bellman-ford-renderer.ts',
      '../../algorithms/categories/graph/spfa-renderer.ts',
      '../../algorithms/categories/graph/negative-cycle-renderer.ts',
      '../../algorithms/categories/search/search-058/flood-fill-058-renderer.ts',
      '../../algorithms/categories/search/search-058/making-large-island-058-renderer.ts',
    ];

    const violations: Array<{ file: string; lines: number }> = [];

    for (const filePath of benchmarkFiles) {
      const content = (rendererRawModules as Record<string, string>)[filePath];
      expect(content, `标杆文件 ${filePath} 必须在 rendererRawModules 中被正确加载`).toBeDefined();
      const lineCount = content ? content.split('\n').length : 0;
      if (lineCount >= 150) {
        violations.push({ file: filePath, lines: lineCount });
      }
    }

    if (violations.length > 0) {
      const details = violations.map((v) => `  - ${v.file}: ${v.lines} 行 (超出上限 ${v.lines - 150} 行)`).join('\n');
      const errorMsg = `
================================================================================
❌ [TOP-LEVEL ABSTRACTION VIOLATION: RENDERER_OVERSIZED]
【违规文件】
${details}
【违规原因】已重构标杆渲染器必须维持为轻量领域适配器 (Thin Domain Adapter, LOC < 150 行)，严禁发生代码反弹回退！
【纠偏指引】
  1. 将视觉呈现委托至 src/core/renderers/adapters/*-canvas-adapter.ts；
  2. 将多阶段推演委托至 *-step-compiler.ts；
  3. 精简代码使渲染器文件控制在 150 行以内！
================================================================================
`;
      expect(violations, errorMsg).toEqual([]);
    }
  });

  it('门禁 5: 图论网格探索算法必须委托 BinaryGridCanvasAdapter 严禁内联手写 DOM', () => {
    const islandRenderers = [
      '../../algorithms/categories/graph/islands-bfs-renderer.ts',
      '../../algorithms/categories/graph/islands-renderer.ts',
      '../../algorithms/categories/graph/coastline-renderer.ts',
      '../../algorithms/categories/graph/make-largest-island-renderer.ts',
      '../../algorithms/categories/graph/max-island-area-renderer.ts',
      '../../algorithms/categories/graph/sink-islands-renderer.ts',
      '../../algorithms/categories/graph/total-island-area-renderer.ts',
      '../../algorithms/categories/graph/closed-islands-renderer.ts',
      '../../algorithms/categories/graph/sub-islands-renderer.ts',
      '../../algorithms/categories/graph/distinct-islands-renderer.ts',
      '../../algorithms/categories/graph/water-flow-renderer.ts',
      '../../algorithms/categories/graph/path-min-effort-renderer.ts',
      '../../algorithms/categories/graph/swim-in-rising-water-renderer.ts',
      '../../algorithms/categories/graph/a-star-renderer.ts',
      '../../algorithms/categories/graph/a-star-journey-renderer.ts',
      '../../algorithms/categories/graph/trapping-water-ii-renderer.ts',
    ];

    const inlineViolations: string[] = [];

    for (const filePath of islandRenderers) {
      const content = (rendererRawModules as Record<string, string>)[filePath];
      expect(content, `网格渲染器 ${filePath} 必须存在`).toBeDefined();
      if (!content.includes('BinaryGridCanvasAdapter')) {
        inlineViolations.push(`${filePath}: 未接入 BinaryGridCanvasAdapter`);
      }
      if (content.includes('container.innerHTML = `') || content.includes('container.innerHTML = "')) {
        inlineViolations.push(`${filePath}: 包含内联 container.innerHTML 拼接`);
      }
    }

    expect(inlineViolations, '所有图论网格渲染器严禁内联 DOM 拼接，必须委托 BinaryGridCanvasAdapter').toEqual([]);
  });
});

