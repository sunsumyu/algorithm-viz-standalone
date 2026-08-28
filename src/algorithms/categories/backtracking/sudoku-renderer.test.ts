import { describe, it, expect } from 'vitest';
import {
  parsePuzzle,
  buildSudokuSteps,
  DEFAULT_PUZZLE,
  EASY_PUZZLE,
  MAX_STEPS
} from './sudoku-renderer';

describe('Sudoku (数独回溯算法推导与单元格求解)', () => {
  it('1. parsePuzzle 正确将文本格式化为 9x9 网格', () => {
    const board = parsePuzzle(DEFAULT_PUZZLE);
    expect(board.length).toBe(9);
    expect(board[0].length).toBe(9);
    expect(board[0][0]).toBe('5');
    expect(board[0][1]).toBe('3');
    expect(board[0][2]).toBe('.');
  });

  it('2. 针对数独题目能够成功求解到 solved 状态', () => {
    // 只有一个空格的几乎完整数独
    const almostSolved = 
      '534678912\n' +
      '672195348\n' +
      '198342567\n' +
      '859761423\n' +
      '426853791\n' +
      '713924856\n' +
      '961537284\n' +
      '287419635\n' +
      '34528617.';
    const board = parsePuzzle(almostSolved);
    const steps = buildSudokuSteps(board);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('solved');
    expect(lastStep.filled).toBe(81);
    expect(lastStep.message).toContain('数独已解出');
  });

  it('3. 步数推导包含试填 (try)、冲突 (reject)、回溯 (backtrack) 状态', () => {
    const board = parsePuzzle(DEFAULT_PUZZLE);
    const steps = buildSudokuSteps(board);

    const trySteps = steps.filter((s) => s.action === 'try');
    const rejectSteps = steps.filter((s) => s.action === 'reject');
    const backtrackSteps = steps.filter((s) => s.action === 'backtrack');

    expect(trySteps.length).toBeGreaterThan(0);
    expect(rejectSteps.length).toBeGreaterThan(0);
    expect(backtrackSteps.length).toBeGreaterThan(0);
  });

  it('4. 大量回溯的题目受 MAX_STEPS 保护，不陷入死循环', () => {
    // 空数独棋盘，搜索空间极大
    const emptyBoard = parsePuzzle('.'.repeat(81));
    const steps = buildSudokuSteps(emptyBoard);
    expect(steps.length).toBeLessThanOrEqual(MAX_STEPS + 1);
  });
});
