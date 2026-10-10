/**
 * 状态压缩 BFS (State Compression BFS - LeetCode 847 / 864) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 状态空间扩维 (u, mask) + 二进制位掩码记录 + 多图层三维判重
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class StateCompressionBfsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'state-compression-bfs';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'state-compression-bfs' ||
      modelId === '847' ||
      modelId === '864' ||
      modelId === 'shortestPathLength' ||
      modelId === 'state-bfs'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '状态压缩 BFS (State Compression BFS) · 全景推演树',
      badge: 'LeetCode 847/864 · 状态空间扩维 (u, mask) · 多图层判重 · O(N × 2^N) 线性层序最优',
      descriptionHtml: `
        问题本质：图或网格探索过程中存在物品收集或全节点覆盖状态，允许重复访问同一物理节点，但要求总移动步数最小。<br/>
        <b>状态空间扩维与位掩码多图层搜索机制：</b><br/>
        ① <b>状态空间扩维 (State Augmentation)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;普通 BFS 仅以坐标 $(r, c)$ 或节点编号 $u$ 为状态；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;状态压缩 BFS 将状态单元扩维为三元组 $(r, c, mask)$ 或二元组 $(u, mask)$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;其中 $mask$ 的第 $k$ 位为 1 表示已持有第 $k$ 把钥匙或已访问第 $k$ 个节点；<br/>
        ② <b>多图层三维判重 (Multi-Layer Visited)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;使用三维布尔表 <code>visited[r][c][mask]</code>；每个不同的 $mask$ 对应一个平行的拓扑图层；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;移动到普通地块：在当前图层内扩展 $(r, c, mask) \to (r', c', mask)$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;拾取新物品 $k$：触发跨图层跃迁 $(r, c, mask) \to (r', c', mask \mid (1 \ll k))$！<br/>
        ③ <b>首次到达即最优定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;网格每一步移动权值均为 1，BFS 队列严格满足单调性与两段性；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;一旦队首弹出的状态满足 $mask = targetMask$，其对应的移动步数必然为全局最短路径！
      `,
      initialStateText: '载入 3x3 障碍迷宫，含钥匙 a(位0), b(位1)，终态目标掩码 targetMask = 0b11 (3)。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '网格与物品配置',
        valuesStr: '起点 (0,0), 钥匙 a(0,2), 钥匙 b(2,0), 障碍墙壁 #(1,0), #(1,1)',
      },
      {
        prefix: '├───',
        label: '状态扩维三元组',
        valuesStr: '(r, c, mask)，mask ∈ [0, 2^2 - 1] (共 4 个状态图层)',
      },
      {
        prefix: '└───',
        label: '目标掩码',
        valuesStr: 'targetMask = (1 << 2) - 1 = 0b11 (集齐全部钥匙)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】状态空间扩维初始化与初始图层入队',
        subtitle: '创建三维判重表 visited[R][C][4]，起点 (0, 0, 0b00) 入队',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '初始图层 0b00 起点入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">初始图层 0b00</span>',
            detailLines: [
              '│  ① queue = [(r=0, c=0, mask=0b00, dist=0)]',
              '│  ② visited[0][0][0b00] = true (锁定初始图层起点)',
            ],
            fillLine: '└── 初始状态建立就绪 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '图层 0b00 沿通道向右推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">同图层移动</span>',
            detailLines: [
              '│  ① (0,0) ➔ (0,1)，未发现钥匙，mask 保持 0b00，dist = 1',
              '│  ② (0,1) ➔ (0,2)，发现钥匙 a，即将触发跃迁',
            ],
            fillLine: '└── 到达钥匙 a 位置 (0, 2)',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】拾得钥匙 a，跃迁至图层 0b01 并绕行障碍',
        subtitle: '执行位运算 mask |= (1 << 0)，状态跃迁至新图层并绕开墙壁',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '跨图层跃迁: 0b00 ➔ 0b01',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">拾取钥匙 a</span>',
            detailLines: [
              '│  ① 钥匙 a 对应位 0：mask = 0b00 | (1 << 0) = 0b01',
              '│  ② visited[0][2][0b01] = true，dist = 2',
              '│  ③ 状态进入全新的「持有钥匙 a」图层！',
            ],
            fillLine: '└── 成功跃迁至图层 0b01 ✨',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '绕行障碍墙壁向下推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">图层 0b01 绕行</span>',
            detailLines: [
              '│  ① (0,2) 向下移动到 (1,2)，dist = 3',
              '│  ② (1,2) 向下移动到 (2,2)，dist = 4',
              '│  ③ (2,2) 向左移动到 (2,1)，dist = 5',
              '│  ④ 沿途均在图层 0b01 中探索，避免死循环',
            ],
            fillLine: '└── 逼近钥匙 b 所在单元格 (2, 0)',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】拾得钥匙 b，跃迁至终态图层 0b11 与最优解结算',
        subtitle: '执行 mask |= (1 << 1) 达到 0b11，命中 targetMask 终止搜索',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '拾取钥匙 b 与终态跃迁: 0b01 ➔ 0b11',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">钥匙全集齐</span>',
            detailLines: [
              '│  ① 踏入 (2,0)，mask = 0b01 | (1 << 1) = 0b11 (十进制 3)',
              '│  ② dist = 5 + 1 = 6 步',
              '│  ③ 满足 mask === targetMask (0b11)',
            ],
            fillLine: '└── 终态状态点亮: (r=2, c=0, mask=0b11) 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'BFS 最短路最优性结算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">全局最优</span>',
            detailLines: [
              '│  ① 首次从队列中弹出全状态目标，步数 = 6',
              '│  ② 由 BFS 单调性，任何后续路径步数均 ≥ 6',
              '│  ③ 时间复杂度: O(R × C × 2^K)，空间复杂度: O(R × C × 2^K)',
            ],
            fillLine: '└── 返回最短路径长度: 6 步 🎉',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="deduction-board" style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${header}
        ${baseCase}
        ${rounds.join('\n')}
      </div>
    `;
  }
}
