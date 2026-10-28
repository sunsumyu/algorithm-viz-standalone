/**
 * 通用步进归一化与防跳步消除引擎 (Universal Step Normalization Engine · USNE)
 *
 * 核心架构职责：
 * 1. 🚨 画布防断电卫士 (Zero Visual Blackout Guardian):
 *    - 杜绝基底判空 (root == null / empty queue / index out of bound) 时画布全灰、零焦点断电。
 *    - 自动探针溯源：自动绑定父级调用节点作为探针锚点 (nullProbe: { parentVal, branch }) 并注入次级高亮。
 *    - 保持上下文连续性：在汇总或无主步骤中，平滑延续上一有效活跃焦点，杜绝画布闪烁黑屏。
 *
 * 2. 🚨 严格递归调用返回帧合成器 (Strict Call-Return Unwind Synthesizer):
 *    - 解决递归子调用返回时，控制权直接瞬移至下一物理语句、跳过调用方表达式 (如 if (!isValid(left))) 的恶性跳步问题。
 *    - 当检测到调用栈退栈或叶子/基底返回时，若调用方返回现场帧缺失，自动合成平滑的「调用返回现场帧」。
 *
 * 3. 🚨 高亮冻结与无变化幽灵帧剔除 (Zero Line Freezing & Ghost Step Purging):
 *    - 消除连续多步代码行、变量、视觉完全相同且无状态演进的死循环停滞帧。
 *
 * 4. 🚨 全局非侵入性与安全隔离 (Non-Intrusive Safety):
 *    - 原生已具备高品质完整步骤的算法 100% 原样保留，仅对缺失视觉锚点或调用返回帧的残缺步骤进行自愈补偿。
 */

import { StepBase } from './step-visualizer';
import { DeclarativeAlgorithmSpec } from './renderers/declarative-stage-presenter';
import { BinaryTreeOfTreesSynthesizer } from './renderers/adapters/binary-tree-of-trees-synthesizer';

export interface StepNormalizationContext {
  algorithmId?: string;
  stageId?: string;
  currentMode?: string;
  spec?: DeclarativeAlgorithmSpec<any>;
  codeLanguages?: Record<string, string[]>;
}

export class StepNormalizationEngine {
  /**
   * 对任意算法生成的步骤序列进行通用自愈与归一化加工
   */
  public static normalize<TStep extends StepBase = any>(
    rawSteps: TStep[],
    context?: StepNormalizationContext
  ): TStep[] {
    if (!rawSteps || rawSteps.length === 0) {
      return rawSteps;
    }

    // 阶段 1: 画布防断电与动态探针补全
    const blackoutHealedSteps = this.healVisualBlackouts(rawSteps, context);

    // 阶段 2: 严格递归调用返回现场帧补全 (防跳步)
    const unwindSynthesizedSteps = this.synthesizeReturnUnwindFrames(blackoutHealedSteps, context);

    // 阶段 3: 幽灵死锁帧过滤
    const finalSteps = this.purgeGhostSteps(unwindSynthesizedSteps);

    // 阶段 4: 全量二叉树算法「树上挂树 (Tree of Trees)」共享全景拓扑自动合成
    const enrichedSteps = BinaryTreeOfTreesSynthesizer.enrichStepsWithTreeOfTrees(finalSteps, {
      algorithmId: context?.algorithmId || context?.spec?.id,
      stageId: context?.stageId,
    });

    return enrichedSteps as TStep[];
  }

  /**
   * 1. 画布防断电自愈：为所有无视觉亮点的步骤提供锚点延续或 nullProbe
   */
  private static healVisualBlackouts<TStep extends StepBase>(
    steps: TStep[],
    _context?: StepNormalizationContext
  ): TStep[] {
    let lastActiveNode: number | string | null = null;
    const parentStack: (number | string)[] = [];

    return steps.map((step: any, index: number) => {
      // 提取当前步骤中显式存在的活跃元素 (覆盖树节点、指针、下标与树状数组等)
      const curIdx = typeof step.curIdx === 'number' && step.curIdx > 0 ? step.curIdx : null;
      const current = step.current ?? step.activeNodeId ?? step.nodeVal ?? step.activeNode ?? curIdx;
      const hasExplicitActive = current !== undefined && current !== null;
      const hasSecondary = Array.isArray(step.secondaryHighlightedNodes) && step.secondaryHighlightedNodes.length > 0;
      const hasHighlighted = Array.isArray(step.highlightedNodes) && step.highlightedNodes.length > 0;
      const hasVisited = Array.isArray(step.visitedNodes) && step.visitedNodes.length > 0;
      const hasNullProbe = Boolean(step.nullProbe && step.nullProbe.parentVal != null);
      const hasSelected = Array.isArray(step.selected) && step.selected.length > 0;
      const hasActiveIndices = Array.isArray(step.activeIndices) && step.activeIndices.length > 0;
      const hasJumpPath = Array.isArray(step.jumpPath) && step.jumpPath.length > 0;
      const hasPointers = step.pointers && Object.keys(step.pointers).length > 0;

      // 跟踪调用栈与最后活跃节点
      if (hasExplicitActive) {
        lastActiveNode = current;
        const action = String(step.action || step.phase || '');
        if (action.includes('recurse') || action.includes('call') || action.includes('push') || action.includes('entry')) {
          if (!parentStack.includes(current)) {
            parentStack.push(current);
          }
        }
      }

      // 检测是否属于树结构算法且包含树数据实体 (区分二叉树 TreeNode 与普通数组)
      const isBinaryTree = Boolean(step.tree && typeof step.tree === 'object' && !Array.isArray(step.tree));
      const isArrayTree = Boolean(step.tree && Array.isArray(step.tree));
      const hasTree = isBinaryTree || isArrayTree;

      const isBlackout =
        !hasExplicitActive &&
        !hasSecondary &&
        !hasHighlighted &&
        !hasVisited &&
        !hasNullProbe &&
        !hasSelected &&
        !hasActiveIndices &&
        !hasJumpPath &&
        !hasPointers;

      // 若未出现断电，直接放行
      if (!isBlackout) {
        return step;
      }

      // 处理画布全灰断电 (Blackout) 异常
      const clonedStep = { ...step };

      // 场景 A: 树结构中的判空、基底或叶子返回 (如 isValidBST(null) 或 maxDepth(null))
      if (hasTree) {
        const textToInspect = `${step.message || ''} ${step.decision || ''} ${step.action || ''} ${step.phase || ''} ${step.log || ''}`.toLowerCase();
        const isNullCheck =
          textToInspect.includes('null') ||
          textToInspect.includes('空') ||
          textToInspect.includes('基底') ||
          textToInspect.includes('叶子') ||
          textToInspect.includes('base');

        if (isNullCheck) {
          // 追溯调用父节点
          const parentVal = parentStack.length > 0 ? parentStack[parentStack.length - 1] : lastActiveNode;
          if (parentVal != null) {
            // 启发式推导分支方向 (left vs right)
            let branch: 'left' | 'right' = 'left';
            if (textToInspect.includes('right') || textToInspect.includes('右')) {
              branch = 'right';
            } else if (textToInspect.includes('left') || textToInspect.includes('左')) {
              branch = 'left';
            } else {
              // 从前一步推导分支方向
              const prevStep = index > 0 ? (steps[index - 1] as any) : null;
              const prevText = `${prevStep?.message || ''} ${prevStep?.decision || ''} ${prevStep?.action || ''}`.toLowerCase();
              if (prevText.includes('right') || prevText.includes('右')) {
                branch = 'right';
              }
            }

            clonedStep.nullProbe = { parentVal, branch };
            clonedStep.secondaryHighlightedNodes = Array.from(
              new Set([...(clonedStep.secondaryHighlightedNodes || []), parentVal])
            );
            return clonedStep;
          }
        }

        // 场景 B: 树结构中的汇总、全局判定或中转步：延续上一次的活跃上下文，杜绝瞬间全灰
        if (lastActiveNode != null) {
          clonedStep.secondaryHighlightedNodes = Array.from(
            new Set([...(clonedStep.secondaryHighlightedNodes || []), lastActiveNode])
          );
        } else if (step.tree && step.tree.val != null) {
          clonedStep.secondaryHighlightedNodes = [step.tree.val];
        }
      } else {
        // 场景 C: 线性表/数组/图结构中的无主步骤：延续上一活跃焦点或第一元素
        if (lastActiveNode != null) {
          clonedStep.secondaryHighlightedNodes = [lastActiveNode];
        }
      }

      return clonedStep;
    });
  }

  /**
   * 2. 严格递归调用返回现场帧合成器：消除递归退栈时的光标瞬移跳步
   */
  private static synthesizeReturnUnwindFrames<TStep extends StepBase>(
    steps: TStep[],
    _context?: StepNormalizationContext
  ): TStep[] {
    const result: any[] = [];

    for (let i = 0; i < steps.length; i++) {
      const cur = steps[i] as any;
      result.push(cur);

      if (i >= steps.length - 1) continue;
      const next = steps[i + 1] as any;

      // 判断 cur 是否是子调用返回帧 (return true/false, return 0, null-return 等)
      const curAction = String(cur.action || cur.phase || '');
      const curMsg = String(cur.message || cur.decision || '');
      const isCurReturn =
        curAction.includes('return') ||
        curAction.includes('done') ||
        curMsg.includes('返回') ||
        curMsg.includes('return');

      // 判断 next 是否回到了父节点执行后续语句
      const nextAction = String(next.action || next.phase || '');
      const isNextContinued =
        nextAction.includes('compare') ||
        nextAction.includes('visit') ||
        nextAction.includes('recurse-right') ||
        nextAction.includes('update') ||
        nextAction.includes('check');

      // 若 cur 是从子树返回，而 next 已经在父节点执行内部计算，但中间缺失了「返回调用点」帧
      if (isCurReturn && isNextContinued && next.current != null) {
        // 检查 cur 与 next 之间是否已有返回现场帧
        const alreadyHasReturnSite =
          curAction.includes('returned') ||
          curAction === 'left-done' ||
          curAction === 'right-done' ||
          cur.codeLine === next.codeLine;

        if (!alreadyHasReturnSite) {
          // 合成平滑的调用返回现场帧
          const unwindStep = {
            ...cur,
            current: next.current,
            nullProbe: undefined,
            secondaryHighlightedNodes: Array.from(
              new Set([...(next.secondaryHighlightedNodes || []), next.current])
            ),
            phase: 'recurse-return',
            action: 'return-unwind',
            decision: `↩ 子调用完成并返回，恢复父节点 ${next.current} 执行现场`,
            message: `子树/子递归执行完毕，控制权安全返回至调用方。准备在节点 ${next.current} 推进后续逻辑。`,
            log: `return to node ${next.current}`,
            statusBadge: { text: `返回节点 ${next.current}`, type: 'info' },
          };

          // 保持代码行号平滑对齐调用点
          if (cur.codeLine && typeof cur.codeLine === 'object') {
            unwindStep.codeLine = cur.codeLine;
          }

          result.push(unwindStep);
        }
      }
    }

    return result;
  }

  /**
   * 3. 剔除连续完全相同的无意义幽灵停滞帧 (Zero Line Freezing & Duplicate Purging)
   */
  private static purgeGhostSteps<TStep extends StepBase>(steps: TStep[]): TStep[] {
    if (steps.length <= 1) return steps;

    const filtered: any[] = [steps[0]];

    for (let i = 1; i < steps.length; i++) {
      const prev = filtered[filtered.length - 1];
      const cur = steps[i] as any;

      // 提取核心特征
      const sameLine = JSON.stringify(prev.codeLine) === JSON.stringify(cur.codeLine);
      const sameCurrent = prev.current === cur.current && prev.activeNodeId === cur.activeNodeId;
      const sameAction = prev.action === cur.action && prev.phase === cur.phase;
      const sameMsg = prev.message === cur.message && prev.decision === cur.decision;

      // 若四者完全一致，判定为重复卡顿帧，予以跳过（保留终态）
      if (sameLine && sameCurrent && sameAction && sameMsg && i < steps.length - 1) {
        continue;
      }

      filtered.push(cur);
    }

    return filtered;
  }
}
