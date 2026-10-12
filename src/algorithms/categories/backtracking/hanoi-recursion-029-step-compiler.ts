/**
 * Class 029: 经典暴力递归入门 (汉诺塔) 步骤编译器
 * 负责推演汉诺塔宏观递归搬迁步骤
 */

import { StepBase } from '../../../core/step-visualizer';

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
