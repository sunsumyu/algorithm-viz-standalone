import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

export interface SequenceTableContext {
  s1: string;
  s2: string;
  m: number;
  n: number;
  direction: 'forward' | 'reverse';
  anchorMap: Record<string, number>;
  dp: (number | null)[][];
}

export interface BorderInitCell {
  i: number;
  j: number;
  val: number;
  tag: string;
  log: string;
  msg: string;
}

export interface BorderInitConfig {
  loopAnchorKey?: string;
  valAnchorKey?: string;
  cells: BorderInitCell[];
}

export interface ConditionEvalResult {
  isMatch: boolean;
  char1: string;
  char2: string;
  tag: string;
  log: string;
  msg: string;
}

export interface TransferResult {
  val: number;
  lineKey: string;
  tag: string;
  log: string;
  msg: string;
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
  diagI?: number;
  diagJ?: number;
  topVal?: number;
  leftVal?: number;
  diagVal?: number;
  operator?: string;
}

export interface TableBoundaryResult {
  lineKey: string;
  val: number;
  valLineKey?: string;
  tag: string;
  log: string;
  msg: string;
}

export interface ReturnInfo {
  i: number;
  j: number;
  val: number;
  tag: string;
  log: string;
  msg: string;
}

/**
 * AbstractSequenceTableCompiler — 序列 DP 二维表格阶段 3 顶层抽象编译器
 *
 * 核心设计：Template Method 模式。
 * 针对历史开发中频发的“偷懒跳步、漏发循环帧、漏发条件比较帧”等问题，
 * 由本顶层基类独占循环控制流，强制实现“一行一步零跳步”的完整生命周期：
 *   1. init: 表格创建与边界分配
 *   2. border/if: 规约「外层 for 循环」与「内嵌 if 分支」两种经典变体
 *   3. loop_i: 强制发射外层循环头帧
 *   4. loop_j: 强制发射内层循环头帧
 *   5. cond: 强制发射条件判断帧（展示判定过程）
 *   6. transfer/init_val: 强制发射状态转移或边界赋值帧
 *   7. return: 强制发射 return 最终汇聚返回帧
 *
 * 子类算法仅需实现具体的业务 Hook，物理上不可能发生跳步。
 */
export abstract class AbstractSequenceTableCompiler {
  public compile(
    model: IYamlAlgorithmModel,
    anchorMap: Record<string, number> = {},
    direction: 'forward' | 'reverse' = 'forward',
    variant: string = 'for'
  ): UniversalStep[] {
    const s1 = this.extractString1(model);
    const s2 = this.extractString2(model);
    const m = s1.length;
    const n = s2.length;
    const isForward = direction !== 'reverse';

    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      new Array(n + 1).fill(null)
    );

    const ctx: SequenceTableContext = {
      s1,
      s2,
      m,
      n,
      direction,
      anchorMap,
      dp
    };

    this.preInitGrid(dp, ctx);

    const steps: UniversalStep[] = [];

    const emitStep = (stepData: any) => {
      const isComparing = stepData.type === 'transfer' || stepData.type === 'cond' || stepData.type === 'eval';
      const curI = isForward ? Math.max(0, Math.min(m - 1, stepData.i - 1)) : Math.max(0, Math.min(m - 1, stepData.i));
      const curJ = isForward ? Math.max(0, Math.min(n - 1, stepData.j - 1)) : Math.max(0, Math.min(n - 1, stepData.j));

      steps.push({
        s: s1,
        t: s2,
        s1,
        s2,
        curI,
        curJ,
        label1: this.getLabel1(),
        label2: this.getLabel2(),
        isComparing,
        ...stepData
      });
    };

    // 1. 初始化分配帧 (init)
    const lineInit = anchorMap.init || 3;
    emitStep({
      type: 'init',
      line: lineInit,
      i: isForward ? 0 : m,
      j: isForward ? 0 : n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: this.getInitMessage(ctx),
      gridHighlight: { i: isForward ? 0 : m, j: isForward ? 0 : n }
    });

    const isIfVariant = variant === 'if';

    // 2. 边界初始化 (border init) - 仅在 for 变体下显式执行外部初始化循环
    if (!isIfVariant) {
      const borderConfig = this.getBorderInitConfig(ctx);
      const lineInitLoop = anchorMap[borderConfig.loopAnchorKey || 'init_loop'] || anchorMap.init_loop || (lineInit + 1);
      const lineInitVal = anchorMap[borderConfig.valAnchorKey || 'init_val'] || anchorMap.init_val || (lineInitLoop + 1);

      for (const cell of borderConfig.cells) {
        // 循环头步进帧：高亮 for 循环头，表明进入新一轮迭代
        emitStep({
          type: 'init-loop',
          line: lineInitLoop,
          i: cell.i,
          j: cell.j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `初始化循环: 考察索引 ${cell.i}`,
          log: `| 🔁 初始化循环: 遍历至 i = ${cell.i}，准备赋值`,
          msg: `初始化循环：<code>i = ${cell.i}</code>，进入循环体执行基底初始化。`,
          gridHighlight: { i: cell.i, j: cell.j }
        });

        // 循环体内赋值步进帧：高亮真正的赋值语句行，将数据填入网格
        dp[cell.i][cell.j] = cell.val;
        emitStep({
          type: 'init-col',
          line: lineInitVal,
          i: cell.i,
          j: cell.j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: cell.tag,
          log: cell.log,
          msg: cell.msg,
          gridHighlight: { i: cell.i, j: cell.j }
        });
      }
    }

    // 3. 循环控制与状态转移（由基类强制约束）
    const lineLoopI = anchorMap.loop_i || 5;
    const lineLoopJ = anchorMap.loop_j || 6;
    const lineCond = anchorMap.cond || 7;

    if (isForward) {
      // ===== 顺推正序前缀 DP =====
      const startI = isIfVariant ? 0 : 1;
      const startJ = isIfVariant ? 0 : 1;

      for (let i = startI; i <= m; i++) {
        emitStep({
          type: 'loop-outer',
          line: lineLoopI,
          i,
          j: startJ,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `外层循环 i = ${i} (考察 ${this.getLabel1()} '${i > 0 ? s1[i - 1] : "空串"}')`,
          log: `| 🔁 [顺推] 外层循环 i = ${i}/${m}：考察 ${this.getLabel1()} 第 ${i} 行`,
          msg: `外层循环：遍历至 <code>i = ${i}</code>${i > 0 ? `，对应字符 <code>${s1[i - 1]}</code>` : ' (空串行)'}。`,
          gridHighlight: { i, j: startJ }
        });

        for (let j = startJ; j <= n; j++) {
          emitStep({
            type: 'loop-inner',
            line: lineLoopJ,
            i,
            j,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `内层循环 j = ${j} (考察 ${this.getLabel2()} '${j > 0 ? s2[j - 1] : "空串"}')`,
            log: `| ➡️ [顺推] 内层循环 j = ${j}/${n}：考察单元格 dp[${i}][${j}]`,
            msg: `内层循环：遍历至 <code>j = ${j}</code>，准备考察单元格 <code>dp[${i}][${j}]</code>。`,
            gridHighlight: { i, j }
          });

          // 如果是 if 变体，优先判定是否落在基底/边界分支
          const boundaryRes = isIfVariant && this.checkTableBoundary ? this.checkTableBoundary(i, j, ctx) : null;
          if (boundaryRes) {
            const lineBoundaryCond = anchorMap[boundaryRes.lineKey] || anchorMap.cond || lineCond;
            emitStep({
              type: 'cond',
              line: lineBoundaryCond,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: boundaryRes.tag,
              log: boundaryRes.log,
              msg: boundaryRes.msg,
              gridHighlight: { i, j }
            });

            dp[i][j] = boundaryRes.val;
            const lineBoundaryVal = anchorMap[boundaryRes.valLineKey || 'init_val'] || anchorMap.init_val || (lineBoundaryCond + 1);
            emitStep({
              type: 'init-col',
              line: lineBoundaryVal,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `边界赋值: dp[${i}][${j}] = ${boundaryRes.val}`,
              log: `| 📝 边界赋值: dp[${i}][${j}] = ${boundaryRes.val}`,
              msg: `执行赋值：<code>dp[${i}][${j}] = <strong>${boundaryRes.val}</strong></code>。`,
              gridHighlight: { i, j }
            });
          } else {
            const condRes = this.evaluateCondition(i, j, ctx);
            emitStep({
              type: 'cond',
              line: lineCond,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: condRes.tag,
              log: condRes.log,
              msg: condRes.msg,
              gridHighlight: { i, j }
            });

            const transRes = this.computeTransfer(i, j, condRes, ctx);
            dp[i][j] = transRes.val;
            const lineTransfer = anchorMap[transRes.lineKey] || lineCond + 1;
            emitStep({
              type: 'transfer',
              line: lineTransfer,
              i,
              j,
              topI: transRes.topI,
              topJ: transRes.topJ,
              leftI: transRes.leftI,
              leftJ: transRes.leftJ,
              diagI: transRes.diagI,
              diagJ: transRes.diagJ,
              topVal: transRes.topVal,
              leftVal: transRes.leftVal,
              diagVal: transRes.diagVal,
              operator: transRes.operator,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: transRes.tag,
              log: transRes.log,
              msg: transRes.msg,
              gridHighlight: { i, j }
            });
          }
        }
      }
    } else {
      // ===== 逆推倒序后缀 DP =====
      const startI = isIfVariant ? m : m - 1;
      const startJ = isIfVariant ? n : n - 1;

      for (let i = startI; i >= 0; i--) {
        emitStep({
          type: 'loop-outer',
          line: lineLoopI,
          i,
          j: startJ,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `外层循环 i = ${i} (逆向考察 ${this.getLabel1()} '${i < m ? s1[i] : "空后缀"}')`,
          log: `| 🔁 [逆推] 外层循环 i = ${i}：逆向考察第 ${i} 行`,
          msg: `外层循环：倒序遍历至 <code>i = ${i}</code>${i < m ? `，对应字符 <code>${s1[i]}</code>` : ' (空后缀行)'}。`,
          gridHighlight: { i, j: startJ }
        });

        for (let j = startJ; j >= 0; j--) {
          emitStep({
            type: 'loop-inner',
            line: lineLoopJ,
            i,
            j,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `内层循环 j = ${j} (逆向考察 ${this.getLabel2()} '${j < n ? s2[j] : "空后缀"}')`,
            log: `| ⬅️ [逆推] 内层循环 j = ${j}：逆向考察单元格 dp[${i}][${j}]`,
            msg: `内层循环：倒序遍历至 <code>j = ${j}</code>，准备考察单元格 <code>dp[${i}][${j}]</code>。`,
            gridHighlight: { i, j }
          });

          const boundaryRes = isIfVariant && this.checkTableBoundary ? this.checkTableBoundary(i, j, ctx) : null;
          if (boundaryRes) {
            const lineBoundaryCond = anchorMap[boundaryRes.lineKey] || anchorMap.cond || lineCond;
            emitStep({
              type: 'cond',
              line: lineBoundaryCond,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: boundaryRes.tag,
              log: boundaryRes.log,
              msg: boundaryRes.msg,
              gridHighlight: { i, j }
            });

            dp[i][j] = boundaryRes.val;
            const lineBoundaryVal = anchorMap[boundaryRes.valLineKey || 'init_val'] || anchorMap.init_val || (lineBoundaryCond + 1);
            emitStep({
              type: 'init-col',
              line: lineBoundaryVal,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `边界赋值: dp[${i}][${j}] = ${boundaryRes.val}`,
              log: `| 📝 边界赋值: dp[${i}][${j}] = ${boundaryRes.val}`,
              msg: `执行赋值：<code>dp[${i}][${j}] = <strong>${boundaryRes.val}</strong></code>。`,
              gridHighlight: { i, j }
            });
          } else {
            const condRes = this.evaluateCondition(i, j, ctx);
            emitStep({
              type: 'cond',
              line: lineCond,
              i,
              j,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: condRes.tag,
              log: condRes.log,
              msg: condRes.msg,
              gridHighlight: { i, j }
            });

            const transRes = this.computeTransfer(i, j, condRes, ctx);
            dp[i][j] = transRes.val;
            const lineTransfer = anchorMap[transRes.lineKey] || lineCond + 1;
            emitStep({
              type: 'transfer',
              line: lineTransfer,
              i,
              j,
              topI: transRes.topI,
              topJ: transRes.topJ,
              leftI: transRes.leftI,
              leftJ: transRes.leftJ,
              diagI: transRes.diagI,
              diagJ: transRes.diagJ,
              topVal: transRes.topVal,
              leftVal: transRes.leftVal,
              diagVal: transRes.diagVal,
              operator: transRes.operator,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: transRes.tag,
              log: transRes.log,
              msg: transRes.msg,
              gridHighlight: { i, j }
            });
          }
        }
      }
    }

    // 4. 收尾返回帧 (return)
    const returnInfo = this.getReturnInfo(ctx);
    const lineReturn = anchorMap.return || (lineLoopI + 8);
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
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, direction, undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  protected preInitGrid(_dp: (number | null)[][], _ctx: SequenceTableContext): void {}
  protected abstract extractString1(model: IYamlAlgorithmModel): string;
  protected abstract extractString2(model: IYamlAlgorithmModel): string;
  protected abstract getLabel1(): string;
  protected abstract getLabel2(): string;
  protected abstract getInitMessage(ctx: SequenceTableContext): string;
  protected abstract getBorderInitConfig(ctx: SequenceTableContext): BorderInitConfig;
  protected checkTableBoundary?(i: number, j: number, ctx: SequenceTableContext): TableBoundaryResult | null;
  protected abstract evaluateCondition(i: number, j: number, ctx: SequenceTableContext): ConditionEvalResult;
  protected abstract computeTransfer(i: number, j: number, cond: ConditionEvalResult, ctx: SequenceTableContext): TransferResult;
  protected abstract getReturnInfo(ctx: SequenceTableContext): ReturnInfo;
}
