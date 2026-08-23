/**
 * 数组专题总结篇 可视化器
 * 系统回顾数组专题所有核心技巧：双指针、二分、前缀和、二维数组等
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './array-summary.html?raw';

/* ── Step interface ── */
interface ASStep {
  section: 'intro' | 'basics' | 'two-pointer' | 'binary-search' | 'prefix-sum' | 'matrix' | 'patterns' | 'matrix-table' | 'done';
  index: number;
  message: string;
  log: string;
  codeLine: number | number[];
  technique: string;
  problems: string[];
}

/* ── Practice questions ── */
interface DemoQuestion {
  problem: string;
  options: string[];
  correct: number;
  explanation: string;
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    problem: '给定数组 nums=[3,2,2,3] 和目标值 val=3，要求原地移除所有等于 val 的元素。最适合使用哪种技巧？',
    options: ['二分查找', '快慢指针', '前缀和', '二维前缀和'],
    correct: 1,
    explanation: '原地移除元素是经典的双指针问题。快指针遍历数组，慢指针记录保留位置，空间 O(1)。',
  },
  {
    problem: '给定一个升序排列的整数数组 nums，返回每个元素的平方组成的新数组（也要升序）。最佳做法？',
    options: ['滑动窗口', '快慢指针', '首尾双指针', '模拟边界'],
    correct: 2,
    explanation: '因为原数组有序，负数的平方可能很大。用首尾双指针从两端比较平方值，从后往前填入结果数组，时间 O(n)。',
  },
  {
    problem: '给定正整数数组 nums 和目标值 target，找出和 >= target 的最短连续子数组长度。应该用？',
    options: ['前缀和', '二分查找', '快慢指针', '滑动窗口'],
    correct: 3,
    explanation: '连续子数组求最值，滑动窗口是最优策略。维护窗口和，和 >= target 时收缩左边界，时间 O(n)。',
  },
  {
    problem: '需要频繁查询一个静态数组中任意区间 [l, r] 的元素之和。最佳预处理方式？',
    options: ['排序后二分', '快慢指针', '前缀和', '模拟边界'],
    correct: 2,
    explanation: '前缀和预处理 O(n)，之后每次区间和查询 O(1)，是静态区间求和的标准做法。',
  },
  {
    problem: '给定一个 m x n 的矩阵，按照螺旋顺序输出所有元素。核心思路是？',
    options: ['递归分治', '模拟边界', '双指针', '前缀和'],
    correct: 1,
    explanation: '维护上下左右四个边界，依次按右→下→左→上遍历，每次遍历后收缩对应边界，直到边界交错。',
  },
];

/* ── Build steps ── */
function buildSteps(): ASStep[] {
  const steps: ASStep[] = [];

  // 0. Intro
  steps.push({
    section: 'intro',
    index: 0,
    message: '欢迎来到数组专题总结篇！我们将系统回顾数组专题的 6 大核心技巧。',
    log: '📝 数组专题回顾开始',
    codeLine: 0,
    technique: 'overview',
    problems: [],
  });

  // 1. Basics
  steps.push({
    section: 'basics',
    index: 1,
    message: '基础操作：数组通过下标访问元素的时间为 O(1)，但搜索、插入和删除需要 O(n)。理解这些基本复杂度是所有技巧的基础。',
    log: '📦 基础操作：访问 O(1)，搜索/插入/删除 O(n)',
    codeLine: 1,
    technique: 'basics',
    problems: [],
  });

  // 2. Two-pointer
  steps.push({
    section: 'two-pointer',
    index: 2,
    message: '双指针法包含三种变体：①对撞指针（首尾向中间）适用于有序数组；②快慢指针适用于原地修改；③滑动窗口适用于连续子数组最值问题。',
    log: '👆👆 双指针：对撞 / 快慢 / 滑动窗口',
    codeLine: [2, 3],
    technique: 'two-pointer',
    problems: ['移除元素', '有序数组平方', '长度最小子数组'],
  });

  // 3. Binary search
  steps.push({
    section: 'binary-search',
    index: 3,
    message: '二分查找：在有序数组上 O(log n) 查找目标值。关键是要明确搜索区间和循环不变量，注意左右边界的开闭。',
    log: '🔍 二分查找：有序数组上 O(log n)',
    codeLine: 4,
    technique: 'binary-search',
    problems: ['二分查找'],
  });

  // 4. Prefix sum
  steps.push({
    section: 'prefix-sum',
    index: 4,
    message: '前缀和：O(n) 预处理后，任意区间和查询只需 O(1)。公式：sum(l, r) = pre[r+1] - pre[l]。',
    log: '📊 前缀和：O(n) 预处理，O(1) 查询',
    codeLine: 5,
    technique: 'prefix-sum',
    problems: ['区间和'],
  });

  // 5. Matrix (2D)
  steps.push({
    section: 'matrix',
    index: 5,
    message: '二维数组技巧：螺旋遍历通过维护四个边界逐步收缩；二维前缀和将前缀和扩展到二维，用于子矩阵求和。',
    log: '🌀 二维数组：螺旋遍历 + 二维前缀和',
    codeLine: 6,
    technique: 'matrix',
    problems: ['螺旋矩阵', '购买土地'],
  });

  // 6. Patterns
  steps.push({
    section: 'patterns',
    index: 6,
    message: '常用套路：原地修改（快慢指针覆盖）、分块处理（√n 分块）、平方后归并（首尾双指针）、模拟边界、差分数组、二分答案。',
    log: '🛠️ 常用套路：原地修改 / 分块 / 归并 / 模拟 / 差分 / 二分答案',
    codeLine: [1, 2, 3, 4, 5, 6],
    technique: 'patterns',
    problems: [],
  });

  // 7. Matrix-table – highlight each row in turn
  const tableRows = [
    { problem: '移除元素', technique: '快慢指针' },
    { problem: '有序数组平方', technique: '首尾双指针' },
    { problem: '长度最小子数组', technique: '滑动窗口' },
    { problem: '二分查找', technique: '二分查找' },
    { problem: '螺旋矩阵', technique: '模拟边界' },
    { problem: '区间和', technique: '前缀和' },
    { problem: '购买土地', technique: '二维前缀和' },
  ];

  tableRows.forEach((row, i) => {
    steps.push({
      section: 'matrix-table',
      index: 7 + i,
      message: `对照表 (${i + 1}/${tableRows.length})：「${row.problem}」→ 核心技巧是「${row.technique}」`,
      log: `📋 ${row.problem} → ${row.technique}`,
      codeLine: 0,
      technique: row.technique,
      problems: [row.problem],
    });
  });

  // 8. Done
  steps.push({
    section: 'done',
    index: 7 + tableRows.length,
    message: '🎉 数组专题回顾完成！你已复习了双指针、二分查找、前缀和、二维数组等核心技巧。尝试右侧的互动练习来检验掌握程度吧！',
    log: '🎉 回顾完成！',
    codeLine: [0, 1, 2, 3, 4, 5, 6],
    technique: 'done',
    problems: [],
  });

  return steps;
}

/* ── Visualizer ── */
export class ArraySummaryVisualizer extends StepVisualizer<ASStep> {
  protected codeLines = [
    '// 数组专题核心技巧 (Java)',
    '// 1. 双指针（快慢/对撞）',
    '// 2. 二分查找（有序数组）',
    '// 3. 滑动窗口（子数组优化）',
    '// 4. 前缀和（区间查询）',
    '// 5. 二维前缀和（子矩阵）',
    '// 6. 模拟（螺旋遍历）',
  ];
  protected codePanelTitle = '数组专题 Java 技巧速查';

  // Section visibility mapping
  private sectionMap: Record<string, string> = {
    intro: 'as-section-basics',
    basics: 'as-section-basics',
    'two-pointer': 'as-section-two-pointer',
    'binary-search': 'as-section-binary-search',
    'prefix-sum': 'as-section-prefix-sum',
    matrix: 'as-section-matrix',
    patterns: 'as-section-patterns',
    'matrix-table': 'as-section-matrix-table',
    done: 'as-section-demo',
  };

  private allSections: HTMLElement[] = [];
  private techItems: HTMLElement[] = [];
  private tableRows: HTMLElement[] = [];
  private logEl: HTMLElement | null = null;
  private currentDemo: DemoQuestion | null = null;
  private demoOptions: HTMLElement | null = null;
  private demoResult: HTMLElement | null = null;
  private demoQuestionEl: HTMLElement | null = null;
  private shuffleBtn: HTMLElement | null = null;
  private revealedSections = new Set<string>();

  protected initDOMElements(): void {
    if (!this.root) return;
    this.logEl = this.root.querySelector('#as-log');
    this.demoOptions = this.root.querySelector('#as-demo-options');
    this.demoResult = this.root.querySelector('#as-demo-result');
    this.demoQuestionEl = this.root.querySelector('#as-demo-question');
    this.shuffleBtn = this.root.querySelector('#as-shuffle-btn');

    // Collect all section elements
    this.allSections = [
      'as-section-basics',
      'as-section-two-pointer',
      'as-section-binary-search',
      'as-section-prefix-sum',
      'as-section-matrix',
      'as-section-patterns',
      'as-section-matrix-table',
      'as-section-demo',
    ].map((id) => this.root!.querySelector(`#${id}`) as HTMLElement).filter(Boolean);

    // Collect technique cards
    this.techItems = [];
    for (let i = 0; i < 6; i++) {
      const el = this.root!.querySelector(`#as-tech-${i}`) as HTMLElement;
      if (el) this.techItems.push(el);
    }

    // Collect table rows
    this.tableRows = [];
    for (let i = 0; i < 7; i++) {
      const el = this.root!.querySelector(`#as-row-${i}`) as HTMLElement;
      if (el) this.tableRows.push(el);
    }

    this.bindPlaybackControls({ message: 'step-message' });

    if (this.shuffleBtn) {
      this.shuffleBtn.onclick = () => this.showRandomDemo();
    }
  }

  protected buildSteps(): ASStep[] {
    return buildSteps();
  }

  protected renderStep(step: ASStep): void {
    // 1. Reveal sections progressively
    this.revealUpTo(step.section);

    // 2. Technique card animations (patterns section)
    if (step.section === 'patterns') {
      this.animateTechItems();
    }

    // 3. Table row highlighting
    this.highlightTableRow(step);

    // 4. Interactive demo
    if (step.section === 'done') {
      this.showRandomDemo();
    }

    // 5. Log
    this.renderLogLine(step);

    // 6. Auto-scroll to latest revealed section
    this.scrollToLatest(step.section);
  }

  /* ── Section reveal ── */
  private revealUpTo(section: string): void {
    const sectionOrder = [
      'as-section-basics',
      'as-section-two-pointer',
      'as-section-binary-search',
      'as-section-prefix-sum',
      'as-section-matrix',
      'as-section-patterns',
      'as-section-matrix-table',
      'as-section-demo',
    ];

    const targetId = this.sectionMap[section];
    if (!targetId) return;

    const targetIdx = sectionOrder.indexOf(targetId);
    if (targetIdx === -1) return;

    for (let i = 0; i <= targetIdx; i++) {
      const el = this.allSections.find((s) => s.id === sectionOrder[i]);
      if (el && !this.revealedSections.has(sectionOrder[i])) {
        this.revealedSections.add(sectionOrder[i]);
        el.classList.remove('as-section-hidden');
        el.classList.add('as-section-visible');
      }
    }
  }

  /* ── Tech item staggered animation ── */
  private animateTechItems(): void {
    this.techItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('as-visible');
      }, i * 120);
    });
  }

  /* ── Table row highlighting ── */
  private highlightTableRow(step: ASStep): void {
    if (step.section !== 'matrix-table') {
      // Remove all highlights when not in matrix-table section
      this.tableRows.forEach((row) => {
        row.classList.remove('as-row-highlight');
        row.classList.add('as-row-dim');
      });
      return;
    }

    const tableRowIndex = step.index - 7;
    this.tableRows.forEach((row, i) => {
      row.classList.remove('as-row-highlight', 'as-row-dim');
      if (i === tableRowIndex) {
        row.classList.add('as-row-highlight');
      } else if (i < tableRowIndex) {
        // Already discussed rows are normal
      } else {
        row.classList.add('as-row-dim');
      }
    });
  }

  /* ── Interactive demo ── */
  private showRandomDemo(): void {
    const q = DEMO_QUESTIONS[Math.floor(Math.random() * DEMO_QUESTIONS.length)];
    this.currentDemo = q;

    if (this.demoQuestionEl) {
      this.demoQuestionEl.textContent = q.problem;
    }

    if (this.demoOptions) {
      this.demoOptions.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'as-demo-opt';
        btn.textContent = opt;
        btn.onclick = () => this.checkAnswer(i, q);
        this.demoOptions!.appendChild(btn);
      });
    }

    if (this.demoResult) {
      this.demoResult.className = 'as-demo-result';
      this.demoResult.textContent = '';
    }
  }

  private checkAnswer(chosen: number, q: DemoQuestion): void {
    const opts = this.demoOptions?.querySelectorAll('.as-demo-opt');
    if (!opts) return;

    const isCorrect = chosen === q.correct;

    opts.forEach((btn, i) => {
      const el = btn as HTMLElement;
      el.onclick = null;
      if (i === q.correct) {
        el.classList.add('as-correct');
      } else if (i === chosen && !isCorrect) {
        el.classList.add('as-wrong');
      }
    });

    if (this.demoResult) {
      this.demoResult.className = 'as-demo-result as-show ' + (isCorrect ? 'as-ok' : 'as-fail');
      this.demoResult.textContent = isCorrect
        ? `✅ 正确！${q.explanation}`
        : `❌ 不对哦。正确答案是「${q.options[q.correct]}」。${q.explanation}`;
    }
  }

  /* ── Scroll helper ── */
  private scrollToLatest(section: string): void {
    const targetId = this.sectionMap[section];
    if (!targetId) return;
    const el = this.root?.querySelector(`#${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ── Log rendering ── */
  private renderLogLine(step: ASStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'array-summary',
  name: '数组专题总结篇',
  viewId: 'algo-array-summary-view',
  category: 'array',
  description: '回顾数组专题所有核心技巧',
  icon: '📝',
  template,
  Visualizer: ArraySummaryVisualizer,
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '系统梳理数组专题的核心思想与解题套路',
});

export {};
