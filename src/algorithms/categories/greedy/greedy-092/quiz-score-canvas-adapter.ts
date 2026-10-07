/**
 * 知识竞赛得分最大化 (Quiz Score) Canvas Adapter
 */

import { QuizScoreStep } from './quiz-score-step-compiler';

export function renderQuizScoreCanvas(stageContainer: HTMLElement, step: QuizScoreStep): void {
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
}
