/**
 * 数组专题总结篇 — 画布适配器
 * 负责六大范式卡片与范式自测题小部件渲染
 */

import { ASStep } from './array-summary-step-compiler';

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

let quizIdx = 0;
let quizScore = 0;

export function renderQuizPanel(host: HTMLElement): void {
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

export const PARADIGM_CARDS: Array<{ title: string; desc: string }> = [
  { title: '📦 基础操作', desc: '寻址 O(1) · 增删 O(n)' },
  { title: '👆 双指针三剑客', desc: '快慢 / 对撞 / 滑动窗口' },
  { title: '🎯 二分查找', desc: '区间开闭与循环不变量' },
  { title: '➕ 前缀和差分', desc: '一维区间和 · 二维容斥' },
  { title: '🌀 螺旋模拟', desc: '四边界顺时针收缩' },
  { title: '🏆 通关大吉', desc: '六大范式融会贯通' },
];

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
