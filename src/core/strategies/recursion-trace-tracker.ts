/**
 * RecursionTraceTracker — 递归阶段步进轨迹追踪深模块
 *
 * 铁律：顶层强制约束和公用的必须在顶层实现。
 * 递归阶段（阶段 1）步骤生成器的五项骨架不变量在此唯一实现：
 *   1. maxSteps 保险丝 — pushStep 静默丢弃 + dfs 循环体 exhausted 短路（历史教训：
 *      target-sum/buy-goods/bounded-knapsack 各自手写 `steps.length >= maxSteps`，散落即漏写）
 *   2. callStack 逐快照拷贝 — 每个 step 持有入栈瞬间的独立数组（`[...callStack]` 散写易漏）
 *   3. stepIndex 严格 1..N 自增 — 引擎独占，算法无感
 *   4. totalSteps 终回填 — finalize() 一次性回填，杜绝散落的 `s.totalSteps = total` 尾巴
 *   5. 树快照克隆 — treeMode 启用时每步 cloneStateDepTree 深克隆 + activeNodeId 焦点
 *      （与 LCS 截断同族的共享状态串扰防线）
 *
 * 接口设计：pushStep 的 fields 参数类型为 Omit<TStep, 托管字段>——算法侧
 * 想写 stepIndex/action/codeLine/callStack/treeRoot 会直接编译报错，骨架物理上不可散落。
 */

import type { HighlightTarget } from '../renderers/dark-code-terminal-presenter';
import type { RecursionStepBase } from '../step-types';
import { cloneStateDepTree } from './tree-clone';

/** 追踪器管理的递归树节点（n-ary children 形状，与 RecursionTreeAdapter 消费契约一致） */
export interface TrackerTreeNode {
  id: string;
  label: string;
  val: string;
  status: 'current' | 'visited' | 'base' | 'pruned';
  tag?: string;
  children: TrackerTreeNode[];
}

/** 引擎托管的骨架字段 — 算法侧 fields 类型中被 Omit 掉，物理不可注入 */
export type TrackerManagedKeys = 'stepIndex' | 'totalSteps' | 'action' | 'codeLine' | 'callStack' | 'treeRoot' | 'activeNodeId';

/** 算法侧只需提供领域字段（decision/message/log/metrics + 算法特有字段） */
export type RecursionDomainFields<TStep> = Omit<TStep, TrackerManagedKeys>;

export interface RecursionTraceTrackerSpec {
  /** 步数上限保险丝，默认 800（与各 stage-evolution 历史默认一致） */
  maxSteps?: number;
  /** 语义锚点 → 高亮行号（算法闭包持有 stage/kind） */
  resolveLine: (anchor: string) => HighlightTarget;
}

export class RecursionTraceTracker<
  TStep extends RecursionStepBase<TFrame>,
  TFrame
> {
  readonly steps: TStep[] = [];
  readonly callStack: TFrame[] = [];
  /** 树模式根节点（spawnNode(null, ...) 时建立；算法持引用做 status/tag 领域转换） */
  treeRoot: TrackerTreeNode | null = null;

  private readonly maxSteps: number;
  private readonly resolveLine: (anchor: string) => HighlightTarget;
  private readonly treeMode: boolean;
  private nodeSeq = 0;
  private focusedNode: TrackerTreeNode | null = null;

  constructor(spec: RecursionTraceTrackerSpec, treeMode = false) {
    this.maxSteps = spec.maxSteps ?? 800;
    this.resolveLine = spec.resolveLine;
    this.treeMode = treeMode;
  }

  /** 保险丝是否熔断 — dfs 递归体每层入口短路检查 */
  get exhausted(): boolean {
    return this.steps.length >= this.maxSteps;
  }

  /** 当前调用栈深度（metrics 用） */
  get depth(): number {
    return this.callStack.length;
  }

  /** 进入栈帧：压栈后由 pushStep 自动快照 */
  enterFrame(frame: TFrame): TFrame {
    this.callStack.push(frame);
    return frame;
  }

  /** 退出栈帧（dfs 汇聚返回前调用） */
  exitFrame(): void {
    this.callStack.pop();
  }

  /**
   * 树模式：派生子节点挂到 parent.children（parent 为 null 时成为根）。
   * 返回节点由算法继续做 status/tag 领域转换。
   */
  spawnNode(parent: TrackerTreeNode | null, label: string): TrackerTreeNode {
    const node: TrackerTreeNode = {
      id: `node-${++this.nodeSeq}`,
      label,
      val: label,
      status: 'current',
      children: [],
    };
    if (parent) {
      parent.children.push(node);
    } else {
      this.treeRoot = node;
    }
    this.focusedNode = node;
    return node;
  }

  /** 焦点切换（activeNodeId 跟随被 focus 的节点，缺省回落根节点） */
  focus(node: TrackerTreeNode): void {
    this.focusedNode = node;
  }

  /**
   * 压入一个步骤：引擎独占托管骨架字段（stepIndex 自增 / codeLine 解析 /
   * callStack 拷贝 / treeMode 下的 treeRoot 深克隆 + activeNodeId 焦点），
   * 算法侧 fields 只填领域字段与 metrics。
   */
  pushStep(action: string, codeKey: string, fields: RecursionDomainFields<TStep>): void {
    if (this.steps.length >= this.maxSteps) return;
    const step = {
      ...fields,
      action,
      stepIndex: this.steps.length + 1,
      totalSteps: 0,
      codeLine: this.resolveLine(codeKey),
      callStack: [...this.callStack],
    } as TStep;
    if (this.treeMode) {
      const target = step as TStep & { treeRoot?: unknown; activeNodeId?: unknown };
      target.treeRoot = cloneStateDepTree(this.treeRoot);
      target.activeNodeId = (this.focusedNode ?? this.treeRoot)?.id;
    }
    this.steps.push(step);
  }

  /** 终结算：回填 totalSteps 并交还步骤序列（生成器唯一出口） */
  finalize(): TStep[] {
    const total = this.steps.length;
    this.steps.forEach((s) => (s.totalSteps = total));
    return this.steps;
  }
}