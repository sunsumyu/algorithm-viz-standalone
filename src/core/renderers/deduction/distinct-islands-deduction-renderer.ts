/**
 * LeetCode 694: 不同岛屿的数量 · 全景推演树渲染策略 (DistinctIslandsDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DistinctIslandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'distinct-islands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'distinct-islands' ||
      modelId === 'number-of-distinct-islands' ||
      modelId === 'leetcode-694' ||
      modelId === '694'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 4));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 694. 不同岛屿的数量 (Distinct Islands) · 全景推演树',
      badge: '几何平移不变性 · 相对坐标原点归一化与哈希集合去重 (Relative Offset Normalization)',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，单元格 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">'1'</code> 代表陆地，<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">'0'</code> 代表水域。<br/>
        <span class="font-bold text-slate-800">平移同构定义</span>：如果两个岛屿可以通过平移完全重合（不含旋转与翻转），则两者被视作<strong>同一种形状</strong>。<br/>
        <span class="font-bold text-slate-800">破局核心：原点归一化</span>：消除绝对网格坐标的干扰。在发现岛屿首个陆地格子 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">(r0, c0)</code> 时，将其设立为几何基准锚点 <span class="font-bold text-indigo-700">(0, 0)</span>。<br/>
        DFS 遍历收集岛屿内所有陆地相对原点的偏移坐标 <span class="font-bold text-rose-700">(r - r0, c - c0)</span> 并序列化为形状签名；存入哈希集合 <span class="font-bold text-purple-700">Set</span> 自动消除平移等价的重复岛屿！
      `,
      initialStateText: `初始形状集合 shapes = ∅，遍历指针自 (0, 0) 开始逐行推进。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界与水域阻断基准：越界或已沉没',
        valuesStr: 'r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] == 0 ➔ 直接 return',
      },
      {
        prefix: '└───',
        label: '就地沉没基准：标记置零与相对记录',
        valuesStr: 'grid[r][c] = 0; path.push((r - r0) + "," + (c - c0)); ➔ 防止回环并累积形状分量',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【锚点锁定 确立原点】在外层扫描中首次命中陆地种子点 (r0, c0)',
        subtitle: '确立几何基准坐标系',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '外层命中陆地：grid[r][c] == 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">⚓ 锁定锚点</span>',
            detailLines: [
              `│  ① 锁定基准原点：(r0, c0) = (r, c)`,
              `│  ② 初始化当前岛屿相对坐标列表：path = []`,
              `│  ③ 发起深度优先搜索：dfs(grid, r, c, r0, c0, path)`,
            ],
            fillLine: `└── 基准锚点确立，开启当前岛屿的形状探测 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【DFS 遍历 相对偏移序列化】四向递归与相对坐标归一化',
        subtitle: '消除绝对位移，抽取形状拓扑特征',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '相对偏移记录：(dr, dc) = (r - r0, c - c0)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">📐 坐标归一</span>',
            detailLines: [
              `│  ① 当前格就地置 0 沉没，防止重复访问`,
              `│  ② 相对偏移写入路径：path.add(dr + "," + dc)`,
              `│  ③ 向上下左右四向深入扩散，收集完整连通块轮廓`,
            ],
            fillLine: `└── 连通块所有陆地格已全部沉没并抽取相对坐标 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '生成形状签名：sig = path.sort().join(";")',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">🏷️ 签名生成</span>',
            detailLines: [
              `│  ① 对相对坐标集合排序，消除递归分支探索先后顺序带来的差异`,
              `│  ② 拼接为唯一几何签名字符串（例如："0,0;0,1;1,0;1,1"）`,
            ],
            fillLine: `└── 当前岛屿的平移不变性几何签名已固定 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【哈希去重判定】与既有形状签名库比对',
        subtitle: '平移全等去重与全新形态收录',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '哈希集合查重：shapes.contains(sig)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">🔍 去重判定</span>',
            detailLines: [
              `│  ① 若 shapes.contains(sig)：与既有岛屿平移全等，属于重复形状，去重丢弃`,
              `│  ② 若 !shapes.contains(sig)：发现全新几何形状！执行 shapes.add(sig)，独立形态数递增`,
            ],
            fillLine: `└── 哈希去重判定完成，更新形状库 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【双重扫描闭环 最终结果】全局网格所有单元格扫描完毕',
        subtitle: '不同几何形态岛屿总数确定',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全图所有岛屿已遍历完毕',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏁 扫描完毕</span>',
            detailLines: [
              `│  ① 所有岛屿均已通过相对坐标归一化转化为特征签名`,
              `│  ② 哈希集合中保留的元素个数即为互不相同的岛屿形态总数`,
            ],
            fillLine: `└── 最终不同形状岛屿数量输出确定 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '几何形状哈希化 · O(M × N) 时间复杂度 / O(M × N) 空间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return shapes.size();',
      answerDescription: '网格推演完毕，返回哈希集合中所包含的互不相同的岛屿形状数量 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
