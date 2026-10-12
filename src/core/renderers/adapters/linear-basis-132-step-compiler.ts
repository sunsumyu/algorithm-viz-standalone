import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface LinearBasis132Step extends StepBase {
  basis: number[];
  curNum: number;
  curBit: number;
  maxXor: number;
  insertedCount: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
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

export const LINEAR_BASIS_132_CODE_LINES = {
  init: { java: 4, cpp: 4, python: 4, typescript: 4 },
  insert: { java: 6, cpp: 6, python: 6, typescript: 5 },
  solid: { java: 9, cpp: 8, python: 9, typescript: 7 },
  eliminate: { java: 12, cpp: 11, python: 11, typescript: 10 },
  dependent: { java: 14, cpp: 13, python: 12, typescript: 12 },
  getMax: { java: 20, cpp: 18, python: 16, typescript: 17 },
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
    codeLine: LINEAR_BASIS_132_CODE_LINES.init,
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
      codeLine: LINEAR_BASIS_132_CODE_LINES.insert,
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
          codeLine: LINEAR_BASIS_132_CODE_LINES.solid,
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
          codeLine: LINEAR_BASIS_132_CODE_LINES.eliminate,
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
        codeLine: LINEAR_BASIS_132_CODE_LINES.dependent,
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
      codeLine: LINEAR_BASIS_132_CODE_LINES.getMax,
      statusBadge: willUpdate ? { text: `更新最大值 ${ans}`, type: 'success' } : { text: `跳过 d[${i}]`, type: 'info' },
    });
  }

  return steps;
}
