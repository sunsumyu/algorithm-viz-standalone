/**
 * 01-Trie 与异或最大值 (01-Trie Max XOR · LeetCode 421 / Class 107)
 * 全景推演树渲染策略 (TrieXorMaxDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TrieXorMaxDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'trie-xor-max';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'trie-xor-max' ||
      modelId === 'trie-xor-max-107' ||
      modelId === '421' ||
      modelId === 'leetcode-421' ||
      modelId === 'maximum-xor' ||
      modelId === 'class107-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 421. 数组中两个数的最大异或值 (01-Trie Max XOR) · 全景推演树',
      badge: '左程云 Class 107 · 01-Trie 二进制树 / 高位贪心反向选择 / O(32N) 降维打击',
      descriptionHtml: `
        目标：给你一个整数数组 <code>nums</code>，返回 <code>nums[i] XOR nums[j]</code> 的最大运算结果。<br/>
        <strong>左程云算法体系教学核心——01-Trie 与高位贪心决策：</strong><br/>
        1. <strong>二进制字典树结构（01-Trie）</strong>：<br/>
        把每一个数字视为固定 31 位（0 到 30 位）的二进制序列，从最高符号位/有效位自顶向下插入一棵<strong>只有 0 和 1 两个分支的二叉前缀树</strong>。<br/>
        树高恒定为 31 层，插入一个数字的时间复杂度为严格常数 <code>O(31)</code>。<br/>
        2. <strong>高位贪心最优选择公理</strong>：<br/>
        对于数字 <code>num</code>，若想让异或结果尽可能大，<strong>二进制的高位权重大于所有低位之和（2^k > 2^k - 1）</strong>！<br/>
        因此从第 30 位自顶向下探测：<br/>
        • 取得 <code>num</code> 在当前位的二进制值 <code>status = (num >> i) & 1</code>；<br/>
        • <strong>贪心最优期望是走向其相反分支 <code>want = status ^ 1</code></strong>（1 选 0，0 选 1），因为异或结果该位能凑出 <code>1</code>；<br/>
        • 若树中存在 <code>want</code> 分支，则果断走入该分支，并在当前位累加贡献 <code>ans |= (1 << i)</code>；<br/>
        • 若 <code>want</code> 分支不存在，别无选择只能顺从走入 <code>status</code> 分支，当前位异或贡献为 0。<br/>
        3. <strong>算法复杂度飞跃</strong>：<br/>
        暴力枚举两两异或为 <code>O(N²)</code>；利用 01-Trie 边建树边贪心查询，总时间复杂度降至 <strong>O(31 · N) = O(N)</strong>！
      `,
      initialStateText: `01-Trie 树根节点初始化：31 层二进制字典树，自高位至低位执行反向贪心探测。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '最高位起始基准 (MSB Start)',
        valuesStr: 'bitIndex = 30 ➔ 从第 30 位最高有效位自顶向下展开',
      },
      {
        prefix: '└───',
        label: '相反位异或贡献公理 (XOR Greed Invariant)',
        valuesStr: 'want = status ^ 1 ➔ 若对应分支存在，ans |= (1 << i)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 01-Trie 拓扑插入 (Insert Binary Stream)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(31) Insert</span>',
      detailLines: [
        'for (int i = 30; i >= 0; i--) {',
        '  int path = (num >> i) & 1;',
        '  if (tree[cur][path] == 0) tree[cur][path] = ++cnt;',
        '  cur = tree[cur][path];',
        '}',
      ],
      fillLine: '定深 31 层插入：每个数值映射为一条长度为 31 的纯 0/1 拓扑路径',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 沿途高位贪心决策查询 (Greedy Max XOR Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Greedy Selection</span>',
      detailLines: [
        'int status = (num >> i) & 1; int want = status ^ 1;',
        'if (tree[cur][want] != 0) { ans |= (1 << i); cur = tree[cur][want]; }',
        'else { cur = tree[cur][status]; }',
      ],
      fillLine: '高位优先公理：只要高位能凑出 1，即使牺牲所有低位也必定全局最优',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 滚动维护与子数组最大异或和拓展 (Global Maximum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">O(N) Total</span>',
      detailLines: [
        '依次遍历数组：先在树中查询当前 num 与历史数字的最大异或值，再将 num 插入树中',
        'maxResult = Math.max(maxResult, query(num)); insert(num);',
      ],
      fillLine: '前缀和转化应用：结合 eor[i] 前缀异或和，同样可 O(N) 解决子数组最大异或和问题',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '01-Trie 插入与高位贪心求解推演流 (Binary Insertion ➔ Opposite Bit Choice ➔ Global Max)',
      subtitle: 'LeetCode 421 & Zuoshen Class 107 01-Trie Max XOR Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxResult; // 数组中任意两数异或所能达到的最大值',
      answerDescription: '时间复杂度严格为 O(31 * N)，空间复杂度为 O(31 * N * 2)，常数小效率极高。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
