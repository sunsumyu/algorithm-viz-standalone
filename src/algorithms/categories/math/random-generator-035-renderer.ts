/**
 * Class 035: 不均匀随机发生器向等概率转化模型 (Random Generator Transformation)
 * 左程云算法通关课入门篇 Class 035 / 冯·诺依曼偏置消除法 / LeetCode 470
 * 核心原语：独立两次试验概率对称消除，等概率 01 发生器与二进制拼装任意区间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface RandomGenStep extends StepBase {
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
  codeLine?: number;
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
}`
};

export function generateRandomGenSteps(targetSamples: number = 3): RandomGenStep[] {
  const freq: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  const allSteps: RandomGenStep[] = [];

  const lines = {
    f: 5,
    rand01: 9,
    whileSame: 13,
    return01: 14,
    rand1To7: 18,
    assembleBits: 21,
    returnAns: 23,
  };

  // Step 0: 入口介绍
  allSteps.push({
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

      const bit = (a === 0 && b === 1) ? 0 : 1;
      bits.push(bit);

      allSteps.push({
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

export function renderRandomGenCanvas(container: HTMLElement, step: RandomGenStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">双掷试验 (Trial A & B)</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            step.pairStatus === 'reject' ? '#f43f5e' : '#34d399'
          }; margin-top: 4px;">
            投掷 A: [ ${step.trialA} ] · 投掷 B: [ ${step.trialB} ]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">二进制位装配流水线 (3 Bits)</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            [ ${step.assembledBits.map(b => `<span style="color: #fbbf24;">${b}</span>`).join(' , ') || '等待装配'} ]
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">最终生成 [1, 7] 目标数值</div>
          <div style="font-size: 20px; font-weight: bold; color: #a855f7; margin-top: 4px;">
            ${step.finalResult !== null ? `🎉 输出值: ${step.finalResult}` : '生成中...'}
          </div>
        </div>
      </div>

      <!-- 核心沙盘：对称概率消除天平与直方图 -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 16px;">
        <!-- 对称概率天平沙盘 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
            冯·诺依曼偏置对称消除天平 (Von Neumann Bias Correction)
          </div>

          <div style="display: flex; justify-content: space-around; align-items: center; padding: 16px 0;">
            <!-- 左盘: (0, 1) 对应 0 -->
            <div style="text-align: center; background: rgba(52, 211, 153, 0.1); border: 1px solid ${step.pairStatus === 'accept_0' ? '#34d399' : 'rgba(52, 211, 153, 0.3)'}; border-radius: 8px; padding: 12px 18px;">
              <div style="font-size: 12px; color: #34d399; font-weight: 600;">事件组合 (0, 1)</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff; margin: 6px 0;">产出 0</div>
              <div style="font-size: 11px; color: #94a3b8;">概率: p · (1-p)</div>
            </div>

            <!-- 天平支点 -->
            <div style="font-size: 24px; color: #fbbf24;">⚖️</div>

            <!-- 右盘: (1, 0) 对应 1 -->
            <div style="text-align: center; background: rgba(56, 189, 248, 0.1); border: 1px solid ${step.pairStatus === 'accept_1' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}; border-radius: 8px; padding: 12px 18px;">
              <div style="font-size: 12px; color: #38bdf8; font-weight: 600;">事件组合 (1, 0)</div>
              <div style="font-size: 16px; font-weight: bold; color: #fff; margin: 6px 0;">产出 1</div>
              <div style="font-size: 11px; color: #94a3b8;">概率: (1-p) · p</div>
            </div>
          </div>

          <div style="font-size: 11px; text-align: center; color: #94a3b8;">
            数学定理：无论 $p$ 为多少，$p(1-p)$ 恒等于 $(1-p)p$！两事件发生概率严格相等！
          </div>
        </div>

        <!-- 频次直方图 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
            目标值 [1, 7] 生成分布看板
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 100px; padding: 0 10px; border-bottom: 1px solid #475569;">
            ${[1, 2, 3, 4, 5, 6, 7].map(num => {
              const count = step.frequencyDistribution[num] || 0;
              const height = count > 0 ? Math.min(80, count * 30 + 20) : 4;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <div style="font-size: 9px; color: #cbd5e1;">${count}次</div>
                  <div style="width: 22px; height: ${height}px; background: #0284c7; border-radius: 3px 3px 0 0;"></div>
                  <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">${num}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '冯·诺依曼随机转化公理',
        '任何具有独立同分布性质但概率偏置的随机源，通过做两次独立试验并比对：(0,1) 与 (1,0) 出现概率必定严格恒等。以此构建等概率 01 发生器，并通过二进制按位拼装即可等概率生成任意区间的整数！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const randomGenerator035Visualizer = registerDeclarativeAlgorithm<RandomGenStep>({
  id: 'random-generator-035',
  name: 'Class 035: 不均匀随机发生器向等概率转化模型 (Random Transformer)',
  category: 'math',
  icon: '🎲',
  difficulty: 2,
  levelOrder: 35,
  learningGoal: '理解冯·诺依曼偏置消除法数学原理，掌握由偏置随机发生器向等概率发生器及任意范围随机数的转化模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 035 / LeetCode 470)</h3>
      <p>给定一个黑盒函数 $f()$，它以未知固定概率 $p$ 产出 0，以 $1-p$ 产出 1：</p>
      <ul>
        <li><strong>问题 1</strong>：如何仅通过调用 $f()$，构造一个产生 0 和 1 概率严格各为 50% 的等概率发生器？</li>
        <li><strong>答案</strong>：独立双掷。若为 (0, 1) 则返回 0；若为 (1, 0) 则返回 1；若为 (0, 0) 或 (1, 1) 则重新投掷。因为 $p(1-p) = (1-p)p$ 绝对对称相等。</li>
        <li><strong>问题 2</strong>：如何基于等概率 01 发生器生成 $[1, 7]$ 的均匀随机数？</li>
        <li><strong>答案</strong>：调用 3 次生成 3 个二进制位，拼装出 $[0, 7]$；若得到 0 则重做，剩余 $[1, 7]$ 的 7 种结果概率严格等可能。</li>
      </ul>
    </div>
  `,
  codeLanguages: RANDOM_GEN_035_CODES,
  inputs: [
    {
      id: 'samples',
      label: '演示抽样次数',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '快速演示 (3 次抽样)', value: '3' },
        { label: '完整演示 (5 次抽样)', value: '5' },
      ],
    },
  ],
  generateSteps: (input) => {
    const samples = Number(input.samples) || 3;
    return generateRandomGenSteps(samples);
  },
  renderCanvas: (container, step) => {
    renderRandomGenCanvas(container, step);
  },
});
