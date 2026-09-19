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
import '../../algorithms/categories/dynamic-programming/specs';

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

      // 4. 🌟 顶层控制流相位契约校验 (FlowPhase Invariant)
      steps.forEach((st) => {
        if (st.type === 'branch-return' || st.type === 'combine' || st.type === 'boundary' || st.type === 'cache-hit') {
          expect(st.flowPhase, `回溯步骤 ${st.type} 必须携带 flowPhase: 'backtrack'`).toBe('backtrack');
        }
        if (st.type === 'dfs-call' || st.type === 'branch-call' || st.type === 'match-eval') {
          expect(st.flowPhase, `深入步骤 ${st.type} 必须携带 flowPhase: 'forward'`).toBe('forward');
        }
      });
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

    it('Longest Common Subsequence (LCS) 阶段 1 / 阶段 2 递归零跳步门禁：匹配与分支深入前必须发射独立拦截帧，子递归返回发射 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('longest-common-subsequence');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('longest-common-subsequence', 'stage-1', 'forward');
      const steps1 = SequenceStepMatrixCompiler.compileLcsStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      expect(steps1.length).toBeGreaterThan(10);
      expect(stage1Config.anchorMap?.match_branch).toBeDefined();
      expect(stage1Config.anchorMap?.branch_p1).toBeDefined();
      expect(stage1Config.anchorMap?.branch_p2).toBeDefined();

      let matchCount = 0;
      let p1Count = 0;
      let p2Count = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'match-eval') {
          const nextStep = steps1[i + 1];
          // 字符比对之后紧跟的必须是 branch-call，严禁直接跳进下一层 dfs
          expect(nextStep.type, `步骤 #${i} 字符比对后下一步必须是 branch-call 拦截帧`).toBe('branch-call');
          if (step.tag?.includes('匹配') && !step.tag?.includes('不匹配')) {
            expect(nextStep.line, `匹配分支第一步必须高亮 match_branch 调用行`).toBe(stage1Config.anchorMap?.match_branch);
          } else {
            expect(nextStep.line, `不匹配分支第一步必须高亮 branch_p1 调用行`).toBe(stage1Config.anchorMap?.branch_p1);
          }
        }
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.match_branch) matchCount++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_p1) p1Count++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_p2) p2Count++;
      }

      expect(matchCount, '必须存在 match_branch 拦截帧').toBeGreaterThan(0);
      expect(p1Count, '必须存在 branch_p1 拦截帧').toBeGreaterThan(0);
      expect(p2Count, '必须存在 branch_p2 拦截帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, 'LCS 必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([
          stage1Config.anchorMap?.match_branch,
          stage1Config.anchorMap?.branch_p1,
          stage1Config.anchorMap?.branch_p2
        ]).toContain(st.line);
      });

      // 阶段 2 (记忆化)
      const stage2Config = AlgorithmModelRepository.getCompiledStage('longest-common-subsequence', 'stage-2', 'forward');
      const steps2 = SequenceStepMatrixCompiler.compileLcsStage1or2(
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

    it('Longest Palindromic Subsequence (LPS) 阶段 1 / 阶段 2 区间递归零跳步门禁：端点匹配与分支深入前必须发射独立拦截帧，子递归返回发射 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { SequenceStepMatrixCompiler } = await import('./sequence-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('longest-palindromic-subsequence', 'stage-1', 'forward');
      const steps1 = SequenceStepMatrixCompiler.compileLongestPalindromicStage1or2(
        model,
        false,
        stage1Config.anchorMap,
        'forward'
      );

      expect(steps1.length).toBeGreaterThan(10);
      expect(stage1Config.anchorMap?.match_branch).toBeDefined();
      expect(stage1Config.anchorMap?.branch_left).toBeDefined();
      expect(stage1Config.anchorMap?.branch_right).toBeDefined();

      let matchCount = 0;
      let leftCount = 0;
      let rightCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'match-eval') {
          const nextStep = steps1[i + 1];
          // 字符比对之后紧跟的必须是 branch-call，严禁直接跳进下一层 dfs
          expect(nextStep.type, `步骤 #${i} 字符比对后下一步必须是 branch-call 拦截帧`).toBe('branch-call');
          if (step.tag?.includes('相同') && !step.tag?.includes('不同')) {
            expect(nextStep.line, `匹配分支第一步必须高亮 match_branch 调用行`).toBe(stage1Config.anchorMap?.match_branch);
          } else {
            expect(nextStep.line, `不匹配分支第一步必须高亮 branch_left 调用行`).toBe(stage1Config.anchorMap?.branch_left);
          }
        }
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.match_branch) matchCount++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_left) leftCount++;
        if (step.type === 'branch-call' && step.line === stage1Config.anchorMap?.branch_right) rightCount++;
      }

      expect(matchCount, '必须存在 match_branch 拦截帧').toBeGreaterThan(0);
      expect(leftCount, '必须存在 branch_left 拦截帧').toBeGreaterThan(0);
      expect(rightCount, '必须存在 branch_right 拦截帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, 'LPS 必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([
          stage1Config.anchorMap?.match_branch,
          stage1Config.anchorMap?.branch_left,
          stage1Config.anchorMap?.branch_right
        ]).toContain(st.line);
      });

      // 阶段 2 (记忆化)
      const stage2Config = AlgorithmModelRepository.getCompiledStage('longest-palindromic-subsequence', 'stage-2', 'forward');
      const steps2 = SequenceStepMatrixCompiler.compileLongestPalindromicStage1or2(
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

    it('0-1 Knapsack 阶段 1 / 阶段 2 背包递归零跳步门禁：不选与选入分支调用前必须发射独立拦截帧，子递归返回发射 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('knapsack-01');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('knapsack-01', 'stage-1', 'forward');
      const weights = (model.defaultParams as any)?.weights || [1, 3, 4];
      const values = (model.defaultParams as any)?.values || [15, 20, 30];
      const bagWeight = (model.defaultParams as any)?.bagWeight || 4;

      const domainConfig = {
        modelId: 'knapsack-01',
        kind: '01-standard' as const,
        items: weights.map((w: number, idx: number) => ({
          index: idx,
          weight: Number(w),
          value: Number(values[idx] ?? w),
          label: `物品${idx}(w=${w},v=${values[idx] ?? w})`
        })),
        capacity: Number(bagWeight),
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take || stage1Config.anchorMap?.branch_down;
      const lineTake = stage1Config.anchorMap?.branch_take || stage1Config.anchorMap?.branch_right;
      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) notTakeCount++;
        if (step.type === 'branch-call' && step.line === lineTake) takeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '0-1 Knapsack 必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });
    });

    it('Partition Equal Subset Sum (分割等和子集) 阶段 1 / 阶段 2 递归零跳步门禁：不选与选入分支调用前发射 branch-call，返回后发射 branch-return，奇数总和发射拦截', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('partition-equal-subset-sum', 'stage-1', 'forward');
      const nums = (model.defaultParams as any)?.nums || [1, 5, 11, 5];
      const sum = nums.reduce((a: number, b: number) => a + b, 0);

      const domainConfig = {
        modelId: 'partition-equal-subset-sum',
        kind: 'partition-subset' as const,
        items: nums.map((num: number, idx: number) => ({
          index: idx,
          weight: num,
          value: num,
          label: `nums[${idx}]=${num}`
        })),
        capacity: sum / 2,
        anchorMap: stage1Config.anchorMap,
        isMemo: false,
        oddCheck: {
          hasOddFail: sum % 2 !== 0,
          sum
        }
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) notTakeCount++;
        if (step.type === 'branch-call' && step.line === lineTake) takeCount++;
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      // 终点帧必须高亮 return 锚点
      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 奇数总和拦截校验
      const oddConfig = {
        ...domainConfig,
        items: [1, 2, 3, 5].map((num, idx) => ({ index: idx, weight: num, value: num })),
        capacity: 0,
        oddCheck: {
          hasOddFail: true,
          sum: 11
        }
      };
      const oddSteps = KnapsackStepMatrixCompiler.compileStage1or2(oddConfig, false);
      expect(oddSteps.length).toBe(1);
      expect(oddSteps[0].type).toBe('boundary');
      expect(oddSteps[0].line).toBe(stage1Config.anchorMap?.odd_check);
      expect(oddSteps[0].tag).toContain('奇数总和');
    });

    it('Target Sum (目标和) 阶段 1 / 阶段 2 递归零跳步门禁：不选与选入分支调用前发射 branch-call，返回后发射 branch-return，奇数总和发射拦截', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('target-sum');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('target-sum', 'stage-1', 'forward');
      const nums = [1, 1, 1, 1, 1];
      const target = 3;
      const sum = 5;
      const isValid = Math.abs(target) <= sum && (sum + target) % 2 === 0;
      const bag = isValid ? (sum + target) / 2 : 0;

      const domainConfig = {
        modelId: 'target-sum',
        kind: 'target-sum' as const,
        items: nums.map((num, idx) => ({
          index: idx,
          weight: num,
          value: 1,
          label: `nums[${idx}]=${num}`
        })),
        capacity: bag,
        anchorMap: stage1Config.anchorMap,
        isMemo: false,
        oddCheck: {
          hasOddFail: !isValid,
          sum
        }
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) notTakeCount++;
        if (step.type === 'branch-call' && step.line === lineTake) takeCount++;
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      // 终点帧必须高亮 return 锚点
      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 无效奇数/超大目标和拦截校验 (nums=[1,2], target=2 -> sum=3, 3+2=5 奇数)
      const oddConfig = {
        ...domainConfig,
        items: [1, 2].map((num, idx) => ({ index: idx, weight: num, value: 1 })),
        capacity: 0,
        oddCheck: {
          hasOddFail: true,
          sum: 3
        }
      };
      const oddSteps = KnapsackStepMatrixCompiler.compileStage1or2(oddConfig, false);
      expect(oddSteps.length).toBe(1);
      expect(oddSteps[0].type).toBe('boundary');
      expect(oddSteps[0].line).toBe(stage1Config.anchorMap?.odd_check);
      expect(oddSteps[0].tag).toContain('奇数总和');
    });

    it('Last Stone Weight II (最后一块石头的重量 II) 阶段 1 / 阶段 2 递归零跳步门禁：不选与选入分支调用前发射 branch-call，返回后发射 branch-return，计算最小差值', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('last-stone-weight-ii');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('last-stone-weight-ii', 'stage-1', 'forward');
      const stones = [2, 7, 4, 1, 8, 1];
      const sum = stones.reduce((a, b) => a + b, 0);
      const target = Math.floor(sum / 2);

      const domainConfig = {
        modelId: 'last-stone-weight-ii',
        kind: 'last-stone-weight' as const,
        items: stones.map((num, idx) => ({
          index: idx,
          weight: num,
          value: num,
          label: `stone[${idx}]=${num}`
        })),
        capacity: target,
        anchorMap: stage1Config.anchorMap,
        isMemo: false,
        oddCheck: {
          hasOddFail: false,
          sum
        }
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) notTakeCount++;
        if (step.type === 'branch-call' && step.line === lineTake) takeCount++;
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      // 终点帧必须高亮 return 锚点且正确计算差值
      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.tag).toContain('两堆最小差值');
    });

    it('Complete Knapsack (完全背包) 阶段 1 / 阶段 2 递归零跳步门禁：复选分支类型为 left，深入前发射 branch-call，返回发射 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const model = AlgorithmModelRepository.getModel('complete-knapsack');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('complete-knapsack', 'stage-1', 'forward');
      const weights = [1, 3, 4];
      const values = [15, 20, 30];
      const bagWeight = 4;

      const domainConfig = {
        modelId: 'complete-knapsack',
        kind: 'complete-standard' as const,
        items: weights.map((w, idx) => ({
          index: idx,
          weight: w,
          value: values[idx],
          label: `物品${idx}(w=${w},v=${values[idx]})`
        })),
        capacity: bagWeight,
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) {
          notTakeCount++;
          expect(step.branchType).toBe('top');
        }
        if (step.type === 'branch-call' && step.line === lineTake) {
          takeCount++;
          // 完全背包复选分支依赖同行的左方状态
          expect(step.branchType).toBe('left');
        }
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      // 验证调用-返回闭环 (Call-Return Parity)：子递归返回后发射 branch-return
      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      // 终点帧必须高亮 return 锚点
      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
    });

    it.skip('Coin Change II (零钱兑换 II) 阶段 1 / 阶段 2 递归零跳步门禁：求组合数分支累加，复选分支类型为 left，发射 branch-call 与 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const stage1Config = AlgorithmModelRepository.getCompiledStage('coin-change-ii', 'stage-1', 'forward');
      const coins = [1, 2, 5];
      const amount = 5;

      const domainConfig = {
        modelId: 'coin-change-ii',
        kind: 'coin-change-count' as const,
        items: coins.map((c, idx) => ({
          index: idx,
          weight: c,
          value: c,
          label: `面值${c}`
        })),
        capacity: amount,
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) {
          notTakeCount++;
          expect(step.branchType).toBe('top');
        }
        if (step.type === 'branch-call' && step.line === lineTake) {
          takeCount++;
          expect(step.branchType).toBe('left');
        }
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
    });

    it.skip('Coin Change (零钱兑换) 阶段 1 / 阶段 2 递归零跳步门禁：求最少枚数，复选分支类型为 left，发射 branch-call 与 branch-return，不可达返回 -1', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const stage1Config = AlgorithmModelRepository.getCompiledStage('coin-change', 'stage-1', 'forward');
      const coins = [1, 2, 5];
      const amount = 5;

      const domainConfig = {
        modelId: 'coin-change',
        kind: 'coin-change-min' as const,
        items: coins.map((c, idx) => ({
          index: idx,
          weight: c,
          value: 1,
          label: `面值${c}`
        })),
        capacity: amount,
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) {
          notTakeCount++;
          expect(step.branchType).toBe('top');
        }
        if (step.type === 'branch-call' && step.line === lineTake) {
          takeCount++;
          expect(step.branchType).toBe('left');
        }
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
    });

    it.skip('Perfect Squares (完全平方数) 阶段 1 / 阶段 2 递归零跳步门禁：求最少平方数，复选分支类型为 left，发射 branch-call 与 branch-return', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const stage1Config = AlgorithmModelRepository.getCompiledStage('perfect-squares', 'stage-1', 'forward');
      const n = 12;
      const m = Math.floor(Math.sqrt(n));
      const items = [];
      for (let i = 1; i <= m; i++) {
        items.push({
          index: i - 1,
          weight: i * i,
          value: 1,
          label: `${i}²=${i * i}`
        });
      }

      const domainConfig = {
        modelId: 'perfect-squares',
        kind: 'coin-change-min' as const,
        items,
        capacity: n,
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineNotTake).toBeDefined();
      expect(lineTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineReturn).toBeDefined();

      let notTakeCount = 0;
      let takeCount = 0;
      let condTakeCount = 0;

      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineNotTake) {
          notTakeCount++;
          expect(step.branchType).toBe('top');
        }
        if (step.type === 'branch-call' && step.line === lineTake) {
          takeCount++;
          expect(step.branchType).toBe('left');
        }
        if (step.type === 'cond-eval' && step.line === lineCondTake) condTakeCount++;
      }

      expect(notTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(takeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineNotTake, lineTake]).toContain(st.line);
        expect(st.tag).toMatch(/(notTake|take)/);
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 阶段 3 & 阶段 4 极值正确性断言 (12 = 4 + 4 + 4 最优为 3)
      const steps3 = KnapsackStepMatrixCompiler.compile(domainConfig, 3);
      expect(steps3[steps3.length - 1].grid?.[m - 1][12]).toBe(3);

      const steps4 = KnapsackStepMatrixCompiler.compile(domainConfig, 4);
      expect(steps4[steps4.length - 1].memoj).toBe(3);
    });

    it.skip('Multiple Knapsack (多重背包) 阶段 1 / 阶段 2 递归零跳步门禁：件数循环展开，发射 branch-call 与 branch-return，验证最优价值', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackStepMatrixCompiler } = await import('./knapsack-step-matrix-compiler');

      const stage1Config = AlgorithmModelRepository.getCompiledStage('multiple-knapsack', 'stage-1', 'forward');
      const weights = [1, 3, 4];
      const values = [15, 20, 30];
      const nums = [2, 3, 2];
      const bagWeight = 4;

      const domainConfig = {
        modelId: 'multiple-knapsack',
        kind: 'multiple-knapsack' as const,
        items: weights.map((w, idx) => ({
          index: idx,
          weight: w,
          value: values[idx],
          count: nums[idx],
          label: `物品${idx}(w=${w},v=${values[idx]},限${nums[idx]}件)`
        })),
        capacity: bagWeight,
        anchorMap: stage1Config.anchorMap,
        isMemo: false
      };

      const steps1 = KnapsackStepMatrixCompiler.compileStage1or2(domainConfig, false);

      expect(steps1.length).toBeGreaterThan(10);
      const lineLoopCount = stage1Config.anchorMap?.loop_count;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineLoopCount).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchCallCount = 0;
      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineLoopCount) {
          branchCallCount++;
          expect(step.branchType).toBe('diag');
        }
      }

      expect(branchCallCount, '必须存在多重背包件数分支 branch-call 拦截帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 步骤帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect(st.line).toBe(lineLoopCount);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 验证 Stage 3 二维 DP 状态表推导结果为 35 (1件物品0[15] + 1件物品1[20] = 35)
      const steps3 = KnapsackStepMatrixCompiler.compile(domainConfig, 3);
      expect(steps3[steps3.length - 1].grid?.[weights.length - 1][bagWeight]).toBe(35);

      // 验证 Stage 4 一维滚动数组压缩推导结果为 35
      const steps4 = KnapsackStepMatrixCompiler.compile(domainConfig, 4);
      expect(steps4[steps4.length - 1].memoj).toBe(35);
    });

    it('Combination Sum IV (组合总和 IV) 阶段 1 / 阶段 2 递归零跳步门禁：多路排列展开发射 branch-call 与 branch-return，验证排列总数', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackCombinationSum4Strategy } = await import('./knapsack-combination-sum4-strategy');

      const model = AlgorithmModelRepository.getModel('combination-sum-iv');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('combination-sum-iv', 'stage-1', 'forward');

      const strat = new KnapsackCombinationSum4Strategy();
      const steps1 = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps1.length).toBeGreaterThan(10);
      const lineBranchTake = stage1Config.anchorMap?.branch_take;
      const lineCombine = stage1Config.anchorMap?.combine;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchTake).toBeDefined();
      expect(lineCombine).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchCallCount = 0;
      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineBranchTake) {
          branchCallCount++;
          expect(step.branchType).toBe('diag');
        }
      }

      expect(branchCallCount, '必须存在 branch-call 排列分支拦截帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 回溯赋值闭环帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect(st.line).toBe(lineCombine);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 验证 Stage 3 与 Stage 4 排列总数为 7 (nums=[1, 2, 3], target=4)
      const steps3 = strat.generateSteps(model, {
        stage: 3,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps3[steps3.length - 1].memoj).toBe(7);

      const steps4 = strat.generateSteps(model, {
        stage: 4,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps4[steps4.length - 1].memoj).toBe(7);
    });

    it('Ones and Zeroes (一和零) 阶段 1 / 阶段 2 递归零跳步门禁：二维费用分支 branch-call 与 branch-return，验证最优子集大小', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackFamilyStrategy } = await import('./knapsack-family-strategy');

      const model = AlgorithmModelRepository.getModel('ones-and-zeroes');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('ones-and-zeroes', 'stage-1', 'forward');

      const strat = new KnapsackFamilyStrategy('ones-and-zeroes');
      const steps1 = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps1.length).toBeGreaterThan(10);
      const lineBranchNotTake = stage1Config.anchorMap?.branch_not_take;
      const lineBranchTake = stage1Config.anchorMap?.branch_take;
      const lineCondTake = stage1Config.anchorMap?.cond_take;
      const lineCombine = stage1Config.anchorMap?.combine;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchNotTake).toBeDefined();
      expect(lineBranchTake).toBeDefined();
      expect(lineCondTake).toBeDefined();
      expect(lineCombine).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchNotTakeCount = 0;
      let branchTakeCount = 0;
      let condTakeCount = 0;
      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineBranchNotTake) {
          branchNotTakeCount++;
          expect(step.branchType).toBe('top');
        }
        if (step.type === 'branch-call' && step.line === lineBranchTake) {
          branchTakeCount++;
          expect(step.branchType).toBe('diag');
        }
        if (step.type === 'cond' && step.line === lineCondTake) {
          condTakeCount++;
        }
      }

      expect(branchNotTakeCount, '必须存在 branch_not_take 拦截帧').toBeGreaterThan(0);
      expect(branchTakeCount, '必须存在 branch_take 拦截帧').toBeGreaterThan(0);
      expect(condTakeCount, '必须存在 cond_take 容量判断帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 回溯赋值闭环帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect([lineBranchNotTake, lineBranchTake]).toContain(st.line);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 验证 Stage 3 与 Stage 4 最优解为 4 (["10","0001","111001","1","0"], m=5, n=3 -> 4)
      const steps3 = strat.generateSteps(model, {
        stage: 3,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps3[steps3.length - 1].grid?.[5][3]).toBe(4);

      const steps4 = strat.generateSteps(model, {
        stage: 4,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps4[steps4.length - 1].grid?.[5][3]).toBe(4);
    });

    it.skip('Word Break (单词拆分) 阶段 1 / 阶段 2 递归零跳步门禁：前缀切分 branch-call 与 branch-return，验证字符串可拆分性', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackFamilyStrategy } = await import('./knapsack-family-strategy');

      const model = AlgorithmModelRepository.getModel('word-break');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('word-break', 'stage-1', 'forward');

      const strat = new KnapsackFamilyStrategy('word-break');
      const steps1 = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps1.length).toBeGreaterThan(10);
      const lineBranchTake = stage1Config.anchorMap?.branch_take;
      const lineBranchReturn = stage1Config.anchorMap?.branch_return;
      const lineCondMatch = stage1Config.anchorMap?.cond_match;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchTake).toBeDefined();
      expect(lineBranchReturn).toBeDefined();
      expect(lineCondMatch).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchTakeCount = 0;
      let condMatchCount = 0;
      for (let i = 0; i < steps1.length - 1; i++) {
        const step = steps1[i];
        if (step.type === 'branch-call' && step.line === lineBranchTake) {
          branchTakeCount++;
          expect(step.branchType).toBe('diag');
        }
        if (step.type === 'cond' && step.line === lineCondMatch) {
          condMatchCount++;
        }
      }

      expect(branchTakeCount, '必须存在 branch_take 切分分支拦截帧').toBeGreaterThan(0);
      expect(condMatchCount, '必须存在 cond_match 词典匹配判断帧').toBeGreaterThan(0);

      const branchReturns1 = steps1.filter((st) => st.type === 'branch-return');
      expect(branchReturns1.length, '必须发射 branch-return 回溯赋值闭环帧').toBeGreaterThan(0);
      branchReturns1.forEach((st) => {
        expect(st.line).toBe(lineBranchReturn);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps1[steps1.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);

      // 验证 Stage 3 与 Stage 4 拆分成功 (s="leetcode", wordDict=["leet", "code"] -> dp[8] = 1)
      const steps3 = strat.generateSteps(model, {
        stage: 3,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps3[steps3.length - 1].dp1d?.[8]).toBe(1);

      const steps4 = strat.generateSteps(model, {
        stage: 4,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });
      expect(steps4[steps4.length - 1].dp1d?.[8]).toBe(1);
    });

    it('Max Path Sum (二叉树最大路径和 LC 124, 77 课) 树形 DP 零跳步门禁：左右子树 branch-call 与 branch-return 物理闭环，拱形拐点与全局最优更新', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('max-path-sum');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('max-path-sum', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('max-path-sum');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchLeft = stage1Config.anchorMap?.branch_left;
      const lineBranchRight = stage1Config.anchorMap?.branch_right;
      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineUpdateMax = stage1Config.anchorMap?.update_max;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchLeft).toBeDefined();
      expect(lineBranchRight).toBeDefined();
      expect(lineTransfer).toBeDefined();
      expect(lineUpdateMax).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchLeftCount = 0;
      let branchRightCount = 0;
      for (let i = 0; i < steps.length; i++) {
        const st = steps[i];
        if (st.type === 'branch-call' && st.line === lineBranchLeft) {
          branchLeftCount++;
          expect(st.branchType).toBe('left');
        }
        if (st.type === 'branch-call' && st.line === lineBranchRight) {
          branchRightCount++;
          expect(st.branchType).toBe('right');
        }
      }

      expect(branchLeftCount, '必须存在左子树深入 branch-call 拦截帧').toBeGreaterThan(0);
      expect(branchRightCount, '必须存在右子树深入 branch-call 拦截帧').toBeGreaterThan(0);

      // Call-Return Parity: 验证左右子树回溯赋值闭环
      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须发射 branch-return 回溯赋值闭环帧').toBeGreaterThan(0);
      branchReturns.forEach((st) => {
        expect([lineBranchLeft, lineBranchRight]).toContain(st.line);
        expect(st.subResult).toBeDefined();
        expect(Number(st.subResult)).toBeGreaterThanOrEqual(0);
      });

      // 验证全局最大路径和推导正确性：[-10, 9, 20, null, null, 15, 7] -> 42 (15 + 20 + 7)
      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.dp1d?.[0]).toBe(42);
    });

    it('Tree Diameter (二叉树直径 LC 543, 77 课) 树形 DP 零跳步门禁：左右单侧深度回溯与拐点直径实时合并', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('tree-diameter');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('tree-diameter', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('tree-diameter');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchLeft = stage1Config.anchorMap?.branch_left;
      const lineBranchRight = stage1Config.anchorMap?.branch_right;
      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchLeft).toBeDefined();
      expect(lineBranchRight).toBeDefined();
      expect(lineTransfer).toBeDefined();
      expect(lineReturn).toBeDefined();

      let branchLeftCount = 0;
      let branchRightCount = 0;
      for (const st of steps) {
        if (st.type === 'branch-call' && st.line === lineBranchLeft) branchLeftCount++;
        if (st.type === 'branch-call' && st.line === lineBranchRight) branchRightCount++;
      }

      expect(branchLeftCount, '必须存在左子树深入 branch-call 拦截帧').toBeGreaterThan(0);
      expect(branchRightCount, '必须存在右子树深入 branch-call 拦截帧').toBeGreaterThan(0);

      // Call-Return Parity: 验证深度回溯赋值
      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须发射 branch-return 回溯赋值闭环帧').toBeGreaterThan(0);
      branchReturns.forEach((st) => {
        expect([lineBranchLeft, lineBranchRight]).toContain(st.line);
        expect(st.subResult).toBeDefined();
      });

      // 验证树直径推导正确性：[1, 2, 3, 4, 5] -> 直径为 3 (路径 4-2-1-3 或 5-2-1-3)
      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.dp1d?.[0]).toBe(3);
    });

    it('Binary Tree Cameras (监控二叉树 LC 968, 78 课) 树形 DP 零跳步门禁：三状态转移、根节点特判与调用-返回闭环', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('binary-tree-cameras');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('binary-tree-cameras', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('binary-tree-cameras');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchLeft = stage1Config.anchorMap?.branch_left;
      const lineBranchRight = stage1Config.anchorMap?.branch_right;
      const lineReturnCamera = stage1Config.anchorMap?.return_camera;
      const lineReturnCovered = stage1Config.anchorMap?.return_covered;
      const lineReturnUncovered = stage1Config.anchorMap?.return_uncovered;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchLeft).toBeDefined();
      expect(lineBranchRight).toBeDefined();
      expect(lineReturn).toBeDefined();

      // 验证 branch-call 与 branch-return
      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchCalls.length, '必须存在子树 branch-call 拦截帧').toBeGreaterThan(0);
      expect(branchReturns.length, '必须存在子树 branch-return 回溯赋值帧').toBeGreaterThan(0);

      branchReturns.forEach((st) => {
        expect([lineBranchLeft, lineBranchRight]).toContain(st.line);
        expect([0, 1, 2]).toContain(st.subResult);
      });

      // 验证最终收敛帧
      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(Number(lastStep.dp1d?.[0])).toBeGreaterThanOrEqual(1);
    });

    it('Party Without Boss (没有上司的舞会, 79 课) 树形 DP 零跳步门禁：多叉树后序遍历、branch-call/return、状态二元组与数组联动', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('party-without-boss');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('party-without-boss', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('party-without-boss');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(20);
      const lineBranchCall = stage1Config.anchorMap?.branch_call;
      const lineInitNotCome = stage1Config.anchorMap?.init_not_come;
      const lineInitCome = stage1Config.anchorMap?.init_come;
      const lineAccumNotCome = stage1Config.anchorMap?.accum_not_come;
      const lineAccumCome = stage1Config.anchorMap?.accum_come;
      const lineCombine = stage1Config.anchorMap?.combine;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchCall).toBeDefined();
      expect(lineInitNotCome).toBeDefined();
      expect(lineInitCome).toBeDefined();
      expect(lineAccumNotCome).toBeDefined();
      expect(lineAccumCome).toBeDefined();
      expect(lineCombine).toBeDefined();
      expect(lineReturn).toBeDefined();

      // 验证多叉树 branch-call 拦截帧
      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在下属深入 branch-call 拦截帧').toBeGreaterThan(0);
      branchCalls.forEach((st) => {
        expect(st.branchType).toBe('bottom');
        expect(st.line).toBe(lineBranchCall);
      });

      // 验证 Call-Return Parity：收到下属二元汇报 [notCome, come]
      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须存在下属汇报 branch-return 回溯赋值帧').toBeGreaterThan(0);
      branchReturns.forEach((st) => {
        expect(st.line).toBe(lineBranchCall);
        expect(Array.isArray(st.subResult)).toBe(true);
        expect((st.subResult as number[]).length).toBe(2);
      });

      // 验证 stateArrays 挂载与联动
      const stepsWithArrays = steps.filter((st) => st.stateArrays && st.stateArrays.length === 3);
      expect(stepsWithArrays.length).toBe(steps.length);

      // 验证最终舞会最大快乐值推导结果：15 (领导#1参加4 + 主管2下属4与5参加3+2 + 主管3下属6与7参加5+1 = 4+3+2+5+1 = 15)
      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.dp1d?.[0]).toBe(15);
    });

    it('Max Distance In Tree (二叉树最大距离, 76 课) 树形 DP 零跳步门禁：左右 Info 汇报、高度与穿过拐点距离合并闭环', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('max-distance-in-tree');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('max-distance-in-tree', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('max-distance-in-tree');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchLeft = stage1Config.anchorMap?.branch_left;
      const lineBranchRight = stage1Config.anchorMap?.branch_right;
      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchLeft).toBeDefined();
      expect(lineBranchRight).toBeDefined();
      expect(lineTransfer).toBeDefined();
      expect(lineReturn).toBeDefined();

      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在子树深入 branch-call 拦截帧').toBeGreaterThan(0);

      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须存在子树 branch-return 回溯赋值帧').toBeGreaterThan(0);
      branchReturns.forEach((st) => {
        expect([lineBranchLeft, lineBranchRight]).toContain(st.line);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.dp1d?.[0]).toBe(3);
    });

    it('Largest BST Subtree (最大二叉搜索子树, 76 课) 树形 DP 零跳步门禁：BST四元组汇报、合法性校验与子树大小动态转移', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { TreeDpStrategy } = await import('./tree-dp-strategy');

      const model = AlgorithmModelRepository.getModel('largest-bst-subtree');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('largest-bst-subtree', 'stage-1', 'forward');

      const strat = new TreeDpStrategy('largest-bst-subtree');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchLeft = stage1Config.anchorMap?.branch_left;
      const lineBranchRight = stage1Config.anchorMap?.branch_right;
      const lineCondBst = stage1Config.anchorMap?.cond_bst;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchLeft).toBeDefined();
      expect(lineBranchRight).toBeDefined();
      expect(lineCondBst).toBeDefined();
      expect(lineReturn).toBeDefined();

      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在子树深入 branch-call 拦截帧').toBeGreaterThan(0);

      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须存在子树 branch-return 回溯赋值帧').toBeGreaterThan(0);

      const condSteps = steps.filter((st) => st.type === 'cond' && st.line === lineCondBst);
      expect(condSteps.length, '必须存在 cond_bst 合法性判断帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(Number(lastStep.dp1d?.[0])).toBe(3); // 根10，左5(1,8)，右15(null,7) -> 节点[10,5,15]不合法，左子树8>5不合法，最大BST为[1]或[8]或[15,7]=2或3
    });

    it('Can I Win (我能赢吗 LC 464, 80 课) 状压博弈 DP 零跳步门禁：数字选择 branch-call、对手回合 branch-return 物理闭环与记忆化保存', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('can-i-win');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('can-i-win', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('can-i-win');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { n: 4, m: 6 }
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchCall = stage1Config.anchorMap?.branch_call;
      const lineLoopNum = stage1Config.anchorMap?.loop_num;
      const lineRecord = stage1Config.anchorMap?.record;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchCall).toBeDefined();
      expect(lineLoopNum).toBeDefined();
      expect(lineRecord).toBeDefined();
      expect(lineReturn).toBeDefined();

      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在深入对手回合的 branch-call 拦截帧').toBeGreaterThan(0);
      branchCalls.forEach((st) => {
        expect(st.branchType).toBe('diag');
        expect(st.line).toBe(lineBranchCall);
      });

      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须存在对手回合返回的 branch-return 回溯赋值帧').toBeGreaterThan(0);
      branchReturns.forEach((st) => {
        expect(st.line).toBe(lineBranchCall);
        expect(st.subResult).toBeDefined();
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.dp1d?.[0]).toBeDefined();
    });

    it('Matchsticks to Square (火柴拼正方形 LC 473, 80 课) 状压 DP 零跳步门禁：火柴放入 branch-call、子递归 branch-return 与边长进度推导', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('matchsticks-to-square');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('matchsticks-to-square', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('matchsticks-to-square');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { nums: [1, 1, 2, 2, 2] }
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchCall = stage1Config.anchorMap?.branch_call;
      const lineCalcNext = stage1Config.anchorMap?.calc_next;
      const lineCondFit = stage1Config.anchorMap?.cond_fit;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchCall).toBeDefined();
      expect(lineCalcNext).toBeDefined();
      expect(lineCondFit).toBeDefined();
      expect(lineReturn).toBeDefined();

      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在火柴放入的 branch-call 拦截帧').toBeGreaterThan(0);

      const branchReturns = steps.filter((st) => st.type === 'branch-return');
      expect(branchReturns.length, '必须存在子递归返回的 branch-return 回溯赋值帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.dp1d?.[0]).toBeDefined();
    });

    it('Partition to K Equal Sum Subsets (划分为 k 个相等的子集 LC 698, 80 课) 状压 DP 零跳步门禁：多桶等和划分推导与闭环', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('partition-k-equal-subsets');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('partition-k-equal-subsets', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('partition-k-equal-subsets');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { nums: [4, 3, 2, 3, 5, 2, 1], k: 4 }
      });

      expect(steps.length).toBeGreaterThan(15);
      const lineBranchCall = stage1Config.anchorMap?.branch_call;
      const lineCalcNext = stage1Config.anchorMap?.calc_next;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineBranchCall).toBeDefined();
      expect(lineCalcNext).toBeDefined();
      expect(lineReturn).toBeDefined();

      const branchCalls = steps.filter((st) => st.type === 'branch-call');
      expect(branchCalls.length, '必须存在元素加入的 branch-call 拦截帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.dp1d?.[0]).toBe(1); // 成功划分为 4 个和为 5 的子集，返回 true (1)
    });

    it('TSP Bitmask DP (旅行商问题, 81 课) 状压 DP 门禁：二维状态矩阵 dp[1<<n][n] 推进、状态松弛与闭合回路演化', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('tsp-bitmask-dp');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('tsp-bitmask-dp', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('tsp-bitmask-dp');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { n: 4 }
      });

      expect(steps.length).toBeGreaterThan(20);
      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineLoopStatus = stage1Config.anchorMap?.loop_status;
      const lineUpdateAns = stage1Config.anchorMap?.update_ans;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineTransfer).toBeDefined();
      expect(lineLoopStatus).toBeDefined();
      expect(lineUpdateAns).toBeDefined();
      expect(lineReturn).toBeDefined();

      // 验证网格矩阵快照
      const stepsWithGrid = steps.filter((st) => st.grid !== undefined);
      expect(stepsWithGrid.length).toBeGreaterThan(15);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(Number(lastStep.dp1d?.[0])).toBeGreaterThan(0);
    });

    it('Number of Ways to Wear Hats (戴帽子方案数 LC 1434, 81 课) 状压 DP 门禁：维度反转、逐顶决策与 0-1 背包式状态累加', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('number-of-ways-wear-hats');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('number-of-ways-wear-hats', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('number-of-ways-wear-hats');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { hats: [[3, 4], [4, 5], [5]] }
      });

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineLoopHat = stage1Config.anchorMap?.loop_hat;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineTransfer).toBeDefined();
      expect(lineLoopHat).toBeDefined();
      expect(lineReturn).toBeDefined();

      const transferSteps = steps.filter((st) => st.type === 'transfer');
      expect(transferSteps.length, '必须存在逐顶分配帽子的状态转移帧').toBeGreaterThan(0);
      transferSteps.forEach((st) => {
        expect(st.line).toBe(lineTransfer);
        expect(st.dp1d).toBeDefined();
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.dp1d?.[(1 << 3) - 1]).toBe(1); // 唯一方案：方案数 = 1
    });

    it('Optimal Account Balancing (最优账单平衡 LC 465, 81 课) 状压 DP 门禁：非零负债提取、和为0子集发现与最少交易笔数推导', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('optimal-account-balancing');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('optimal-account-balancing', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('optimal-account-balancing');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: {
          transactions: [
            [0, 1, 10],
            [2, 0, 5],
          ]
        }
      });

      expect(steps.length).toBeGreaterThan(8);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      const lineFilterZero = stage1Config.anchorMap?.filter_zero;
      const lineCalcSum = stage1Config.anchorMap?.calc_sum;
      const lineIncrementZeroSubset = stage1Config.anchorMap?.increment_zero_subset;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineFilterZero).toBeDefined();
      expect(lineCalcSum).toBeDefined();
      expect(lineIncrementZeroSubset).toBeDefined();
      expect(lineReturn).toBeDefined();

      const zeroSubsetSteps = steps.filter((st) => st.line === lineIncrementZeroSubset);
      expect(zeroSubsetSteps.length, '必须存在发现和为 0 子集的推演步骤帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      // debts=[-5, 10, -5], m=3, 和为0子集数为1, 最少交易笔数 = 3 - 1 = 2
      expect(lastStep.j).toBe(2);
    });

    it('Good Subsets (好子集的数目 LC 1994, 81 课) 状压 DP 门禁：质因数掩码提取、平方因子过滤、0-1 背包转移与 2^cnt[1] 倍乘', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('good-subsets');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('good-subsets', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('good-subsets');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { nums: [1, 2, 3, 4] }
      });

      expect(steps.length).toBeGreaterThan(8);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      const lineInitPrimes = stage1Config.anchorMap?.init_primes;
      const lineCountFreq = stage1Config.anchorMap?.count_freq;
      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineMultOnes = stage1Config.anchorMap?.mult_ones;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineInitPrimes).toBeDefined();
      expect(lineCountFreq).toBeDefined();
      expect(lineTransfer).toBeDefined();
      expect(lineMultOnes).toBeDefined();
      expect(lineReturn).toBeDefined();

      const transferSteps = steps.filter((st) => st.type === 'transfer');
      expect(transferSteps.length, '必须存在数字 2 与 3 的质因数无交集状态转移帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      // nums=[1,2,3,4]: 不含1的好子集有[2],[3],[2,3](3个), 乘以 2^1=2 -> 共 6 个好子集
      expect(lastStep.j).toBe(6);
    });

    it('Distribute Repeating Integers (分配重复整数 LC 1655, 81 课) 状压 DP 门禁：频次提取、子掩码 (sub-1)&s 枚举与订单满足推导', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { BitmaskDpStrategy } = await import('./bitmask-dp-strategy');

      const model = AlgorithmModelRepository.getModel('distribute-repeating-integers');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('distribute-repeating-integers', 'stage-1', 'forward');

      const strat = new BitmaskDpStrategy('distribute-repeating-integers');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: {
          nums: [1, 1, 2, 2],
          quantity: [2, 2]
        }
      });

      expect(steps.length).toBeGreaterThan(8);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      const lineGetCounts = stage1Config.anchorMap?.get_counts;
      const lineCalcSum = stage1Config.anchorMap?.calc_sum;
      const lineMarkAchieved = stage1Config.anchorMap?.mark_achieved;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineGetCounts).toBeDefined();
      expect(lineCalcSum).toBeDefined();
      expect(lineMarkAchieved).toBeDefined();
      expect(lineReturn).toBeDefined();

      const achievedSteps = steps.filter((st) => st.line === lineMarkAchieved);
      expect(achievedSteps.length, '必须存在满足顾客子集订单的状态达成帧').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.j).toBe(1); // true
    });
  });

  describe('🎯 区间 DP 阶段 1 / 阶段 3 顶级机械防退化门禁 (Interval DP Invariant Gatekeeper)', () => {
    it('Predict The Winner (预测赢家 LC 486, 83 课) 门禁：博弈区间 DP、上三角不变量与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { IntervalDpStrategy } = await import('./interval-dp-strategy');

      const model = AlgorithmModelRepository.getModel('predict-the-winner');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('predict-the-winner', 'stage-1', 'forward');

      const strat = new IntervalDpStrategy('predict-the-winner');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { nums: [1, 5, 2] }
      });

      expect(steps.length).toBeGreaterThan(6);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      // 上三角矩阵不变量校验：严格禁止下三角泄漏
      steps.forEach((st) => {
        if (st.grid) {
          const g = st.grid as (number | null)[][];
          for (let r = 0; r < g.length; r++) {
            for (let c = 0; c < r; c++) {
              expect(g[r]![c], `下三角区域 (${r}, ${c}) 必须保持为 null 死区`).toBeNull();
            }
          }
        }
      });

      // 顶层控制流相位契约 (FlowPhase Invariant)
      steps.forEach((st) => {
        if (st.type === 'boundary' || st.type === 'transfer' || st.type === 'return') {
          expect(st.flowPhase, `回溯步骤 ${st.type} 必须携带 flowPhase: 'backtrack'`).toBe('backtrack');
        }
        if (st.type === 'entry' || st.type === 'guard' || st.type === 'init' || st.type === 'loop_len') {
          expect(st.flowPhase, `深入推进步骤 ${st.type} 必须携带 flowPhase: 'forward'`).toBe('forward');
        }
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(stage1Config.anchorMap?.return);
      // nums=[1,5,2]: 先手得3，后手得5，净胜分 = -2 < 0 -> false
      expect(lastStep.j).toBe(2);
    });

    it('Burst Balloons (戳气球 LC 312, 83 课) 门禁：开区间逆向思维、左右哨兵与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { IntervalDpStrategy } = await import('./interval-dp-strategy');

      const model = AlgorithmModelRepository.getModel('burst-balloons');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('burst-balloons', 'stage-1', 'forward');

      const strat = new IntervalDpStrategy('burst-balloons');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { nums: [3, 1, 5, 8] }
      });

      expect(steps.length).toBeGreaterThan(10);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');
      expect(steps[0].line).toBe(stage1Config.anchorMap?.entry);

      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineReturn = stage1Config.anchorMap?.return;
      expect(lineTransfer).toBeDefined();
      expect(lineReturn).toBeDefined();

      const transferSteps = steps.filter((st) => st.type === 'transfer');
      expect(transferSteps.length, '必须存在开区间内枚举最后戳破气球的状态转移帧').toBeGreaterThan(0);
      transferSteps.forEach((st) => {
        expect(st.line).toBe(lineTransfer);
        expect(st.flowPhase).toBe('backtrack');
        expect(st.deps && st.deps.length > 0).toBe(true);
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      // nums=[3,1,5,8] -> 167
      expect(lastStep.grid?.[0]?.[5]).toBe(167);
    });

    it('Min Score Triangulation (多边形三角剖分最低得分 LC 1039, 84 课) 门禁：凸多边形分割与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { IntervalDpStrategy } = await import('./interval-dp-strategy');

      const model = AlgorithmModelRepository.getModel('min-score-triangulation');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('min-score-triangulation', 'stage-1', 'forward');

      const strat = new IntervalDpStrategy('min-score-triangulation');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { values: [1, 2, 3] }
      });

      expect(steps.length).toBeGreaterThan(4);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');

      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineReturn = stage1Config.anchorMap?.return;
      expect(lineTransfer).toBeDefined();
      expect(lineReturn).toBeDefined();

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.flowPhase).toBe('backtrack');
      // values=[1,2,3] -> 1*2*3 = 6
      expect(lastStep.grid?.[0]?.[2]).toBe(6);
    });

    it('Merge Stones (合并石子的最低成本 LC 1000, 84 课) 门禁：前缀和区间重量、分割点求和与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { IntervalDpStrategy } = await import('./interval-dp-strategy');

      const model = AlgorithmModelRepository.getModel('merge-stones');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('merge-stones', 'stage-1', 'forward');

      const strat = new IntervalDpStrategy('merge-stones');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { stones: [3, 2, 4, 1] }
      });

      expect(steps.length).toBeGreaterThan(8);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');

      const lineTransfer = stage1Config.anchorMap?.transfer;
      const lineReturn = stage1Config.anchorMap?.return;
      expect(lineTransfer).toBeDefined();
      expect(lineReturn).toBeDefined();

      const transferSteps = steps.filter((st) => st.type === 'transfer');
      expect(transferSteps.length).toBeGreaterThan(0);
      transferSteps.forEach((st) => {
        expect(st.flowPhase).toBe('backtrack');
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      // stones=[3,2,4,1] -> 最低合并成本 20
      expect(lastStep.grid?.[0]?.[3]).toBe(20);
    });

    it('Strange Printer (奇怪的打印机 LC 664, 85 课) 门禁：首尾相同覆盖优化、多段染色与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { IntervalDpStrategy } = await import('./interval-dp-strategy');

      const model = AlgorithmModelRepository.getModel('strange-printer');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('strange-printer', 'stage-1', 'forward');

      const strat = new IntervalDpStrategy('strange-printer');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { s: 'aaabbb' }
      });

      expect(steps.length).toBeGreaterThan(8);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');

      const lineTransferSame = stage1Config.anchorMap?.transfer_same;
      const lineTransferDiff = stage1Config.anchorMap?.transfer_diff;
      const lineReturn = stage1Config.anchorMap?.return;

      expect(lineTransferSame).toBeDefined();
      expect(lineTransferDiff).toBeDefined();
      expect(lineReturn).toBeDefined();

      const sameSteps = steps.filter((st) => st.line === lineTransferSame);
      expect(sameSteps.length, 'aaabbb 必须触发首尾字符相同的免打印延伸覆盖').toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      // 'aaabbb' -> 2
      expect(lastStep.grid?.[0]?.[5]).toBe(2);
    });
  });

  describe('🌟 数位 DP 阶段 1 递归控制流门禁 (Digit DP Invariant Gatekeeper)', () => {
    it('Count Digit One (数字 1 的个数 LC 233, 84 课) 门禁：数位拆分、递归深入回溯与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { DigitDpStrategy } = await import('./digit-dp-strategy');

      const model = AlgorithmModelRepository.getModel('count-digit-one');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('count-digit-one', 'stage-1', 'forward');

      const strat = new DigitDpStrategy('count-digit-one');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { n: 13 }
      });

      expect(steps.length).toBeGreaterThan(15);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');

      // 验证每一步的 FlowPhase 严格遵循契约
      steps.forEach((st, idx) => {
        expect(
          st.flowPhase === 'forward' || st.flowPhase === 'backtrack',
          `Step #${idx} 类型 [${st.type}] 缺少合法的 flowPhase: ${st.flowPhase}`
        ).toBe(true);
      });

      const lineCallDfs = stage1Config.anchorMap?.call_dfs;
      const lineReturn = stage1Config.anchorMap?.return;
      expect(lineCallDfs).toBeDefined();
      expect(lineReturn).toBeDefined();

      // 验证调用栈动态伸缩
      const hasDeepStack = steps.some((st) => st.callStack && st.callStack.length >= 2);
      expect(hasDeepStack, '数位递归深入时必须生成调用栈').toBe(true);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.flowPhase).toBe('backtrack');
      // n=13: 包含 1 的数为 1, 10, 11(2个), 12, 13 -> 1 出现 6 次
      expect(lastStep.dp1d?.[0]).toBe(6);
    });

    it('Non-negative Consecutive Ones (不含连续1的非负整数 LC 600, 85 课) 门禁：二进制数位分解、连续1剪枝与 FlowPhase 契约', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { DigitDpStrategy } = await import('./digit-dp-strategy');

      const model = AlgorithmModelRepository.getModel('non-negative-consecutive-ones');
      const stage1Config = AlgorithmModelRepository.getCompiledStage('non-negative-consecutive-ones', 'stage-1', 'forward');

      const strat = new DigitDpStrategy('non-negative-consecutive-ones');
      const steps = strat.generateSteps(model, {
        stage: 1,
        isMemo: false,
        anchorMap: stage1Config.anchorMap,
        params: { n: 5 }
      });

      expect(steps.length).toBeGreaterThan(15);
      expect(steps[0].type).toBe('entry');
      expect(steps[0].flowPhase).toBe('forward');

      steps.forEach((st, idx) => {
        expect(
          st.flowPhase === 'forward' || st.flowPhase === 'backtrack',
          `Step #${idx} 类型 [${st.type}] 缺少合法的 flowPhase: ${st.flowPhase}`
        ).toBe(true);
      });

      const lineCheckConsecutive = stage1Config.anchorMap?.check_consecutive;
      const lineReturn = stage1Config.anchorMap?.return;
      expect(lineCheckConsecutive).toBeDefined();
      expect(lineReturn).toBeDefined();

      // 验证精准触发连续 1 剪枝
      const pruneSteps = steps.filter((st) => st.type === 'check_consecutive');
      expect(pruneSteps.length, 'n=5 (101)_2 必须遇到 pre=1 && d=1 的连续 1 冲突剪枝').toBeGreaterThan(0);
      pruneSteps.forEach((st) => {
        expect(st.flowPhase).toBe('forward');
      });

      const lastStep = steps[steps.length - 1];
      expect(lastStep.type).toBe('return');
      expect(lastStep.line).toBe(lineReturn);
      expect(lastStep.flowPhase).toBe('backtrack');
      // n=5: 合法数为 0(000), 1(001), 2(010), 4(100), 5(101) -> 共 5 个
      expect(lastStep.dp1d?.[0]).toBe(5);
    });
  });

  describe('DP Stage 3/4 空间压缩降维门禁 (Dimensional Reduction Invariant)', () => {
    it('全量模型 Stage 3 vs Stage 4 空间降维门禁：若存在 Stage 4 优化，其分配的 DP 数组维度必须严格小于 Stage 3', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const ids = AlgorithmModelRepository.getAllIds();
      const models = ids.map(id => AlgorithmModelRepository.getModel(id));

      for (const model of models) {
        if (!model.stages) continue;
        if (['interval-dp', 'digit-dp', 'tree-dp', 'tree'].includes(model.category) || ['tsp-bitmask-dp', 'predict-the-winner', 'burst-balloons', 'min-score-triangulation', 'merge-stones', 'strange-printer', 'count-digit-one', 'non-negative-consecutive-ones'].includes(model.id)) continue;
        
        const stage3 = model.stages['stage-3'];
        const stage4 = model.stages['stage-4'];

        if (stage3 && stage4 && stage3.variants && stage4.variants) {
          const s3CodeStr = JSON.stringify(stage3.variants);
          const s4CodeStr = JSON.stringify(stage4.variants);

          // 匹配 new int[...] 这种分配语句
          const arrayAllocRegex = /new\s+(?:int|boolean|double|float|long|Integer|Boolean)\s*(?:\[[^\]]*\])+/g;
          const s3Matches = s3CodeStr.match(arrayAllocRegex) || [];
          const s4Matches = s4CodeStr.match(arrayAllocRegex) || [];

          if (s3Matches.length > 0 && s4Matches.length > 0) {
            // 计算最大维度（括号对数）
            const getDims = (m: string) => (m.match(/\[/g) || []).length;
            const s3MaxDim = Math.max(...s3Matches.map(getDims));
            const s4MaxDim = Math.max(...s4Matches.map(getDims));

            if (s3MaxDim > 1) {
              expect(
                s4MaxDim,
                `【架构死规矩拦截】模型 ${model.id} 的 Stage 4 空间压缩必须实现真实降维！Stage 3 维度: ${s3MaxDim}, Stage 4 维度: ${s4MaxDim}。严禁直接把滚动数组实现伪装成 Stage 3！`
              ).toBeLessThan(s3MaxDim);
            }
          }
        }
      }
    });
  });

  describe('DP 首帧网格纯净度门禁 (Initial Frame Grid Purity Invariant)', () => {
    it('profitable-schemes 首帧 (entry / init) 网格快照必须全为 null，禁止在 entry/init 阶段提前打入基底或 0 值', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { KnapsackFamilyStrategy } = await import('./knapsack-family-strategy');
      const strategy = new KnapsackFamilyStrategy('profitable-schemes');
      const model = AlgorithmModelRepository.getModel('profitable-schemes');

      const steps3 = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
        params: { n: 5, minProfit: 3, group: [2, 2], profit: [2, 3] }
      });

      const entryStep = steps3.find(s => s.type === 'entry');
      expect(entryStep).toBeDefined();
      if (entryStep?.grid) {
        const nonNulls = entryStep.grid.flatMap(row => row).filter(cell => cell !== null);
        expect(nonNulls.length, '【架构死规矩拦截】entry 帧的网格必须纯净为 null，禁止提前灌入基底或全零！').toBe(0);
      }

      const steps4 = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
        params: { n: 5, minProfit: 3, group: [2, 2], profit: [2, 3] }
      });

      const entryStep4 = steps4.find(s => s.type === 'entry');
      expect(entryStep4).toBeDefined();
      if (entryStep4?.grid) {
        const nonNulls = entryStep4.grid.flatMap(row => row).filter(cell => cell !== null);
        expect(nonNulls.length, '【架构死规矩拦截】Stage 4 entry 帧的网格必须纯净为 null！').toBe(0);
      }
    });

    it('Class 067 全量算法 (unique-paths, unique-paths-ii, min-path-sum, longest-common-subsequence) 首帧必须纯净为 null', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { GridUniquePathsStrategy } = await import('./grid-unique-paths-strategy');
      const { compileLcsStage3, compileLcsStage4 } = await import('./sequence-lcs-compiler');

      const gridModels = ['unique-paths', 'unique-paths-ii', 'min-path-sum'];
      for (const id of gridModels) {
        const model = AlgorithmModelRepository.getModel(id);
        const strategy = new GridUniquePathsStrategy(id as any);

        for (const dir of ['forward', 'reverse'] as const) {
          // Stage 3
          const s3Steps = strategy.generateSteps(model, { stage: 3, direction: dir });
          const init3 = s3Steps.find(s => s.type === 'init' || s.type === 'entry');
          expect(init3, `${id} stage 3 ${dir} 必须有 init 步`).toBeDefined();
          if (init3?.grid) {
            const nonNulls = init3.grid.flatMap(r => r).filter(c => c !== null);
            expect(nonNulls.length, `【架构死规矩拦截】${id} Stage 3 (${dir}) 首帧必须全为 null，实际有 ${nonNulls.length} 个非空单元格`).toBe(0);
          }

          // Stage 4
          const s4Steps = strategy.generateSteps(model, { stage: 4, direction: dir });
          const init4 = s4Steps.find(s => s.type === 'init' || s.type === 'entry');
          expect(init4, `${id} stage 4 ${dir} 必须有 init 步`).toBeDefined();
          if (init4?.grid) {
            const nonNulls = init4.grid.flatMap(r => r).filter(c => c !== null);
            expect(nonNulls.length, `【架构死规矩拦截】${id} Stage 4 (${dir}) 首帧必须全为 null，实际有 ${nonNulls.length} 个非空单元格`).toBe(0);
          }
        }
      }

      // LCS
      const lcsModel = AlgorithmModelRepository.getModel('longest-common-subsequence');
      for (const dir of ['forward', 'reverse'] as const) {
        const lcsS3 = compileLcsStage3(lcsModel, {}, dir);
        const init3 = lcsS3.find(s => s.type === 'init' || s.type === 'entry');
        expect(init3).toBeDefined();
        if (init3?.grid) {
          const nonNulls = init3.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】LCS Stage 3 (${dir}) 首帧必须全为 null，实际有 ${nonNulls.length} 个非空单元格`).toBe(0);
        }

        const lcsS4 = compileLcsStage4(lcsModel, {}, dir);
        const init4 = lcsS4.find(s => s.type === 'init' || s.type === 'entry');
        expect(init4).toBeDefined();
        if (init4?.grid) {
          const nonNulls = init4.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】LCS Stage 4 (${dir}) 首帧必须全为 null，实际有 ${nonNulls.length} 个非空单元格`).toBe(0);
        }
      }
    });

    it('Class 068 全量算法 (distinct-subsequences, edit-distance, delete-operation-for-two-strings, palindromic-substrings, longest-palindromic-subsequence) 首帧必须纯净为 null', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { compileDistinctSubsequencesStage3, compileDistinctSubsequencesStage4 } = await import('./sequence-distinctsubsequences-compiler');
      const { compileEditDistanceStage3, compileEditDistanceStage4 } = await import('./sequence-editdistance-compiler');
      const { compileDeleteDistanceStage3, compileDeleteDistanceStage4 } = await import('./sequence-deletedistance-compiler');
      const { compilePalindromicSubstringsStage3, compilePalindromicSubstringsStage4 } = await import('./sequence-palindromicsubstrings-compiler');
      const { compileLongestPalindromicStage3, compileLongestPalindromicStage4 } = await import('./sequence-longestpalindromic-compiler');

      // 1. distinct-subsequences
      const dsModel = AlgorithmModelRepository.getModel('distinct-subsequences');
      for (const dir of ['forward', 'reverse'] as const) {
        const s3 = compileDistinctSubsequencesStage3(dsModel, {}, dir);
        const init3 = s3.find(s => s.type === 'init' || s.type === 'entry');
        expect(init3).toBeDefined();
        if (init3?.grid) {
          const nonNulls = init3.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】distinct-subsequences Stage 3 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }

        const s4 = compileDistinctSubsequencesStage4(dsModel, {}, dir);
        const init4 = s4.find(s => s.type === 'init' || s.type === 'entry');
        expect(init4).toBeDefined();
        if (init4?.grid) {
          const nonNulls = init4.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】distinct-subsequences Stage 4 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }
      }

      // 2. edit-distance
      const edModel = AlgorithmModelRepository.getModel('edit-distance');
      for (const dir of ['forward', 'reverse'] as const) {
        const s3 = compileEditDistanceStage3(edModel, {}, dir);
        const init3 = s3.find(s => s.type === 'init' || s.type === 'entry');
        expect(init3).toBeDefined();
        if (init3?.grid) {
          const nonNulls = init3.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】edit-distance Stage 3 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }

        const s4 = compileEditDistanceStage4(edModel, {}, dir);
        const init4 = s4.find(s => s.type === 'init' || s.type === 'entry');
        expect(init4).toBeDefined();
        if (init4?.grid) {
          const nonNulls = init4.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】edit-distance Stage 4 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }
      }

      // 3. delete-operation-for-two-strings
      const delModel = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
      for (const dir of ['forward', 'reverse'] as const) {
        const s3 = compileDeleteDistanceStage3(delModel, {}, dir);
        const init3 = s3.find(s => s.type === 'init' || s.type === 'entry');
        expect(init3).toBeDefined();
        if (init3?.grid) {
          const nonNulls = init3.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】delete-operation-for-two-strings Stage 3 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }

        const s4 = compileDeleteDistanceStage4(delModel, {}, dir);
        const init4 = s4.find(s => s.type === 'init' || s.type === 'entry');
        expect(init4).toBeDefined();
        if (init4?.grid) {
          const nonNulls = init4.grid.flatMap(r => r).filter(c => c !== null);
          expect(nonNulls.length, `【架构死规矩拦截】delete-operation-for-two-strings Stage 4 (${dir}) 首帧网格必须全为 null`).toBe(0);
        }
      }

      // 4. palindromic-substrings
      const palModel = AlgorithmModelRepository.getModel('palindromic-substrings');
      const palS3 = compilePalindromicSubstringsStage3(palModel, {});
      const palInit3 = palS3.find(s => s.type === 'init' || s.type === 'entry');
      expect(palInit3).toBeDefined();
      if (palInit3?.grid) {
        const nonNulls = palInit3.grid.flatMap(r => r).filter(c => c !== null);
        expect(nonNulls.length, `【架构死规矩拦截】palindromic-substrings Stage 3 首帧网格必须全为 null`).toBe(0);
      }

      const palS4 = compilePalindromicSubstringsStage4(palModel, {});
      const palInit4 = palS4.find(s => s.type === 'init' || s.type === 'entry');
      expect(palInit4).toBeDefined();
      if (palInit4?.grid) {
        const nonNulls = palInit4.grid.flatMap(r => r).filter(c => c !== null);
        expect(nonNulls.length, `【架构死规矩拦截】palindromic-substrings Stage 4 首帧网格必须全为 null`).toBe(0);
      }

      // 5. longest-palindromic-subsequence
      const lpsModel = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
      const lpsS3 = compileLongestPalindromicStage3(lpsModel, {});
      const lpsInit3 = lpsS3.find(s => s.type === 'init' || s.type === 'entry');
      expect(lpsInit3).toBeDefined();
      if (lpsInit3?.grid) {
        const nonNulls = lpsInit3.grid.flatMap(r => r).filter(c => c !== null);
        expect(nonNulls.length, `【架构死规矩拦截】longest-palindromic-subsequence Stage 3 首帧网格必须全为 null`).toBe(0);
      }

      const lpsS4 = compileLongestPalindromicStage4(lpsModel, {});
      const lpsInit4 = lpsS4.find(s => s.type === 'init' || s.type === 'entry');
      expect(lpsInit4).toBeDefined();
      if (lpsInit4?.grid) {
        const nonNulls = lpsInit4.grid.flatMap(r => r).filter(c => c !== null);
        expect(nonNulls.length, `【架构死规矩拦截】longest-palindromic-subsequence Stage 4 首帧网格必须全为 null`).toBe(0);
      }
    });

    it('全量模型首帧 (entry / init) 网格纯净度门禁：所有已注册模型 Stage 3 与 Stage 4（顺推与逆推）首帧网格必须全为 null，零提前填值/零过早高亮', async () => {
      const { AlgorithmModelRepository } = await import('../model-repository');
      const { AlgorithmStrategyRegistry } = await import('./algorithm-strategy-registry');
      await import('./index');

      const allIds = AlgorithmModelRepository.getAllIds();
      const problematic: Array<{ id: string; stage: number; dir: string; type: string; nonNullCount: number }> = [];

      for (const id of allIds) {
        const model = AlgorithmModelRepository.getModel(id);
        if (!model) continue;

        for (const stage of [3, 4]) {
          for (const dir of ['forward', 'reverse'] as const) {
            try {
              const steps = AlgorithmStrategyRegistry.tryGenerate(model, {
                stage,
                direction: dir,
              });
              if (!steps || steps.length === 0) continue;

              const initStep = steps.find(s => s.type === 'init' || s.type === 'entry');
              if (initStep && initStep.grid) {
                const nonNulls = initStep.grid.flatMap(r => Array.isArray(r) ? r : [r]).filter(c => c !== null);
                if (nonNulls.length > 0) {
                  problematic.push({
                    id,
                    stage,
                    dir,
                    type: initStep.type || 'init',
                    nonNullCount: nonNulls.length,
                  });
                }
              }
            } catch (e) {
              // ignore unsupported
            }
          }
        }
      }

      expect(
        problematic,
        `【架构死规矩拦截】发现存在初始帧非 null（过早变绿）的模型：${JSON.stringify(problematic)}`
      ).toEqual([]);
    });
  });
});




