import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export type BitmaskDpModelId =
  | 'can-i-win'
  | 'matchsticks-to-square'
  | 'partition-k-equal-subsets'
  | 'tsp-bitmask-dp'
  | 'number-of-ways-wear-hats'
  | 'optimal-account-balancing'
  | 'good-subsets'
  | 'distribute-repeating-integers';

/**
 * 状压DP策略 (Bitmask DP Strategy)
 * 第080讲、第081讲：状压dp 上/下
 * 为每个状压DP算法生成 UniversalStep 演示步骤。
 */
export class BitmaskDpStrategy implements IAlgorithmStrategy {
  readonly modelId: string;

  constructor(private algo: BitmaskDpModelId) {
    this.modelId = algo;
  }

  canHandle(modelId: string): boolean {
    return modelId === this.algo || modelId === this.modelId;
  }

  generateSteps(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] {
    return this.tryGenerate(model, params) ?? [];
  }

  tryGenerate(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] | null {
    if (model.id !== this.algo) return null;

    switch (this.algo) {
      case 'can-i-win':
        return this.compileCanIWin(params);
      case 'matchsticks-to-square':
        return this.compileMatchsticks(params);
      case 'partition-k-equal-subsets':
        return this.compilePartitionK(params);
      case 'tsp-bitmask-dp':
        return this.compileTsp(params);
      case 'number-of-ways-wear-hats':
        return this.compileWearHats(params);
      case 'optimal-account-balancing':
        return this.compileOptimalAccount(params);
      case 'good-subsets':
        return this.compileGoodSubsets(params);
      case 'distribute-repeating-integers':
        return this.compileDistributeRepeating(params);
      default:
        return null;
    }
  }

  // ─── Can I Win (LeetCode 464) ─────────────────────────
  private compileCanIWin(params: StageExecutionParams): UniversalStep[] {
    const n = Number(params.params?.n) || 4;
    const m = Number(params.params?.m) || 6;
    const steps: UniversalStep[] = [];
    let stepId = 0;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `初始化：数字池 1~${n}，目标累加和 ≥ ${m}`,
      `canIWin(n=${n}, m=${m})`
    ));

    if (m === 0) {
      steps.push(mkStep('目标为 0，先手直接获胜 → true', '结果: true'));
      return steps;
    }

    const total = n * (n + 1) / 2;
    if (total < m) {
      steps.push(mkStep(`所有数累加和 ${total} < ${m}，不可能赢 → false`, '结果: false'));
      return steps;
    }

    // 小规模搜索演示
    const dp = new Map<number, boolean>();
    let count = 0;
    const maxSteps = 28;

    const dfs = (status: number, rest: number, depth: number): boolean => {
      if (count >= maxSteps) return false;
      if (dp.has(status)) {
        const cached = dp.get(status)!;
        steps.push(mkStep(
          `${'　'.repeat(depth)}缓存命中 status=${status.toString(2).padStart(n + 1, '0')} → ${cached ? '先手赢' : '先手输'}`,
          `depth=${depth}, cached=${cached}`
        ));
        count++;
        return cached;
      }

      const avail: number[] = [];
      for (let i = 1; i <= n; i++) {
        if (status & (1 << i)) avail.push(i);
      }

      steps.push(mkStep(
        `${'　'.repeat(depth)}可选 [${avail.join(',')}]，还需凑 ${rest}`,
        `depth=${depth}, status=${status.toString(2).padStart(n + 1, '0')}`
      ));
      count++;

      let ans = false;
      for (let i = 1; i <= n && !ans; i++) {
        if (!(status & (1 << i))) continue;
        if (count >= maxSteps) break;

        if (i >= rest) {
          steps.push(mkStep(
            `${'　'.repeat(depth + 1)}选 ${i} ≥ rest(${rest})，直接获胜！`,
            `选${i}, 直接赢`
          ));
          count++;
          ans = true;
        } else {
          steps.push(mkStep(
            `${'　'.repeat(depth + 1)}尝试选 ${i}，rest → ${rest - i}`,
            `选${i}, 对手回合`
          ));
          count++;
          if (!dfs(status ^ (1 << i), rest - i, depth + 2)) {
            ans = true;
          }
        }
      }

      dp.set(status, ans);
      if (count < maxSteps) {
        steps.push(mkStep(
          `${'　'.repeat(depth)}结论 status=${status.toString(2).padStart(n + 1, '0')} → ${ans ? '先手赢 ✓' : '先手输 ✗'}`,
          `dp[${status}]=${ans}`
        ));
        count++;
      }
      return ans;
    };

    const initStatus = (1 << (n + 1)) - 2;
    const result = dfs(initStatus, m, 0);

    steps.push(mkStep(
      `最终结果：先手${result ? '能赢 ✓' : '不能赢 ✗'}`,
      `答案: ${result}`
    ));

    return steps;
  }

  // ─── Matchsticks to Square (LeetCode 473) ─────────────
  private compileMatchsticks(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;

    let matchsticks: number[];
    const raw = params.params?.nums;
    if (Array.isArray(raw)) {
      matchsticks = raw.map(Number);
    } else if (typeof raw === 'string') {
      matchsticks = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    } else {
      matchsticks = [1, 1, 2, 2, 2];
    }

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    const sum = matchsticks.reduce((a, b) => a + b, 0);

    steps.push(mkStep(
      `火柴: [${matchsticks.join(',')}]，总长=${sum}`,
      `sum=${sum}`
    ));

    if (sum % 4 !== 0) {
      steps.push(mkStep(`总长 ${sum} 不是 4 的倍数 → false`, '结果: false'));
      return steps;
    }

    const side = sum / 4;
    matchsticks.sort((a, b) => b - a);

    steps.push(mkStep(
      `边长=${side}，降序排列: [${matchsticks.join(',')}]`,
      `side=${side}`
    ));

    if (matchsticks[0] > side) {
      steps.push(mkStep(`最大火柴 ${matchsticks[0]} > 边长 ${side} → false`, '结果: false'));
      return steps;
    }

    const sides = [0, 0, 0, 0];
    let count = 0;
    const maxSteps = 25;

    const dfs = (idx: number): boolean => {
      if (count >= maxSteps) return false;
      if (idx === matchsticks.length) {
        const ok = sides[0] === side && sides[1] === side && sides[2] === side;
        steps.push(mkStep(
          `所有火柴放完，四边=[${sides.join(',')}] → ${ok ? '✓' : '✗'}`,
          `完成: ${ok}`,
          [...sides]
        ));
        count++;
        return ok;
      }
      for (let i = 0; i < 4; i++) {
        if (sides[i] + matchsticks[idx] > side) continue;
        if (i > 0 && sides[i] === sides[i - 1]) continue;
        if (count >= maxSteps) break;
        sides[i] += matchsticks[idx];
        steps.push(mkStep(
          `火柴${matchsticks[idx]} → 边${i}，四边=[${sides.join(',')}]`,
          `idx=${idx}, 放入边${i}`,
          [...sides]
        ));
        count++;
        if (dfs(idx + 1)) return true;
        sides[i] -= matchsticks[idx];
        if (count < maxSteps) {
          steps.push(mkStep(
            `回溯：火柴${matchsticks[idx]} 从边${i}取出`,
            `回溯 idx=${idx}`,
            [...sides]
          ));
          count++;
        }
      }
      return false;
    };

    const result = dfs(0);
    steps.push(mkStep(
      `结果：${result ? '能拼成正方形 ✓' : '不能拼成正方形 ✗'}`,
      `答案: ${result}`
    ));
    return steps;
  }

  // ─── Partition to K Equal Sum Subsets (LeetCode 698) ──
  private compilePartitionK(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;

    let nums: number[];
    const raw = params.params?.nums;
    if (Array.isArray(raw)) {
      nums = raw.map(Number);
    } else if (typeof raw === 'string') {
      nums = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    } else {
      nums = [4, 3, 2, 3, 5, 2, 1];
    }
    const k = Number(params.params?.k) || 4;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    const sum = nums.reduce((a, b) => a + b, 0);
    steps.push(mkStep(
      `数组: [${nums.join(',')}], k=${k}, 总和=${sum}`,
      `sum=${sum}, k=${k}`
    ));

    if (sum % k !== 0) {
      steps.push(mkStep(`总和 ${sum} 不能被 k=${k} 整除 → false`, '结果: false'));
      return steps;
    }

    const target = sum / k;
    nums.sort((a, b) => b - a);
    steps.push(mkStep(
      `目标 target=${target}，降序: [${nums.join(',')}]`,
      `target=${target}`
    ));

    if (nums[0] > target) {
      steps.push(mkStep(`最大值 ${nums[0]} > target=${target} → false`, '结果: false'));
      return steps;
    }

    const buckets = new Array(k).fill(0);
    let count = 0;
    const maxSteps = 25;

    const dfs = (idx: number): boolean => {
      if (count >= maxSteps) return false;
      if (idx === nums.length) {
        const ok = buckets.every(b => b === target);
        steps.push(mkStep(
          `全部分配完，桶=[${buckets.join(',')}] → ${ok ? '✓' : '✗'}`,
          `完成: ${ok}`,
          [...buckets]
        ));
        count++;
        return ok;
      }
      for (let i = 0; i < k; i++) {
        if (buckets[i] + nums[idx] > target) continue;
        if (i > 0 && buckets[i] === buckets[i - 1]) continue;
        if (count >= maxSteps) break;
        buckets[i] += nums[idx];
        steps.push(mkStep(
          `数${nums[idx]} → 桶${i}，桶=[${buckets.join(',')}]`,
          `idx=${idx}, 桶${i}`,
          [...buckets]
        ));
        count++;
        if (dfs(idx + 1)) return true;
        buckets[i] -= nums[idx];
      }
      return false;
    };

    const result = dfs(0);
    steps.push(mkStep(
      `结果：${result ? '能划分为 ' + k + ' 个等和子集 ✓' : '不能划分 ✗'}`,
      `答案: ${result}`
    ));
    return steps;
  }

  // ─── TSP (Travelling Salesman Problem) ────────────────
  private compileTsp(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;
    const n = Math.min(Number(params.params?.n) || 4, 6);

    const distExamples: Record<number, number[][]> = {
      4: [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
      ],
      5: [
        [0, 3, 4, 2, 7],
        [3, 0, 4, 6, 3],
        [4, 4, 0, 5, 8],
        [2, 6, 5, 0, 6],
        [7, 3, 8, 6, 0],
      ],
      6: [
        [0, 10, 15, 20, 25, 30],
        [10, 0, 35, 25, 20, 15],
        [15, 35, 0, 30, 10, 20],
        [20, 25, 30, 0, 35, 25],
        [25, 20, 10, 35, 0, 15],
        [30, 15, 20, 25, 15, 0],
      ],
    };

    const dist = distExamples[n] || distExamples[4]!;
    const full = (1 << n) - 1;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `TSP: ${n} 个城市，全集掩码=${full.toString(2)}`,
      `n=${n}, full=${full}`
    ));

    const INF = 1e9;
    const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
    dp[1][0] = 0;

    steps.push(mkStep(
      `初始化 dp[${(1).toString(2).padStart(n, '0')}][0] = 0`,
      `dp[1][0]=0`
    ));

    let count = 0;
    const maxSteps = 30;

    for (let S = 1; S <= full && count < maxSteps; S++) {
      for (let i = 0; i < n && count < maxSteps; i++) {
        if (!(S & (1 << i)) || dp[S][i] >= INF) continue;
        for (let j = 0; j < n && count < maxSteps; j++) {
          if (S & (1 << j)) continue;
          const nxt = S | (1 << j);
          const newCost = dp[S][i] + dist[i][j];
          if (newCost < dp[nxt][j]) {
            dp[nxt][j] = newCost;
            steps.push(mkStep(
              `dp[${nxt.toString(2).padStart(n, '0')}][${j}] = dp[${S.toString(2).padStart(n, '0')}][${i}](${dp[S][i]}) + dist[${i}][${j}](${dist[i][j]}) = ${newCost}`,
              `S=${S}→${nxt}, i=${i}→j=${j}`,
              dp[nxt].map(v => v >= INF ? -1 : v)
            ));
            count++;
          }
        }
      }
    }

    for (let S = 1; S <= full; S++) {
      for (let i = 0; i < n; i++) {
        if (!(S & (1 << i)) || dp[S][i] >= INF) continue;
        for (let j = 0; j < n; j++) {
          if (S & (1 << j)) continue;
          const nxt = S | (1 << j);
          const newCost = dp[S][i] + dist[i][j];
          if (newCost < dp[nxt][j]) {
            dp[nxt][j] = newCost;
          }
        }
      }
    }

    let ans = INF;
    let bestI = -1;
    for (let i = 1; i < n; i++) {
      const total = dp[full][i] + dist[i][0];
      if (total < ans) {
        ans = total;
        bestI = i;
      }
    }

    steps.push(mkStep(
      `最优：dp[${full.toString(2)}][${bestI}](${dp[full][bestI]}) + dist[${bestI}→0](${dist[bestI][0]}) = ${ans}`,
      `答案: ${ans}`,
      dp[full].map(v => v >= INF ? -1 : v)
    ));

    return steps;
  }

  // ─── Number of Ways to Wear Different Hats (LC 1434) ──
  private compileWearHats(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;
    const hats = [[3, 4], [4, 5], [5]];
    const n = hats.length;
    const full = (1 << n) - 1;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `人数 n=${n}，喜好: 人0=[3,4], 人1=[4,5], 人2=[5]`,
      `n=${n}`
    ));

    const dp = new Array(1 << n).fill(0);
    dp[0] = 1;

    const hatToPersons: number[][] = Array.from({ length: 6 }, () => []);
    for (let p = 0; p < n; p++) {
      for (const h of hats[p]!) {
        if (h <= 5) hatToPersons[h]!.push(p);
      }
    }

    steps.push(mkStep(
      `反向映射：帽子3→[0], 帽子4→[0,1], 帽子5→[1,2]`,
      `hatToPersons ready`
    ));

    for (let h = 1; h <= 5; h++) {
      if (hatToPersons[h]!.length === 0) continue;
      steps.push(mkStep(
        `--- 决策第 ${h} 顶帽子 (喜欢它的人: [${hatToPersons[h]!.join(',')}]) ---`,
        `帽子 h=${h}`,
        [...dp]
      ));

      for (let S = full; S >= 0; S--) {
        if (dp[S] === 0) continue;
        for (const p of hatToPersons[h]!) {
          if (!(S & (1 << p))) {
            const nxt = S | (1 << p);
            dp[nxt] += dp[S];
            steps.push(mkStep(
              `帽子${h} 给 人${p}: 状态 ${S.toString(2).padStart(n, '0')} → ${nxt.toString(2).padStart(n, '0')}, dp[${nxt.toString(2).padStart(n, '0')}]=${dp[nxt]}`,
              `h=${h}, p=${p}, S=${S}→${nxt}`,
              [...dp]
            ));
          }
        }
      }
    }

    steps.push(mkStep(
      `所有人均戴上帽子方案数 dp[${full.toString(2)}] = ${dp[full]}`,
      `答案: ${dp[full]}`,
      [...dp]
    ));

    return steps;
  }

  // ─── Optimal Account Balancing (LC 465) ───────────────
  private compileOptimalAccount(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;
    const debts = [-5, 10, -5];
    const m = debts.length;
    const full = (1 << m) - 1;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `非零负债 debts = [${debts.join(',')}], 人数 m=${m}`,
      `m=${m}`
    ));

    const sum = new Array(1 << m).fill(0);
    for (let S = 1; S <= full; S++) {
      for (let i = 0; i < m; i++) {
        if (S & (1 << i)) {
          sum[S] = sum[S ^ (1 << i)] + debts[i]!;
          break;
        }
      }
    }

    const dp = new Array(1 << m).fill(0);
    for (let S = 1; S <= full; S++) {
      for (let i = 0; i < m; i++) {
        if (S & (1 << i)) {
          dp[S] = Math.max(dp[S], dp[S ^ (1 << i)]!);
        }
      }
      if (sum[S] === 0) {
        dp[S]++;
        steps.push(mkStep(
          `子集 ${S.toString(2).padStart(m, '0')} 和为 0！dp[${S.toString(2).padStart(m, '0')}]=${dp[S]} (包含1个独立和0集合)`,
          `sum[${S}]=0, dp[${S}]=${dp[S]}`,
          [...dp]
        ));
      }
    }

    const ans = m - dp[full]!;
    steps.push(mkStep(
      `全集最大和0子集数=${dp[full]}, 最少交易笔数 = m(${m}) - ${dp[full]} = ${ans}`,
      `答案: ${ans}`,
      [...dp]
    ));

    return steps;
  }

  // ─── Good Subsets (LC 1994) ───────────────────────────
  private compileGoodSubsets(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;
    const nums = [1, 2, 3, 4];

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `nums = [${nums.join(',')}], 质数表: [2,3,5,7,11,13,17,19,23,29]`,
      `init`
    ));

    steps.push(mkStep(
      `数字4含平方因子(2^2)排除；数字1有1个；数字2掩码=001, 数字3掩码=010`,
      `filter`
    ));

    const dp = new Array(1 << 3).fill(0);
    dp[0] = 1;

    dp[1] = 1;
    steps.push(mkStep(
      `加入数字 2 (掩码 001): dp[001] = 1`,
      `add 2`,
      [...dp]
    ));

    dp[2] = 1;
    dp[3] = 1;
    steps.push(mkStep(
      `加入数字 3 (掩码 010): dp[010] = 1, dp[011] = dp[001]*1 = 1 (子集[2,3])`,
      `add 3`,
      [...dp]
    ));

    const sumWithout1 = dp[1] + dp[2] + dp[3];
    const ans = sumWithout1 * 2;

    steps.push(mkStep(
      `不含1好子集方案数=${sumWithout1}，数字1产生 2^1=2 倍乘 → 最终好子集数 = ${ans}`,
      `答案: ${ans}`,
      [...dp]
    ));

    return steps;
  }

  // ─── Distribute Repeating Integers (LC 1655) ──────────
  private compileDistributeRepeating(params: StageExecutionParams): UniversalStep[] {
    const steps: UniversalStep[] = [];
    let stepId = 0;
    const nums = [1, 1, 2, 2];
    const quantity = [2, 2];
    const m = quantity.length;
    const full = (1 << m) - 1;

    const mkStep = (msg: string, log: string, dp1d?: number[]): UniversalStep => ({
      stepId: stepId++,
      dp1d: dp1d || [],
      memo: {},
      msg,
      log,
    });

    steps.push(mkStep(
      `nums=[${nums.join(',')}], 顾客需求=[${quantity.join(',')}], m=${m}`,
      `init`
    ));

    steps.push(mkStep(
      `频次统计: 数字1频次=2, 数字2频次=2`,
      `freq ready`
    ));

    const dp = new Array(1 << m).fill(0);
    dp[0] = 1;

    dp[1] = 1;
    steps.push(mkStep(
      `数字1(频次2) 分配给顾客0 (需求2): dp[01] = true`,
      `assign num1 -> cust0`,
      [...dp]
    ));

    dp[3] = 1;
    steps.push(mkStep(
      `数字2(频次2) 分配给顾客1 (需求2): dp[11] = true (满足全部顾客！)`,
      `assign num2 -> cust1`,
      [...dp]
    ));

    steps.push(mkStep(
      `dp[${full.toString(2)}] = true → 可以满足所有顾客订单 ✓`,
      `答案: true`,
      [...dp]
    ));

    return steps;
  }
}

