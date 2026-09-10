/**
 * 左神算法通关课 Class 149 ~ 154 有序表全家桶自动化测试套件
 * 涵盖：SB 树、红黑树、跳表、Splay 伸展树、替罪羊树、FHQ-Treap
 */

import { describe, it, expect } from 'vitest';
import { buildSBSteps } from './sb-tree-renderer';
import { buildRBSteps } from './red-black-tree-renderer';
import { buildSkipListSteps } from './skiplist-renderer';
import { buildSplaySteps } from './splay-tree-renderer';
import { buildScapegoatSteps } from './scapegoat-tree-renderer';
import { buildFHQSteps } from './treap-fhq-renderer';
import {
  SB_TREE_CODES,
  RED_BLACK_CODES,
  SKIPLIST_CODES,
  SPLAY_TREE_CODES,
  SCAPEGOAT_CODES,
  FHQ_TREAP_CODES,
} from './advanced-149-154-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神有序表专题 (Class 149 ~ 154) 综合测试套件', () => {
  // 1. Class 149: SB 树
  describe('Class 149: Size Balanced Tree (SB 树)', () => {
    it('插入序列后 SB 树各节点应满足 size 平衡准则', () => {
      const steps = buildSBSteps([10, 20, 30, 40, 50, 25]);
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();

      const verifySB = (node: any) => {
        if (!node) return 0;
        const szL = verifySB(node.left);
        const szR = verifySB(node.right);
        expect(node.size).toBe(szL + szR + 1);
        return node.size;
      };

      verifySB(last.root);
      verify1BasedCodeLines(steps, SB_TREE_CODES);
    });
  });

  // 2. Class 150: 红黑树
  describe('Class 150: 红黑树 (Red-Black Tree)', () => {
    it('插入序列后红黑树根必须为黑且无连续红节点', () => {
      const steps = buildRBSteps([10, 20, 30, 15, 25]);
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();
      expect(last.root?.color).toBe('BLACK');

      const verifyNoConsecutiveRed = (node: any, parentColor: string) => {
        if (!node) return;
        if (parentColor === 'RED') {
          expect(node.color).toBe('BLACK');
        }
        verifyNoConsecutiveRed(node.left, node.color);
        verifyNoConsecutiveRed(node.right, node.color);
      };

      verifyNoConsecutiveRed(last.root, 'BLACK');
      verify1BasedCodeLines(steps, RED_BLACK_CODES);
    });
  });

  // 3. Class 151: 跳表
  describe('Class 151: 跳表 (SkipList)', () => {
    it('插入序列应保持节点有序且最高层不超限', () => {
      const steps = buildSkipListSteps([3, 7, 9, 12, 19, 21, 26]);
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(7);

      for (let i = 1; i < last.nodes.length; i++) {
        expect(last.nodes[i].val).toBeGreaterThan(last.nodes[i - 1].val);
        expect(last.nodes[i].levels).toBeLessThanOrEqual(last.maxLevel);
      }
      verify1BasedCodeLines(steps, SKIPLIST_CODES);
    });
  });

  // 4. Class 152: Splay 伸展树
  describe('Class 152: Splay 伸展树', () => {
    it('伸展目标节点后目标节点必须成为整棵树的新根', () => {
      const steps = buildSplaySteps([5, 4, 3, 2, 1], 1);
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();
      expect(last.root?.val).toBe(1);
      verify1BasedCodeLines(steps, SPLAY_TREE_CODES);
    });
  });

  // 5. Class 153: 替罪羊树
  describe('Class 153: 替罪羊树 (Scapegoat Tree)', () => {
    it('单调插入触发暴力重构后应形成绝对平衡的二叉树', () => {
      const steps = buildScapegoatSteps([10, 20, 30, 40, 50, 60], 0.7);
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();

      const verifyBST = (node: any, min: number, max: number) => {
        if (!node) return;
        expect(node.val).toBeGreaterThan(min);
        expect(node.val).toBeLessThan(max);
        verifyBST(node.left, min, node.val);
        verifyBST(node.right, node.val, max);
      };

      verifyBST(last.root, -Infinity, Infinity);
      verify1BasedCodeLines(steps, SCAPEGOAT_CODES);
    });
  });

  // 6. Class 154: FHQ-Treap
  describe('Class 154: 非旋 Treap (FHQ-Treap)', () => {
    it('按指定 key 分裂后左树全部元素 <= key 且右树全部元素 > key', () => {
      const items = [
        { val: 10, pri: 42 },
        { val: 20, pri: 17 },
        { val: 30, pri: 85 },
        { val: 40, pri: 23 },
        { val: 50, pri: 64 },
      ];
      const steps = buildFHQSteps(items, 25);
      // 检查 split 步骤 (倒数第3步)
      const splitStep = steps.find(s => s.splitKey === 25 && s.rootL && s.rootR);
      expect(splitStep).toBeDefined();

      const collectVals = (node: any, arr: number[]) => {
        if (!node) return;
        collectVals(node.left, arr);
        arr.push(node.val);
        collectVals(node.right, arr);
      };

      const lVals: number[] = [];
      const rVals: number[] = [];
      collectVals(splitStep?.rootL, lVals);
      collectVals(splitStep?.rootR, rVals);

      expect(lVals.every(v => v <= 25)).toBe(true);
      expect(rVals.every(v => v > 25)).toBe(true);
      verify1BasedCodeLines(steps, FHQ_TREAP_CODES);
    });
  });
});
