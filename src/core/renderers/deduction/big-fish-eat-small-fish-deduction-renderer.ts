/**
 * 大鱼吃小鱼 (Big Fish Eat Small Fish · Class 053 Code02)
 * 全景推演树渲染策略 (BigFishEatSmallFishDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BigFishEatSmallFishDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'big-fish-eat-small-fish';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'big-fish-eat-small-fish' ||
      modelId === 'big-fish-eat-small-fish-053' ||
      modelId === '大鱼吃小鱼' ||
      modelId === 'class053-code02'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 053 Code02. 大鱼吃小鱼 · 全景推演树',
      badge: '算法通关课 Class 053 · 单调递减栈维护轮数级联动态规划 / 左侧大鱼吞噬右侧小鱼 / 严格 O(N) 线性摊销',
      descriptionHtml: `
        核心目标：给定一个鱼群体重数组 <code>fishes</code>。每一轮中，每条鱼同时吃掉紧挨其右侧且体重严格小于自己的鱼。求鱼群达到稳定状态（不再有鱼被吃）所需的总轮数。<br/>
        <strong>左程云算法体系教学核心——单调栈与轮数级联动态转移公理：</strong><br/>
        1. <strong>谁吃谁的支配关系与左侧大鱼公理</strong>：<br/>
        一条鱼 <code>cur</code> 只能被其<strong>左侧第一个体重严格大于自己的大鱼 <code>leftBig</code></strong> 吃掉；<br/>
        如果左侧没有任何鱼比 <code>cur</code> 大，则 <code>cur</code> 永远存活，吃鱼轮数视为 <code>0</code>；<br/>
        2. <strong>级联消耗与轮数转移状态方程</strong>：<br/>
        • 维护单调栈，栈内元素存储二元组 <code>(weight, turns)</code>，自底向上体重递减；<br/>
        • 遍历到当前鱼 <code>W</code> 时，必须先等 <code>W</code> 左侧那些比 <code>W</code> 矮小的阻隔鱼全部被更左侧的大鱼吃完，<code>W</code> 才会直接暴露给它的大鱼天敌！<br/>
        • 初始化当前鱼被吃所需轮数：<code>turns = 1</code>；<br/>
        • <code>while (!stack.isEmpty() && stack.peek().weight &lt;= W)</code>：<br/>
          <code>turns = Math.max(turns, stack.pop().turns + 1);</code>（吸收更小鱼被吃产生的轮数延迟）；<br/>
        • 若栈弹空：说明左侧没有能吃掉 <code>W</code> 的鱼，<code>W</code> 永生存活，<code>turns = 0</code> 并压入 <code>(W, 0)</code>；<br/>
        • 若栈非空：栈顶大鱼在第 <code>turns</code> 轮吃掉 <code>W</code>，更新全局最大轮数 <code>ans = Math.max(ans, turns)</code>，压入 <code>(W, turns)</code>！
      `,
      initialStateText: `演进入口：maxTurns(fishes) ➔ 初始化单调栈 stack = [] 记录 (weight, turns)，全局 ans = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '单调递增全存活 (Strictly Increasing Base)',
        valuesStr: 'fishes[i] < fishes[i+1] 全局递增 ➔ 无大吃小关系，直接 return 0',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '全鱼群扫描完毕 ➔ 级联消耗轮数收敛，返回全局所需最大轮数 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 吸收小鱼死亡轮数延迟 (Absorb Intermediate Deaths)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">turns = max(t, p.t+1)</span>',
      detailLines: [
        'int curTurns = 1;',
        'while (!stack.isEmpty() && stack.peek().weight <= w) {',
        '  curTurns = Math.max(curTurns, stack.pop().turns + 1);',
        '}',
      ],
      fillLine: '排队牺牲：中间比我小的鱼先被吃掉，每一层阻隔让天敌吃我的时间后延',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 左侧天敌大鱼锁定 (Settle Predator turns)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Predator Hit</span>',
      detailLines: [
        'if (stack.isEmpty()) {',
        '  curTurns = 0; // 左无更大鱼，自身为峰值永生存活',
        '} else {',
        '  ans = Math.max(ans, curTurns); // 贡献被吃轮数',
        '}',
        'stack.push(new Fish(w, curTurns));',
      ],
      fillLine: '天敌对决：锁定左侧直接捕食者，记录在全并发演进中吃掉该鱼的轮次',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全局稳定轮数交付 (Stable Rounds Delivery)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        'return ans;',
      ],
      fillLine: '并发仿真：利用单调栈 O(N) 模拟并行大消融过程，彻底告别逐轮模拟',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '大鱼吃小鱼推演流 (Predator Finding ➔ Intermediate Delay Cascade ➔ Round DP)',
      subtitle: 'Zuoshen Class 053 Code02 Monotonic Stack & Cascading Turns',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '鱼群完全稳定所需总轮数 ans',
      complexityStr: '时间复杂度: O(N) 每个鱼节点进出栈一次 · 空间复杂度: O(N) 单调栈',
    });

    return header + baseCase + round + finalReturn;
  }
}
