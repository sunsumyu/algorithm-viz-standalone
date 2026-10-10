/**
 * Class 027: 最小生成树算法 (MST - Kruskal & Prim) (洛谷 P3366) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：身材保持在 65 行内，委托给纯 SVG 适配器与步进编译器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type EdgeDef,
  type Mst027Step,
  MST_027_CODES,
  buildMst027Steps,
} from './mst-kruskal-prim-027-step-compiler';
import {
  renderMst027Canvas,
  renderMst027CustomMetrics,
} from '../../../core/renderers/adapters/mst-kruskal-prim-027-canvas-adapter';

export const mst027Visualizer = registerDeclarativeAlgorithm<Mst027Step>({
  id: 'mst-kruskal-prim-027',
  name: '最小生成树 (Kruskal & Prim) (Class 027)',
  category: 'graph',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 27,
  aliases: ['class027-code01', 'class027-code02', 'mst-kruskal-prim-027', 'mst-kruskal-prim', 'luogu-p3366'],
  learningGoal: '掌握 Kruskal 贪心加边与并查集防环机制，理解 Prim 节点集割边扩展定理与最小生成树应用',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定一个无向带权连通图，求出图的最小生成树 (Minimum Spanning Tree) 的所有边的边权之和。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>默认图拓扑：</strong>4 个顶点，边权为 (1-2:1), (2-3:2), (1-3:4), (2-4:3), (3-4:5)。<br/>
        <strong>MST 选取边：</strong>(1-2:1) + (2-3:2) + (2-4:3) = 6。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nodes',
      label: '顶点个数 (N)',
      type: 'number',
      defaultValue: 4,
      min: 2,
      max: 6,
    },
  ],
  codeLanguages: MST_027_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(2, parseInt(String(inputs?.nodes || 4), 10));
    return buildMst027Steps(n);
  },
  renderCanvas: (container, step) => renderMst027Canvas(container, step as Mst027Step),
  renderCustomMetrics: (container, step) => renderMst027CustomMetrics(container, step as Mst027Step),
});

export {
  renderMst027Canvas,
  renderMst027CustomMetrics,
  buildMst027Steps,
  MST_027_CODES,
  type EdgeDef,
  type Mst027Step,
};
