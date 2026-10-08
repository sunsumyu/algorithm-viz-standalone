// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Card1SubViewControlsAdapter } from './card1-subview-controls-adapter';

describe('Card1SubViewControlsAdapter (Matt Pocock 深模块规范)', () => {
  it('正确生成 Card 1 子视图胶囊栏 HTML，并内联消除原生黑色边框', () => {
    const html = Card1SubViewControlsAdapter.renderBarHtml({
      visible: true,
      activeView: 'primary',
      meta: {
        primaryTabLabel: '二维网格',
        primaryTabIcon: 'fa-table-cells',
        deductionTabLabel: '全景推演树',
        deductionTabIcon: 'fa-diagram-project',
        card1TitleHtml: '',
      },
    });

    expect(html).toContain('id="card1-subview-bar"');
    expect(html).toContain('id="btn-card1-view-grid"');
    expect(html).toContain('id="btn-card1-view-deduction"');
    expect(html).toContain('fa-table-cells');
    expect(html).toContain('二维网格');
    expect(html).toContain('fa-diagram-project');
    expect(html).toContain('全景推演树');

    // 关键断言：自包含 border: none，绝对杜绝原生黑边框！
    expect(html).toContain('border: none');
    expect(html).toContain('background: #ffffff');
  });

  it('能正确在 DOM 中动态同步主沙盘与推演树的激活态', () => {
    const container = document.createElement('div');
    container.innerHTML = Card1SubViewControlsAdapter.renderBarHtml({
      visible: true,
      activeView: 'primary',
      meta: {
        primaryTabLabel: '二维网格',
        primaryTabIcon: 'fa-table-cells',
        deductionTabLabel: '全景推演树',
        deductionTabIcon: 'fa-diagram-project',
        card1TitleHtml: '',
      },
    });

    const btnGrid = container.querySelector('#btn-card1-view-grid') as HTMLElement;
    const btnDeduction = container.querySelector('#btn-card1-view-deduction') as HTMLElement;

    expect(btnGrid.className).toContain('active');
    expect(btnDeduction.className).not.toContain('active');

    // 切换到 deduction 视角
    Card1SubViewControlsAdapter.syncBarState(container, 'deduction');
    expect(btnGrid.className).not.toContain('active');
    expect(btnDeduction.className).toContain('active');
    expect(btnDeduction.getAttribute('style')).toContain('background: #ffffff');
    expect(btnGrid.getAttribute('style')).toContain('background: transparent');

    // 切换回 primary 视角
    Card1SubViewControlsAdapter.syncBarState(container, 'primary');
    expect(btnGrid.className).toContain('active');
    expect(btnDeduction.className).not.toContain('active');
    expect(btnGrid.getAttribute('style')).toContain('background: #ffffff');
  });
});
