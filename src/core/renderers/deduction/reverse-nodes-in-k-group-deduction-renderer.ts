/**
 * K 个一组翻转链表 (Reverse Nodes in k-Group · LeetCode 25 / Class 037)
 * 全景推演树渲染策略 (ReverseNodesInKGroupDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseNodesInKGroupDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-nodes-in-k-group';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-nodes-in-k-group' ||
      modelId === '25' ||
      modelId === 'leetcode-25' ||
      modelId === 'reverse-k-group-037' ||
      modelId === 'class037-code01' ||
      modelId === 'reverse-nodes-in-k-group-25' ||
      modelId === 'reverse-k-group'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 25. K 个一组翻转链表 (Reverse Nodes in k-Group) · 全景推演树',
      badge: '大厂压轴高频硬核题 & 左程云 Class 037 · K 节点前瞻探查 / 局部区间就地反转 / 组间首尾无缝缝合 / O(1) 空间',
      descriptionHtml: `
        核心目标：给你链表的头节点 <code>head</code> ，每 <code>k</code> 个节点一组进行翻转，请你返回修改后的链表。<br/>
        如果节点总数不是 <code>k</code> 的整数倍，那么请将最后剩余的节点保持原有顺序。<br/>
        <strong>左程云【必备篇】Class 037 核心精髓——探针前瞻探测与组间桥接缝合公理：</strong><br/>
        1. <strong>探针前瞻探测（K 步定组尾公理）</strong>：<br/>
        • 每一组反转前，指针从 <code>start</code> 开始向前走 <code>k - 1</code> 步寻找组尾 <code>end</code>；<br/>
        • 若步数不足 <code>k</code> 即提前触碰 <code>null</code>，说明<strong>最后一组不足 k 个节点</strong>，根据题意立即终止循环，保持原拓扑顺序不变！<br/>
        2. <strong>局部区间指针原地反转</strong>：<br/>
        • 暂存下一组起点：<code>nextGroup = end.next</code>；<br/>
        • 在区间 <code>[start, end]</code> 内执行反转，使原来的 <code>end</code> 成为这组的新头，<code>start</code> 沦为这组的新尾；<br/>
        3. <strong>前驱组尾与后继跨组缝合（严防断链）</strong>：<br/>
        • <strong>首组处理</strong>：若为第 1 组，这组的新头 <code>end</code> 确立为<strong>整条链表全局新头 head</strong>；<br/>
        • <strong>组间桥接</strong>：若非首组，将上一组的新尾 <code>lastTeamEnd.next = end</code>（上组尾连本组头）；<br/>
        • <strong>暂挂后继</strong>：本组新尾连下一组起点 <code>start.next = nextGroup</code>；<br/>
        • <strong>指针交接</strong>：更新 <code>lastTeamEnd = start; start = nextGroup;</code>，进入下一轮探测！
      `,
      initialStateText: `翻转入口：reverseKGroup(head, k) ➔ 启动 K 步探针与 lastTeamEnd 缝合器。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界判空与退化 (k <= 1 or Null)',
        valuesStr: 'head == null || head.next == null || k <= 1 ➔ 结构恒等，直接 return head',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: 'start == null || 探查不足 k 节点 ➔ 剩余节点保持原序，算法圆满收尾',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 前瞻 K 步探寻组尾 (Lookahead Probing end)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Step 1: Probe</span>',
      detailLines: [
        'ListNode end = start;',
        'for (int i = 1; i < k && end != null; i++) {',
        '  end = end.next; // 前瞻试探 k - 1 步',
        '}',
        'if (end == null) return head; // 不足 k 个，保持原样结束',
      ],
      fillLine: '前瞻雷达：探查当前组是否存在完整的 k 个节点，不足则保留原序',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 组内闭环就地反转 (Local In-place Reverse)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Step 2: Reverse</span>',
      detailLines: [
        'ListNode nextTeam = end.next;',
        'ListNode cur = start, pre = null;',
        'while (cur != nextTeam) {',
        '  ListNode next = cur.next; cur.next = pre; pre = cur; cur = next;',
        '}',
      ],
      fillLine: '局部颠倒：闭区间 [start, end] 指针掉头，原 end 变组首，原 start 变组尾',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 跨组缝合与推进 (Bridge & Pointer Advance)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Step 3: Stitch</span>',
      detailLines: [
        'if (lastTeamEnd == null) {',
        '  head = end; // 确立全局新头',
        '} else {',
        '  lastTeamEnd.next = end; // 上组尾连本组新头',
        '}',
        'start.next = nextTeam;    // 本组新尾暂挂下一组起点',
        'lastTeamEnd = start; start = nextTeam; // 状态推进',
      ],
      fillLine: '前后咬合：上一组组尾与当前组新组头严丝合缝，指针滑入下一组',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'K 组翻转推演流 (K-Step Probing ➔ Intra-Group Inversion ➔ Inter-Group Stitching)',
      subtitle: 'LeetCode 25 & Zuoshen Class 037 Reverse Nodes in k-Group Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '新链表头节点 (New Head after K-Group Inversion)',
      complexityStr: '时间复杂度: O(N) 每个节点仅访问 2 次 · 空间复杂度: O(1) 极致常数空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
