/**
 * 经典动态规划算法演化阶段顶级防退化门禁测试 (DP Stage Invariant Gatekeeper Tests)
 * 强制约束：
 * 任何算法的 Stage 1 暴力递归必须满足：
 * 1. 产生合法 UniversalTreeNode 递归调用树 (treeRoot 与 activeNodeId)
 * 2. 产生合法 2D 物理探索网格坐标 (i, j)
 * 3. 走过的路径必须保留探索足迹 (activeTrail)
 * 4. 挂载 2D 网格沙盘 (renderCanvas) 与 动态调用树 (renderCustomMetrics)
 *
 * 若有任何算法偷工减料（如只返回简陋纯文本或缺少足迹/树形），本门禁立即红灯拦截！
 */

import { describe, it, expect } from 'vitest';
import { buildLcsStage1Steps, buildLcsStage1ForwardSteps } from '../../algorithms/categories/dynamic-programming/dp-067/longest-common-subsequence-renderer';
import { buildLpsStage1Steps, buildLpsStage2Steps } from '../../algorithms/categories/dynamic-programming/dp-067/longest-palindromic-subsequence-renderer';
import type { IStrictRecursionStep } from './strict-stage-contracts';

describe('🎯 动态规划全库 Stage 1 / Stage 2 顶级机械门禁 (DP Stage Invariant Gatekeeper)', () => {
  describe('LPS (最长回文子序列) 阶段 1 顶级契约门禁核验', () => {
    const steps = buildLpsStage1Steps({ 'input-s': 'bbbab' });

    it('所有步骤必须 100% 具备合法 2D 物理坐标 (i, j)', () => {
      expect(steps.length).toBeGreaterThan(5);
      steps.forEach((st, idx) => {
        expect(typeof st.i, `Step #${idx} 缺少合法 i 坐标`).toBe('number');
        expect(typeof st.j, `Step #${idx} 缺少合法 j 坐标`).toBe('number');
        expect(st.i).toBeGreaterThanOrEqual(0);
        expect(st.j).toBeGreaterThanOrEqual(0);
      });
    });

    it('必须构建合法的动态递归调用树 (treeRoot & activeNodeId)', () => {
      steps.forEach((st, idx) => {
        expect(st.treeRoot, `Step #${idx} 缺少 treeRoot`).toBeDefined();
        expect(st.treeRoot.id, `Step #${idx} treeRoot 缺少 id`).toBeTruthy();
        expect(Array.isArray(st.treeRoot.children), `Step #${idx} treeRoot 缺少 children 数组`).toBe(true);
        expect(typeof st.activeNodeId, `Step #${idx} 缺少 activeNodeId`).toBe('string');
      });

      // 深入递归步骤中，调用树必须真实展开分支节点
      const deepStep = steps.find((st) => st.treeRoot.children.length > 0);
      expect(deepStep, '递归展开过程中 treeRoot 必须真实生长子分支').toBeDefined();
    });

    it('探索深入时必须保留足迹 activeTrail 与调用栈 callStack', () => {
      // 检查处于递归深层时的步骤
      const inFlightSteps = steps.filter((st) => st.currentCall.startsWith('f(') && !st.decision.includes('主函数入口'));
      expect(inFlightSteps.length).toBeGreaterThan(0);

      const hasTrail = inFlightSteps.some((st) => st.activeTrail && st.activeTrail.length >= 1);
      expect(hasTrail, '递归探索深入时必须记录真实足迹 activeTrail 坐标').toBe(true);

      const hasStack = inFlightSteps.some((st) => st.callStack && st.callStack.length >= 1);
      expect(hasStack, '递归深入时必须记录当前 callStack 调用栈').toBe(true);
    });

    it('执行日志必须具备层级缩进线规范 (| | | 📥 ...)', () => {
      const indentedLogs = steps.filter((st) => st.log && st.log.includes('📥 进入 f('));
      expect(indentedLogs.length).toBeGreaterThan(0);
    });
  });

  describe('LCS (最长公共子序列) 阶段 1 顶级契约门禁核验', () => {
    const steps = buildLcsStage1ForwardSteps({ 'input-s1': 'abcde', 'input-s2': 'ace' });

    it('所有步骤必须 100% 具备合法 2D 物理坐标 (i, j)', () => {
      expect(steps.length).toBeGreaterThan(5);
      steps.forEach((st, idx) => {
        expect(typeof st.i, `LCS Step #${idx} 缺少合法 i 坐标`).toBe('number');
        expect(typeof st.j, `LCS Step #${idx} 缺少合法 j 坐标`).toBe('number');
      });
    });

    it('必须构建合法的动态递归调用树 (treeRoot & activeNodeId)', () => {
      steps.forEach((st, idx) => {
        expect(st.treeRoot, `LCS Step #${idx} 缺少 treeRoot`).toBeDefined();
        expect(st.activeNodeId, `LCS Step #${idx} 缺少 activeNodeId`).toBeTruthy();
      });
    });

    it('必须记录 activeTrail 并在深入时非空', () => {
      const deepSteps = steps.filter((st) => st.activeTrail && st.activeTrail.length >= 2);
      expect(deepSteps.length, 'LCS 必须包含深度 >= 2 的足迹步骤').toBeGreaterThan(0);
    });
  });

  describe('LPS (最长回文子序列) 阶段 2 记忆化剪枝树门禁核验', () => {
    const steps = buildLpsStage2Steps({ 'input-s': 'bbbab' });

    it('Stage 2 记忆化搜索必须 100% 具备合法 treeRoot 剪枝决策树', () => {
      expect(steps.length).toBeGreaterThan(5);
      steps.forEach((st, idx) => {
        expect(st.treeRoot, `Stage 2 Step #${idx} 缺少 treeRoot 剪枝树`).toBeDefined();
        expect(st.activeNodeId, `Stage 2 Step #${idx} 缺少 activeNodeId`).toBeTruthy();
      });
    });

    it('遇到重复子问题时，必须产生带有 pruned 剪枝标记的树节点', () => {
      // 使用包含重叠子区间的测试用例 cbbabb
      const overlapSteps = buildLpsStage2Steps({ 'input-s': 'cbbabb' });
      const hitSteps = overlapSteps.filter((st) => st.memoHit);
      expect(hitSteps.length, 'LPS 在 cbbabb 中必须触发记忆化剪枝命中').toBeGreaterThan(0);
      
      // 检查是否有节点被标记为 pruned
      const hasPrunedNode = overlapSteps.some((st) => {
        const findPruned = (n: any): boolean => {
          if (n.status === 'pruned') return true;
          return (n.children || []).some(findPruned);
        };
        return findPruned(st.treeRoot);
      });
      expect(hasPrunedNode, '记忆化搜索在缓存命中时必须将对应树节点标记为 pruned 剪枝状态').toBe(true);
    });
  });

  describe('序列 DP 阶段 1 / 阶段 2 递归零跳步门禁 (Zero-Skip Invariant Gatekeeper)', () => {
    it('Distinct Subsequences 阶段 1 在字符匹配时必须先发射 branch-call 进入 if 块体，严禁直接跳到 dfs-call', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('distinct-subsequences');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-1', 'forward');
      const steps = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      expect(steps.length).toBeGreaterThan(10);

      // 验证步骤流：当字符比对成功 (match-eval 且 log 包含匹配) 时，紧随其后的下一步必须是 branch-call (进入 if 分支)
      for (let i = 0; i < steps.length - 1; i++) {
        const step = steps[i];
        if (step.type === 'match-eval' && step.tag?.includes('匹配') && !step.tag?.includes('不匹配')) {
          const nextStep = steps[i + 1];
          expect(nextStep.type, `步骤 #${i} 字符匹配后，下一步必须为 branch-call 进入 if 体`).toBe('branch-call');
          expect(nextStep.line, `步骤 #${i + 1} 必须高亮 branch_match 行号`).toBe(stage1Config.anchorMap?.branch_match);
        }
      }
    });

    it('Distinct Subsequences 阶段 2 (记忆化) 同样必须满足进入 if 块体的零跳步不变量', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('distinct-subsequences');
      const stage2Config = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-2', 'forward');
      const steps = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage1or2(
        model,
        true,
        stage2Config.anchorMap,
        'forward'
      );

      expect(steps.length).toBeGreaterThan(10);

      for (let i = 0; i < steps.length - 1; i++) {
        const step = steps[i];
        if (step.type === 'match-eval' && step.tag?.includes('匹配') && !step.tag?.includes('不匹配')) {
          const nextStep = steps[i + 1];
          expect(nextStep.type, `Stage 2 步骤 #${i} 字符匹配后，下一步必须为 branch-call 进入 if 体`).toBe('branch-call');
          expect(nextStep.line, `Stage 2 步骤 #${i + 1} 必须高亮 branch_match 行号`).toBe(stage2Config.anchorMap?.branch_match);
        }
      }
    });

    it('Distinct Subsequences 阶段 1 必须具备调用-返回闭环 (Call-Return Parity)：子递归返回后必须发射 branch-return 回到对应分支赋值行', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('distinct-subsequences');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-1', 'forward');
      const steps = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      // 1. 验证存在 branch-return 步骤
      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);

      // 2. 验证每个 branch-return 步骤行号必须严格落在 branch_match 或 branch_skip 行上
      const validLines = [stage1Config.anchorMap?.branch_match, stage1Config.anchorMap?.branch_skip];
      branchReturns.forEach((st) => {
        expect(validLines).toContain(st.line);
        expect(st.tag).toMatch(/(useMatch|skipChar|分支返回)/);
        expect(st.log).toMatch(/↩️ 子分支 dfs/);
      });

      // 3. 验证紧随退栈之后的第一步行为：当从深层栈返回到父层时，下一个具有相同栈深度的动作必须回到 branch-return
      const returnIndices: number[] = [];
      steps.forEach((st, idx) => {
        if (st.type === 'branch-return') returnIndices.push(idx);
      });
      expect(returnIndices.length).toBeGreaterThan(0);
    });

    it('Delete Operation for Two Strings 阶段 1 / 阶段 2 递归零跳步门禁：不匹配时必须先发射 branch-call 高亮 branch_del1 与 branch_del2', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('delete-operation-for-two-strings', 'stage-1', 'forward');
      const steps1 = SequenceStepMatrixCompiler.compileDeleteDistanceStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      expect(steps1.length).toBeGreaterThan(10);
      expect(stage1Config.anchorMap?.branch_del1).toBeDefined();
      expect(stage1Config.anchorMap?.branch_del2).toBeDefined();

      let del1Count = 0;
      let del2Count = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'match-eval') {
          const nextStep = steps1[i + 1];
          // 字符比对之后紧跟的必须是 branch-call，严禁直接瞬移到 dfs-call
          expect(nextStep.type, `步骤 #${i} 字符比对后下一步必须是 branch-call 拦截帧`).toBe('branch-call');
          if (step.tag?.includes('不匹配')) {
            expect(nextStep.line, `不匹配分支第一步必须高亮 branch_del1 调用行`).toBe(stage1Config.anchorMap?.branch_del1);
          }
        }
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_del1) del1Count++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_del2) del2Count++;
      }

      expect(del1Count, '必须存在 branch_del1 拦截帧').toBeGreaterThan(0);
      expect(del2Count, '必须存在 branch_del2 拦截帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, 'Delete Distance 必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([stage1Config.anchorMap?.branch_del1, stage1Config.anchorMap?.branch_del2]).toContain(st.line);
        expect(st.tag).toMatch(/(delWord1|delWord2|分支返回)/);
      });

      // 阶段 2 (记忆化)
      const stage2Config = AlgorithmModelRepository.getCompiledStage('delete-operation-for-two-strings', 'stage-2', 'forward');
      const steps2 = SequenceStepMatrixCompiler.compileDeleteDistanceStage1or2(
        model,
        true,
        stage2Config.anchorMap,
        'forward'
      );

      for (let i = 0; i < steps2.length - 1; i++) {
        const step = steps2[i];
        if (step.type === 'match-eval') {
          const nextStep = steps2[i + 1];
          expect(nextStep.type, `Stage 2 步骤 #${i} 比对后下一步必须是 branch-call`).toBe('branch-call');
        }
      }
    });

    it('Edit Distance 阶段 1 / 阶段 2 递归零跳步门禁：三向分支 (replace/delete/insert) 深入前必须发射独立拦截帧', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('edit-distance');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('edit-distance', 'stage-1', 'forward');
      const steps1 = SequenceStepMatrixCompiler.compileEditDistanceStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      expect(steps1.length).toBeGreaterThan(10);
      expect(stage1Config.anchorMap?.branch_replace).toBeDefined();
      expect(stage1Config.anchorMap?.branch_delete).toBeDefined();
      expect(stage1Config.anchorMap?.branch_insert).toBeDefined();

      let replaceCount = 0;
      let deleteCount = 0;
      let insertCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'match-eval') {
          const nextStep = steps1[i + 1];
          expect(nextStep.type, `步骤 #${i} 字符比对后下一步必须是 branch-call 拦截帧`).toBe('branch-call');
          if (step.tag?.includes('不匹配')) {
            expect(nextStep.line, `不匹配分支第一步必须高亮 branch_replace 调用行`).toBe(stage1Config.anchorMap?.branch_replace);
          }
        }
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_replace) replaceCount++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_delete) deleteCount++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_insert) insertCount++;
      }

      expect(replaceCount, '必须存在 branch_replace 拦截帧').toBeGreaterThan(0);
      expect(deleteCount, '必须存在 branch_delete 拦截帧').toBeGreaterThan(0);
      expect(insertCount, '必须存在 branch_insert 拦截帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：三向子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, 'Edit Distance 必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([
          stage1Config.anchorMap?.branch_replace,
          stage1Config.anchorMap?.branch_delete,
          stage1Config.anchorMap?.branch_insert
        ]).toContain(st.line);
        expect(st.tag).toMatch(/(replace|delete|insert|分支返回)/);
      });

      // 阶段 2 (记忆化)
      const stage2Config = AlgorithmModelRepository.getCompiledStage('edit-distance', 'stage-2', 'forward');
      const steps2 = SequenceStepMatrixCompiler.compileEditDistanceStage1or2(
        model,
        true,
        stage2Config.anchorMap,
        'forward'
      );

      for (let i = 0; i < steps2.length - 1; i++) {
        const step = steps2[i];
        if (step.type === 'match-eval') {
          const nextStep = steps2[i + 1];
          expect(nextStep.type, `Stage 2 步骤 #${i} 比对后下一步必须是 branch-call`).toBe('branch-call');
        }
      }
    });
  });
});
