/**
 * 折纸问题 (Paper Folding · Class 040)
 * 全景推演树渲染策略 (PaperFoldingDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PaperFoldingDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'paper-folding';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'paper-folding' ||
      modelId === 'paper-folding-040' ||
      modelId === 'zuo-class-040' ||
      modelId === 'fold-paper-creases'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '左程云 Class 040. 折纸问题与满二叉树中序同构 (Paper Folding) · 全景推演树',
      badge: '物理几何对折 ➔ 满二叉树中序遍历同构 / 零空间建树 O(N) 栈解法 / 逐层物理裂变',
      descriptionHtml: `
        核心目标：请把一段纸条竖直放置在桌面上，然后从下往上对折 <code>N</code> 次。展开纸条后从上到下打印所有折痕的方向（凹 down 或凸 up）。<br/>
        <strong>左程云算法体系教学核心——物理裂变与二叉树拓扑的精妙同构：</strong><br/>
        1. <strong>折痕生成规律公理</strong>：<br/>
        • 对折 1 次：中间产生 1 条折痕，且必为<strong>凹（Down）</strong>；<br/>
        • 对折 2 次：原折痕上方新增一条凹折痕，下方新增一条凸折痕；折痕顺序为：凹、凹、凸；<br/>
        • 递推公理：每一次对折，都会在上一轮生成的<strong>每一条旧折痕的上侧新产生一条凹折痕，在下侧新产生一条凸折痕</strong>！<br/>
        2. <strong>满二叉树中序遍历同构定理</strong>：<br/>
        把第一次对折产生的凹折痕视为二叉树的<strong>根节点</strong>；<br/>
        每一条旧折痕上侧新产生的折痕对应为其<strong>左孩子（永远是凹）</strong>；<br/>
        每一条旧折痕下侧新产生的折痕对应为其<strong>右孩子（永远是凸）</strong>；<br/>
        纸条从上到下的折痕顺序，<strong>在数学拓扑上严格等价于这棵高度为 N 的满二叉树的中序遍历（左 ➔ 根 ➔ 右）</strong>！<br/>
        3. <strong>不建树空间极致优化</strong>：<br/>
        无须分配堆内存创建真正的二叉树节点，只需在递归函数中携带层数参数 <code>i</code> 和布尔标志 <code>isDown</code>，利用调用栈即可在 <strong>O(N) 空间复杂度</strong>内完成 $O(2^N)$ 折痕流的按序打印！
      `,
      initialStateText: `物理模型初始化：纸条自底向上对折 N 次，折痕数 total = 2^N - 1，中序时序遍历。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '递归越界基准 (Recursion Depth Base)',
        valuesStr: 'i > N ➔ 触碰纸条最大对折层数限制，直接 return',
      },
      {
        prefix: '└───',
        label: '拓扑属性定义 (Child Polarity Invariant)',
        valuesStr: '左孩子属性必为凹 (down=true)；右孩子属性必为凸 (down=false)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 经典中序递归栈推演 (In-order DFS ➔ O(N) Space)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">DFS O(N) Space</span>',
      detailLines: [
        'void printProcess(int i, int N, boolean down) {',
        '  if (i > N) return;',
        '  printProcess(i + 1, N, true);  // 递归左孩子：永远是凹',
        '  print(down ? "凹" : "凸");     // 中序访问当前折痕',
        '  printProcess(i + 1, N, false); // 递归右孩子：永远是凸',
        '}',
      ],
      fillLine: '零开销建树：仅利用系统调用栈深度 O(N)，自然输出 2^N - 1 条物理折痕',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 显式调用栈模拟 (Explicit Stack Simulation)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Stack Trace</span>',
      detailLines: [
        '自定义栈帧 Frame(level, isDown, state)',
        '整条左边界全压入栈（连续压入 N 个 down=true 帧）',
        '弹栈输出折痕后转向右子树（压入 down=false 帧）',
      ],
      fillLine: '时序可视化：把隐式函数调用转为显式栈帧拓扑，看清每一次回溯',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 纸条物理裂变递推 (Physical Crease Fission)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Physics Fission</span>',
      detailLines: [
        '第 1 轮: [ 凹 ] (共 1 条)',
        '第 2 轮: [ 凹, 凹, 凸 ] (旧折痕左凹右凸裂变，共 3 条)',
        '第 3 轮: [ 凹, 凹, 凸, 凹, 凹, 凸, 凸 ] (共 7 条)',
      ],
      fillLine: '物理本质：对折时原有的一条折痕被压紧对分，两侧必然产生一凹一凸两条新痕',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '折纸拓扑同构与物理裂变全景推演流 (Geometry ➔ Binary Tree Isomorphism ➔ Fission)',
      subtitle: 'Zuoshen Class 040 Paper Folding Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return creaseSequence; // 从上到下展开的完整凹凸折痕序列',
      answerDescription: '时间复杂度严格为 O(2^N)，空间复杂度为递归树高度 O(N)，完美展现了算法与物理几何的同构之美。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
