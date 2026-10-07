import { getGreedy090Anchor } from './greedy-090-stage-codes';
import { Greedy090Step } from './greedy-090-shared';

export interface AbsValueAddStep extends Greedy090Step {
  currentArray: number[];
  newlyAdded: number[];
  comparingPair?: [number, number];
  diffResult?: number;
  gcdValue?: number;
  maxVal?: number;
  theoreticalCount?: number;
  hasZero: boolean;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function parseArrayInput(raw: string): number[] {
  const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n >= 0);
  return nums.length > 0 ? nums : [3, 9];
}

export function buildAbsValueAddSteps(rawInput: string, stage: number): AbsValueAddStep[] {
  const initArr = parseArrayInput(rawInput);
  const steps: AbsValueAddStep[] = [];

  // 计算全局 GCD 和最大值
  let max = 0;
  let g = 0;
  let hasZero = false;
  const countSet = new Set<number>();

  for (const x of initArr) {
    if (x === 0 || countSet.has(x)) hasZero = true;
    countSet.add(x);
    if (x > max) max = x;
    g = gcd(g, x);
  }
  const theoretical = max === 0 ? 1 : Math.floor(max / g) + (hasZero ? 1 : 0);

  const initAnchor = getGreedy090Anchor(
    'abs-value-add',
    stage === 1 ? 1 : stage === 2 ? 2 : 3,
    stage === 1 ? 'init' : stage === 2 ? 'init' : 'intro'
  );

  // Step 0: 入口帧
  steps.push({
    line: initAnchor.java,
    stepIndex: 0,
    currentArray: [...initArr],
    newlyAdded: [],
    gcdValue: g,
    maxVal: max,
    theoreticalCount: theoretical,
    hasZero,
    decision: '初始化数组状态',
    message: `初始数组: [${initArr.join(', ')}]，探索任意两数差值绝对值的闭包生成过程`,
    log: `[Init] 初始数组: ${initArr.join(',')}`,
    codeLine: initAnchor,
  });

  if (stage === 1) {
    // 阶段1: 暴力集合循环生成
    const set = new Set<number>(initArr);
    const list = [...initArr];
    let round = 1;

    while (round <= 4) {
      const beforeSize = list.length;
      let addedInRound = false;

      const whileAnchor = getGreedy090Anchor('abs-value-add', 1, 'whileLoop');
      steps.push({
        line: whileAnchor.java,
        stepIndex: steps.length,
        currentArray: [...list],
        newlyAdded: [],
        gcdValue: g,
        maxVal: max,
        theoreticalCount: theoretical,
        hasZero,
        decision: `第 ${round} 轮扩散排查`,
        message: `开始第 ${round} 轮两两作差扫描，当前集合包含 ${beforeSize} 个元素`,
        log: `[Round ${round}] 集合大小=${beforeSize}`,
        codeLine: whileAnchor,
      });

      for (let i = 0; i < beforeSize; i++) {
        for (let j = i + 1; j < beforeSize; j++) {
          const a = list[i];
          const b = list[j];
          const diff = Math.abs(a - b);

          if (!set.has(diff)) {
            set.add(diff);
            list.push(diff);
            addedInRound = true;

            const addAnchor = getGreedy090Anchor('abs-value-add', 1, 'add');
            steps.push({
              line: addAnchor.java,
              stepIndex: steps.length,
              currentArray: [...list],
              newlyAdded: [diff],
              comparingPair: [a, b],
              diffResult: diff,
              gcdValue: g,
              maxVal: max,
              theoreticalCount: theoretical,
              hasZero,
              decision: `发现新差值 |${a} - ${b}| = ${diff}`,
              message: `计算两数差的绝对值 |${a} - ${b}| = ${diff}，集合中尚不存在，加入集合！集合大小变为 ${list.length}`,
              log: `[Add New] |${a} - ${b}| = ${diff} 入库`,
              codeLine: addAnchor,
            });
          }
        }
      }

      if (!addedInRound) {
        const retAnchor = getGreedy090Anchor('abs-value-add', 1, 'ret');
        steps.push({
          line: retAnchor.java,
          stepIndex: steps.length,
          currentArray: [...list],
          newlyAdded: [],
          gcdValue: g,
          maxVal: max,
          theoreticalCount: theoretical,
          hasZero,
          decision: '数组大小达到固定，终止循环',
          message: `第 ${round} 轮遍历中未产生任何新差值，集合已完全封闭！最终元素总数 = ${list.length}`,
          log: `[Fix Done] 集合大小稳定在 ${list.length}`,
          codeLine: retAnchor,
        });
        break;
      }
      round++;
    }
    return steps;
  }

  if (stage === 2) {
    // 阶段2: GCD 数论推演
    const updateGcdAnchor = getGreedy090Anchor('abs-value-add', 2, 'updateGCD');
    steps.push({
      line: updateGcdAnchor.java,
      stepIndex: steps.length,
      currentArray: [...initArr],
      newlyAdded: [],
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '扫描最大值与最大公约数',
      message: `数论扫描：全体元素最大值 Max = ${max}，非零最大公约数 GCD(g) = ${g}`,
      log: `[GCD Scan] Max=${max}, GCD=${g}`,
      codeLine: updateGcdAnchor,
    });

    // 展现理想倍数集
    const fullClosure: number[] = [];
    if (hasZero) fullClosure.push(0);
    if (g > 0) {
      for (let v = g; v <= max; v += g) {
        fullClosure.push(v);
      }
    } else if (max === 0) {
      fullClosure.push(0);
    }

    const calcAnchor = getGreedy090Anchor('abs-value-add', 2, 'calcCount');
    steps.push({
      line: calcAnchor.java,
      stepIndex: steps.length,
      currentArray: fullClosure,
      newlyAdded: fullClosure.filter((x) => !initArr.includes(x)),
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '数论闭包生成',
      message: `由辗转相除法可知：所有生成的数必为 ${g} 的倍数（从 ${g} 到 ${max} 共 ${max / g} 个）${hasZero ? '，加上 0 额外计 1 个' : ''}`,
      log: `[Theory Calc] 最终闭包集合包含 ${fullClosure.length} 个数`,
      codeLine: calcAnchor,
    });

    const retAnchor = getGreedy090Anchor('abs-value-add', 2, 'ret');
    steps.push({
      line: retAnchor.java,
      stepIndex: steps.length,
      currentArray: fullClosure,
      newlyAdded: [],
      gcdValue: g,
      maxVal: max,
      theoreticalCount: theoretical,
      hasZero,
      decision: '数论贪心 O(N log M) 极速结算',
      message: `计算公式：ans = (${max} / ${g}) + (${hasZero ? '1 (有0)' : '0 (无0)'}) = ${theoretical}`,
      log: `[Done] 最终长度=${theoretical}`,
      codeLine: retAnchor,
    });

    return steps;
  }

  // 阶段3: 证明
  const gcdAnchor = getGreedy090Anchor('abs-value-add', 3, 'gcd');
  steps.push({
    line: gcdAnchor.java,
    stepIndex: steps.length,
    currentArray: [3, 9, 6, 0],
    newlyAdded: [6, 0],
    comparingPair: [9, 3],
    diffResult: 6,
    gcdValue: 3,
    maxVal: 9,
    theoreticalCount: 4,
    hasZero: true,
    decision: '更相减损术数学等价性',
    message: '数学本质：古中国《九章算术》中的“更相减损术”证明，不断相减操作必然能求出任意两数的最大公约数 g',
    log: '[Proof Start] 更相减损术与欧几里得算法等价。',
    codeLine: gcdAnchor,
  });

  const conclAnchor = getGreedy090Anchor('abs-value-add', 3, 'conclusion');
  steps.push({
    line: conclAnchor.java,
    stepIndex: steps.length,
    currentArray: [0, 3, 6, 9],
    newlyAdded: [],
    gcdValue: 3,
    maxVal: 9,
    theoreticalCount: 4,
    hasZero: true,
    decision: '裴蜀定理格点全覆盖证明',
    message: '一旦最小非零公约数 g 生成，通过 |k*g - g| = (k-1)*g，整个整数格点 {1g, 2g, ..., max} 将被彻底覆盖且无法产生其他任何多余数，闭包定理成立！',
    log: '[Proof Verified] 闭包定理严格成立。',
    codeLine: conclAnchor,
  });

  return steps;
}
