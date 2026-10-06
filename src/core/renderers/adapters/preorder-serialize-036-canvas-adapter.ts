/**
 * Preorder Serialize & Deserialize Canvas Adapter (Class 036 Code05 / LeetCode 297)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 纯表现层适配器：委托 renderTreeSvg 与 renderQueuePipeline 呈现序列化推演与 Token 队列管道。
 */

import {
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { SERIAL_TREE_NODES } from './preorder-serialize-036-step-compiler';

export function renderPreorderSerializeCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || SERIAL_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, '序列化 / 反序列化 Token 队列流') : ''}
    </div>
  `;
}

export class PreorderSerialize036CanvasAdapter {
  static renderCanvas = renderPreorderSerializeCanvas;
}
