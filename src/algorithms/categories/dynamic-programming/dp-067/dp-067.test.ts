import { describe, it, expect } from 'vitest';
import { getManifest } from '../../../../core/registry';
import './index';
import {
  buildMinPathSumStage1Steps,
  buildMinPathSumStage2Steps,
  buildMinPathSumStage3Steps,
  buildMinPathSumStage4Steps,
} from './min-path-sum-renderer';
import {
  buildWordSearchStage1Steps,
  buildWordSearchStage2Steps,
  buildWordSearchStage3Steps,
  buildWordSearchStage4Steps,
} from './word-search-renderer';
import {
  buildLcsStage1Steps,
  buildLcsStage2Steps,
  buildLcsStage3Steps,
  buildLcsStage4Steps,
} from './longest-common-subsequence-renderer';
import {
  buildLpsStage1Steps,
  buildLpsStage2Steps,
  buildLpsStage3Steps,
  buildLpsStage4Steps,
} from './longest-palindromic-subsequence-renderer';
import {
  buildTreeCountStage1Steps,
  buildTreeCountStage2Steps,
  buildTreeCountStage3Steps,
  buildTreeCountStage4Steps,
} from './tree-count-height-m-renderer';
import {
  buildLipStage1Steps,
  buildLipStage2Steps,
  buildLipStage3Steps,
  buildLipStage4Steps,
} from './longest-increasing-path-renderer';
import {
  MIN_PATH_SUM_STAGE1_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE2_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE3_CODE_LANGUAGES,
  MIN_PATH_SUM_STAGE4_CODE_LANGUAGES,
  WORD_SEARCH_STAGE1_CODE_LANGUAGES,
  WORD_SEARCH_STAGE2_CODE_LANGUAGES,
  WORD_SEARCH_STAGE3_CODE_LANGUAGES,
  WORD_SEARCH_STAGE4_CODE_LANGUAGES,
  LCS_STAGE1_CODE_LANGUAGES,
  LCS_STAGE2_CODE_LANGUAGES,
  LCS_STAGE3_CODE_LANGUAGES,
  LCS_STAGE4_CODE_LANGUAGES,
  LPS_STAGE1_CODE_LANGUAGES,
  LPS_STAGE2_CODE_LANGUAGES,
  LPS_STAGE3_CODE_LANGUAGES,
  LPS_STAGE4_CODE_LANGUAGES,
  TREE_COUNT_STAGE1_CODE_LANGUAGES,
  TREE_COUNT_STAGE2_CODE_LANGUAGES,
  TREE_COUNT_STAGE3_CODE_LANGUAGES,
  TREE_COUNT_STAGE4_CODE_LANGUAGES,
  LIP_STAGE1_CODE_LANGUAGES,
  LIP_STAGE2_CODE_LANGUAGES,
  LIP_STAGE3_CODE_LANGUAGES,
  LIP_STAGE4_CODE_LANGUAGES,
} from './dp-067-stage-codes';

describe('🧪 Class 067 从递归入手二维动态规划 6大经典算法全量测试套件', () => {
  // ==========================================
  // 1. Code01 最小路径和 (LeetCode 64)
  // ==========================================
  describe('Code01: 最小路径和 (LeetCode 64)', () => {
    const grid = [
      [1, 3, 1],
      [1, 5, 1],
      [4, 2, 1],
    ];
    const inputs = { 'input-grid': JSON.stringify(grid) };

    it('阶段 1 暴力递归应能正确生成递归调用步骤并求出终点', () => {
      const steps = buildMinPathSumStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].currentCall).toBe('f(2, 2)');
      const finalStep = steps[steps.length - 1];
      expect(finalStep.metrics?.['metric-ans']).toBe('7');
    });

    it('阶段 2 记忆化搜索应记录缓存命中并大幅减少重复子问题', () => {
      const steps = buildMinPathSumStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const hitSteps = steps.filter((s) => s.memoHit);
      expect(hitSteps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.cachedVal).toBe(7);
    });

    it('阶段 3 严格二维表应自上而下、自左向右递推且结果为 7', () => {
      const steps = buildMinPathSumStage3Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentVal).toBe(7);
      expect(lastStep.dpTable[2][2]).toBe(7);
    });

    it('阶段 4 空间压缩应维护一维数组且最终答案正确', () => {
      const steps = buildMinPathSumStage4Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp[grid[0].length - 1]).toBe(7);
    });
  });

  // ==========================================
  // 2. Code02 单词搜索 (LeetCode 79)
  // ==========================================
  describe('Code02: 单词搜索 (LeetCode 79)', () => {
    const inputs = {
      'input-board': JSON.stringify([
        ['A', 'B', 'C', 'E'],
        ['S', 'F', 'C', 'S'],
        ['A', 'D', 'E', 'E'],
      ]),
      'input-word': 'ABCCED',
    };

    it('阶段 1 回溯应能成功搜索到目标单词', () => {
      const steps = buildWordSearchStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const foundStep = steps.find((s) => s.status === 'found');
      expect(foundStep).toBeDefined();
      expect(foundStep?.matchedLen).toBe(6);
    });

    it('阶段 2 教学反例应清晰展示无后效性破坏导致的状态冲突', () => {
      const steps = buildWordSearchStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const conflictStep = steps.find((s) => s.status === 'conflict');
      expect(conflictStep).toBeDefined();
      expect(conflictStep?.metrics?.['metric-status']).toContain('无后效性');
    });

    it('阶段 3 原地修改回溯应包含标记与现场恢复步骤', () => {
      const steps = buildWordSearchStage3Steps({
        ...inputs,
        'input-word': 'ABCB',
      });
      const matchSteps = steps.filter((s) => s.status === 'match');
      const backtrackSteps = steps.filter((s) => s.status === 'backtrack');
      expect(matchSteps.length).toBeGreaterThan(0);
      expect(backtrackSteps.length).toBeGreaterThan(0);
    });

    it('阶段 4 启发式词频统计应正确做出搜索方向决策', () => {
      const steps = buildWordSearchStage4Steps(inputs);
      expect(steps[0].status).toBe('prune');
      expect(steps[0].decision).toContain('词频');
    });
  });

  // ==========================================
  // 3. Code03 最长公共子序列 LCS (LeetCode 1143)
  // ==========================================
  describe('Code03: 最长公共子序列 LCS (LeetCode 1143)', () => {
    const inputs = { 'input-s1': 'abcde', 'input-s2': 'ace' };

    it('阶段 1 暴力递归应正确计算 LCS 长度为 3', () => {
      const steps = buildLcsStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['metric-ans']).toBe('3');
    });

    it('阶段 2 记忆化搜索应记录缓存命中', () => {
      const steps = buildLcsStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.cachedVal).toBe(3);
    });

    it('阶段 3 严格二维表应展示对角线与上下左右转移', () => {
      const steps = buildLcsStage3Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.currentVal).toBe(3);
      expect(lastStep.dpTable[5][3]).toBe(3);
    });

    it('阶段 4 空间压缩应正确记录 leftUp 寄存器变化且最终结果为 3', () => {
      const steps = buildLcsStage4Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp[3]).toBe(3);
    });
  });

  // ==========================================
  // 4. Code04 最长回文子序列 LPS (LeetCode 516)
  // ==========================================
  describe('Code04: 最长回文子序列 LPS (LeetCode 516)', () => {
    const inputs = { 'input-s': 'bbbab' };

    it('阶段 1 区间递归应得出答案为 4 ("bbbb")', () => {
      const steps = buildLpsStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['metric-ans']).toBe('4');
    });

    it('阶段 2 区间记忆化搜索应记录 memo 缓存', () => {
      const steps = buildLpsStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.cachedVal).toBe(4);
    });

    it('阶段 3 严格区间半三角表应自底向上递推且结果为 4', () => {
      const steps = buildLpsStage3Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dpTable[0][4]).toBe(4);
    });

    it('阶段 4 空间压缩应利用 leftDown 寄存器且结果为 4', () => {
      const steps = buildLpsStage4Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp[4]).toBe(4);
    });
  });

  // ==========================================
  // 5. Code05 节点数为n高度不大于m的二叉树结构数
  // ==========================================
  describe('Code05: 节点数为n高度不大于m的二叉树结构数', () => {
    const inputs = { 'input-n': 5, 'input-m': 3 };

    it('阶段 1 规模拆解递归应得出方案数为 6', () => {
      const steps = buildTreeCountStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['metric-ans']).toBe('6');
    });

    it('阶段 2 记忆化搜索应能记录备忘录缓存', () => {
      const steps = buildTreeCountStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.cachedVal).toBe(6);
    });

    it('阶段 3 严格二维表应外层列循环递推且 dp[5][3] = 6', () => {
      const steps = buildTreeCountStage3Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dpTable[5][3]).toBe(6);
    });

    it('阶段 4 双列滚动空间压缩应正确计算出 6', () => {
      const steps = buildTreeCountStage4Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp[5]).toBe(6);
    });

    it('左侧双面板排布应严格保持主数据沙盘在上(Card 1)、辅助推导在下(Card 2)', () => {
      const manifest = getManifest('tree-count-height-m');
      expect(manifest).toBeDefined();
      expect(manifest?.template).toContain('🌲 左右子树规模拆分示图');
      expect(manifest?.template).toContain('🌿 规模拆解递归调用树');
    });
  });

  // ==========================================
  // 6. Code06 矩阵中的最长递增路径 (LeetCode 329)
  // ==========================================
  describe('Code06: 矩阵中的最长递增路径 (LeetCode 329)', () => {
    const matrix = [
      [9, 9, 4],
      [6, 6, 8],
      [2, 1, 1],
    ];
    const inputs = { 'input-matrix': JSON.stringify(matrix) };

    it('阶段 1 暴力 DFS 应能正确顺着偏序关系递推并返回局部最长延伸', () => {
      const steps = buildLipStage1Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].currentCall).toContain('dfs');
    });

    it('阶段 2 记忆化搜索应能正确记录每个格子的最长路径并剪枝', () => {
      const steps = buildLipStage2Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.memoGrid[2][1]).toBeGreaterThanOrEqual(1);
    });

    it('阶段 3 严格按值拓扑排序递推应从小到大/从大到小填表', () => {
      const steps = buildLipStage3Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].decision).toContain('拓扑序');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dpTable[2][1]).toBe(4);
    });

    it('阶段 4 最长递增路径沙盘应重构出路径 [1, 2, 6, 9] 且长度为 4', () => {
      const steps = buildLipStage4Steps(inputs);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxLen).toBe(4);
      expect(lastStep.bestPath.length).toBe(4);
    });
  });

  // ==========================================
  // 7. 算法注册与元数据核验
  // ==========================================
  describe('算法中心全局注册核验', () => {
    const expectedIds = [
      'min-path-sum',
      'word-search',
      'longest-common-subsequence',
      'longest-palindromic-subsequence',
      'tree-count-height-m',
      'longest-increasing-path',
    ];

    it.each(expectedIds)('算法 ID "%s" 应已成功注册至全局算法注册中心', (id) => {
      const algo = getManifest(id);
      expect(algo).toBeDefined();
      expect(algo?.id).toBe(id);
      expect(algo?.category).toBe('dynamic-programming');
      expect(algo?.template).toBeDefined();
      expect(algo?.Visualizer).toBeDefined();
    });
  });

  // ==========================================
  // 8. 绝对一行一步代码联动与行号边界机械审查 (Strict One-Line-One-Step Invariants)
  // ==========================================
  describe('🎯 绝对一行一步代码联动与行号边界机械审查 (Strict One-Line-One-Step Invariants)', () => {
    const minPathInputs = { 'input-grid': JSON.stringify([[1, 3, 1], [1, 5, 1], [4, 2, 1]]) };
    const wordSearchInputs = {
      'input-board': JSON.stringify([['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']]),
      'input-word': 'ABCCED',
    };
    const lcsInputs = { 'input-s1': 'abcde', 'input-s2': 'ace' };
    const lpsInputs = { 'input-s': 'bbbab' };
    const treeInputs = { 'input-n': '5', 'input-m': '3' };
    const lipInputs = { 'input-matrix': JSON.stringify([[9, 9, 4], [6, 6, 8], [2, 1, 1]]) };

    const algoSuites = [
      {
        id: 'min-path-sum',
        builders: [buildMinPathSumStage1Steps, buildMinPathSumStage2Steps, buildMinPathSumStage3Steps, buildMinPathSumStage4Steps],
        inputs: minPathInputs,
        stageCodes: [MIN_PATH_SUM_STAGE1_CODE_LANGUAGES, MIN_PATH_SUM_STAGE2_CODE_LANGUAGES, MIN_PATH_SUM_STAGE3_CODE_LANGUAGES, MIN_PATH_SUM_STAGE4_CODE_LANGUAGES],
      },
      {
        id: 'word-search',
        builders: [buildWordSearchStage1Steps, buildWordSearchStage2Steps, buildWordSearchStage3Steps, buildWordSearchStage4Steps],
        inputs: wordSearchInputs,
        stageCodes: [WORD_SEARCH_STAGE1_CODE_LANGUAGES, WORD_SEARCH_STAGE2_CODE_LANGUAGES, WORD_SEARCH_STAGE3_CODE_LANGUAGES, WORD_SEARCH_STAGE4_CODE_LANGUAGES],
      },
      {
        id: 'longest-common-subsequence',
        builders: [buildLcsStage1Steps, buildLcsStage2Steps, buildLcsStage3Steps, buildLcsStage4Steps],
        inputs: lcsInputs,
        stageCodes: [LCS_STAGE1_CODE_LANGUAGES, LCS_STAGE2_CODE_LANGUAGES, LCS_STAGE3_CODE_LANGUAGES, LCS_STAGE4_CODE_LANGUAGES],
      },
      {
        id: 'longest-palindromic-subsequence',
        builders: [buildLpsStage1Steps, buildLpsStage2Steps, buildLpsStage3Steps, buildLpsStage4Steps],
        inputs: lpsInputs,
        stageCodes: [LPS_STAGE1_CODE_LANGUAGES, LPS_STAGE2_CODE_LANGUAGES, LPS_STAGE3_CODE_LANGUAGES, LPS_STAGE4_CODE_LANGUAGES],
      },
      {
        id: 'tree-count-height-m',
        builders: [buildTreeCountStage1Steps, buildTreeCountStage2Steps, buildTreeCountStage3Steps, buildTreeCountStage4Steps],
        inputs: treeInputs,
        stageCodes: [TREE_COUNT_STAGE1_CODE_LANGUAGES, TREE_COUNT_STAGE2_CODE_LANGUAGES, TREE_COUNT_STAGE3_CODE_LANGUAGES, TREE_COUNT_STAGE4_CODE_LANGUAGES],
      },
      {
        id: 'longest-increasing-path',
        builders: [buildLipStage1Steps, buildLipStage2Steps, buildLipStage3Steps, buildLipStage4Steps],
        inputs: lipInputs,
        stageCodes: [LIP_STAGE1_CODE_LANGUAGES, LIP_STAGE2_CODE_LANGUAGES, LIP_STAGE3_CODE_LANGUAGES, LIP_STAGE4_CODE_LANGUAGES],
      },
    ];

    for (const suite of algoSuites) {
      suite.builders.forEach((builder, stageIdx) => {
        const stageNum = stageIdx + 1;
        it(`[${suite.id}] 阶段 ${stageNum} 所有步进必须严格满足一行一步与多语言行号不越界`, () => {
          const steps = builder(suite.inputs) as Array<{ codeLine?: Record<string, number> }>;
          expect(steps.length, `阶段 ${stageNum} 步数必须大于 0`).toBeGreaterThan(0);

          const stageCodeLangs = suite.stageCodes[stageIdx];
          expect(stageCodeLangs, `阶段 ${stageNum} 必须配置多语言代码面板`).toBeDefined();

          const distinctLines = new Set<number>();

          for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
            const step = steps[stepIdx];
            expect(step.codeLine, `Step ${stepIdx} 必须具备 codeLine 行号字典`).toBeDefined();
            const lineMap = step.codeLine as Record<string, number>;

            for (const lang of ['java', 'cpp', 'python', 'javascript']) {
              const line = lineMap[lang];
              expect(line, `Step ${stepIdx} 缺少语言 ${lang} 的行号映射`).toBeDefined();

              const codeArray = stageCodeLangs?.[lang] || [];
              expect(codeArray.length, `语言 ${lang} 代码行数组不能为空`).toBeGreaterThan(0);
              expect(line, `Step ${stepIdx} 语言 ${lang} 行号 ${line} 超界 [1, ${codeArray.length}]`).toBeGreaterThanOrEqual(1);
              expect(line, `Step ${stepIdx} 语言 ${lang} 行号 ${line} 超界 [1, ${codeArray.length}]`).toBeLessThanOrEqual(codeArray.length);

              if (lang === 'java') {
                distinctLines.add(line);
              }
            }
          }

          // 杜绝单一循环死锁或全局单一行号假高亮 (至少跨越多个不同代码行)
          expect(distinctLines.size, `阶段 ${stageNum} 执行行号不可停滞在单一或极少数行`).toBeGreaterThanOrEqual(3);
        });
      });
    }

    it('单词搜索阶段 4 必须不存在高亮死锁，且 DFS 与预处理均有独立步进', () => {
      const steps = buildWordSearchStage4Steps(wordSearchInputs);
      const lineSequence = steps.map((s) => s.codeLine?.['java']);
      
      // 验证存在预处理行（行 2~8）
      expect(lineSequence.some((l) => l !== undefined && l >= 2 && l <= 8)).toBe(true);
      // 验证存在 DFS 内部行（行 17~25）
      expect(lineSequence.some((l) => l !== undefined && l >= 17 && l <= 25)).toBe(true);
      // 验证连续在同一行（如 line 12）不超过 3 步
      let consecutiveCount = 1;
      for (let i = 1; i < lineSequence.length; i++) {
        if (lineSequence[i] === lineSequence[i - 1]) {
          consecutiveCount++;
          expect(consecutiveCount, `行号 ${lineSequence[i]} 连续停滞超过 3 步，违反一行一步原则`).toBeLessThanOrEqual(3);
        } else {
          consecutiveCount = 1;
        }
      }
    });
  });
});
