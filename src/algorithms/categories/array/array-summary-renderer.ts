/**
 * 数组专题总结篇 可视化器 — 4-Card 标准现代架构
 * 系统回顾数组专题所有核心技巧：双指针、二分、滑动窗口、前缀和、模拟边界等
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ARRAY_SUMMARY_PROBLEM_HTML,
  ARRAY_SUMMARY_ANALYSIS_HTML,
  ARRAY_SUMMARY_CODE_LANGUAGES,
} from './array-summary-problem-content';
import template from './array-summary.html?raw';

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
  codeLine: number | number[];
  technique: string;
  problems: string[];
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

  // 0. Intro
  steps.push({
    section: 'intro',
    index: 0,
    message: '欢迎来到数组专题总结篇！我们将系统梳理数组 6 大核心解题范式。',
    log: '📝 数组专题回顾开始',
    codeLine: 0,
    technique: '全景导读',
    problems: ['数组理论基础', '移除元素', '有序数组平方', '最小子数组', '螺旋矩阵', '区间和'],
  });

  // 1. Basics
  steps.push({
    section: 'basics',
    index: 1,
    message: '基础操作：数组连续内存物理地址直接寻址使得下标访问为 O(1)，但搜索、插入和删除需要 O(n)。',
    log: '📦 基础操作：访问 O(1)，搜索/插入/删除 O(n)',
    codeLine: 1,
    technique: '连续内存寻址',
    problems: ['数组理论基础'],
  });

  // 2. Two-pointer
  steps.push({
    section: 'two-pointer',
    index: 2,
    message: '双指针法分为：①快慢双指针（原地修改）；②首尾对撞双指针（有序两端归并）；③滑动窗口（连续子数组最值）。',
    log: '👆👆 双指针三剑客：快慢 / 对撞 / 滑动窗口',
    codeLine: [2, 3],
    technique: '双指针三剑客',
    problems: ['LC 27 移除元素', 'LC 977 有序数组平方', 'LC 209 长度最小子数组'],
  });

  // 3. Binary search
  steps.push({
    section: 'binary-search',
    index: 3,
    message: '二分查找：有序数组的绝对检索利器，掌握左闭右闭 [left, right] 与左闭右开 [left, right) 的循环不变量。',
    log: '🎯 二分查找：区间开闭与循环不变量',
    codeLine: 2,
    technique: '二分查找',
    problems: ['LC 704 二分查找', 'LC 35 搜索插入位置'],
  });

  // 4. Prefix sum
  steps.push({
    section: 'prefix-sum',
    index: 4,
    message: '前缀和：以空间换时间，O(n) 预处理 prefix 数组，O(1) 瞬时响应一维区间求和与二维子矩阵求和。',
    log: '➕ 前缀和：一维差分与二维容斥原理',
    codeLine: [4, 5],
    technique: '前缀和差分与容斥',
    problems: ['Kama 58 区间和', 'Kama 44 购买土地'],
  });

  // 5. Matrix
  steps.push({
    section: 'matrix',
    index: 5,
    message: '模拟行为：螺旋矩阵等几何模拟问题，核心在于牢牢守住转折点定义，四边界 (top, bottom, left, right) 顺时针收缩。',
    log: '🌀 模拟行为：四边界顺时针收缩',
    codeLine: 3,
    technique: '四边界模拟',
    problems: ['LC 59 螺旋矩阵 II', 'LC 54 螺旋矩阵'],
  });

  // 6. Done
  steps.push({
    section: 'done',
    index: 6,
    message: '🎉 恭喜！数组专题 6 大核心解题范式已全部梳理完毕，你已具备扎实的数组解题功底！',
    log: '🏆 数组专题总结完成',
    codeLine: 0,
    technique: '数组通关',
    problems: ['全套数组经典题目'],
  });

  return steps;
}

export class ArraySummaryVisualizer extends StepVisualizer<ASStep> {
  protected codeLanguages = ARRAY_SUMMARY_CODE_LANGUAGES;
  protected codeLines = ARRAY_SUMMARY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '数组核心范式 速查速览';

  private currentQuizIdx = 0;
  private quizScore = 0;
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private paradigmCards: NodeListOf<HTMLElement> | null = null;
  private metricTopicEl: HTMLElement | null = null;
  private metricTrickEl: HTMLElement | null = null;
  private metricProblemsEl: HTMLElement | null = null;
  private metricScoreEl: HTMLElement | null = null;
  private quizQuestionEl: HTMLElement | null = null;
  private quizOptionsEl: HTMLElement | null = null;
  private quizFeedbackEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.paradigmCards = this.root.querySelectorAll('.as-paradigm-card');
    this.metricTopicEl = this.root.querySelector('#metric-topic');
    this.metricTrickEl = this.root.querySelector('#metric-trick');
    this.metricProblemsEl = this.root.querySelector('#metric-problems');
    this.metricScoreEl = this.root.querySelector('#metric-score');
    this.quizQuestionEl = this.root.querySelector('#quiz-question');
    this.quizOptionsEl = this.root.querySelector('#quiz-options');
    this.quizFeedbackEl = this.root.querySelector('#quiz-feedback');
    this.liveTextEl = this.root.querySelector('#as-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 范式卡片点击切换步进
    this.paradigmCards?.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx || '0', 10);
        const targetStep = Math.min(this.steps.length - 1, idx + 1);
        this.goToStep(targetStep);
      });
    });

    // 渲染测验题目
    this.renderQuiz(0);

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: ARRAY_SUMMARY_PROBLEM_HTML,
      analysisHtml: ARRAY_SUMMARY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  private renderQuiz(qIdx: number): void {
    if (!this.quizQuestionEl || !this.quizOptionsEl || !this.quizFeedbackEl) return;
    this.currentQuizIdx = qIdx % DEMO_QUESTIONS.length;
    const q = DEMO_QUESTIONS[this.currentQuizIdx];

    this.quizQuestionEl.textContent = `【自测题 ${this.currentQuizIdx + 1}/${DEMO_QUESTIONS.length}】${q.problem}`;
    this.quizFeedbackEl.textContent = '';
    this.quizOptionsEl.innerHTML = q.options
      .map(
        (opt, idx) => `
      <button class="as-quiz-btn" data-opt="${idx}">${String.fromCharCode(65 + idx)}. ${opt}</button>
    `
      )
      .join('');

    this.quizOptionsEl.querySelectorAll<HTMLButtonElement>('.as-quiz-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.dataset.opt || '0', 10);
        const isCorrect = chosen === q.correct;
        btn.classList.add(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
          this.quizScore++;
          if (this.metricScoreEl) this.metricScoreEl.textContent = `${this.quizScore} / ${DEMO_QUESTIONS.length}`;
          if (this.quizFeedbackEl) {
            this.quizFeedbackEl.innerHTML = `<span style="color:#15803d; font-weight:700;">✓ 回答正确！</span> ${q.explanation}`;
          }
        } else {
          if (this.quizFeedbackEl) {
            this.quizFeedbackEl.innerHTML = `<span style="color:#b91c1c; font-weight:700;">✗ 回答错误。</span> 正确答案为 ${String.fromCharCode(65 + q.correct)}。${q.explanation}`;
          }
        }

        // 2.5秒后切到下一题
        setTimeout(() => {
          this.renderQuiz(this.currentQuizIdx + 1);
        }, 2500);
      });
    });
  }

  protected buildSteps(): ASStep[] {
    return buildArraySummarySteps();
  }

  protected renderStep(step: ASStep): void {
    const { section, index, message, technique, problems } = step;

    // 1. 高亮对应范式卡片
    this.paradigmCards?.forEach((card) => {
      const cardIdx = parseInt(card.dataset.idx || '0', 10);
      if (cardIdx === index - 1) card.classList.add('active');
      else card.classList.remove('active');
    });

    // 2. 更新状态监视器
    if (this.metricTopicEl) {
      const topicNames: Record<string, string> = {
        intro: '全景导读',
        basics: '基础理论',
        'two-pointer': '双指针三剑客',
        'binary-search': '二分查找',
        'prefix-sum': '前缀和差分',
        matrix: '螺旋模拟',
        patterns: '总结升华',
        done: '通关大吉',
      };
      this.metricTopicEl.textContent = topicNames[section] || section;
    }
    if (this.metricTrickEl) this.metricTrickEl.textContent = technique;
    if (this.metricProblemsEl) {
      this.metricProblemsEl.textContent = `${problems.length} 个经典例题`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = section === 'done' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = section === 'done' ? '#15803d' : '#1d4ed8';
      logEntry.style.border = '1px solid ' + (section === 'done' ? '#bbf7d0' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeTopic = this.root?.querySelector('#badge-topic');
    if (badgeTopic) {
      const topicNames: Record<string, string> = {
        intro: '全景导读',
        basics: '基础理论',
        'two-pointer': '双指针三剑客',
        'binary-search': '二分查找',
        'prefix-sum': '前缀和差分',
        matrix: '螺旋模拟',
        patterns: '总结升华',
        done: '通关大吉',
      };
      badgeTopic.textContent = topicNames[section] || section;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
    this.quizScore = 0;
    if (this.metricScoreEl) this.metricScoreEl.textContent = `0 / ${DEMO_QUESTIONS.length}`;
    this.renderQuiz(0);
  }
}

registerAlgorithm({
  id: 'array-summary',
  name: '数组专题总结篇',
  viewId: 'algo-array-summary-view',
  category: 'array',
  description: '回顾数组专题所有核心技巧',
  icon: '📝',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '系统回顾数组专题所有核心技巧',
  template,
  Visualizer: ArraySummaryVisualizer,
});
