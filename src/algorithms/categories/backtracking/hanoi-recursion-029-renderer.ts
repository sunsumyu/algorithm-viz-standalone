/**
 * Class 029: 经典暴力递归入门 (汉诺塔问题 - Tower of Hanoi)
 * 经典算法入门第一课
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface Hanoi029Step extends StepBase {
  disksA: number[];
  disksB: number[];
  disksC: number[];
  movedDisk?: number;
  fromPillar: string;
  toPillar: string;
  moveCount: number;
  totalExpectedMoves: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const HANOI_029_CODES = {
  java: `public class Hanoi {
    // 宏观递归思维：
    // 1. 将 1 ~ n-1 号圆盘从 from 借助 to 移动到 other
    // 2. 将 n 号最大圆盘从 from 直接移动到 to
    // 3. 将 1 ~ n-1 号圆盘从 other 借助 from 移动到 to
    public static void hanoi(int n, String from, String to, String other) {
        if (n == 1) {
            System.out.println("移动圆盘 1: 从 " + from + " -> " + to);
            return;
        }
        hanoi(n - 1, from, other, to);
        System.out.println("移动圆盘 " + n + ": 从 " + from + " -> " + to);
        hanoi(n - 1, other, to, from);
    }
}`,
  cpp: `void hanoi(int n, string from, string to, string other) {
    if (n == 1) {
        cout << "移动圆盘 1: " << from << " -> " << to << endl;
        return;
    }
    hanoi(n - 1, from, other, to);
    cout << "移动圆盘 " << n << ": " << from << " -> " << to << endl;
    hanoi(n - 1, other, to, from);
}`,
  python: `def hanoi(n, from_p, to_p, other_p):
    if n == 1:
        print(f"移动圆盘 1: {from_p} -> {to_p}")
        return
    hanoi(n - 1, from_p, other_p, to_p)
    print(f"移动圆盘 {n}: {from_p} -> {to_p}")
    hanoi(n - 1, other_p, to_p, from_p)`,
  typescript: `export function hanoi(n: number, from: string, to: string, other: string): void {
    if (n === 1) {
        console.log(\`移动圆盘 1: \${from} -> \${to}\`);
        return;
    }
    hanoi(n - 1, from, other, to);
    console.log(\`移动圆盘 \${n}: \${from} -> \${to}\`);
    hanoi(n - 1, other, to, from);
}`
};

export function buildHanoi029Steps(n: number = 3): Hanoi029Step[] {
  const steps: Hanoi029Step[] = [];
  const totalMoves = (1 << n) - 1;

  const pillars: Record<string, number[]> = {
    A: Array.from({ length: n }, (_, i) => n - i), // [3, 2, 1]
    B: [],
    C: [],
  };

  steps.push({
    disksA: [...pillars.A],
    disksB: [...pillars.B],
    disksC: [...pillars.C],
    fromPillar: 'A',
    toPillar: 'C',
    moveCount: 0,
    totalExpectedMoves: totalMoves,
    decision: `主函数入口：共计 ${n} 个圆盘置于柱子 A，目标完全移动至柱子 C，总步数将严格为 2^${n} - 1 = ${totalMoves} 步`,
    message: '核心思维：永远不要陷进微观单步调用，信任子过程的宏观语义',
    log: `enter hanoi(n=${n}, A->C)`,
    codeLine: 1,
    statusBadge: { text: '准备搬迁', type: 'info' },
  });

  let count = 0;

  function move(disk: number, from: string, to: string, other: string) {
    if (disk === 1) {
      const d = pillars[from].pop()!;
      pillars[to].push(d);
      count++;
      steps.push({
        disksA: [...pillars.A],
        disksB: [...pillars.B],
        disksC: [...pillars.C],
        movedDisk: 1,
        fromPillar: from,
        toPillar: to,
        moveCount: count,
        totalExpectedMoves: totalMoves,
        decision: `【基准步】移动最小圆盘 1：从 ${from} 柱 ➜ ${to} 柱`,
        message: `当前完成进度: ${count} / ${totalMoves} 步`,
        log: `move disk 1: ${from} -> ${to}`,
        codeLine: 9,
        statusBadge: { text: `第 ${count} 步 (${from}➜${to})`, type: 'success' },
      });
      return;
    }

    // 1. 将 1 ~ disk-1 移到 other
    move(disk - 1, from, other, to);

    // 2. 将 disk 移到 to
    const d = pillars[from].pop()!;
    pillars[to].push(d);
    count++;
    steps.push({
      disksA: [...pillars.A],
      disksB: [...pillars.B],
      disksC: [...pillars.C],
      movedDisk: disk,
      fromPillar: from,
      toPillar: to,
      moveCount: count,
      totalExpectedMoves: totalMoves,
      decision: `【底盘转移】移动关键圆盘 ${disk}：从 ${from} 柱 ➜ ${to} 柱`,
      message: `底盘成功归位！随后将借助 ${from} 柱将上方其余圆盘覆回目标柱`,
      log: `move disk ${disk}: ${from} -> ${to}`,
      codeLine: 13,
      statusBadge: { text: `移动底盘 ${disk}`, type: 'warning' },
    });

    // 3. 将 1 ~ disk-1 移到 to
    move(disk - 1, other, to, from);
  }

  move(n, 'A', 'C', 'B');

  steps.push({
    disksA: [...pillars.A],
    disksB: [...pillars.B],
    disksC: [...pillars.C],
    fromPillar: 'A',
    toPillar: 'C',
    moveCount: count,
    totalExpectedMoves: totalMoves,
    decision: `🎉 汉诺塔全部搬迁圆满达成！全部 ${n} 个圆盘规范安放于目标柱 C，总步数精确消耗 ${count} 步`,
    message: '递归终了，柱 A/B 均为空',
    log: `hanoi finished in ${count} moves`,
    codeLine: 15,
    statusBadge: { text: '完美收官', type: 'success' },
  });

  return steps;
}

export const hanoiRecursion029Visualizer = registerDeclarativeAlgorithm<Hanoi029Step>({
  id: 'hanoi-recursion-029',
  name: '经典暴力递归入门 (汉诺塔) (Class 029)',
  category: 'backtracking',
  icon: '🗼',
  difficulty: 1,
  levelOrder: 29,
  learningGoal: '深刻体悟暴力递归的宏观调度三部曲，不纠缠递归内部细节，建立对子过程语义的强大信任感',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>有三根柱子 A、B、C。A 柱上有 <code>N</code> 个大小各不相同的圆盘，大的在下小的在上。每次只能移动一个圆盘，且大盘绝不能压在小盘上方。求将全部圆盘从 A 移到 C 的最少步数及具体操作序列。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>定理：</strong>N 个圆盘的最优移动步数严格为 <code>2ᴺ - 1</code>。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'disks',
      label: '圆盘个数 (N)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
    },
  ],
  codeLanguages: HANOI_029_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(1, Math.min(5, parseInt(String(inputs.disks || 3), 10)));
    return buildHanoi029Steps(n);
  },
  renderCanvas: (container, step) => {
    const renderPillar = (name: string, disks: number[]) => {
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 180px; position: relative;">
          <!-- 垂直立柱 -->
          <div style="position: absolute; width: 8px; height: 150px; background: #cbd5e1; border-radius: 4px; bottom: 10px; z-index: 1;"></div>
          <!-- 底座 -->
          <div style="position: absolute; width: 90%; height: 10px; background: #94a3b8; border-radius: 4px; bottom: 0;"></div>
          
          <!-- 堆叠的圆盘 -->
          <div style="display: flex; flex-direction: column-reverse; align-items: center; gap: 4px; z-index: 2; margin-bottom: 12px; width: 100%;">
            ${disks.map((d) => {
              const width = 30 + d * 22;
              const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
              const bg = colors[(d - 1) % colors.length];
              return `
                <div style="width: ${width}px; height: 22px; background: ${bg}; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${d}
                </div>
              `;
            }).join('')}
          </div>

          <span style="position: absolute; bottom: -20px; font-weight: 800; font-size: 14px; color: #334155;">柱 ${name}</span>
        </div>
      `;
    };

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前移动圆盘</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.movedDisk ? `圆盘 #${step.movedDisk}` : '准备中'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前搬迁轨迹</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.fromPillar} ➜ ${step.toPillar}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">已走步数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.moveCount} 步</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">总步数进度</div>
            <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.moveCount} / ${step.totalExpectedMoves}</div>
          </div>
        </div>

        <!-- 物理柱子演化展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 30px 20px 40px 20px; margin-bottom: 20px;">
          <div style="display: flex; gap: 20px; justify-content: space-around;">
            ${renderPillar('A', step.disksA)}
            ${renderPillar('B', step.disksB)}
            ${renderPillar('C', step.disksC)}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '宏观递归三步推导',
          `1. hanoi(n-1, from, other, to) ➜ 2. 移底盘 n ➜ 3. hanoi(n-1, other, to, from)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
