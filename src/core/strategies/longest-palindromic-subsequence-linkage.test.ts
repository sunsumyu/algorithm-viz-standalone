import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { SequenceStepMatrixCompiler } from './sequence-step-matrix-compiler';
import { YamlModelLoader } from '../yaml-model-loader';

describe('最长回文子序列 (LPS) 代码联动与生命周期规范核验', () => {
  const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');

  it('Stage 1 (递归) 锚点与执行步骤必须精准对齐真实执行代码且无注释行高亮', () => {
    const stage1Variant = model.stages?.['stage-1']?.variants?.['standard'];
    expect(stage1Variant).toBeDefined();

    const compiled = YamlModelLoader.compileSource(stage1Variant, 'java');
    const cleanLines = compiled.cleanSource.split('\n');
    const anchorMap = compiled.anchorMap;

    // 1. 验证锚点存在性
    expect(anchorMap.entry, '主函数入口锚点必须存在').toBeDefined();
    expect(anchorMap.dfs_entry, 'dfs 辅助函数入口锚点必须存在').toBeDefined();
    expect(anchorMap.boundary_cross, 'Base Case 越界锚点必须存在').toBeDefined();
    expect(anchorMap.boundary_single, 'Base Case 单字符锚点必须存在').toBeDefined();
    expect(anchorMap.match, '端点相同比较锚点必须存在').toBeDefined();
    expect(anchorMap.branch_left, '左分支锚点必须存在').toBeDefined();
    expect(anchorMap.branch_right, '右分支锚点必须存在').toBeDefined();
    expect(anchorMap.combine, '汇总两分支锚点必须存在').toBeDefined();

    // 2. 关键断言：Base Case 2 必须是 if (i == j) return 1;，严禁高亮在注释行上！
    const singleLineIdx = anchorMap.boundary_single - 1;
    expect(cleanLines[singleLineIdx].trim()).toMatch(/^if\s*\(\s*i\s*==\s*j\s*\)\s*return\s*1;/);
    expect(cleanLines[singleLineIdx].trim().startsWith('//')).toBe(false);

    // 3. 生成 Stage 1 步骤并验证生命周期与独立分支
    const steps = SequenceStepMatrixCompiler.compileLongestPalindromicStage1or2(model, false, anchorMap);
    expect(steps.length).toBeGreaterThan(0);

    // Step 0 必须是主函数入口
    expect(steps[0].type).toBe('entry');
    expect(steps[0].line).toBe(anchorMap.entry);

    // 必须存在左右两分支独立探索步骤
    const hasLeftBranch = steps.some(s => s.type === 'diff-branch-left');
    const hasRightBranch = steps.some(s => s.type === 'diff-branch-right');
    expect(hasLeftBranch, '必须包含舍弃左端的独立探索步进').toBe(true);
    expect(hasRightBranch, '必须包含舍弃右端的独立探索步进').toBe(true);

    // 4. 黄金断言：所有步进的高亮行必须在合法代码范围内，且对应行绝不能是纯注释行或空行！
    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];
      const lineNum = step.line!;
      expect(lineNum, `步骤 #${idx + 1} 行号必须 >= 1`).toBeGreaterThanOrEqual(1);
      expect(lineNum, `步骤 #${idx + 1} 行号必须 <= ${cleanLines.length}`).toBeLessThanOrEqual(cleanLines.length);

      const codeText = cleanLines[lineNum - 1].trim();
      expect(codeText.length, `步骤 #${idx + 1} 高亮行 ${lineNum} 不能为空行`).toBeGreaterThan(0);
      expect(codeText.startsWith('//'), `步骤 #${idx + 1} 高亮行 ${lineNum} 绝不能是注释行 ("${codeText}")`).toBe(false);
    }
  });

  it('Stage 2 (记忆化) 步骤行号必须合法且命中剪枝高亮在代码行', () => {
    const stage2Variant = model.stages?.['stage-2']?.variants?.['standard'];
    expect(stage2Variant).toBeDefined();

    const compiled = YamlModelLoader.compileSource(stage2Variant, 'java');
    const cleanLines = compiled.cleanSource.split('\n');
    const anchorMap = compiled.anchorMap;

    expect(anchorMap.cache_hit).toBeDefined();
    const cacheHitCode = cleanLines[anchorMap.cache_hit - 1].trim();
    expect(cacheHitCode).toMatch(/^if\s*\(memo\[i\]\[j\]\s*!=\s*null\)\s*return\s*memo\[i\]\[j\];/);
    expect(cacheHitCode.startsWith('//')).toBe(false);

    const modelWithOverlap = {
      ...model,
      defaultParams: { s: 'abcd' },
    };
    const steps = SequenceStepMatrixCompiler.compileLongestPalindromicStage1or2(modelWithOverlap, true, anchorMap);
    expect(steps.some(s => s.type === 'cache-hit')).toBe(true);

    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];
      const lineNum = step.line!;
      expect(lineNum).toBeGreaterThanOrEqual(1);
      expect(lineNum).toBeLessThanOrEqual(cleanLines.length);
      const codeText = cleanLines[lineNum - 1].trim();
      expect(codeText.startsWith('//'), `Stage 2 步骤 #${idx + 1} 行 ${lineNum} 绝不能是注释行`).toBe(false);
    }
  });

  it('Stage 3 (二维DP) 与 Stage 4 (一维压缩) 高亮行绝不能是注释行', () => {
    // Stage 3
    const stage3Variant = model.stages?.['stage-3']?.variants?.['standard'];
    const compiled3 = YamlModelLoader.compileSource(stage3Variant, 'java');
    const cleanLines3 = compiled3.cleanSource.split('\n');
    const steps3 = SequenceStepMatrixCompiler.compileLongestPalindromicStage3(model, compiled3.anchorMap);

    for (let idx = 0; idx < steps3.length; idx++) {
      const step = steps3[idx];
      const lineNum = step.line!;
      expect(lineNum).toBeGreaterThanOrEqual(1);
      expect(lineNum).toBeLessThanOrEqual(cleanLines3.length);
      const codeText = cleanLines3[lineNum - 1].trim();
      expect(codeText.startsWith('//'), `Stage 3 步骤 #${idx + 1} 行 ${lineNum} 绝不能是注释行`).toBe(false);
    }

    // Stage 4
    const stage4Variant = model.stages?.['stage-4']?.variants?.['rolling_1d'];
    const compiled4 = YamlModelLoader.compileSource(stage4Variant, 'java');
    const cleanLines4 = compiled4.cleanSource.split('\n');
    const steps4 = SequenceStepMatrixCompiler.compileLongestPalindromicStage4(model, compiled4.anchorMap);

    for (let idx = 0; idx < steps4.length; idx++) {
      const step = steps4[idx];
      const lineNum = step.line!;
      expect(lineNum).toBeGreaterThanOrEqual(1);
      expect(lineNum).toBeLessThanOrEqual(cleanLines4.length);
      const codeText = cleanLines4[lineNum - 1].trim();
      expect(codeText.startsWith('//'), `Stage 4 步骤 #${idx + 1} 行 ${lineNum} 绝不能是注释行`).toBe(false);
    }
  });
});
