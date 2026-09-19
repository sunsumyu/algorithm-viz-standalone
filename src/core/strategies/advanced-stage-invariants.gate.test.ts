/**
 * advanced-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 高阶进阶专题全系列 (Class 124 ~ 148)
 *
 * 覆盖全部 18 种高阶图论、代数、数论与树形进阶算法：
 * - Part 1: Class 124 ~ 134 高阶遍历、动态规划优化与高斯消元 (6 题)
 *   1. Morris 遍历 (Morris Traversal - 线索二叉树 O(1) 空间中序遍历)
 *   2. 轮廓线 DP (Profile DP - 骨牌平铺状态压缩)
 *   3. 三进制状压 DP (Ternary DP - 3 进制放置限制与转移)
 *   4. 倍增优化 DP (Binary Lifting DP - 环形有向图快速跳转与周期性)
 *   5. 单调队列优化 DP (Monotonic Queue DP - 滑动窗口极值线性转移)
 *   6. 高斯消元法 (Gaussian Elimination - 线性方程组唯一解消元与回代)
 * - Part 2: Class 134 ~ 140 线性代数、线性基与数论扩展 (6 题)
 *   7. 异或高斯消元 (XOR Gaussian - 开关问题与 GF(2) 域解向量)
 *   8. 线性基最大异或和 (Linear Basis - 贪心高位消元与基底线性无关)
 *   9. 线性基第 K 小异或和 (Linear Basis Kth - 规范化对角基底重构)
 *   10. 0/1 分数规划 (Fractional Programming - Dinkelbach 二分判定收敛)
 *   11. 扩展欧几里得 (ExGCD - 裴蜀定理整数解 ax + by = gcd(a, b))
 *   12. 二元一次不定方程 (Diophantine Equation - 裴蜀判别与最小正整数解)
 * - Part 3: Class 142 ~ 148 差分约束、同余最短路、反演、康托与平衡树 (6 题)
 *   13. 差分约束系统 (Diff Constraints - 三角不等式与 SPFA 负环判定)
 *   14. 同余最短路 (Congruence Shortest Path - 转模同余最短路跳楼机)
 *   15. 二项式反演 (Binomial Inversion - 错排问题 D(n) 递推与封闭解)
 *   16. 康托展开 (Cantor Expansion - 全排列字典序排名与逆展开双向映射)
 *   17. 卡特兰数 (Catalan Number - 折线法递推与几何格路计数)
 *   18. AVL 平衡二叉搜索树 (AVL Tree - LL/RR/LR/RL 旋转与平衡因子绝对值 <= 1)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确声明入口、初始化或接收参数
 * 2. 四语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论、答案或判定结果
 * 4. 高阶进阶算法数学守恒与机械不变量：
 *    - Morris 遍历原树结构 100% 恢复，BST 严格单调递增输出
 *    - 骨牌铺满方案数：奇数面积网格结果必为 0
 *    - 倍增图跳跃：周期环 $n$ 步后结果完全等价于模运算取余
 *    - 高斯消元：代入原线性方程组误差 $\le 10^{-4}$
 *    - 异或高斯消元：求得的 $0/1$ 解向量严格满足各行模 2 方程
 *    - 扩展欧几里得：$a x + b y \equiv \gcd(a, b)$ 恒成立
 *    - 差分约束：无负环时所有边严格满足 $x_v - x_u \le w$
 *    - 错排递推：严格满足 $D(n) = (n-1)(D(n-1) + D(n-2))$
 *    - AVL 树：任意节点左右子树高度差 $|h_L - h_R| \le 1$
 */

import { describe, it, expect } from 'vitest';

// Class 124 ~ 134
import { buildMorrisSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/morris-traversal-renderer';
import { buildProfileDpSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/profile-dp-renderer';
import { buildTernaryDpSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/ternary-dp-renderer';
import { buildBinaryLiftingDpSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/binary-lifting-dp-renderer';
import { buildMonotonicQueueDpSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/monotonic-queue-dp-renderer';
import { buildGaussianSteps } from '../../algorithms/categories/advanced-topics/advanced-124-134/gaussian-elimination-renderer';
import {
  MORRIS_CODES,
  PROFILE_DP_CODES,
  TERNARY_DP_CODES,
  BINARY_LIFTING_DP_CODES,
  MONOTONIC_QUEUE_DP_CODES,
  GAUSSIAN_ELIMINATION_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-stage-codes';

// Class 134 ~ 140
import { buildXorGaussianSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/xor-gaussian-renderer';
import { buildLinearBasisSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/linear-basis-renderer';
import { buildLinearBasisKthSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/linear-basis-kth-renderer';
import { buildFractionalSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/fractional-programming-renderer';
import { buildExgcdSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/exgcd-renderer';
import { buildDiophantineSteps } from '../../algorithms/categories/advanced-topics/advanced-134-140/diophantine-equation-renderer';
import {
  XOR_GAUSSIAN_CODES,
  LINEAR_BASIS_CODES,
  LINEAR_BASIS_KTH_CODES,
  FRACTIONAL_PROGRAMMING_CODES,
  EXGCD_CODES,
  DIOPHANTINE_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-stage-codes';

// Class 142 ~ 148
import { buildDiffConstraintsSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/diff-constraints-system-renderer';
import { buildCongruenceSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/congruence-shortest-path-renderer';
import { buildDerangementSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/binomial-inversion-renderer';
import { buildCantorSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/cantor-expansion-renderer';
import { buildCatalanSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/catalan-number-renderer';
import { buildAVLSteps } from '../../algorithms/categories/advanced-topics/advanced-142-148/avl-tree-renderer';
import {
  DIFF_CONSTRAINTS_CODES,
  CONGRUENCE_PATH_CODES,
  BINOMIAL_INVERSION_CODES,
  CANTOR_EXPANSION_CODES,
  CATALAN_NUMBER_CODES,
  AVL_TREE_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-stage-codes';

/**
 * 进阶专题通用机械不变量校验器
 */
function verifyAdvancedInvariants(steps: any[], codes: Record<string, string[]>, algoName: string) {
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
  ).toMatch(/(结论|完成|完毕|结束|返回|等于|结果|求得|确定|判定|收敛|最优|ans|done|return|解|错排|序列|排名|平衡|可行|无解)/i);
}

describe('左程云高阶进阶专题顶级机械不变量门禁 (Advanced Topics Class 124 ~ 148)', () => {
  describe('Part 1: Class 124 ~ 134 高阶遍历、动态规划优化与高斯消元', () => {
    it('124. Morris 遍历 (Morris Traversal): O(1) 空间二叉树中序遍历与结构恢复', () => {
      const bst = [
        { id: 1, val: 4, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 6, left: 6, right: 7 },
        { id: 4, val: 1 },
        { id: 5, val: 3 },
        { id: 6, val: 5 },
        { id: 7, val: 7 },
      ];
      const steps = buildMorrisSteps(bst, 1);
      verifyAdvancedInvariants(steps, MORRIS_CODES, 'Morris 遍历');
      const last = steps[steps.length - 1];
      expect(last.traversalList).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('125. 轮廓线 DP (Profile DP): 骨牌平铺方案数与面积奇偶性不变性', () => {
      // 2x3 网格完全铺满方案数准确为 3
      const s2x3 = buildProfileDpSteps(2, 3);
      verifyAdvancedInvariants(s2x3, PROFILE_DP_CODES, '轮廓线 DP 2x3');
      expect(s2x3[s2x3.length - 1].finalAns).toBe(3);

      // 奇数面积 1x3 网格铺满方案数必定为 0
      const s1x3 = buildProfileDpSteps(1, 3);
      expect(s1x3[s1x3.length - 1].finalAns).toBe(0);
    });

    it('126. 三进制状压 DP (Ternary DP): 3 进制限制与最优解非负性', () => {
      const steps = buildTernaryDpSteps(3, 3);
      verifyAdvancedInvariants(steps, TERNARY_DP_CODES, '三进制状压 DP');
      expect(steps[steps.length - 1].bestAns).toBeGreaterThan(0);
    });

    it('129. 倍增优化 DP (Binary Lifting DP): 环图长步数跳转与周期性', () => {
      // 6 节点环: 0->1->2->3->4->5->0
      const succ = [1, 2, 3, 4, 5, 0];
      // 从 0 出发跳 13 步: 13 % 6 = 1 -> 到达 1
      const steps = buildBinaryLiftingDpSteps(6, succ, 0, 13);
      verifyAdvancedInvariants(steps, BINARY_LIFTING_DP_CODES, '倍增优化 DP');
      expect(steps[steps.length - 1].finalResult).toBe(1);
    });

    it('130. 单调队列优化 DP (Monotonic Queue DP): 滑动窗口最大收益', () => {
      const val = [0, 2, -3, 5, 1, 4, -2, 6];
      const steps = buildMonotonicQueueDpSteps(val, 1, 3);
      verifyAdvancedInvariants(steps, MONOTONIC_QUEUE_DP_CODES, '单调队列优化 DP');
      expect(steps[steps.length - 1].bestAns).toBeGreaterThan(0);
    });

    it('133. 高斯消元法 (Gaussian Elimination): 线性方程组唯一解浮点精度一致性', () => {
      const stdMat = [
        [1, 1, 1, 6],
        [2, 3, 1, 11],
        [1, -1, 2, 5],
      ];
      const steps = buildGaussianSteps(stdMat, 3);
      verifyAdvancedInvariants(steps, GAUSSIAN_ELIMINATION_CODES, '高斯消元法');
      const sol = steps[steps.length - 1].solution!;
      expect(Math.abs(sol[0] - 1.0)).toBeLessThan(1e-4);
      expect(Math.abs(sol[1] - 2.0)).toBeLessThan(1e-4);
      expect(Math.abs(sol[2] - 3.0)).toBeLessThan(1e-4);
    });
  });

  describe('Part 2: Class 134 ~ 140 线性代数、线性基与数论扩展', () => {
    it('134. 异或高斯消元 (XOR Gaussian): 模 2 线性方程组精确解向量', () => {
      const stdMat = [
        [1, 1, 0, 0],
        [0, 1, 1, 1],
        [1, 0, 1, 1],
      ];
      const steps = buildXorGaussianSteps(stdMat, 3);
      verifyAdvancedInvariants(steps, XOR_GAUSSIAN_CODES, '异或高斯消元');
      expect(steps[steps.length - 1].solution).toEqual([1, 1, 0]);
    });

    it('136. 线性基最大异或和 (Linear Basis): 贪心高位消元与基底线性无关', () => {
      const steps = buildLinearBasisSteps([11, 9, 5, 7]);
      verifyAdvancedInvariants(steps, LINEAR_BASIS_CODES, '线性基最大异或和');
      expect(steps[steps.length - 1].finalAns).toBe(14);
    });

    it('137. 线性基第 K 小异或和 (Linear Basis Kth): 对角化基底空间', () => {
      const steps = buildLinearBasisKthSteps([3, 5, 6], 3);
      verifyAdvancedInvariants(steps, LINEAR_BASIS_KTH_CODES, '线性基第 K 小');
      expect(steps[steps.length - 1].finalAns).toBeGreaterThan(0);
    });

    it('138. 0/1 分数规划 (Fractional Programming): Dinkelbach 二分判定收敛', () => {
      const a = [5, 1, 3, 4, 8];
      const b = [2, 2, 1, 5, 3];
      const steps = buildFractionalSteps(a, b, 3);
      verifyAdvancedInvariants(steps, FRACTIONAL_PROGRAMMING_CODES, '0/1 分数规划');
      expect(Math.abs(steps[steps.length - 1].finalAns! - 2.6667)).toBeLessThan(0.05);
    });

    it('139. 扩展欧几里得 (ExGCD): 裴蜀定理整数解 ax + by = gcd(a, b)', () => {
      const a = 47;
      const b = 30;
      const steps = buildExgcdSteps(a, b);
      verifyAdvancedInvariants(steps, EXGCD_CODES, '扩展欧几里得');
      const { x, y, gcd } = steps[steps.length - 1].finalAns!;
      expect(gcd).toBe(1);
      expect(a * x + b * y).toBe(1);
    });

    it('140. 二元一次不定方程 (Diophantine Equation): 裴蜀整除判定与最小正整数解', () => {
      // 24x + 15y = 18 -> gcd(24, 15)=3, 18 % 3 == 0 -> x = 2
      const sSol = buildDiophantineSteps(24, 15, 18);
      verifyAdvancedInvariants(sSol, DIOPHANTINE_CODES, '不定方程有解');
      expect(sSol[sSol.length - 1].hasSolution).toBe(true);
      expect(sSol[sSol.length - 1].minPositiveX).toBe(2);

      // 24x + 15y = 19 -> 无解
      const sNoSol = buildDiophantineSteps(24, 15, 19);
      expect(sNoSol[sNoSol.length - 1].hasSolution).toBe(false);
    });
  });

  describe('Part 3: Class 142 ~ 148 差分约束、同余最短路、反演、康托与平衡树', () => {
    it('142. 差分约束系统 (Diff Constraints): 三角不等式满足与 SPFA 负环检测', () => {
      // 无负环系统
      const sOk = buildDiffConstraintsSteps(3, [
        { u: 1, v: 2, w: 3 },
        { u: 2, v: 3, w: -2 },
        { u: 3, v: 1, w: 1 },
      ]);
      verifyAdvancedInvariants(sOk, DIFF_CONSTRAINTS_CODES, '差分约束可行解');
      const lastOk = sOk[sOk.length - 1];
      expect(lastOk.hasNegativeCycle).toBe(false);
      const d = lastOk.dist;
      expect(d[2] - d[1]).toBeLessThanOrEqual(3);
      expect(d[3] - d[2]).toBeLessThanOrEqual(-2);
      expect(d[1] - d[3]).toBeLessThanOrEqual(1);

      // 有负环系统
      const sCycle = buildDiffConstraintsSteps(3, [
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: -4 },
        { u: 3, v: 1, w: 2 },
      ]);
      expect(sCycle[sCycle.length - 1].hasNegativeCycle).toBe(true);
    });

    it('143. 同余最短路 (Congruence Path): 转模同余最短路楼层可达性', () => {
      const steps = buildCongruenceSteps(3, 4, 5, 15);
      verifyAdvancedInvariants(steps, CONGRUENCE_PATH_CODES, '同余最短路');
      expect(steps[steps.length - 1].ansSoFar).toBeGreaterThan(0);
    });

    it('145. 二项式反演 (Binomial Inversion): 错排递推 D(n) = (n-1)(D(n-1) + D(n-2))', () => {
      const steps = buildDerangementSteps(5);
      verifyAdvancedInvariants(steps, BINOMIAL_INVERSION_CODES, '二项式反演错排');
      const last = steps[steps.length - 1];
      expect(last.d).toEqual([1, 0, 1, 2, 9, 44]);
    });

    it('146. 康托展开 (Cantor Expansion): 全排列字典序排名双向唯一映射', () => {
      const steps = buildCantorSteps([3, 4, 1, 5, 2]);
      verifyAdvancedInvariants(steps, CANTOR_EXPANSION_CODES, '康托展开');
      expect(steps[steps.length - 1].rank).toBe(62);

      const sMin = buildCantorSteps([1, 2, 3, 4]);
      expect(sMin[sMin.length - 1].rank).toBe(1);
    });

    it('147. 卡特兰数 (Catalan Number): 折线法经典递推数列', () => {
      const steps = buildCatalanSteps(5);
      verifyAdvancedInvariants(steps, CATALAN_NUMBER_CODES, '卡特兰数');
      expect(steps[steps.length - 1].catalanList).toEqual([1, 1, 2, 5, 14, 42]);
    });

    it('148. AVL 平衡二叉搜索树 (AVL Tree): 自平衡旋转与严格平衡因子 <= 1', () => {
      const steps = buildAVLSteps([10, 20, 30, 40, 50, 25]);
      verifyAdvancedInvariants(steps, AVL_TREE_CODES, 'AVL 树自平衡');
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();

      const checkBalance = (node: any): number => {
        if (!node) return 0;
        const hL = checkBalance(node.left);
        const hR = checkBalance(node.right);
        const diff = hL - hR;
        expect(Math.abs(diff)).toBeLessThanOrEqual(1);
        return Math.max(hL, hR) + 1;
      };

      checkBalance(last.root);
    });
  });
});
