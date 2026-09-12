/**
 * 树型 DP 共享辅助模块 (TreeDp Shared Helpers)
 * RawTreeNode 结构、层序建树与通用树转换，供各 tree-*.ts 编译模块复用
 */

import type { UniversalTreeNode } from '../universal-stage-engine';

export interface RawTreeNode {
  id: string;
  val: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

export function parseTreeArray(raw: any): (number | null)[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    return raw
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
      .filter((n) => n === null || !isNaN(n));
  }
  return [1, 2, 3, 4, 5];
}

export function buildRawTree(arr: (number | null)[]): RawTreeNode | null {
  if (!arr || arr.length === 0 || arr[0] === null) return null;
  const root: RawTreeNode = { id: 'node-0', val: arr[0]!, left: null, right: null };
  const queue: RawTreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      curr.left = { id: `node-${i}`, val: arr[i]!, left: null, right: null };
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      curr.right = { id: `node-${i}`, val: arr[i]!, left: null, right: null };
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

export function toUniversalTree(
  node: RawTreeNode | null,
  activeId?: string,
  tags: Map<string, string> = new Map(),
  statuses: Map<string, UniversalTreeNode['status']> = new Map()
): UniversalTreeNode | null {
  if (!node) return null;
  const status: UniversalTreeNode['status'] =
    node.id === activeId ? 'current' : statuses.get(node.id) || 'normal';
  const tag = tags.get(node.id);

  return {
    id: node.id,
    r: 0,
    c: 0,
    val: `Node(${node.val})`,
    status,
    tag,
    children: [
      toUniversalTree(node.left, activeId, tags, statuses),
      toUniversalTree(node.right, activeId, tags, statuses),
    ].filter(Boolean) as UniversalTreeNode[],
  };
}
