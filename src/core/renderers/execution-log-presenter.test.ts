// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { ExecutionLogPresenter } from './execution-log-presenter';

describe('ExecutionLogPresenter (Shared Card 4 Deep Module)', () => {
  it('renderCard4Html outputs standard unique-paths Card 4 HTML container and header', () => {
    const html = ExecutionLogPresenter.renderCard4Html();
    expect(html).toContain('class="dsp-log-card"');
    expect(html).toContain('class="dsp-log-header"');
    expect(html).toContain('id="log-container"');
    expect(html).toContain('id="log-count"');
    expect(html).toContain('执行日志');
  });

  it('renderCard4Html supports custom options', () => {
    const html = ExecutionLogPresenter.renderCard4Html({
      title: '算法推导日志',
      containerId: 'custom-log-container',
      countId: 'custom-log-count',
      countLabel: '等待启动',
      customClass: 'my-custom-class',
    });
    expect(html).toContain('算法推导日志');
    expect(html).toContain('id="custom-log-container"');
    expect(html).toContain('id="custom-log-count"');
    expect(html).toContain('等待启动');
    expect(html).toContain('my-custom-class');
  });

  it('renderStepLogs correctly renders log items, highlights current step, and updates count', () => {
    const container = document.createElement('div');
    const logCount = document.createElement('span');

    const steps = [
      { log: '步骤 1: 扫描根节点' },
      { message: '步骤 2: 深入左子树' },
      { decision: '步骤 3: 命中基底返回' },
    ];

    ExecutionLogPresenter.renderStepLogs(container, steps, 1, logCount);

    expect(logCount.textContent).toBe('2 / 3 记录');
    expect(container.children.length).toBe(2);

    // Step 0 is historical
    const step0 = container.children[0] as HTMLElement;
    expect(step0.textContent).toContain('步骤 1: 扫描根节点');
    expect(step0.textContent).toContain('#1');
    expect(step0.getAttribute('style')).toContain('color: #64748b');

    // Step 1 is current active
    const step1 = container.children[1] as HTMLElement;
    expect(step1.textContent).toContain('步骤 2: 深入左子树');
    expect(step1.textContent).toContain('#2');
    expect(step1.getAttribute('style')).toContain('border-left: 3px solid #3b82f6');
  });

  it('formatLogMessage standardizes crude English debug logs into 《不同路径》 standard Chinese with emoji', () => {
    // Crude English logs from legacy adapters should be cleanly converted
    expect(ExecutionLogPresenter.formatLogMessage({ log: 'visit 4' }, 0)).toContain('| 🔍 检查并比对当前节点 Node(4)');
    expect(ExecutionLogPresenter.formatLogMessage({ log: 'recurse left: 4' }, 1)).toContain('| 🌿 递归深入左子树 (4)');
    expect(ExecutionLogPresenter.formatLogMessage({ log: 'hit target: 2' }, 2)).toContain('| 🎯 命中目标节点 (2)！返回对应子树');
    expect(ExecutionLogPresenter.formatLogMessage({ log: 'done stage-2 result=2' }, 3)).toContain('| 🏆 第 2 阶段推演完成 (result=2)');

    // When Chinese message is present alongside crude English log, prefer Chinese message
    expect(
      ExecutionLogPresenter.formatLogMessage(
        {
          log: 'hit target: 2',
          message: '节点 2 == 2 命中目标！返回以此为根的子树。',
          action: 'found',
        },
        4
      )
    ).toBe('| 🎯 节点 2 == 2 命中目标！返回以此为根的子树。');

    // When native unique-paths formatted log is passed, preserve it
    expect(
      ExecutionLogPresenter.formatLogMessage(
        {
          log: '| 📥 进入 dfs(i=0, j=0) [顺推调用 #1]',
        },
        0
      )
    ).toBe('| 📥 进入 dfs(i=0, j=0) [顺推调用 #1]');
  });
  it('gracefully handles null container or empty steps without throwing', () => {
    expect(() => ExecutionLogPresenter.renderStepLogs(null, [], 0)).not.toThrow();
    const container = document.createElement('div');
    expect(() => ExecutionLogPresenter.renderStepLogs(container, [], 0)).not.toThrow();
  });
});
