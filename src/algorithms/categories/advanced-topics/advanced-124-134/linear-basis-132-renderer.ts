/**
 * Class 132: 线性基与异或空间基底 (Linear Basis)
 * 洛谷 P3812 【模板】线性基
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface LinearBasis132Step extends StepBase {
  basis: number[];
  curNum: number;
  curBit: number;
  maxXor: number;
  insertedCount: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const LINEAR_BASIS_132_CODES = {
  java: `public class LinearBasis {
    static long[] d = new long[62];

    public static boolean insert(long x) {
        for (int i = 60; i >= 0; i--) {
            if ((x & (1L << i)) == 0) continue;
            if (d[i] == 0) {
                d[i] = x;
                return true;
            }
            x ^= d[i];
        }
        return false;
    }

    public static long getMax() {
        long ans = 0;
        for (int i = 60; i >= 0; i--) {
            if ((ans ^ d[i]) > ans) {
                ans ^= d[i];
            }
        }
        return ans;
    }
}`,
  cpp: `class LinearBasis {
    long long d[62] = {0};
public:
    bool insert(long long x) {
        for (int i = 60; i >= 0; i--) {
            if (!(x & (1LL << i))) continue;
            if (!d[i]) {
                d[i] = x;
                return true;
            }
            x ^= d[i];
        }
        return false;
    }
    long long getMax() {
        long long ans = 0;
        for (int i = 60; i >= 0; i--) {
            if ((ans ^ d[i]) > ans) ans ^= d[i];
        }
        return ans;
    }
};`,
  python: `class LinearBasis:
    def __init__(self):
        self.d = [0] * 62

    def insert(self, x: int) -> bool:
        for i in range(60, -1, -1):
            if not (x & (1 << i)): continue
            if self.d[i] == 0:
                self.d[i] = x
                return True
            x ^= self.d[i]
        return False

    def get_max(self) -> int:
        ans = 0
        for i in range(60, -1, -1):
            if (ans ^ self.d[i]) > ans:
                ans ^= self.d[i]
        return ans`,
  typescript: `export class LinearBasis {
    d: number[] = new Array(62).fill(0);
    insert(x: number): boolean {
        for (let i = 60; i >= 0; i--) {
            if ((x & (1 << i)) === 0) continue;
            if (this.d[i] === 0) {
                this.d[i] = x;
                return true;
            }
            x ^= this.d[i];
        }
        return false;
    }
    getMax(): number {
        let ans = 0;
        for (let i = 60; i >= 0; i--) {
            if ((ans ^ this.d[i]) > ans) ans ^= this.d[i];
        }
        return ans;
    }
}`
};

export function buildLinearBasis132Steps(nums: number[], maxBit: number = 5): LinearBasis132Step[] {
  const steps: LinearBasis132Step[] = [];
  const d: number[] = new Array(maxBit + 1).fill(0);
  let count = 0;

  // 1. 入口
  steps.push({
    basis: [...d],
    curNum: 0,
    curBit: -1,
    maxXor: 0,
    insertedCount: 0,
    decision: `主函数入口：准备将 [${nums.join(', ')}] 依次插入线性基，以构造极小生成基底并求解最大异或和`,
    message: '线性基性质：原集合的所有异或值与线性基子集异或值构成的张成空间等价',
    log: `init LinearBasis`,
    codeLine: 1,
    statusBadge: { text: '初始化', type: 'info' },
  });

  // 2. 插入过程
  for (const rawX of nums) {
    let x = rawX;
    let inserted = false;

    steps.push({
      basis: [...d],
      curNum: x,
      curBit: -1,
      maxXor: 0,
      insertedCount: count,
      decision: `开始插入数字 x = ${x} (二进制 0b${x.toString(2).padStart(maxBit + 1, '0')})`,
      message: '从高位至低位逐位扫描第一个为 1 的二进制位',
      log: `insert(${x})`,
      codeLine: 5,
      statusBadge: { text: `插入 ${x}`, type: 'warning' },
    });

    for (let i = maxBit; i >= 0; i--) {
      if ((x & (1 << i)) === 0) continue;

      if (d[i] === 0) {
        d[i] = x;
        count++;
        inserted = true;
        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: count,
          decision: `🎉 发现基底位置 d[${i}] 为空！将当前值 ${x} 成功固化为第 ${i} 位的基向量 d[${i}] = ${x}`,
          message: `基底向量规模扩充为 ${count} 个独立元`,
          log: `d[${i}] = ${x}`,
          codeLine: 9,
          statusBadge: { text: `成功驻留 d[${i}]`, type: 'success' },
        });
        break;
      } else {
        const oldX = x;
        x ^= d[i];
        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: count,
          decision: `基底位置 d[${i}] 已存在向量 ${d[i]}。高位消元：x = ${oldX} ^ ${d[i]} = ${x}`,
          message: `通过异或消除第 ${i} 位的 1，继续向低位探查`,
          log: `x ^= d[${i}] (${oldX} -> ${x})`,
          codeLine: 12,
          statusBadge: { text: `消元至 ${x}`, type: 'info' },
        });
      }
    }

    if (!inserted) {
      steps.push({
        basis: [...d],
        curNum: 0,
        curBit: -1,
        maxXor: 0,
        insertedCount: count,
        decision: `元素 ${rawX} 被完全消元为 0，说明该元素属于现有基底张成空间的线性组合，无需新增基向量`,
        message: '集合线性相关，基底不发生改变',
        log: `linear dependent: ${rawX}`,
        codeLine: 14,
        statusBadge: { text: `线性相关已消零`, type: 'danger' },
      });
    }
  }

  // 3. 贪心求解全局最大异或和
  let ans = 0;
  for (let i = maxBit; i >= 0; i--) {
    const candidate = ans ^ d[i];
    const willUpdate = d[i] !== 0 && candidate > ans;
    if (willUpdate) {
      ans = candidate;
    }
    steps.push({
      basis: [...d],
      curNum: 0,
      curBit: i,
      maxXor: ans,
      insertedCount: count,
      decision: `贪心考量第 ${i} 位基底 d[${i}] = ${d[i]}：异或后候选值 = ${ans} ^ ${d[i]} = ${candidate}`,
      message: willUpdate ? `🎉 异或后数值更大，采纳该基向量，ans 更新为 ${ans}` : `保持不变，当前最优异或和为 ${ans}`,
      log: `getMax bit=${i} -> ${ans}`,
      codeLine: 20,
      statusBadge: willUpdate ? { text: `更新最大值 ${ans}`, type: 'success' } : { text: `跳过 d[${i}]`, type: 'info' },
    });
  }

  return steps;
}

export const linearBasis132Visualizer = registerDeclarativeAlgorithm<LinearBasis132Step>({
  id: 'linear-basis-132',
  name: '线性基与异或空间基底 (Class 132)',
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 132,
  learningGoal: '深刻理解线性基向量张成空间、高位消元插入机制与贪心异或最大值推导',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定 <code>n</code> 个整数，求在这些数中选取任意个（可以为 0 个）数进行异或运算所能得到的<strong>最大值</strong>。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例输入：</strong>[11, 9, 5, 7]<br/>
        <strong>样例输出：</strong>15<br/>
        <strong>解释：</strong>11 ^ 5 ^ 7 = 15 为最大异或和。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '正整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '11, 9, 5, 7',
      placeholder: '请输入正整数列表',
    },
  ],
  codeLanguages: LINEAR_BASIS_132_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '11, 9, 5, 7');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildLinearBasis132Steps(nums.length > 0 ? nums : [11, 9, 5, 7], 5);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前处理数字</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curNum > 0 ? step.curNum : '闲置'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前探测位 (Bit)</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.curBit >= 0 ? `第 ${step.curBit} 位` : '无'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">基底独立向量数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.insertedCount} 个</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">当前最大异或和</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.maxXor}</div>
          </div>
        </div>

        <!-- 线性基向量状态表 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🗄️ 线性基底向量表 d[i] (最高位至最低位)
          </div>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
            ${step.basis.map((val, idx) => {
              const isActive = idx === step.curBit;
              return `
                <div style="border: 1px solid ${isActive ? '#3b82f6' : '#e2e8f0'}; background: ${isActive ? '#eff6ff' : '#ffffff'}; border-radius: 6px; padding: 8px; text-align: center;">
                  <div style="font-size: 10px; color: #64748b; font-family: monospace;">d[${idx}]</div>
                  <div style="font-size: 14px; font-weight: 700; color: ${val > 0 ? '#1e293b' : '#cbd5e1'}; margin-top: 2px;">
                    ${val > 0 ? val : '0'}
                  </div>
                  <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
                    ${val > 0 ? '0b' + val.toString(2).padStart(6, '0') : '-'}
                  </div>
                </div>
              `;
            }).reverse().join('')}
          </div>
        </div>

        <!-- 决策解析卡片 -->
        ${renderFormulaCard(
          '线性基插入与消元准则',
          `for i from 60 down to 0: if (x & (1<<i)) { if (!d[i]) { d[i] = x; break; } else x ^= d[i]; }`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
