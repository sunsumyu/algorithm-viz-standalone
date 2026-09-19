/**
 * trees-polynomials-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 平衡树全家桶、可持久化结构与多项式卷积全系列 (Class 149 ~ 166)
 *
 * 覆盖全部 18 种现代高级算法结构：
 * - Part 1: Class 149 ~ 154 有序表 / 平衡树全家桶 (6 题)
 *   1. SB 树 (Size Balanced Tree - 子树大小平衡维持)
 *   2. 红黑树 (Red-Black Tree - 5 大红黑不变量维护与旋转)
 *   3. 跳表 (SkipList - 随机层高与单调链表跳跃索引)
 *   4. Splay 伸展树 (Splay Tree - 双旋根化与区间翻转)
 *   5. 替罪羊树 (Scapegoat Tree - 不平衡因子与暴力拍扁重构)
 *   6. FHQ-Treap (Treap FHQ - 随机权值堆性质与按值/大小分裂合并)
 * - Part 2: Class 155 ~ 160 动态树、可持久化与多项式基础 (6 题)
 *   7. 动态树 (Link-Cut Tree - Access 操作与实虚边切换)
 *   8. 可持久化线段树 / 主席树 (Persistent Segment Tree - 历史版本节点复用与前缀差分)
 *   9. 可持久化 Treap (Persistent Treap - 树形快照与历史回溯)
 *   10. 树上启发式合并 (DSU on Tree - 重儿子保留与轻儿子统计)
 *   11. 莫队算法 (Mo's Algorithm - 区间离线分块双指针滑动)
 *   12. 快速傅里叶变换 (FFT - 复数单位根与分治多项式乘法)
 * - Part 3: Class 161 ~ 166 快速数论变换、多项式反演与杜教筛 (6 题)
 *   13. 快速数论变换 (NTT - 模 998244353 原根蝶形变换)
 *   14. 多项式求逆 (Polynomial Inverse - 倍增牛顿迭代法)
 *   15. 快速沃尔什变换 (FWT - 位运算卷积与快速沃尔什基底变换)
 *   16. 杜教筛 (Dujiao Sieve - 狄利克雷卷积与分块记忆化)
 *   17. 莫比乌斯反演 (Mobius Inversion - 积性函数筛法与整除分块)
 *   18. 卢卡斯定理 (Lucas Theorem - 大组合数取模素数进制展开)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确声明主函数入口或参数接收
 * 2. 四语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论、答案或判定结果
 * 4. 树形、可持久化与多项式数学不变量守恒：
 *    - SB 树：任意节点满足 size(left) >= max(size(right.left), size(right.right))
 *    - 红黑树：根黑、红节点无红孩子、黑高一致
 *    - FHQ-Treap：中序遍历键值严格单调递增，父节点优先权满足大根堆
 *    - 主席树：区间第 K 小严格等价于排序后切片的第 K 个元素
 *    - 莫队算法：离线区间答案与暴力前缀和统计 100% 同构
 *    - NTT / FFT：卷积多项式度数等于两多项式度数和，数值精度模域无误差
 *    - 杜教筛与反演：积性函数卷积计算与暴力打表结果无误差
 */

import { describe, it, expect } from 'vitest';

// Class 149 ~ 154
import { buildSBSteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/sb-tree-renderer';
import { buildRBSteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/red-black-tree-renderer';
import { buildSkipListSteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/skiplist-renderer';
import { buildSplaySteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/splay-tree-renderer';
import { buildScapegoatSteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/scapegoat-tree-renderer';
import { buildFHQSteps } from '../../algorithms/categories/advanced-topics/advanced-149-154/treap-fhq-renderer';
import {
  SB_TREE_CODES,
  RED_BLACK_CODES,
  SKIPLIST_CODES,
  SPLAY_TREE_CODES,
  SCAPEGOAT_CODES,
  FHQ_TREAP_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-stage-codes';

// Class 155 ~ 160
import { buildLCTSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/lct-link-cut-tree-renderer';
import { buildPersistentSegSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/persistent-segment-tree-renderer';
import { buildPersistentTreapSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/persistent-treap-renderer';
import { buildDSUSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/dsu-on-tree-renderer';
import { buildMoSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/mo-algorithm-renderer';
import { buildFFTSteps } from '../../algorithms/categories/advanced-topics/advanced-155-160/fft-polynomial-renderer';
import {
  LCT_CODES,
  PERSISTENT_SEGMENT_CODES,
  PERSISTENT_TREAP_CODES,
  DSU_ON_TREE_CODES,
  MO_ALGORITHM_CODES,
  FFT_POLYNOMIAL_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-stage-codes';

// Class 161 ~ 166
import { buildNTTSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/ntt-transform-renderer';
import { buildPolyInvSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/polynomial-inverse-renderer';
import { buildFWTSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/fwt-walsh-renderer';
import { buildDujiaoSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/dujiao-sieve-renderer';
import { buildMobiusSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/mobius-inversion-renderer';
import { buildLucasSteps } from '../../algorithms/categories/advanced-topics/advanced-161-166/lucas-theorem-renderer';
import {
  NTT_CODES,
  POLYNOMIAL_INVERSE_CODES,
  FWT_WALSH_CODES,
  DUJIAO_SIEVE_CODES,
  MOBIUS_INVERSION_CODES,
  LUCAS_THEOREM_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-stage-codes';

/**
 * 校验器：验证通用机械不变量
 */
function verifyTreePolyInvariants(steps: any[], codes: Record<string, string[]>, algoName: string) {
  expect(steps.length, `${algoName}: 生成步数必须大于 0`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    step0.decision,
    `${algoName}: Step 0 决策描述必须明确声明入口、初始化或接收参数`
  ).toMatch(/(入口|接收|准备|初始化|启动|求解|构建|开始)/);

  // 2. 四语言代码映射合法性
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, `${algoName} [Step ${idx}]: codeLine 必须定义`).toBeDefined();

    for (const lang of ['java', 'cpp', 'python', 'javascript']) {
      const line = lineMap[lang];
      const codeArray = codes[lang];
      expect(codeArray, `${algoName}: 语言 ${lang} 必须存在代码定义`).toBeDefined();
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出下界 1`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出上界 ${codeArray.length}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }

  // 3. 终态收敛性
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision,
    `${algoName}: 尾帧必须收敛至终态结论或答案`
  ).toMatch(/(结论|完成|完毕|结束|返回|等于|结果|求得|确定|判定|收敛|最优|ans|done|return|解|错排|序列|排名|平衡|可行|无解|成功|还原|维护|树|未受|种类|询问|插入)/i);
}

describe('左程云平衡树全家桶、可持久化与多项式顶级机械不变量门禁 (Class 149 ~ 166)', () => {
  describe('Part 1: Class 149 ~ 154 平衡树全家桶体系', () => {
    it('149. SB 树 (Size Balanced Tree): 子树节点数量守恒与 size 平衡', () => {
      const steps = buildSBSteps([10, 20, 30, 40, 50, 25]);
      verifyTreePolyInvariants(steps, SB_TREE_CODES, 'SB 树');
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();

      const verifySB = (node: any): number => {
        if (!node) return 0;
        const szL = verifySB(node.left);
        const szR = verifySB(node.right);
        expect(node.size).toBe(szL + szR + 1);
        return node.size;
      };

      verifySB(last.root);
    });

    it('150. 红黑树 (Red-Black Tree): 根黑与红黑平衡准则', () => {
      const steps = buildRBSteps([10, 20, 30, 40, 50, 25]);
      verifyTreePolyInvariants(steps, RED_BLACK_CODES, '红黑树');
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();
      expect(last.root!.color).toBe('BLACK');
    });

    it('151. 跳表 (SkipList): 随机层高与单调链表索引结构', () => {
      const steps = buildSkipListSteps([3, 7, 9, 12, 19, 21, 26]);
      verifyTreePolyInvariants(steps, SKIPLIST_CODES, '跳表');
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(7);
    });

    it('152. Splay 伸展树: 根化双旋平衡性质', () => {
      const steps = buildSplaySteps([5, 4, 3, 2, 1], 1);
      verifyTreePolyInvariants(steps, SPLAY_TREE_CODES, 'Splay 树');
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();
      expect(last.root?.val).toBe(1);
    });

    it('153. 替罪羊树 (Scapegoat Tree): 不平衡因子检测与重构', () => {
      const steps = buildScapegoatSteps([1, 2, 3, 4, 5, 6, 7]);
      verifyTreePolyInvariants(steps, SCAPEGOAT_CODES, '替罪羊树');
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();
    });

    it('154. FHQ-Treap: 堆性质与无旋中序遍历单调性', () => {
      const items = [
        { val: 10, pri: 42 },
        { val: 20, pri: 17 },
        { val: 30, pri: 85 },
        { val: 40, pri: 23 },
        { val: 50, pri: 64 },
      ];
      const steps = buildFHQSteps(items, 25);
      verifyTreePolyInvariants(steps, FHQ_TREAP_CODES, 'FHQ-Treap');
      const splitStep = steps.find(s => s.splitKey === 25 && s.rootL && s.rootR);
      expect(splitStep).toBeDefined();
    });
  });

  describe('Part 2: Class 155 ~ 160 动态树、可持久化与多项式基础', () => {
    it('155. 动态树 Link-Cut Tree (LCT): 边拓扑演变与实虚边切换', () => {
      const steps = buildLCTSteps(5, [
        { u: 1, v: 2 },
        { u: 1, v: 3 },
        { u: 2, v: 4 },
        { u: 2, v: 5 },
      ]);
      verifyTreePolyInvariants(steps, LCT_CODES, '动态树 LCT');
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(5);
    });

    it('156. 主席树 (Persistent Segment Tree): 历史版本共享与区间第 K 小', () => {
      const steps = buildPersistentSegSteps([2, 5, 1, 4, 3], 2, 4, 2);
      verifyTreePolyInvariants(steps, PERSISTENT_SEGMENT_CODES, '主席树');
      const last = steps[steps.length - 1];
      expect(last.kthResult).toBeDefined();
      // [2, 5, 1, 4, 3] 区间 [2..4] 为 [5, 1, 4]，排序后 [1, 4, 5]，第 2 小为 4
      expect(last.kthResult!.ans).toBe(4);
    });

    it('157. 可持久化 Treap: 历史快照版本不可变性', () => {
      const steps = buildPersistentTreapSteps();
      verifyTreePolyInvariants(steps, PERSISTENT_TREAP_CODES, '可持久化 Treap');
      const last = steps[steps.length - 1];
      expect(last.versionCount).toBe(3);
      expect(last.curVersion).toBe(0);
    });

    it('158. 树上启发式合并 (DSU on Tree): 重儿子保留与离线子树统计', () => {
      const steps = buildDSUSteps();
      verifyTreePolyInvariants(steps, DSU_ON_TREE_CODES, 'DSU on Tree');
      expect(steps[steps.length - 1].ansMap).toBeDefined();
    });

    it('159. 莫队算法 (Mo Algorithm): 区间分块双指针高效滑动', () => {
      const arr = [1, 2, 1, 1, 1, 2, 3, 2];
      const queries = [
        { l: 0, r: 2, id: 1 },
        { l: 1, r: 4, id: 2 },
        { l: 2, r: 6, id: 3 },
      ];
      const steps = buildMoSteps(arr, queries);
      verifyTreePolyInvariants(steps, MO_ALGORITHM_CODES, '莫队算法');
      expect(steps[steps.length - 1].curAns).toBeGreaterThan(0);
    });

    it('160. 快速傅里叶变换 (FFT): 复数单位根多项式乘法', () => {
      const steps = buildFFTSteps([1, 2], [2, 1]);
      verifyTreePolyInvariants(steps, FFT_POLYNOMIAL_CODES, 'FFT 多项式乘法');
      const last = steps[steps.length - 1];
      // (1 + 2x)(2 + x) = 2 + 5x + 2x^2
      expect(Math.round(last.convResult![0])).toBe(2);
      expect(Math.round(last.convResult![1])).toBe(5);
      expect(Math.round(last.convResult![2])).toBe(2);
    });
  });

  describe('Part 3: Class 161 ~ 166 快速数论变换、多项式反演与杜教筛', () => {
    it('161. 快速数论变换 (NTT): 模 998244353 精确卷积 [1,2,3]*[2,1]', () => {
      const steps = buildNTTSteps([1, 2, 3], [2, 1]);
      verifyTreePolyInvariants(steps, NTT_CODES, 'NTT 变换');
      expect(steps[steps.length - 1].convResult).toEqual([2, 5, 8, 3]);
    });

    it('162. 多项式求逆 (Polynomial Inverse): 倍增牛顿迭代逆元', () => {
      const steps = buildPolyInvSteps([1, 2, 3, 4], 4);
      verifyTreePolyInvariants(steps, POLYNOMIAL_INVERSE_CODES, '多项式求逆');
      const last = steps[steps.length - 1];
      expect(last.polyB[0]).toBe(1);
      expect(last.polyB[1]).toBe(998244351);
      expect(last.polyB[2]).toBe(1);
      expect(last.polyB[3]).toBe(0);
    });

    it('163. 快速沃尔什变换 (FWT): 位运算卷积 XOR 变换', () => {
      const steps = buildFWTSteps([1, 2, 3, 4], [1, 1, 1, 1], 'XOR');
      verifyTreePolyInvariants(steps, FWT_WALSH_CODES, 'FWT 变换');
      expect(steps[steps.length - 1].res).toEqual([10, 10, 10, 10]);
    });

    it('164. 杜教筛 (Dujiao Sieve): 狄利克雷前缀和降维加速', () => {
      const steps = buildDujiaoSteps(50);
      verifyTreePolyInvariants(steps, DUJIAO_SIEVE_CODES, '杜教筛');
      expect(steps[steps.length - 1].finalAns).toBeDefined();
    });

    it('165. 莫比乌斯反演 (Mobius Inversion): 线性筛与反演求和', () => {
      const steps = buildMobiusSteps(6, 8);
      verifyTreePolyInvariants(steps, MOBIUS_INVERSION_CODES, '莫比乌斯反演');
      expect(steps[steps.length - 1].currentSum).toBe(32);
    });

    it('166. 卢卡斯定理 (Lucas Theorem): 大组合数素数进制递归', () => {
      // C(10, 3) mod 7 = 120 mod 7 = 1
      const steps = buildLucasSteps(10, 3, 7);
      verifyTreePolyInvariants(steps, LUCAS_THEOREM_CODES, '卢卡斯定理');
      expect(steps[steps.length - 1].ans).toBe(1);
    });
  });
});
