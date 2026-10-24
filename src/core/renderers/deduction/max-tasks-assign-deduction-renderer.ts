/**
 * 你可以安排的最多任务数目 (Maximum Number of Tasks You Can Assign · LeetCode 2071 / Class 055)
 * 全景推演树渲染策略 (MaxTasksAssignDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MaxTasksAssignDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'max-tasks-assign';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'max-tasks-assign' ||
      modelId === 'max-tasks-assign-055' ||
      modelId === '2071' ||
      modelId === 'leetcode-2071' ||
      modelId === 'max-task-assign' ||
      modelId === 'class055-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 2071. 你可以安排的最多任务数目 · 全景推演树',
      badge: '大厂压轴 Hard 级贪心 & 左程云 Class 055 · 二分答案 + 贪心排序匹配 + 双端队列双向调度 (头取最易/尾取最难) / O(N log N)',
      descriptionHtml: `
        核心目标：给你 <code>n</code> 个任务和 <code>m</code> 名工人。每个任务需要力量 <code>tasks[i]</code>，工人自身力量为 <code>workers[j]</code>。你有 <code>pills</code> 粒药丸，每粒让一名工人力量临时增加 <code>strength</code>。每个工人最多吃一粒药，最多完成一个任务。求<strong>最多能完成的任务数目</strong>。<br/>
        <strong>左程云算法体系教学核心——二分答案单调性与双端队列双向调度神级公理：</strong><br/>
        1. <strong>二分答案单调性</strong>：<br/>
        如果能完成 <code>k</code> 个任务，必然能完成 <code>k - 1</code> 个任务；具备完美单调性！二分任务数 <code>k &isin; [0, min(n, m)]</code>。<br/>
        2. <strong>贪心最优子集选取</strong>：<br/>
        验证是否能完成 <code>k</code> 个任务时：<br/>
        • 必然选取<strong>要求最小的前 <code>k</code> 个任务</strong>（从小到大排序）；<br/>
        • 必然派遣<strong>力量最强的后 <code>k</code> 名工人</strong>（从小到大排序）；<br/>
        3. <strong>双端队列双向贪心调度神级法则</strong>：<br/>
        • 将当前工人服药后可胜任的所有任务解锁，依次压入单调双端队列 <code>deque</code>（队头最容易，队尾最难）；<br/>
        • <strong>法则 ①（不吃药攻坚最易 · pollFirst）</strong>：<br/>
          若当前工人不吃药即可完成队头任务 <code>w &ge; tasks[deque.peekFirst()]</code>，直接完成队头最简单任务出队！省下宝贵药丸；<br/>
        • <strong>法则 ②（吃药攻坚最难 · pollLast）</strong>：<br/>
          若不吃药无法完成任何任务，则必须服药！消耗一粒药丸，此时该工人力量已达顶峰，<strong>果断拿下队尾最难任务（pollLast）</strong>，把更容易的任务留给后续较弱的工人！<br/>
        • 二分单次校验 $O(k)$，总时间复杂度严格 $O((N + M) \log(\min(N, M)))$。
      `,
      initialStateText: `二分调度：maxTaskAssign(tasks, workers, pills, strength) ➔ 排序两数组，在 [0, min(n, m)] 展开二分检验。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '二分答案区间初始化 (Binary Search Range)',
        valuesStr: 'int l = 0, r = Math.min(tasks.length, workers.length), ans = 0;',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '二分左右边界 l > r 结束 ➔ 返回成功验证的最大任务数 ans',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 药丸解锁覆盖任务压入双端队列 (Unlock Covered Tasks into Deque)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">offerLast()</span>',
      detailLines: [
        'while (tIdx < mid && tasks[tIdx] <= workers[wIdx] + strength) {',
        '  deque.offerLast(tIdx++); // 将该工人吃药所能胜任的任务入队',
        '}',
      ],
      fillLine: '扩充军备：将当前工人服用药丸后能解决的所有候选任务有序纳编',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双端队列贪心分流调度 (Dual-Ended Greedy Dispatch)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Head/Tail Split</span>',
      detailLines: [
        'if (tasks[deque.peekFirst()] <= workers[wIdx]) {',
        '  deque.pollFirst(); // 免费工人体力充沛，轻松消解队头最易任务',
        '} else if (pillsLeft > 0) {',
        '  pillsLeft--; deque.pollLast(); // 必须服药！服药后攻坚队尾最难任务',
        '} else { return false; } // 无法胜任且无药可用，校验失败',
      ],
      fillLine: '神级调度：不服药巧取队头易题，服猛药啃下队尾硬骨头，最大化全局产能',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 二分左右边界收缩 (Binary Search Bounds Update)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">ans = mid</span>',
      detailLines: [
        'if (check(mid)) { ans = mid; l = mid + 1; }',
        'else { r = mid - 1; }',
      ],
      fillLine: '极限折半：若当前 mid 任务数可顺利完成，继续向上探寻更大产能上限',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '任务安排推演流 (Binary Search Mid ➔ Unlock Tasks ➔ Dual-Ended Greedy ➔ Bounds Shift)',
      subtitle: 'LeetCode 2071 & Zuoshen Class 055 Dual-Ended Deque Scheduling Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最多可以安排完成的任务数目 ans',
      complexityStr: '时间复杂度: O(N log N + (N + M) log(min(N, M))) · 空间复杂度: O(N)',
    });

    return header + baseCase + round + finalReturn;
  }
}
