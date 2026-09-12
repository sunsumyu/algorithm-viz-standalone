/**
 * 数组专题总结篇 可视化器 — 4-Card 标准现代架构
 * 系统回顾数组专题所有核心技巧：双指针、二分、滑动窗口、前缀和、模拟边界等
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ARRAY_SUMMARY_PROBLEM_HTML,
  ARRAY_SUMMARY_ANALYSIS_HTML,
  ARRAY_SUMMARY_CODE_LANGUAGES,
} from './array-summary-problem-content';

export interface ASStep {
  section:
    | 'intro'
    | 'basics'
    | 'two-pointer'
    | 'binary-search'
    | 'prefix-sum'
    | 'matrix'
    | 'patterns'
    | 'done';
  index: number;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  technique: string;
  problems: string[];
  metrics?: Record<string, string>;
}

export interface DemoQuestion {
  problem: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    problem: '给定数组 nums=[3,2,2,3] 和目标值 val=3，原地移除所有等于 val 的元素。最适合使用？',
    options: ['二分查找', '快慢双指针', '前缀和', '二维矩阵'],
    correct: 1,
    explanation: '原地移除元素是经典快慢双指针问题。快指针寻找新元素，慢指针记录写入位置，O(1) 辅助空间。',
  },
  {
    problem: '给定升序整数数组 nums，返回各元素平方组成的新升序数组。最佳做法？',
    options: ['滑动窗口', '快慢指针', '首尾对撞双指针', '螺旋模拟'],
    correct: 2,
    explanation: '原数组有序，负数平方可能很大。用首尾双指针从两端向中间比对最大平方值倒序写入，时间 O(n)。',
  },
  {
    problem: '给定正整数数组 nums 和目标值 target，找出和 ≥ target 的最短连续子数组长度。应该用？',
    options: ['前缀和', '二分查找', '快慢指针', '滑动窗口'],
    correct: 3,
    explanation: '连续子数组求极值，滑动窗口最优。维护窗口和，和 ≥ target 时持续收缩左边界，时间 O(n)。',
  },
  {
    problem: '需要频繁查询一个静态数组中任意区间 [L, R] 的元素之和。最佳预处理方式？',
    options: ['排序后二分', '快慢指针', '一维前缀和', '模拟边界'],
    correct: 2,
    explanation: '一维前缀和预处理 O(n)，之后每次区间和查询 O(1)，是静态区间求和的标准做法。',
  },
  {
    problem: '生成一个 n×n 的顺时针螺旋矩阵。核心思路是？',
    options: ['递归分治', '四边界收缩模拟', '双指针', '前缀和'],
    correct: 1,
    explanation: '维护上下左右 (top, bottom, left, right) 四个边界，顺时针填数并收缩对应边界，循环不变量保证无 bug。',
  },
];

export function buildArraySummarySteps(): ASStep[] {
  const steps: ASStep[] = [];

  const lines = {
    intro: 1,
    basics: 1,
    twoPointer: [2, 3, 4],
    binarySearch: 5,
    prefixSum: [6, 7],
    matrix: 8,
    done: 1,
  };

  // 0. Intro
  steps.push({
    section: 'intro',
    index: 0,
    message: '欢迎来到数组专题总结篇！我们将系统梳理数组 6 大核心解题范式。',
    log: '📝 数组专题回顾开始',
    codeLine: lines.intro,
    technique: '全景导读',
    problems: ['数组理论基础', '移除元素', '有序数组平方', '最小子数组', '螺旋矩阵', '区间和'],
  });

  // 1. Basics
  steps.push({
    section: 'basics',
    index: 1,
    message: '基础操作：数组连续内存物理地址直接寻址使得下标访问为 O(1)，但搜索、插入和删除需要 O(n)。',
    log: '📦 基础操作：访问 O(1)，搜索/插入/删除 O(n)',
    codeLine: lines.basics,
    technique: '连续内存寻址',
    problems: ['数组理论基础'],
  });

  // 2. Two-pointer
  steps.push({
    section: 'two-pointer',
    index: 2,
    message: '双指针法分为：①快慢双指针（原地修改）；②首尾对撞双指针（有序两端归并）；③滑动窗口（连续子数组最值）。',
    log: '👆👆 双指针三剑客：快慢 / 对撞 / 滑动窗口',
    codeLine: lines.twoPointer,
    technique: '双指针三剑客',
    problems: ['LC 27 移除元素', 'LC 977 有序数组平方', 'LC 209 长度最小子数组'],
  });

  // 3. Binary search
  steps.push({
    section: 'binary-search',
    index: 3,
    message: '二分查找：有序数组的绝对检索利器，掌握左闭右闭 [left, right] 与左闭右开 [left, right) 的循环不变量。',
    log: '🎯 二分查找：区间开闭与循环不变量',
    codeLine: lines.binarySearch,
    technique: '二分查找',
    problems: ['LC 704 二分查找', 'LC 35 搜索插入位置'],
  });

  // 4. Prefix sum
  steps.push({
    section: 'prefix-sum',
    index: 4,
    message: '前缀和：以空间换时间，O(n) 预处理 prefix 数组，O(1) 瞬时响应一维区间求和与二维子矩阵求和。',
    log: '➕ 前缀和：一维差分与二维容斥原理',
    codeLine: lines.prefixSum,
    technique: '前缀和差分与容斥',
    problems: ['Kama 58 区间和', 'Kama 44 购买土地'],
  });

  // 5. Matrix
  steps.push({
    section: 'matrix',
    index: 5,
    message: '模拟行为：螺旋矩阵等几何模拟问题，核心在于牢牢守住转折点定义，四边界 (top, bottom, left, right) 顺时针收缩。',
    log: '🌀 模拟行为：四边界顺时针收缩',
    codeLine: lines.matrix,
    technique: '四边界模拟',
    problems: ['LC 59 螺旋矩阵 II', 'LC 54 螺旋矩阵'],
  });

  // 6. Done
  steps.push({
    section: 'done',
    index: 6,
    message: '🎉 恭喜！数组专题 6 大核心解题范式已全部梳理完毕，你已具备扎实的数组解题功底！',
    log: '🏆 数组专题总结完成',
    codeLine: lines.done,
    technique: '数组通关',
    problems: ['全套数组经典题目'],
  });

  return steps;
}


const TOPIC_NAMES: Record<string, string> = {
  intro: '全景导读',
  basics: '基础理论',
  'two-pointer': '双指针三剑客',
  'binary-search': '二分查找',
  'prefix-sum': '前缀和差分',
  matrix: '螺旋模拟',
  patterns: '总结升华',
  done: '通关大吉',
};

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: ASStep[]): ASStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      topic: TOPIC_NAMES[s.section] || s.section,
      trick: s.technique,
      problems: `${s.problems.length} 个经典例题`,
    },
  }));
}

/** 测验小部件状态（跨步骤持久） */
let quizIdx = 0;
let quizScore = 0;

function renderQuizPanel(host: HTMLElement): void {
  const q = DEMO_QUESTIONS[quizIdx % DEMO_QUESTIONS.length];
  const qEl = host.querySelector<HTMLElement>('.as-quiz-question');
  const optsEl = host.querySelector<HTMLElement>('.as-quiz-options');
  const fbEl = host.querySelector<HTMLElement>('.as-quiz-feedback');
  const scoreEl = host.querySelector<HTMLElement>('.as-quiz-score');
  if (!qEl || !optsEl || !fbEl || !scoreEl) return;

  qEl.textContent = `【自测题 ${(quizIdx % DEMO_QUESTIONS.length) + 1}/${DEMO_QUESTIONS.length}】${q.problem}`;
  scoreEl.textContent = `${quizScore} / ${DEMO_QUESTIONS.length}`;
  fbEl.innerHTML = '';
  optsEl.innerHTML = q.options
    .map((opt, i) => `<button class="as-quiz-btn" data-opt="${i}" style="padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #0f172a; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s;">${String.fromCharCode(65 + i)}. ${opt}</button>`)
    .join('');

  optsEl.querySelectorAll<HTMLButtonElement>('.as-quiz-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = parseInt(btn.dataset.opt || '0', 10);
      const isCorrect = chosen === q.correct;
      btn.style.borderColor = isCorrect ? '#22c55e' : '#ef4444';
      btn.style.background = isCorrect ? '#f0fdf4' : '#fef2f2';

      if (isCorrect) {
        quizScore++;
        scoreEl.textContent = `${quizScore} / ${DEMO_QUESTIONS.length}`;
        fbEl.innerHTML = `<span style="color:#15803d; font-weight:700;">✓ 回答正确！</span> ${q.explanation}`;
      } else {
        fbEl.innerHTML = `<span style="color:#b91c1c; font-weight:700;">✗ 回答错误。</span> 正确答案为 ${String.fromCharCode(65 + q.correct)}。${q.explanation}`;
      }

      setTimeout(() => {
        quizIdx = (quizIdx + 1) % DEMO_QUESTIONS.length;
        renderQuizPanel(host);
      }, 2500);
    });
  });
}

const PARADIGM_CARDS: Array<{ title: string; desc: string }> = [
  { title: '📦 基础操作', desc: '寻址 O(1) · 增删 O(n)' },
  { title: '👆 双指针三剑客', desc: '快慢 / 对撞 / 滑动窗口' },
  { title: '🎯 二分查找', desc: '区间开闭与循环不变量' },
  { title: '➕ 前缀和差分', desc: '一维区间和 · 二维容斥' },
  { title: '🌀 螺旋模拟', desc: '四边界顺时针收缩' },
  { title: '🏆 通关大吉', desc: '六大范式融会贯通' },
];

/** 主视觉：六大范式卡片 + 自测题小部件 */
export function renderArraySummaryCanvas(container: HTMLElement, step: ASStep): void {
  const activeIdx = step.index - 1;

  const cardsHtml = PARADIGM_CARDS.map((c, i) => {
    const isActive = i === activeIdx;
    return `
      <div style="width: 150px; padding: 12px 10px; border-radius: 12px; background: ${isActive ? '#eff6ff' : '#ffffff'}; border: 2px solid ${isActive ? '#3b82f6' : '#e2e8f0'}; box-shadow: ${isActive ? '0 4px 14px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.04)'}; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.25s ease; box-sizing: border-box;">
        <div style="font-size: 12px; font-weight: 800; color: ${isActive ? '#1d4ed8' : '#0f172a'};">${c.title}</div>
        <div style="font-size: 10px; color: #64748b;">${c.desc}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 14px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        ${cardsHtml}
      </div>
      <div class="as-quiz-panel" style="width: 100%; max-width: 560px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; background: #f8fafc; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10.5px; font-weight: 700; color: #64748b;">🎯 范式自测（点击作答，答对自动下一题）</span>
          <span class="as-quiz-score" style="font-family: monospace; font-weight: 800; color: #16a34a; font-size: 11px;">0 / ${DEMO_QUESTIONS.length}</span>
        </div>
        <div class="as-quiz-question" style="font-size: 11.5px; font-weight: 700; color: #0f172a; line-height: 1.4;"></div>
        <div class="as-quiz-options" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
        <div class="as-quiz-feedback" style="font-size: 11px; color: #334155; line-height: 1.4; min-height: 16px;"></div>
      </div>
    </div>
  `;

  renderQuizPanel(container);
}

registerDeclarativeAlgorithm<ASStep>({
  id: 'array-summary',
  name: '数组专题总结篇',
  category: 'array',
  description: '回顾数组专题所有核心技巧',
  icon: '📝',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '系统回顾数组专题所有核心技巧',
  inputs: [],
  presets: [
    { label: '六大范式速览', values: {} },
  ],
  metrics: [
    { id: 'topic', label: '当前主题', color: '#2563eb' },
    { id: 'trick', label: '核心技巧', color: '#a855f7' },
    { id: 'problems', label: '关联例题', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前范式', color: '#3b82f6' },
  ],
  codeLanguages: ARRAY_SUMMARY_CODE_LANGUAGES,
  problemHtml: ARRAY_SUMMARY_PROBLEM_HTML,
  analysisHtml: ARRAY_SUMMARY_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildArraySummarySteps()),
  renderCanvas: (container, step) => renderArraySummaryCanvas(container, step as ASStep),
});
