/**
 * 知识竞赛得分最大化 (Quiz Score Maximization) StepCompiler
 * 核心贪心：全选 B 策略基准分 + 差值贡献 (a[i] - b[i]) 降序排序贪心选前 k 题为 A
 */

import { QUIZ_SCORE_LINES } from './greedy-092-stage-codes';
import { Greedy092Step } from './greedy-092-shared';

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
    questions: questions.map((q) => ({ ...q })),
    k,
    curIdx: -1,
    totalScore: 0,
    decision: `主函数入口：题目总数 n=${n}，必须选择恰好 k=${k} 道题使用 A 策略`,
    message: '通过比较每道题选 A 相比选 B 的额外增量收益 diff = a[i] - b[i]',
    log: `enter maxScore(n=${n}, k=${k})`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
  });

  // Step 1: 差值降序排序
  const sorted = [...questions].sort((q1, q2) => q2.diff - q1.diff);

  steps.push({
    questions: sorted.map((q) => ({ ...q })),
    k,
    curIdx: -1,
    totalScore: 0,
    decision: `差值降序贪心排序完成：[${sorted.map((q) => `题#${q.id}(差值:${q.diff})`).join(', ')}]`,
    message: '差值最大代表选 A 相比选 B 带来的净收益最大',
    log: `sorted questions by diff desc: [${sorted.map((q) => q.diff).join(',')}]`,
    line: lines.sortDiff.javascript,
    codeLine: lines.sortDiff,
  });

  let totalScore = 0;

  // Step 2: 前 k 个选择 A
  for (let i = 0; i < k && i < n; i++) {
    const q = sorted[i];
    q.chosenStrategy = 'A';
    totalScore += q.scoreA;

    steps.push({
      questions: sorted.map((item) => ({ ...item })),
      k,
      curIdx: i,
      totalScore,
      decision: `题目 #${q.id} [A:${q.scoreA}, B:${q.scoreB}, 差值:${q.diff}] ➔ 选 A 策略，获得 ${q.scoreA} 分，累计得分 = ${totalScore}`,
      message: `A 策略名额分配 (${i + 1} / ${k})`,
      log: `question #${q.id} choose A -> +${q.scoreA}, total=${totalScore}`,
      line: lines.pickA.javascript,
      codeLine: lines.pickA,
    });
  }

  // Step 3: 剩余题目选择 B
  for (let i = k; i < n; i++) {
    const q = sorted[i];
    q.chosenStrategy = 'B';
    totalScore += q.scoreB;

    steps.push({
      questions: sorted.map((item) => ({ ...item })),
      k,
      curIdx: i,
      totalScore,
      decision: `题目 #${q.id} [A:${q.scoreA}, B:${q.scoreB}, 差值:${q.diff}] ➔ 选 B 策略，获得 ${q.scoreB} 分，累计得分 = ${totalScore}`,
      message: `B 策略题目分配 (${i - k + 1} / ${n - k})`,
      log: `question #${q.id} choose B -> +${q.scoreB}, total=${totalScore}`,
      line: lines.pickB.javascript,
      codeLine: lines.pickB,
    });
  }

  // Step 4: 收敛
  steps.push({
    questions: sorted.map((item) => ({ ...item })),
    k,
    curIdx: -1,
    totalScore,
    decision: `🎉 计算完毕！恰好选择 ${k} 道题选 A、其余选 B 的最大总得分为 ${totalScore} 分`,
    message: '贪心差值决策方案全局最优',
    log: `done totalScore=${totalScore}`,
    line: lines.done.javascript,
    codeLine: lines.done,
  });

  return steps;
}

export function parseQuizScoreInputs(inputs: Record<string, any>): {
  questions: [number, number][];
  k: number;
} {
  const rawQuestions = String(inputs?.['input-questions'] || '10,2; 8,5; 6,6; 3,7');
  const k = Math.max(0, parseInt(String(inputs?.['input-k'] || '2'), 10) || 0);
  const questions = rawQuestions
    .split(';')
    .map((item) => {
      const parts = item.trim().split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    })
    .filter(([a, b]) => a > 0 || b > 0);
  return { questions, k };
}
