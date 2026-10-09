/**
 * 双向广度优先搜索 (Bidirectional BFS · 单词接龙 LeetCode 127) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 双端交替扩展、较小集合优先扩展压制指数爆炸、双波相遇碰撞判定
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BiBFSDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bi-bfs';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bi-bfs' ||
      modelId === 'leetcode-127' ||
      modelId === 'lc-127' ||
      modelId === 'word-ladder' ||
      modelId === 'class063-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '双向广搜单词接龙 (Bidirectional BFS · LC 127) · 全景推演树',
      badge: '双端波前交替 · 优先扩展较小集合 · 碰撞判定 · O(b^(d/2))',
      descriptionHtml: `
        起点单词 <code class="font-bold text-slate-800">beginWord = "hit"</code>，目标终点 <code class="font-bold text-slate-800">endWord = "cog"</code>。<br/>
        词表候选：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">["hot", "dot", "dog", "lot", "log", "cog"]</code>。<br/>
        核心算法架构：<br/>
        ① <b>双端波前锚定：</b> 起点放入 <code class="font-bold text-blue-700">smallLevel = {"hit"}</code>，终点放入 <code class="font-bold text-pink-700">bigLevel = {"cog"}</code>；<br/>
        ② <b>小集合优先扩展 (方向调转优化)：</b> 每一轮扩展前对比集合规模，若 <code class="font-bold text-slate-800">nextLevel.size &gt; bigLevel.size</code>，交换两集合：<br/>
        &nbsp;&nbsp;• 始终从波前节点较少的一端发起单步扩散，将搜索树的分支指数爆炸彻底压缩至单向开方量级；<br/>
        ③ <b>波前碰撞相遇：</b> 遍历词中每一位变换 26 个字母，若新词已被对向集合包含，即刻判定两波碰撞相遇，返回当前转换步数 <code class="font-bold text-emerald-700">len</code>！
      `,
      initialStateText: '正反双向集合初始化完毕，准备开始逐轮波前单字变换与相遇碰撞探测。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '起点与终点初始波前集合',
        valuesStr: 'smallLevel = {"hit"}, bigLevel = {"cog"}',
      },
      {
        prefix: '├───',
        label: '全局已访问字典树/集合',
        valuesStr: 'visited = {"hit", "cog"}',
      },
      {
        prefix: '└───',
        label: '当前转换序列步数计数',
        valuesStr: 'len = 2 (起点到下一层距离初始为 2)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】正向波前第 1 轮扩展 (从 "hit" 出发)',
        subtitle: '当前 smallLevel = {"hit"} · 变换字母寻找有效接龙词',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '替换第 2 位字符 (i = 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">hit ➔ hot</span>',
            detailLines: [
              '│  ① 尝试 "hat", "hbt"... 命中字典词 "hot"',
              '│  ② "hot" 不在 bigLevel 中 ➔ 未发生碰撞',
              '│  ③ 加入 nextLevel = {"hot"}，并加入 visited',
            ],
            fillLine: '└── 产生新波前 nextLevel = {"hot"} 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '集合规模判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">保持方向</span>',
            detailLines: [
              '│  ① nextLevel.size(1) <= bigLevel.size(1)',
              '│  ② smallLevel = nextLevel = {"hot"}，方向维持正向',
            ],
            fillLine: '└── 步数推进至 len = 3',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】正向波前第 2 轮扩展 (从 "hot" 出发)',
        subtitle: '尝试替换 "hot" 各字符 · 发现 "dot" 与 "lot"',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '变换 "hot" 获得有效扩展词',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">hot ➔ dot, lot</span>',
            detailLines: [
              '│  ① 替换第 1 位获得 "dot" 与 "lot"',
              '│  ② 两词均未命中 bigLevel({"cog"})',
              '│  ③ 加入 nextLevel = {"dot", "lot"}',
            ],
            fillLine: '└── 产生双词波前 nextLevel = {"dot", "lot"}',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '对调集合优化 (Swap Sets)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-pink-100 text-pink-800 rounded font-bold">掉转搜索方向</span>',
            detailLines: [
              '│  ① nextLevel.size(2) > bigLevel.size(1) ➔ 对向更小！',
              '│  ② swap: smallLevel = {"cog"}, bigLevel = {"dot", "lot"}',
              '│  ③ 掉转方向，优先从终点反向扩展单个词 "cog"',
            ],
            fillLine: '└── 成功压制搜索分支膨胀，步数推进至 len = 4 🔄',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】反向波前扩展与碰撞判定 (从 "cog" 反推)',
        subtitle: '替换 "cog" 字符 ➔ 产生 "dog" 与 "log" ➔ 命中 "dot" 碰撞！',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '反向扩展获得 "dog"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-pink-100 text-pink-800 rounded font-bold">cog ➔ dog</span>',
            detailLines: [
              '│  ① 替换第 1 位获得 "dog"，不在 bigLevel 中',
              '│  ② 进一步变换 "dog" 的第 2 位获得 "dot"',
            ],
            fillLine: '└── 探测到 "dot" 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '碰撞检测 (Collision Detected)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">双波相遇</span>',
            detailLines: [
              '│  ① bigLevel({"dot", "lot"}).contains("dot") 严格成立！',
              '│  ② 正向与反向波前在 "dot" 节点胜利会师！',
              '│  ③ 最短接龙序列锁定: "hit" ➔ "hot" ➔ "dot" ➔ "dog" ➔ "cog"',
            ],
            fillLine: '└── 达成最短转换步数 len = 5 🏆',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '小波前字符替换 ➔ 碰撞检测 ➔ 集合规模对调 swap(small, big) ➔ 调转推进'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return len = 5;',
      answerDescription:
        '🏆 最终返回：双向波前成功在 "dot" 节点相遇，最短转换序列总长度为 5！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
