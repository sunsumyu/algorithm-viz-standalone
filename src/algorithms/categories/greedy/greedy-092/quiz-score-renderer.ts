/**
 * 知识竞赛得分最大化 - 声明式教学级沙盘渲染器
 * 核心贪心：全选 B 策略基准分 + 差值贡献 (a[i] - b[i]) 降序排序贪心选前 k 题为 A
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  QUIZ_SCORE_CODES,
  QUIZ_SCORE_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface QuizQuestionItem {
  id: number;
  scoreA: number;
  scoreB: number;
  diff: number; // scoreA - scoreB
  chosenStrategy?: 'A' | 'B';
}

export interface QuizScoreStep extends Greedy092Step {
  questions: QuizQuestionItem[];
  k: number;
  curIdx: number;
  totalScore: number;
}

export function buildQuizScoreSteps(rawQuestions: [number, number][], k: number): QuizScoreStep[] {
  const steps: QuizScoreStep[] = [];
  const lines = QUIZ_SCORE_LINES;
  const n = rawQuestions.length;

  const questions: QuizQuestionItem[] = rawQuestions.map(([scoreA, scoreB], idx) => ({
    id: idx + 1,
    scoreA,
    scoreB,
    diff: scoreA - scoreB,
  }));

  // Step 0: 入口
  steps.push({
    questions: questions.map(q => ({ ...q })),
    k,
    curIdx: -1,
    totalScore: 0,
    decision: `主函数入口：题目总数 n=${n}，必须选择恰好 k=${k} 道题使用 A 策略`,
    message: '通过比较每道题选 A 相比选 B 的额外增量收益 diff = a[i] - b[i]',
    log: `enter maxScore(n=${n}, k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 差值降序排序
  const sorted = [...questions].sort((q1, q2) => q2.diff - q1.diff);

  steps.push({
    questions: sorted.map(q => ({ ...q })),
    k,
    curIdx: -1,
    totalScore: 0,
    decision: '贪心排序：按 A 策略相对 B 策略的增益差值 (scoreA - scoreB) 从大到小降序排列',
    message: '优先给差值最大的前 k 道题分配 A 策略，其余 n-k 道题分配 B 策略',
    log: 'sorted questions by diff descending',
    codeLine: lines.sortDiff,
  });

  // Step 2: 选前 k 题为 A 策略
  let totalScore = 0;
  for (let i = 0; i < k; i++) {
    const q = sorted[i];
    q.chosenStrategy = 'A';
    totalScore += q.scoreA;

    steps.push({
      questions: sorted.map(item => ({ ...item })),
      k,
      curIdx: i,
      totalScore,
      decision: `题目 #${q.id} [A:${q.scoreA}, B:${q.scoreB}, 差值:+${q.diff}] ➔ 选 A 策略，获得 ${q.scoreA} 分，累计得分 = ${totalScore}`,
      message: `A 策略名额已使用 ${i + 1} / ${k}`,
      log: `question #${q.id} choose A -> +${q.scoreA}, total=${totalScore}`,
      codeLine: lines.pickA,
    });
  }

  // Step 3: 其余选 B 策略
  for (let i = k; i < n; i++) {
    const q = sorted[i];
    q.chosenStrategy = 'B';
    totalScore += q.scoreB;

    steps.push({
      questions: sorted.map(item => ({ ...item })),
      k,
      curIdx: i,
      totalScore,
      decision: `题目 #${q.id} [A:${q.scoreA}, B:${q.scoreB}, 差值:${q.diff}] ➔ 选 B 策略，获得 ${q.scoreB} 分，累计得分 = ${totalScore}`,
      message: `B 策略题目分配 (${i - k + 1} / ${n - k})`,
      log: `question #${q.id} choose B -> +${q.scoreB}, total=${totalScore}`,
      codeLine: lines.pickB,
    });
  }

  // Step 4: 收敛
  steps.push({
    questions: sorted.map(item => ({ ...item })),
    k,
    curIdx: -1,
    totalScore,
    decision: `🎉 计算完毕！恰好选择 ${k} 道题选 A、其余选 B 的最大总得分为 ${totalScore} 分`,
    message: '贪心差值决策方案全局最优',
    log: `done totalScore=${totalScore}`,
    codeLine: lines.done,
  });

  return steps;
}

export const quizScoreVisualizer = registerDeclarativeAlgorithm<QuizScoreStep>({
  id: 'quiz-score-maximization',
  name: '知识竞赛得分最大化 (Quiz Score)',
  category: 'greedy',
  icon: '📝',
  difficulty: 2,
  levelOrder: 924,
  learningGoal: '掌握基准假定结合边际差值 (A - B) 降序贪心排序选择的经典转化模型',
  problemHtml: GREEDY_092_PROBLEMS.quizScore.html,
  analysisHtml: GREEDY_092_PROBLEMS.quizScore.html,
  inputs: [
    {
      id: 'input-questions',
      label: '题目分值列表 (A,B 分号隔开)',
      type: 'text',
      defaultValue: '10,2; 8,5; 6,6; 3,7',
      placeholder: '10,2; 8,5; 6,6; 3,7',
    },
    {
      id: 'input-k',
      label: '选择 A 策略题目数 k',
      type: 'text',
      defaultValue: '2',
      placeholder: '如 2',
    },
  ],
  codeLanguages: QUIZ_SCORE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawQuestions = String(inputs?.['input-questions'] || '10,2; 8,5; 6,6; 3,7');
    const k = Math.max(0, parseInt(String(inputs?.['input-k'] || '2'), 10) || 0);
    const questions = rawQuestions.split(';').map((item) => {
      const parts = item.trim().split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    }).filter(([a, b]) => a > 0 || b > 0);
    return buildQuizScoreSteps(questions, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: QuizScoreStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">题目规模: <b>${step.questions.length}</b> 题</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">目标 A 策略数: ${step.k} 题</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">当前最大总得分:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalScore} 分</span>
        </div>
      </div>
    `;

    // 中部题目看板
    const qBox = document.createElement('div');
    qBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    step.questions.forEach((q, idx) => {
      const isCur = step.curIdx === idx;
      const isA = q.chosenStrategy === 'A';
      const isB = q.chosenStrategy === 'B';

      let border = '#cbd5e1';
      let bg = '#f8fafc';
      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
      } else if (isA) {
        border = '#10b981';
        bg = '#ecfdf5';
      } else if (isB) {
        border = '#f59e0b';
        bg = '#fffbeb';
      }

      const card = document.createElement('div');
      card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 12px; color: #1e293b;">题目 #${q.id} ${q.chosenStrategy ? `(选策略 ${q.chosenStrategy})` : ''}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${q.diff >= 0 ? '#10b981' : '#ef4444'};">增益 (A-B): ${q.diff >= 0 ? `+${q.diff}` : q.diff}</span>
        </div>
        <div style="display: flex; justify-content: space-around; margin: 4px 0; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="color: #64748b; font-size: 10px;">策略 A 得分</span>
            <span style="font-weight: 700; color: ${isA ? '#047857' : '#334155'};">${q.scoreA}</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="color: #64748b; font-size: 10px;">策略 B 得分</span>
            <span style="font-weight: 700; color: ${isB ? '#b45309' : '#334155'};">${q.scoreB}</span>
          </div>
        </div>
      `;
      qBox.appendChild(card);
    });
    mainCard.appendChild(qBox);

    stageContainer.appendChild(mainCard);
  },
});
