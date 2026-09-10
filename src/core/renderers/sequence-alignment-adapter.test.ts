import { describe, it, expect, beforeEach } from 'vitest';
import { SequenceAlignmentPresenter } from './sequence-alignment-adapter';

class MockElement {
  public innerHTML = '';
}

describe('SequenceAlignmentPresenter 通用序列比对适配器测试', () => {
  let container: any;

  beforeEach(() => {
    container = new MockElement();
  });

  it('正常步进下应正确渲染字符块且绝对不含 undefined 脏字符', () => {
    SequenceAlignmentPresenter.render(container, {
      s1: 'abcde',
      s2: 'ace',
      curI: 0,
      curJ: 0,
    });

    const html = container.innerHTML;
    expect(html).not.toContain('undefined');
    expect(html).toContain("s1[0] == s2[0] ('a')");
    expect(html).toContain("索引 [0]: 'a'");
    expect(html).toContain("索引 [4]: 'e'");
  });

  it('当游标越界到达基底时，焦点必须落在末尾 EOF/Ø 哨兵格且绝不消失', () => {
    SequenceAlignmentPresenter.render(container, {
      s1: 'abcde',
      s2: 'ace',
      curI: 5, // s1.length 为 5，越界
      curJ: 3, // s2.length 为 3，越界
    });

    const html = container.innerHTML;
    expect(html).not.toContain('undefined');
    expect(html).toContain('末尾空串基底 (EOF / Ø)');
    expect(html).toContain('🛡️ 边界基底');
    // 必须存在越界高亮样式
    expect(html).toContain('#fee2e2'); // eof-active 激活背景
  });

  it('当前路径上已锁定的字符必须常驻匹配徽章', () => {
    SequenceAlignmentPresenter.render(container, {
      s1: 'abcde',
      s2: 'ace',
      curI: 3, // 当前看 d
      curJ: 2, // 当前看 e
      matchedIndices1: [0, 2], // 已匹配 a, c
      matchedIndices2: [0, 1], // 已匹配 a, c
    });

    const html = container.innerHTML;
    expect(html).not.toContain('undefined');
    // 包含常驻匹配标记 ★
    expect(html).toContain('★');
  });
});
