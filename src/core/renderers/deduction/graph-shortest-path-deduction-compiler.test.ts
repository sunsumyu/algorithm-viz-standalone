import { describe, it, expect } from 'vitest';
import { GraphShortestPathDeductionCompiler } from './graph-shortest-path-deduction-compiler';

describe('GraphShortestPathDeductionCompiler', () => {
  it('正确编译图论单源松弛推演展板 HTML', () => {
    const html = GraphShortestPathDeductionCompiler.compile({
      title: '测试最短路径算法 · 全景推演树',
      badge: '松弛推演测试',
      descriptionHtml: '图拓扑推演测试描述',
      initialStateText: '源点 0 初始为 0',
      baseCases: [
        { prefix: '├───', label: '源点初始化', valuesStr: 'dist[0] = 0' }
      ],
      rounds: [
        {
          title: '【第 1 轮】松弛展开',
          subtitle: '探测邻接点',
          steps: [
            {
              connector: '└───',
              label: '松弛边 (0, 1)',
              badgeHtml: '<span>松弛</span>',
              detailLines: ['│  dist[1] = 4'],
              fillLine: '└── 更新完毕',
            }
          ]
        }
      ],
      finalReturn: {
        returnCode: 'dist = [0, 4]',
        answerDescription: '最短距离向量完全收敛',
      }
    });

    expect(html).toContain('测试最短路径算法 · 全景推演树');
    expect(html).toContain('源点 0 初始为 0');
    expect(html).toContain('dist[0] = 0');
    expect(html).toContain('【第 1 轮】松弛展开');
    expect(html).toContain('dist = [0, 4]');
    expect(html).toContain('最短距离向量完全收敛');
  });
});
