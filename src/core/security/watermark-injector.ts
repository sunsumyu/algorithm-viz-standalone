/**
 * 运行时切片数据动态水印注入器 (WatermarkInjector)
 *
 * 职责：
 * 1. 结合当前买家身份信息 (user_id / uid)，在算法切片数据中注入隐形零宽盲水印；
 * 2. 注入在题目讲义、题解与步骤日志中，随用户复制自然带出；
 * 3. 几何坐标无感微扰：在图论节点坐标中混入微米级浮点偏移 (0.001px 级)，肉眼与屏幕渲染完全无异，但具备数学可溯源特征。
 */

import { injectWatermarkIntoText } from './zero-width-watermark';

export interface AlgorithmChunkData {
  id?: string;
  name?: string;
  problemHtml?: string;
  description?: string;
  nodes?: Array<{ x: number; y: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

/**
 * 简易哈希函数：将字符串映射为 32 位整数
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 将买家特征动态注入到算法数据切片中
 */
export function injectBuyerWatermark(
  chunk: AlgorithmChunkData,
  buyerUserId: string
): AlgorithmChunkData {
  if (!buyerUserId) return chunk;

  const result: AlgorithmChunkData = { ...chunk };

  // 1. 文本隐形盲水印注入
  if (result.problemHtml && typeof result.problemHtml === 'string') {
    result.problemHtml = injectWatermarkIntoText(result.problemHtml, buyerUserId);
  } else if (result.description && typeof result.description === 'string') {
    result.description = injectWatermarkIntoText(result.description, buyerUserId);
  }

  // 2. 空间拓扑坐标无感微扰 (微量浮点偏移，100% 视觉不可察觉)
  if (Array.isArray(result.nodes) && result.nodes.length > 0) {
    const seed = hashString(buyerUserId);
    result.nodes = result.nodes.map((node, idx) => {
      if (typeof node.x === 'number' && typeof node.y === 'number') {
        const deltaX = (((seed + idx * 13) % 100) - 50) * 0.0001; // 偏移范围 [-0.005, 0.005] px
        const deltaY = (((seed + idx * 29) % 100) - 50) * 0.0001;
        return {
          ...node,
          x: Number((node.x + deltaX).toFixed(4)),
          y: Number((node.y + deltaY).toFixed(4)),
        };
      }
      return node;
    });
  }

  return result;
}
