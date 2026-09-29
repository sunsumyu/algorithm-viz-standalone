import { describe, it, expect } from 'vitest';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  JUMP_POINT_SEARCH_CODE_LANGUAGES,
  JPS_CODE_LINES,
} from './jump-point-search-problem-content';

describe('JPS Problem Content & Code Panel', () => {
  it('应包含完备的教学讲义与分析 HTML', () => {
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('Jump Point Search');
    expect(JUMP_POINT_SEARCH_PROBLEM_HTML).toContain('强迫邻居');
    expect(JUMP_POINT_SEARCH_ANALYSIS_HTML).toContain('复杂度');
  });

  it('四语言代码中必须覆盖 Java / C++ / Python / JavaScript', () => {
    const langs = Object.keys(JUMP_POINT_SEARCH_CODE_LANGUAGES);
    expect(langs).toContain('java');
    expect(langs).toContain('cpp');
    expect(langs).toContain('python');
    expect(langs).toContain('javascript');
  });

  it('所有锚点行号必须在有效代码行数范围内且为正整数', () => {
    for (const [action, langMap] of Object.entries(JPS_CODE_LINES)) {
      for (const [lang, lineOrLines] of Object.entries(langMap)) {
        const code = JUMP_POINT_SEARCH_CODE_LANGUAGES[lang];
        expect(code, `代码语言 ${lang} 必须存在`).toBeDefined();
        const lineCount = code.split('\n').length;
        const lines = Array.isArray(lineOrLines) ? lineOrLines : [lineOrLines];
        for (const l of lines) {
          expect(l, `Action ${action} in ${lang} line ${l} 必须大于 0`).toBeGreaterThan(0);
          expect(l, `Action ${action} in ${lang} line ${l} 必须小于等于总行数 ${lineCount}`).toBeLessThanOrEqual(lineCount);
        }
      }
    }
  });
});
