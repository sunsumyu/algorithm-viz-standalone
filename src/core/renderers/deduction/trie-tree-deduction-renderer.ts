/**
 * 前缀树 (Trie / Prefix Tree · LeetCode 208 / Class 017)
 * 全景推演树渲染策略 (TrieTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TrieTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'trie-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'trie-tree' ||
      modelId === 'trie-tree-017' ||
      modelId === '208' ||
      modelId === 'leetcode-208' ||
      modelId === 'class017-code01' ||
      modelId === 'trie-prefix-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 208. 实现 Trie (前缀树) · 全景推演树',
      badge: '左程云 Class 017 · pass/end 词频设计 / 动态指针与二维静态数组 / 公共前缀共享',
      descriptionHtml: `
        目标：设计一种高效的树形字典检索数据结构（Trie），支持 <code>insert</code>、<code>search</code>（单词精确检索）与 <code>startsWith</code>（前缀匹配）。<br/>
        <strong>左程云算法体系教学核心——前缀树拓扑与统计公理：</strong><br/>
        1. <strong>节点 pass 与 end 核心定义</strong>：<br/>
        • <code>pass</code>：表示<strong>有多少个单词在插入时经过了当前节点</strong>（前缀包含当前路径的单词总数）；<br/>
        • <code>end</code>：表示<strong>有多少个单词以当前节点作为结尾</strong>（该单词出现的绝对频次）；<br/>
        根节点不存字符，边上承载字符（或子节点指针索引 <code>0..25</code> 映射字符 <code>'a'..'z'</code>）。<br/>
        2. <strong>三模态操作逻辑</strong>：<br/>
        • <strong>插入（insert）</strong>：沿字符指针下潜，若子节点不存在则动态创建；沿途经过的所有节点 <code>pass++</code>，最终结尾节点 <code>end++</code>；<br/>
        • <strong>完整查询（search）</strong>：沿字符路径下潜，中途若指针断裂直接返回 false；成功抵达终点且终点 <code>end > 0</code> 时返回 true；<br/>
        • <strong>前缀统计（prefixNumber / startsWith）</strong>：沿字符路径下潜，若断裂返回 0；成功抵达终点直接返回该节点的 <code>pass</code> 值！<br/>
        3. <strong>算法竞赛静态连续数组优化（Static Array Trie）</strong>：<br/>
        使用平坦化的二维数组 <code>tree[MAX_NODES][26]</code> 替代大量散落的 Java/C++ 对象指针，避免 GC 开销与指针解引用缓存抖动，执行速度提升 5~10 倍！
      `,
      initialStateText: `Trie 树根节点初始化：root (pass=0, end=0)，子节点槽位 26 叉树展开。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空字符/分支缺失基准 (Branch Missing)',
        valuesStr: 'cur.next[path] == null ➔ 剪枝快速失败，search 返回 false / prefix 返回 0',
      },
      {
        prefix: '└───',
        label: '字符哈希映射基准 (Alphabet Index)',
        valuesStr: 'path = char - \'a\' (0 <= path < 26)，映射为子节点唯一槽位',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 面向对象动态指针实现 (Object Pointer Trie)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Pointer Trie</span>',
      detailLines: [
        'for (char c : word) { path = c - \'a\'; if (cur.next[path] == null) cur.next[path] = new Node(); }',
        'cur = cur.next[path]; cur.pass++;',
        'cur.end++; // 循环结束在终点打桩标记',
      ],
      fillLine: '拓扑自然扩张：按字符顺流建树，同一前缀的多个单词自动共享节点空间',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 静态连续数组竞赛优化版 (Static Array Trie)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Static Array</span>',
      detailLines: [
        'int[][] tree = new int[MAXN][26]; int[] pass = new int[MAXN]; int[] end = new int[MAXN];',
        'if (tree[cur][path] == 0) tree[cur][path] = ++cnt;',
        'cur = tree[cur][path]; pass[cur]++;',
      ],
      fillLine: '连续内存分配：通过整数索引寻址，极致契合 CPU Cache Line 缓存局部性',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 多模态检索与前缀断裂剪枝 (Search & Prefix Count)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">O(L) Query</span>',
      detailLines: [
        'search(word): 若中途遇空直接 return false; 走完全程 return cur.end > 0;',
        'prefixNumber(pre): 若中途遇空直接 return 0; 走完全程 return cur.pass;',
      ],
      fillLine: 'O(L) 极速检索：查找耗时仅与单词长度 L 有关，与词库规模 N 完全无关',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '前缀树构建与高效前缀检索推演流 (Dynamic Object ➔ Static Array ➔ O(L) Query)',
      subtitle: 'LeetCode 208 & Zuoshen Class 017 Trie Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return result; // 单词命中结果或公共前缀词频',
      answerDescription: '单次插入和查询时间复杂度为严格的 O(L)，空间复杂度为 O(N * L * Σ)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
