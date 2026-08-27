import type { KeyPointsData, ProblemDetail } from './code-panel';

/**
 * 题目题面与算法要点解析器 (ProblemAnalysisViewer) - 深模块 (Deep Module)
 * 封装：
 * 1. LeetCode 原始题目题面、输入输出格式与测试用例渲染 (Problem Detail View)
 * 2. 5 步动态规划法系统要点看板渲染 (KeyPoints Takeaways View)
 */
export class ProblemAnalysisViewer {
  /**
   * 渲染核心要点视图 (5-Step DP Method Takeaways View)
   */
  public static renderKeyPoints(container: HTMLElement, keyPoints: KeyPointsData | string): void {
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'algo-kp-card';

    // 结构化数据模式
    if (typeof keyPoints === 'object' && keyPoints.points) {
      const header = document.createElement('div');
      header.className = 'algo-kp-header';

      const title = document.createElement('div');
      title.className = 'algo-kp-title';
      title.innerHTML = `💡 ${keyPoints.title || '动态规划 5 步推导核心要点'}`;
      header.appendChild(title);

      if (keyPoints.summary) {
        const summary = document.createElement('div');
        summary.className = 'algo-kp-summary';
        summary.innerHTML = keyPoints.summary;
        header.appendChild(summary);
      }

      card.appendChild(header);

      const list = document.createElement('div');
      list.className = 'algo-kp-list';

      keyPoints.points.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'algo-kp-item';

        const num = document.createElement('span');
        num.className = 'algo-kp-num';
        num.textContent = String(index + 1);

        const icon = document.createElement('span');
        icon.className = 'algo-kp-icon';
        icon.textContent = item.icon || '📌';

        const content = document.createElement('div');
        content.className = 'algo-kp-content';

        const labelRow = document.createElement('div');
        labelRow.className = 'algo-kp-label-row';

        const label = document.createElement('span');
        label.className = 'algo-kp-label';
        label.textContent = item.label;
        labelRow.appendChild(label);

        if (item.badge) {
          const badge = document.createElement('span');
          badge.className = 'algo-kp-badge';
          badge.textContent = item.badge;
          labelRow.appendChild(badge);
        }

        const desc = document.createElement('div');
        desc.className = 'algo-kp-desc';
        desc.innerHTML = item.desc;

        content.appendChild(labelRow);
        content.appendChild(desc);

        row.appendChild(num);
        row.appendChild(icon);
        row.appendChild(content);
        list.appendChild(row);
      });

      card.appendChild(list);
    } else {
      // 纯文本 / HTML 模式
      const textContent = document.createElement('div');
      textContent.className = 'algo-kp-html-content';
      textContent.innerHTML = typeof keyPoints === 'string' ? keyPoints : '';
      card.appendChild(textContent);
    }

    container.appendChild(card);
  }

  /**
   * 渲染原始题目描述视图 (Problem Statement View)
   */
  public static renderProblemDetail(container: HTMLElement, problemDetail: ProblemDetail): void {
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'algo-problem-card';

    // 1. 题目头部元信息 (Title, LeetCode ID & Difficulty Badge, Tags)
    const header = document.createElement('div');
    header.className = 'algo-problem-header';

    const titleRow = document.createElement('div');
    titleRow.className = 'algo-problem-title-row';

    const title = document.createElement('h3');
    title.className = 'algo-problem-title';
    title.textContent = problemDetail.title || '题目描述';
    titleRow.appendChild(title);

    if (problemDetail.difficulty) {
      const diffBadge = document.createElement('span');
      diffBadge.className = `algo-problem-diff is-${problemDetail.difficulty}`;
      diffBadge.textContent =
        problemDetail.difficulty === 'easy'
          ? '简单'
          : problemDetail.difficulty === 'medium'
          ? '中等'
          : '困难';
      titleRow.appendChild(diffBadge);
    }

    if (problemDetail.leetcodeId) {
      const lcLink = document.createElement('a');
      lcLink.className = 'algo-problem-lc-link';
      lcLink.href = problemDetail.leetcodeUrl || `https://leetcode.cn/problems/`;
      lcLink.target = '_blank';
      lcLink.rel = 'noopener noreferrer';
      lcLink.innerHTML = `LeetCode #${problemDetail.leetcodeId} ↗`;
      titleRow.appendChild(lcLink);
    }

    header.appendChild(titleRow);

    if (problemDetail.tags && problemDetail.tags.length > 0) {
      const tagsRow = document.createElement('div');
      tagsRow.className = 'algo-problem-tags';
      problemDetail.tags.forEach((tag) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'algo-problem-tag';
        tagEl.textContent = tag;
        tagsRow.appendChild(tagEl);
      });
      header.appendChild(tagsRow);
    }

    card.appendChild(header);

    // 2. 题面正文 (Description)
    const descEl = document.createElement('div');
    descEl.className = 'algo-problem-desc';
    descEl.innerHTML = problemDetail.description;
    card.appendChild(descEl);

    // 3. 测试用例示例 (Examples)
    if (problemDetail.examples && problemDetail.examples.length > 0) {
      const examplesTitle = document.createElement('div');
      examplesTitle.className = 'algo-problem-section-title';
      examplesTitle.innerHTML = '🧪 示例测试用例';
      card.appendChild(examplesTitle);

      problemDetail.examples.forEach((ex, index) => {
        const exCard = document.createElement('div');
        exCard.className = 'algo-problem-example-card';

        const exHeader = document.createElement('div');
        exHeader.className = 'algo-problem-example-header';
        exHeader.textContent = `示例 ${index + 1}`;
        exCard.appendChild(exHeader);

        const exBody = document.createElement('div');
        exBody.className = 'algo-problem-example-body';

        const inRow = document.createElement('div');
        inRow.className = 'algo-problem-example-row';
        inRow.innerHTML = `<span class="ex-label">输入：</span><code class="ex-code">${ex.input}</code>`;
        exBody.appendChild(inRow);

        const outRow = document.createElement('div');
        outRow.className = 'algo-problem-example-row';
        outRow.innerHTML = `<span class="ex-label">输出：</span><code class="ex-code is-out">${ex.output}</code>`;
        exBody.appendChild(outRow);

        if (ex.explanation) {
          const expRow = document.createElement('div');
          expRow.className = 'algo-problem-example-row is-exp';
          expRow.innerHTML = `<span class="ex-label">解释：</span><span class="ex-text">${ex.explanation}</span>`;
          exBody.appendChild(expRow);
        }

        exCard.appendChild(exBody);
        card.appendChild(exCard);
      });
    }

    // 4. 数据规模约束与提示 (Constraints)
    if (problemDetail.constraints && problemDetail.constraints.length > 0) {
      const constrTitle = document.createElement('div');
      constrTitle.className = 'algo-problem-section-title';
      constrTitle.innerHTML = '🔒 数据规模与约束条件';
      card.appendChild(constrTitle);

      const constrList = document.createElement('ul');
      constrList.className = 'algo-problem-constraints';
      problemDetail.constraints.forEach((c) => {
        const li = document.createElement('li');
        li.innerHTML = `<code>${c}</code>`;
        constrList.appendChild(li);
      });
      card.appendChild(constrList);
    }

    container.appendChild(card);
  }
}
