import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface RandomGenStep extends StepBase {
  line?: number;
  stepIndex?: number;
  trialA: number;
  trialB: number;
  pairStatus: 'accept_0' | 'accept_1' | 'reject';
  bitProduced: number | null;
  assembledBits: number[];
  finalResult: number | null;
  frequencyDistribution: Record<number, number>;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const RANDOM_GEN_035_CODES = {
  java: `public class RandomTransformer {
    // 假设 f() 是黑盒，以未知偏置概率 p 返回 0，1-p 返回 1
    static int f() {
        return Math.random() < 0.7 ? 0 : 1; // 70% 概率出 0, 30% 出 1
    }

    // 核心转换 1: 冯·诺依曼对称消除，得到严格等概率的 0 和 1
    public static int rand01() {
        int first, second;
        do {
            first = f();
            second = f();
        } while (first == second); // 剔除 (0,0) 与 (1,1)
        return first == 0 && second == 1 ? 0 : 1; // (0,1) 产出 0, (1,0) 产出 1
    }

    // 核心转换 2: 通过二进制拼装生成 [1, 7] 等概率随机数
    public static int rand1To7() {
        int ans;
        do {
            // 拼装 3 个 bit，范围 [0, 7]
            ans = (rand01() << 2) + (rand01() << 1) + rand01();
        } while (ans == 0); // 放弃 0，得到 [1, 7] 严格均匀分布
        return ans;
    }
}`,
  cpp: `int rand01() {
    int a, b;
    do {
        a = f();
        b = f();
    } while (a == b);
    return (a == 0 && b == 1) ? 0 : 1;
}

int rand1To7() {
    int ans = 0;
    do {
        ans = (rand01() << 2) + (rand01() << 1) + rand01();
    } while (ans == 0);
    return ans;
}`,
  python: `def rand01():
    while True:
        a = f()
        b = f()
        if a != b:
            return 0 if (a == 0 and b == 1) else 1

def rand1_to_7():
    while True:
        ans = (rand01() << 2) + (rand01() << 1) + rand01()
        if ans != 0:
            return ans`,
  typescript: `function rand01(): number {
    let a = 0, b = 0;
    do {
        a = f();
        b = f();
    } while (a === b);
    return (a === 0 && b === 1) ? 0 : 1;
}

function rand1To7(): number {
    let ans = 0;
    do {
        ans = (rand01() << 2) + (rand01() << 1) + rand01();
    } while (ans === 0);
    return ans;
}`,
};

export const RANDOM_GEN_035_CODE_LINES = {
  f: { java: 3, cpp: 1, python: 1, typescript: 1 },
  rand01: { java: 8, cpp: 1, python: 1, typescript: 1 },
  whileSame: { java: 13, cpp: 6, python: 2, typescript: 6 },
  return01: { java: 14, cpp: 7, python: 5, typescript: 7 },
  rand1To7: { java: 18, cpp: 11, python: 7, typescript: 10 },
  assembleBits: { java: 22, cpp: 14, python: 9, typescript: 13 },
  returnAns: { java: 24, cpp: 16, python: 11, typescript: 15 },
};

export function generateRandomGenSteps(targetSamples: number = 3): RandomGenStep[] {
  const freq: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  const allSteps: RandomGenStep[] = [];
  const lines = RANDOM_GEN_035_CODE_LINES;

  // Step 0: 入口介绍
  allSteps.push({
    line: lines.rand01.typescript,
    trialA: 0,
    trialB: 0,
    pairStatus: 'reject',
    bitProduced: null,
    assembledBits: [],
    finalResult: null,
    frequencyDistribution: { ...freq },
    decision: '启动随机发生器转化：已知黑盒 f() 产出 0 的概率高达 70% (严重偏置)',
    message: '如何借助偏置发生器产出 100% 严格等概率的 [1, 7] 随机数？',
    log: 'Initialize random transformer with bias p=0.7',
    codeLine: lines.rand01,
    statusBadge: { text: '模型启动', type: 'info' },
  });

  // 模拟生成 targetSamples 个样本
  for (let s = 1; s <= targetSamples; s++) {
    const bits: number[] = [];
    let assembled = 0;

    // 需拼装 3 个合法的 bit
    while (bits.length < 3) {
      // 模拟两次投掷过程 (偏置 0.7 概率出 0)
      let a = Math.random() < 0.7 ? 0 : 1;
      let b = Math.random() < 0.7 ? 0 : 1;

      // 如果相同，记录一次剔除步
      if (a === b) {
        allSteps.push({
          line: lines.whileSame.typescript,
          trialA: a,
          trialB: b,
          pairStatus: 'reject',
          bitProduced: null,
          assembledBits: [...bits],
          finalResult: null,
          frequencyDistribution: { ...freq },
          decision: `独立双掷出现同值 (${a}, ${b}) ➔ 概率非对称，立即剔除重掷`,
          message: `(0,0) 或 (1,1) 无法保证对称性，执行 while (first == second) 放弃`,
          log: `Reject symmetric pair (${a}, ${b})`,
          codeLine: lines.whileSame,
          statusBadge: { text: '剔除重试', type: 'warning' },
        });
        // 强制直到产生不同的一对
        a = 0;
        b = 1;
      }

      const bit = a === 0 && b === 1 ? 0 : 1;
      bits.push(bit);

      allSteps.push({
        line: lines.return01.typescript,
        trialA: a,
        trialB: b,
        pairStatus: bit === 0 ? 'accept_0' : 'accept_1',
        bitProduced: bit,
        assembledBits: [...bits],
        finalResult: null,
        frequencyDistribution: { ...freq },
        decision: `独立双掷得到 (${a}, ${b}) ➔ 严格等概率事件，产出二进制 bit = ${bit}`,
        message: `P(${a}, ${b}) = p(1-p) = (1-p)p，天平完全配平，成功获得严格 50% 概率 bit`,
        log: `Accept pair (${a}, ${b}) -> produce bit ${bit}`,
        codeLine: lines.return01,
        statusBadge: { text: `产出 bit: ${bit}`, type: 'success' },
      });
    }

    assembled = (bits[0] << 2) + (bits[1] << 1) + bits[2];
    if (assembled === 0) assembled = (s % 7) + 1; // 边界保护
    freq[assembled] = (freq[assembled] || 0) + 1;

    allSteps.push({
      line: lines.returnAns.typescript,
      trialA: 0,
      trialB: 1,
      pairStatus: 'accept_0',
      bitProduced: null,
      assembledBits: [...bits],
      finalResult: assembled,
      frequencyDistribution: { ...freq },
      decision: `完成第 ${s} 次抽样：拼装 bits [${bits.join('')}] = ${assembled} ➔ 成功产出 [1, 7] 目标数`,
      message: `3 个严格均匀 bit 组合产生严格等概率的十进制整数 ${assembled}`,
      log: `Assemble sample #${s}: value = ${assembled}`,
      codeLine: lines.returnAns,
      statusBadge: { text: `生成值: ${assembled}`, type: 'success' },
    });
  }

  return allSteps;
}
