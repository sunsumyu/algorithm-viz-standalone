/**
 * 计数排序 全景推演树渲染策略 (CountingSortDeductionRenderer)
 * 纯静态无状态，展示频次统计、前缀和累加与逆序稳定回填三阶段推导
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CountingSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'counting-sort-deduction';

  public canHandle(modelId: string): boolean {
    return modelId === 'counting-sort' || modelId === 'count-sort';
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const rawArr = [4, 2, 2, 8, 3, 3, 1];
    const n = rawArr.length;

    const header = DeductionBoardPrimitives.renderHeader({
      title: '计数排序全景推演展板 (Counting Sort Prefix Sum Pipeline)',
      badge: 'O(N + K) 线性时间 · O(K) 辅助空间 · 稳定排序',
      descriptionHtml:
        '非比较型整数排序经典范式：先统计值域范围内各元素出现的频次 <code>count[v]</code>；接着进行前缀和累加 <code>count[v] += count[v-1]</code> 确定各元素在排序后数组中的末位索引；最后自右向左逆向遍历原数组完成稳定输出。',
      initialStateText: `待排数组 A = [${rawArr.join(', ')}], 最小值 min = 1, 最大值 max = 8, 值域跨度 K = 8`,
    });

    const baseCases = DeductionBoardPrimitives.renderBaseCases([
      { prefix: '├───', label: '阶段 1: 频次直方图', valuesStr: 'count[v] 记录数值 v 出现的次数' },
      { prefix: '├───', label: '阶段 2: 前缀和累计', valuesStr: 'count[v] 转换为：原数组中小于等于 v 的元素总个数' },
      { prefix: '└───', label: '阶段 3: 逆向稳定回填', valuesStr: '自右向左扫描 A[i]，放至 output[--count[A[i]]] 维持相等元素相对次序' },
    ]);

    const pipelineSteps = [
      {
        phase: '阶段 1: 频次直方图统计',
        detail: '遍历数组 A = [4, 2, 2, 8, 3, 3, 1]',
        state: '统计结果: 1出现1次, 2出现2次, 3出现2次, 4出现1次, 8出现1次 (其余为0)',
        countArr: 'count = [0, 1, 2, 2, 1, 0, 0, 0, 1] (索引 1..8)',
      },
      {
        phase: '阶段 2: 前缀和累加变换',
        detail: 'count[i] = count[i] + count[i-1]',
        state: '累加映射: ≤1有1个, ≤2有3个, ≤3有5个, ≤4有6个, ≤8有7个',
        countArr: 'prefixCount = [0, 1, 3, 5, 6, 6, 6, 6, 7]',
      },
      {
        phase: '阶段 3: 逆向稳定回填过程',
        detail: '自右向左提取原数组末尾元素 A[6] 到 A[0]',
        state: 'A[6]=1: --count[1]=0 → output[0]=1\nA[5]=3: --count[3]=4 → output[4]=3\nA[4]=3: --count[3]=3 → output[3]=3\nA[3]=8: --count[8]=6 → output[6]=8\nA[2]=2: --count[2]=2 → output[2]=2\nA[1]=2: --count[2]=1 → output[1]=2\nA[0]=4: --count[4]=5 → output[5]=4',
        countArr: 'output = [1, 2, 2, 3, 3, 4, 8]',
      },
    ];

    const roundsHtml = pipelineSteps
      .map(s =>
        DeductionBoardPrimitives.renderOuterRound({
          title: s.phase,
          subtitle: s.detail,
          innerStepsHtml: DeductionBoardPrimitives.renderInnerStep({
            connector: '└──',
            label: s.detail,
            badgeHtml: `<span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">三阶段流水线</span>`,
            detailLines: s.state.split('\n'),
            fillLine: `阶段数组快照: ${s.countArr}`,
          }),
        })
      )
      .join('');

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      roundsHtml,
      '非比较映射 · 频次直方图 · 前缀和定位 · 逆序稳定收集'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: '[1, 2, 2, 3, 3, 4, 8]',
      answerDescription:
        '计数排序突破了基于比较排序算法 O(N log N) 的理论时间下界，在值域范围 K 相对不大时能达到极其优异的 O(N + K) 纯线性时间复杂度。',
      complexityStr: '时间复杂度: O(N + K) | 空间复杂度: O(N + K)',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCases}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
