/**
 * 二叉树最大宽度 (Maximum Width of Binary Tree · LeetCode 662 / Class 036 Code03)
 * 全景推演树渲染策略 (WidthOfBinaryTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class WidthOfBinaryTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'width-of-binary-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'width-of-binary-tree' ||
      modelId === '662' ||
      modelId === 'leetcode-662' ||
      modelId === 'tree-036-width-of-binary-tree' ||
      modelId === 'tree-036-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 662. 二叉树最大宽度 (Maximum Width of Binary Tree) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 036 · 节点二叉堆编号 / 本层首节点 base 归一化防溢出 / 双静态数组',
      descriptionHtml: `
        目标：求出二叉树各层中<strong>最大宽度</strong>。每一层的宽度被定义为：该层两端点（最左与最右的非空节点）之间的长度，两端点间包含的 null 节点同样计入长度。<br/>
        <strong>《代码随想录》与左程云算法体系教学破局点——二叉堆索引与大数防溢出：</strong><br/>
        1. <strong>二叉堆编号模型（Heap Indexing）</strong>：<br/>
        若根节点编号为 <code>1</code>，则其左孩子编号为 <code>2 * i</code>，右孩子编号为 <code>2 * i + 1</code>；<br/>
        当前层的宽度即为：<code>maxWidth = max(maxWidth, rightIndex - leftIndex + 1)</code>；<br/>
        2. <strong>核心工业暗礁——超深斜树的整型溢出防御（Base Normalization）</strong>：<br/>
        若树高达到数千层，<code>2 * i</code> 将以指数级暴增，造成 32 位甚至 64 位整数溢出崩溃！<br/>
        <strong>破局解法</strong>：每层开始时，记本层最左节点的编号为 <code>base</code>；本层所有节点在出队和子节点派生时，<strong>统一减去 base 做局部归一化</strong>！<br/>
        因为同层节点的相对距离不变，减去 base 丝毫不影响宽度计算，却能让索引重新从 <code>0</code> 开始，彻底消除数字溢出隐患！<br/>
        3. <strong>左程云 Class 036 双静态数组队列（Stage 2）</strong>：<code>nodeQueue[]</code> 与 <code>idQueue[]</code> 并行管理，极致提速。
      `,
      initialStateText: `宽度计算入口：widthOfBinaryTree(root) ➔ 根节点入队，初始编号 id = 1，maxWidth = 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空树基准 (Base Null)',
        valuesStr: 'root == null ➔ return 0 (空树最大宽度为 0)',
      },
      {
        prefix: '└───',
        label: '首层初始化 (Root Setup)',
        valuesStr: 'queue.push({ node: root, id: 1L }); maxWidth = 1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 标准 Queue + 首节点 base 归一化防溢出 (Normalized Queue BFS)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Base Normalization</span>',
      detailLines: [
        'long base = queue.peek().id; int size = queue.size(); ➔ 固化层规模并锁定首节点基准值',
        'long first = 0, last = 0; 循环遍历 size 次处理本层各节点',
        'long curId = cur.id - base; ➔ 减去基准值，编号重新归零，彻底规避 2*i 指数级溢出',
        'if (i == 0) first = curId; if (i == size - 1) last = curId;',
        'if (node.left) queue.offer({ node.left, 2 * curId }); if (node.right) queue.offer({ node.right, 2 * curId + 1 });',
        'maxWidth = Math.max(maxWidth, (int)(last - first + 1)); ➔ 本层宽度结算',
      ],
      fillLine: '相对距离不变性：归一化是二叉树堆式编号能够承载超大规模树深的关键防腐底线',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 左程云 Class 036 双静态数组队列 (Node + ID Zero-GC Queues)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Dual Arrays</span>',
      detailLines: [
        'TreeNode[] nodeQ = new TreeNode[MAXN]; int[] idQ = new int[MAXN]; ➔ 预分配平坦内存',
        'int l = 0, r = 0; nodeQ[r] = root; idQ[r++] = 1;',
        'while (l < r) { int size = r - l; maxWidth = max(maxWidth, idQ[r-1] - idQ[l] + 1); 批量推进 l 指针并入队子节点 }',
      ],
      fillLine: '工业级高性能范式：双数组并行无对象封装，毫秒级推进，算法竞赛极限压测必备',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 深度优先 DFS 先序遍历与层最左索引记账 (DFS First-Seen Map)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">DFS Map</span>',
      detailLines: [
        'Map<Integer, Long> firstIds; dfs(cur, depth, id)',
        'if (!firstIds.containsKey(depth)) firstIds.put(depth, id); ➔ 先序遍历保证每层首个访问的一定是最左节点',
        'maxWidth = Math.max(maxWidth, (int)(id - firstIds.get(depth) + 1));',
        'dfs(cur.left, depth + 1, 2 * id); dfs(cur.right, depth + 1, 2 * id + 1);',
      ],
      fillLine: '递归先序视角：利用先序遍历“每层先访最左”的天然特性，以 Map 记录首访锚点',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Normalized BFS ➔ Zero-GC Dual Arrays ➔ DFS First-Seen)',
      subtitle: 'Programmer Carl & Zuoshen Class 036 Width Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxWidth; // 全树所有层中两端点包含跨度的最大宽度',
      answerDescription: '时间复杂度严格 O(N)，每个节点处理一次；空间复杂度 O(W)（最大层宽）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
