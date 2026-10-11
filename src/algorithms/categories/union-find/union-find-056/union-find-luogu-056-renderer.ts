/**
 * Class 056: Code01 & Code02 并查集核心模版与路径压缩 (Union-Find Template)
 * 洛谷 P3367 / 牛客
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE01_UNION_FIND_CODES } from './union-find-056-stage-codes';
import { Step056, renderUnionFindTemplateBoard } from './union-find-056-shared';
import {
  type UnionFindOp,
  buildUnionFindTemplateSteps,
} from './union-find-luogu-056-step-compiler';

export { type UnionFindOp, buildUnionFindTemplateSteps };

export const unionFindLuogu056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'union-find-luogu-056',
  aliases: ['union-find-template-056', 'luogu-p3367-056', 'class056-code01'],
  name: '并查集核心模版与路径压缩 (Class 056)',
  category: 'union-find',
  difficulty: 'medium',
  badge: { mode: '并查集模版', complexity: 'O(α(N))' },
  description: '左程云算法通关课【必备篇】Class 056：并查集核心模版、路径压缩与小挂大树形连通性维护 (洛谷 P3367 / 牛客)',
  learningGoal: '彻底掌握树形代表元并查集设计哲学，深刻领悟路径压缩如何将树高度瞬时压平至 1，实现近乎 O(1) 的查询性能。',
  icon: '🌲',

  inputs: [
    {
      id: 'n',
      label: '节点数量 N',
      type: 'number',
      defaultValue: 6,
      min: 2,
      max: 12,
    },
    {
      id: 'ops',
      label: '指令序列 (格式: 1 x y 合并, 2 x y 查询; 换行或分号分隔)',
      type: 'text',
      defaultValue: '1 1 2; 1 2 3; 2 1 3; 1 4 5; 2 1 4; 1 3 5; 2 2 4',
      placeholder: '例如: 1 1 2; 1 2 3; 2 1 3',
    },
  ],

  presets: [
    {
      label: '经典案例: 6节点逐步合并与连通查询',
      values: { n: 6, ops: '1 1 2; 1 2 3; 2 1 3; 1 4 5; 2 1 4; 1 3 5; 2 2 4' },
    },
    {
      label: '两独立大群合并: 1-2-3 与 4-5-6',
      values: { n: 6, ops: '1 1 2; 1 2 3; 1 4 5; 1 5 6; 2 1 6; 1 3 4; 2 1 6' },
    },
    {
      label: '星型辐射连通: 全部连向节点 1',
      values: { n: 5, ops: '1 2 1; 1 3 1; 1 4 1; 1 5 1; 2 2 5; 2 3 4' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.unionFindTemplate056,
  codeLanguages: CODE01_UNION_FIND_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let n = 6;
    let ops: UnionFindOp[] = [
      { type: 1, x: 1, y: 2 },
      { type: 1, x: 2, y: 3 },
      { type: 2, x: 1, y: 3 },
      { type: 1, x: 4, y: 5 },
      { type: 2, x: 1, y: 4 },
      { type: 1, x: 3, y: 5 },
      { type: 2, x: 2, y: 4 },
    ];

    if (params && params.n !== undefined) {
      const parsedN = parseInt(params.n, 10);
      if (!isNaN(parsedN) && parsedN >= 2) n = Math.min(parsedN, 12);
    }

    if (params && params.ops) {
      const raw = String(params.ops);
      const items = raw.split(/[;\n\r]+/).map(s => s.trim()).filter(Boolean);
      const parsedOps: UnionFindOp[] = [];
      for (const item of items) {
        const parts = item.split(/[\s,，]+/).map(p => parseInt(p, 10)).filter(num => !isNaN(num));
        if (parts.length >= 3) {
          const t = parts[0] === 1 ? 1 : 2;
          const x = Math.max(1, Math.min(n, parts[1]));
          const y = Math.max(1, Math.min(n, parts[2]));
          parsedOps.push({ type: t, x, y });
        }
      }
      if (parsedOps.length > 0) ops = parsedOps;
    }

    return buildUnionFindTemplateSteps(n, ops);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderUnionFindTemplateBoard(step);
  },
});
