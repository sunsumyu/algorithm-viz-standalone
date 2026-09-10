/**
 * 通用回溯决策追踪推导引擎 (BacktrackTraceEngine) - DDD 领域核心深模块
 * 遵循领域驱动设计 (DDD) 与高杠杆原则：
 * 纯算法数学与状态推导，0 DOM 依赖，支持无浏览器环境单测。
 * 接收声明式 BacktrackSpec 规范，自动编译生成具有严谨动作语义的 BacktrackTreeStep 领域事件流。
 */

import type { HighlightTarget } from '../../../core/code-panel';
import type { StepVar } from '../../../core/interfaces';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  TreeLayoutEngine,
} from './tree-layout-engine';

export interface BacktrackPruneResult {
  pruned: boolean;
  reason?: string;
  upper?: number | string;
}

export interface BacktrackCodeLineMap {
  start?: HighlightTarget;
  check?: HighlightTarget;
  push?: HighlightTarget;
  recurse?: HighlightTarget;
  prune?: HighlightTarget;
  collect?: HighlightTarget;
  pop?: HighlightTarget;
  end?: HighlightTarget;
}

export interface BacktrackSpec<T = number | string> {
  name: string;
  /** 获取候选子节点列表 */
  getCandidates: (path: T[], parentNode: BacktrackTreeNode | null) => T[];
  /** 判断是否达到解集目标 */
  isSolution: (path: T[]) => boolean;
  /** 可选剪枝判定谓词 */
  prunePredicate?: (candidate: T, path: T[], parentNode: BacktrackTreeNode) => BacktrackPruneResult;
  /** 格式化节点与路径文本 */
  formatNodeValue?: (val: T) => string;
  /** 格式化路径字符串 */
  formatPath?: (path: T[]) => string;
  /** 变量监视快照构造器 */
  makeVars?: (path: T[]) => StepVar[];
  /** 物理代码行高亮映射表 */
  codeLines?: BacktrackCodeLineMap;
  /** 自定义起始/收尾文案 */
  startMessage?: string;
  endMessage?: (solutionCount: number) => string;
}

export interface BacktrackTraceResult {
  root: BacktrackTreeNode;
  allNodes: BacktrackTreeNode[];
  steps: BacktrackTreeStep[];
  solutions: Array<(number | string)[]>;
}

export class BacktrackTraceEngine {
  /**
   * 根据声明式规范自动编译整棵决策树与逐行执行追踪步
   */
  public static compile<T = number | string>(spec: BacktrackSpec<T>): BacktrackTraceResult {
    const formatVal = spec.formatNodeValue || ((v: T) => String(v));
    const formatP = spec.formatPath || ((p: T[]) => `[${p.map(formatVal).join(', ')}]`);
    const codeLines: BacktrackCodeLineMap = spec.codeLines || {
      start: 3,
      check: 9,
      collect: { from: 10, to: 11 },
      prune: 13,
      push: 14,
      recurse: 15,
      pop: 16,
      end: 4,
    };

    let nodeIdCounter = 0;

    // 1. 构建整棵树
    const root: BacktrackTreeNode = {
      id: 'root',
      value: '[]',
      path: [],
      children: [],
      isLeaf: false,
      isPruned: false,
      parentId: null,
      depth: 0,
    };

    function buildSubtree(path: T[], parent: BacktrackTreeNode): void {
      if (spec.isSolution(path)) {
        parent.isLeaf = true;
        return;
      }

      const candidates = spec.getCandidates(path, parent);
      for (const cand of candidates) {
        nodeIdCounter++;
        const childPath = [...path, cand];
        const valStr = formatVal(cand);
        const childId = `${parent.id}-${valStr}-${nodeIdCounter}`;

        let pruneRes: BacktrackPruneResult = { pruned: false };
        if (spec.prunePredicate) {
          pruneRes = spec.prunePredicate(cand, path, parent);
        }

        const childNode: BacktrackTreeNode = {
          id: childId,
          value: valStr,
          path: childPath as (number | string)[],
          children: [],
          isLeaf: spec.isSolution(childPath),
          isPruned: pruneRes.pruned,
          isDirectPrune: pruneRes.pruned,
          parentId: parent.id,
          depth: parent.depth + 1,
        };

        parent.children.push(childNode);

        if (!pruneRes.pruned && !childNode.isLeaf) {
          buildSubtree(childPath, childNode);
        }
      }
    }

    buildSubtree([], root);
    TreeLayoutEngine.layout(root);
    const allNodes = TreeLayoutEngine.flatten(root);

    // 2. 动态生成单步追踪事件流
    const steps: BacktrackTreeStep[] = [];
    const visitedIds: string[] = ['root'];
    const foundIds: string[] = [];
    const dynamicPrunedIds: string[] = [];
    const solutions: Array<(number | string)[]> = [];

    const getVars = (p: T[]): StepVar[] => {
      return spec.makeVars ? spec.makeVars(p) : [];
    };

    // Step 0: 启动步
    steps.push({
      nodes: allNodes,
      currentNodeId: 'root',
      visitedNodeIds: ['root'],
      foundPathIds: [],
      prunedNodeIds: [],
      path: [],
      message: spec.startMessage || `开始回溯搜索：从根节点 [] 出发`,
      codeLine: codeLines.start ?? 1,
      stats: { depth: 0, count: 0 },
      vars: getVars([]),
    });

    function traverse(node: BacktrackTreeNode, currentPath: T[]): void {
      if (node.isLeaf) {
        // 进入终止条件
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `递归进入：满足终止条件，找到目标解`,
          codeLine: codeLines.check ?? 9,
          stats: { depth: node.depth, count: foundIds.length },
          vars: getVars(currentPath),
        });

        foundIds.push(node.id);
        solutions.push([...node.path]);

        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `找到解集：${formatP(currentPath)}，收集并返回`,
          codeLine: codeLines.collect ?? { from: 10, to: 11 },
          stats: { depth: node.depth, count: foundIds.length },
          vars: getVars(currentPath),
        });
        return;
      }

      // 进入 for 循环判断
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：当前路径 ${formatP(currentPath)}，枚举下一层候选分支`,
        codeLine: codeLines.check ?? 9,
        stats: { depth: node.depth, count: foundIds.length },
        vars: getVars(currentPath),
      });

      for (const child of node.children) {
        if (child.isPruned) {
          if (!dynamicPrunedIds.includes(child.id)) {
            dynamicPrunedIds.push(child.id);
          }
          steps.push({
            nodes: allNodes,
            currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...dynamicPrunedIds],
            path: [...node.path],
            message: `剪枝截断：候选元素 ${child.value} 不满足搜索上界，跳过该分支`,
            codeLine: codeLines.prune ?? 13,
            stats: { depth: node.depth, count: foundIds.length },
            vars: getVars(currentPath),
          });
          continue;
        }

        visitedIds.push(child.id);
        const nextPath = (child.path as unknown) as T[];

        // 1. 做选择
        steps.push({
          nodes: allNodes,
          currentNodeId: child.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...child.path],
          message: `处理节点：path.add(${child.value}) → ${formatP(nextPath)}`,
          codeLine: codeLines.push ?? 14,
          stats: { depth: child.depth, count: foundIds.length },
          vars: getVars(nextPath),
        });

        // 2. 递归
        steps.push({
          nodes: allNodes,
          currentNodeId: child.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...child.path],
          message: `向下递归：深入决策子树，处理下一层`,
          codeLine: codeLines.recurse ?? 15,
          stats: { depth: child.depth, count: foundIds.length },
          vars: getVars(nextPath),
        });

        traverse(child, nextPath);

        // 3. 回溯撤销
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `回溯撤销：path.remove()，弹出 ${child.value}，恢复路径为 ${formatP(currentPath)}`,
          codeLine: codeLines.pop ?? 16,
          stats: { depth: node.depth, count: foundIds.length },
          vars: getVars(currentPath),
        });
      }
    }

    traverse(root, []);

    // 收尾步
    steps.push({
      nodes: allNodes,
      currentNodeId: 'root',
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...dynamicPrunedIds],
      path: [],
      message: spec.endMessage
        ? spec.endMessage(foundIds.length)
        : `搜索完成：共找到 ${foundIds.length} 个合法组合解`,
      codeLine: codeLines.end ?? 4,
      stats: { depth: 0, count: foundIds.length },
      vars: getVars([]),
    });

    return {
      root,
      allNodes,
      steps,
      solutions,
    };
  }
}
