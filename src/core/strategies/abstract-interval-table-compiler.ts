import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export interface IntervalTableContext {
  s: string;
  n: number;
  anchorMap: Record<string, number>;
  dp: (number | null)[][];
}

export interface IntervalConditionEvalResult {
  isMatch: boolean;
  charI: string;
  charJ: string;
  tag: string;
  log: string;
  msg: string;
}

export interface IntervalTransferResult {
  val: number;
  lineKey: string;
  tag: string;
  log: string;
  msg: string;
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
}

export interface IntervalReturnInfo {
  i: number;
  j: number;
  val: number;
  tag: string;
  log: string;
  msg: string;
}

/**
 * AbstractIntervalTableCompiler — 区间 DP (上三角状态表) 阶段 3 顶层抽象编译器
 *
 * 核心设计：Template Method 模式。
 * 独占区间动态规划的拓扑推导与循环控制流，强制实现“一行一步零跳步”的生命周期：
 *   1. init: 创建 n×n 上三角状态矩阵
 *   2. diag (可选): 对角线单字符基底初始化
 *   3. for i: 强制发射 loop_i 外层循环头帧 (倒序 i = n-1 down to 0)
 *   4. for j: 强制发射 loop_j 内层循环头帧 (正序 j = i+1/i up to n-1)
 *   5. cond: 强制发射 cond 端点字符比对条件判断帧 (展示 s[i] == s[j] 判定过程)
 *   6. transfer: 强制发射 transfer 状态转移与赋值帧
 *   7. return: 强制发射 return 最终收敛返回帧
 *
 * 物理杜绝任何子类算法偷懒跳步或漏发循环控制帧。
 */
export abstract class AbstractIntervalTableCompiler {
  public compile(
    model: IYamlAlgorithmModel,
    anchorMap: Record<string, number> = {}
  ): UniversalStep[] {
    const s = this.extractString(model);
    const n = s.length;

    const dp: (number | null)[][] = Array.from({ length: n }, () =>
      new Array(n).fill(null)
    );

    const ctx: IntervalTableContext = {
      s,
      n,
      anchorMap,
      dp
    };

    const steps: UniversalStep[] = [];

    const emitStep = (stepData: any) => {
      const isComparing = stepData.type === 'transfer' || stepData.type === 'cond' || stepData.type === 'eval';
      const curI = Math.max(0, Math.min(n - 1, stepData.i ?? 0));
      const curJ = Math.max(0, Math.min(n - 1, stepData.j ?? 0));

      steps.push({
        s,
        s1: s,
        curI,
        curJ,
        curL: curI,
        curR: curJ,
        currentCell: `dp[${curI}][${curJ}]`,
        currentVal: dp[curI]?.[curJ] ?? 0,
        dpTable: JSON.parse(JSON.stringify(dp)),
        depCells: [],
        label1: '母串 S',
        isComparing,
        ...stepData
      });
    };

    // 1. 初始化表格分配帧 (init)
    const lineInit = anchorMap.init || 3;
    emitStep({
      type: 'init',
      line: lineInit,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `创建 ${n}×${n} 上三角状态表`,
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (上三角区域有效)`,
      msg: this.getInitMessage(ctx),
      gridHighlight: { i: 0, j: n - 1 }
    });

    // 2. 对角线单字符基底初始化 (可选 Hook)
    this.performDiagInit(ctx, emitStep);

    // 3. 循环控制与状态转移 (由基类强制独占)
    const lineLoopI = anchorMap.loop_i || 5;
    const lineLoopJ = anchorMap.loop_j || 6;
    const lineCond = anchorMap.cond || 7;

    const startJOffset = this.getInnerLoopStartOffset(); // 1 表示 j 从 i+1 开始，0 表示 j 从 i 开始

    for (let i = n - 1; i >= 0; i--) {
      // 3.1 强制发射外层循环 loop_i 步进帧
      emitStep({
        type: 'loop-outer',
        line: lineLoopI,
        i,
        j: i,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `外层循环 i = ${i} (左端点 '${s[i]}')`,
        log: `| 🔁 外层循环 i = ${i} (倒序)：考察左端点 s[${i}] = '${s[i]}'`,
        msg: `外层循环：区间左端点 <code>i = ${i}</code>（字符 <code>'${s[i]}'</code>），自底向上构建子问题。`,
        gridHighlight: { i, j: i }
      });

      for (let j = i + startJOffset; j < n; j++) {
        // 3.2 强制发射内层循环 loop_j 步进帧
        emitStep({
          type: 'loop-inner',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `内层循环 j = ${j} (区间 [${i}..${j}] 长度 ${j - i + 1})`,
          log: `| ➡️ 内层循环 j = ${j}：扩展考察区间 s[${i}..${j}] = "${s.substring(i, j + 1)}"`,
          msg: `内层循环：区间右端点 <code>j = ${j}</code>（字符 <code>'${s[j]}'</code>），考察子串 <code>"${s.substring(i, j + 1)}"</code>。`,
          gridHighlight: { i, j }
        });

        // 3.3 强制发射 cond 端点字符比对条件判断帧
        const cond = this.evaluateCondition(i, j, ctx);
        emitStep({
          type: 'cond',
          line: lineCond,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: cond.tag,
          log: cond.log,
          msg: cond.msg,
          gridHighlight: { i, j }
        });

        // 3.4 强制发射 transfer 状态转移与网格赋值帧
        const transfer = this.computeTransfer(i, j, cond, ctx);
        dp[i][j] = transfer.val;
        const lineTransfer = anchorMap[transfer.lineKey] || (cond.isMatch ? lineCond + 1 : lineCond + 2);

        emitStep({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          val: transfer.val,
          currentVal: transfer.val,
          topI: transfer.topI,
          topJ: transfer.topJ,
          leftI: transfer.leftI,
          leftJ: transfer.leftJ,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: transfer.tag,
          log: transfer.log,
          msg: transfer.msg,
          gridHighlight: { i, j }
        });
      }
    }

    // 4. 收尾返回帧 (return)
    const returnInfo = this.getReturnInfo(ctx);
    const lineReturn = anchorMap.return || (lineLoopI + 10);
    emitStep({
      type: 'return',
      line: lineReturn,
      i: returnInfo.i,
      j: returnInfo.j,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: returnInfo.tag,
      log: returnInfo.log,
      msg: returnInfo.msg,
      gridHighlight: { i: returnInfo.i, j: returnInfo.j }
    });

    // 5. 挂载 2D 依赖树与活动节点
    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  // ===== 抽象挂钩方法 (Subclass Extension Points) =====
  protected abstract extractString(model: IYamlAlgorithmModel): string;
  protected abstract getInitMessage(ctx: IntervalTableContext): string;
  protected abstract getInnerLoopStartOffset(): number; // 0 或 1
  protected performDiagInit(_ctx: IntervalTableContext, _emitStep: (stepData: any) => void): void {}
  protected abstract evaluateCondition(i: number, j: number, ctx: IntervalTableContext): IntervalConditionEvalResult;
  protected abstract computeTransfer(i: number, j: number, cond: IntervalConditionEvalResult, ctx: IntervalTableContext): IntervalTransferResult;
  protected abstract getReturnInfo(ctx: IntervalTableContext): IntervalReturnInfo;
}
