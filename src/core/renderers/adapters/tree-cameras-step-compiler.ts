import type { HighlightTarget } from '../../step-visualizer';

export interface TreeNode {
  id: number;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

export type CameraNodeState = 0 | 1 | 2; // 0=无覆盖, 1=有摄像头, 2=已覆盖

export interface CameraStep {
  root: TreeNode | null;
  currentNodeId: number | null;
  nodeStates: Record<number, CameraNodeState>;
  cameraCount: number;
  leftState: number | null;
  rightState: number | null;
  action: 'enter' | 'place_camera' | 'covered_by_child' | 'wait_parent' | 'root_camera' | 'done';
  message: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const TREE_CAMERAS_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 3, cpp: 16, python: 3, javascript: 2 },
  enter: { java: 12, cpp: 5, python: 8, javascript: 5 },
  placeCamera: { java: 16, cpp: 8, python: 11, javascript: 8 },
  covered: { java: 21, cpp: 11, python: 14, javascript: 11 },
  waitParent: { java: 24, cpp: 12, python: 15, javascript: 12 },
  rootCamera: { java: 6, cpp: 16, python: 17, javascript: 14 },
  done: { java: 8, cpp: 17, python: 18, javascript: 15 },
};

export function parseTreeFromArray(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  let nextId = 1;
  const root: TreeNode = { id: nextId++, val: arr[0]!, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) {
      node.left = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = { id: nextId++, val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

export function buildTreeCameraSteps(root: TreeNode | null): CameraStep[] {
  const steps: CameraStep[] = [];
  const nodeStates: Record<number, CameraNodeState> = {};
  let cameraCount = 0;

  if (!root) {
    steps.push({
      root: null,
      currentNodeId: null,
      nodeStates: {},
      cameraCount: 0,
      leftState: null,
      rightState: null,
      action: 'done',
      message: '树为空，最小摄像头数量为 0',
      codeLine: TREE_CAMERAS_CODE_LINES.guard,
      line: (TREE_CAMERAS_CODE_LINES.guard as any).java ?? 3,
    });
    return withMetrics(steps);
  }

  function dfs(node: TreeNode | null): CameraNodeState {
    if (!node) return 2; // 空节点视为有覆盖

    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'enter',
      message: `🔽 访问节点 [${node.id}] (val=${node.val})，准备递归后序遍历左右子树`,
      codeLine: TREE_CAMERAS_CODE_LINES.enter,
      line: (TREE_CAMERAS_CODE_LINES.enter as any).java ?? 12,
    });

    const left = dfs(node.left);
    const right = dfs(node.right);

    // 情况 1：左右孩子只要有一个无覆盖 (0)，当前父节点必须放置摄像头
    if (left === 0 || right === 0) {
      cameraCount++;
      nodeStates[node.id] = 1;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'place_camera',
        message: `📷 【情况1】节点 [${node.id}] 的子节点存在无覆盖 (左=${left}, 右=${right})！贪心在此安装第 ${cameraCount} 台摄像头，返回 1 (有摄像头)`,
        codeLine: TREE_CAMERAS_CODE_LINES.placeCamera,
        line: (TREE_CAMERAS_CODE_LINES.placeCamera as any).java ?? 16,
      });
      return 1;
    }

    // 情况 2：左右孩子至少有一个摄像头 (1)，当前节点被摄像头覆盖
    if (left === 1 || right === 1) {
      nodeStates[node.id] = 2;

      steps.push({
        root,
        currentNodeId: node.id,
        nodeStates: { ...nodeStates },
        cameraCount,
        leftState: left,
        rightState: right,
        action: 'covered_by_child',
        message: `🛡️ 【情况2】节点 [${node.id}] 的子节点已有摄像头 (左=${left}, 右=${right})，当前节点处于覆盖范围，返回 2 (已覆盖)`,
        codeLine: TREE_CAMERAS_CODE_LINES.covered,
        line: (TREE_CAMERAS_CODE_LINES.covered as any).java ?? 21,
      });
      return 2;
    }

    // 情况 3：左右孩子都已被覆盖 (2)，当前节点暂时无覆盖，留给上层父节点覆盖
    nodeStates[node.id] = 0;
    steps.push({
      root,
      currentNodeId: node.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: left,
      rightState: right,
      action: 'wait_parent',
      message: `⚪ 【情况3】节点 [${node.id}] 的子节点均为已覆盖 (左=${left}, 右=${right})，当前节点暂无覆盖，留待上层父节点安装摄像头覆盖，返回 0 (无覆盖)`,
      codeLine: TREE_CAMERAS_CODE_LINES.waitParent,
      line: (TREE_CAMERAS_CODE_LINES.waitParent as any).java ?? 24,
    });
    return 0;
  }

  const rootStatus = dfs(root);

  // 根节点特判：如果根节点返回 0 (无覆盖)，根节点自身必须放一个摄像头
  if (rootStatus === 0) {
    cameraCount++;
    nodeStates[root.id] = 1;

    steps.push({
      root,
      currentNodeId: root.id,
      nodeStates: { ...nodeStates },
      cameraCount,
      leftState: null,
      rightState: null,
      action: 'root_camera',
      message: `📷 【根节点特判】遍历结束，根节点 [${root.id}] 依然处于无覆盖状态 (无上层父节点)！必须在此补装第 ${cameraCount} 台摄像头`,
      codeLine: TREE_CAMERAS_CODE_LINES.rootCamera,
      line: (TREE_CAMERAS_CODE_LINES.rootCamera as any).java ?? 6,
    });
  }

  steps.push({
    root,
    currentNodeId: null,
    nodeStates: { ...nodeStates },
    cameraCount,
    leftState: null,
    rightState: null,
    action: 'done',
    message: `🎉 监控配置完成！监控全树所需最小摄像头数量为 ${cameraCount} 台`,
    codeLine: TREE_CAMERAS_CODE_LINES.done,
    line: (TREE_CAMERAS_CODE_LINES.done as any).java ?? 8,
  });

  return withMetrics(steps);
}

function withMetrics(steps: CameraStep[]): CameraStep[] {
  return steps.map((s) => {
    const isPlace = s.action === 'place_camera' || s.action === 'root_camera';
    const isCover = s.action === 'covered_by_child';
    const isWait = s.action === 'wait_parent';

    let action = '✓ 遍历完成';
    if (isPlace) action = '📷 安装摄像头 (覆照父子)';
    else if (isCover) action = '🛡️ 被子节点摄像头覆盖';
    else if (isWait) action = '⚪ 暂无覆盖 (留待父节点覆盖)';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-node': s.currentNodeId ? `节点 [${s.currentNodeId}]` : '—',
        'children-state': s.leftState !== null ? `(左: ${s.leftState}, 右: ${s.rightState})` : '—',
        cameras: `${s.cameraCount} 台`,
        action,
      },
    };
  });
}
