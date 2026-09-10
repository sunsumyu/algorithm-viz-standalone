import { describe, it, expect } from 'vitest';
import { createStageCodeRegistry, type StageCodeMap } from './stage-code-registry';

// Factory prepends prefix to keys, so mock keys must be `kind:stage` format
describe('createStageCodeRegistry', () => {
  it('register() populates the indexer, getAnchor() resolves', () => {
    const templates: StageCodeMap = {
      'a:s1': {
        java: ['// t', 'void m() { // @step:entry', '}'],
        cpp: ['// t', 'void m() { // @step:entry', '}'],
        python: ['# t', 'def m(): # @step:entry', 'pass'],
        javascript: ['// t', 'function m() { // @step:entry', '}'],
      },
    };
    const registry = createStageCodeRegistry<'a'>('fac1', templates);
    registry.register();

    const target = registry.getAnchor(1, 'a', 'entry');
    expect(target.java).toBeGreaterThanOrEqual(1);
    expect(target.cpp).toBeGreaterThanOrEqual(1);
    expect(target.python).toBeGreaterThanOrEqual(1);
    expect(target.javascript).toBeGreaterThanOrEqual(1);
  });

  it('getAnchor() returns fallback when anchor not found', () => {
    const templates: StageCodeMap = {
      'a:s1': {
        java: ['// t', 'void m() {}'],
        cpp: ['// t', 'void m() {}'],
        python: ['# t', 'def m(): pass'],
        javascript: ['// t', 'function m() {}'],
      },
    };
    const registry = createStageCodeRegistry<'a'>('fac2', templates);
    registry.register();

    const target = registry.getAnchor(1, 'a', 'nonexistent-anchor');
    expect(target).toEqual({ java: 1, cpp: 1, python: 1, javascript: 1 });
  });

  it('different anchors resolve to different lines', () => {
    const templates: StageCodeMap = {
      'a:s1': {
        java: ['// t', 'void a() { // @step:entry', '    b(); // @step:body', '}'],
        cpp: ['// t', 'void a() { // @step:entry', '    b(); // @step:body', '}'],
        python: ['# t', 'def a(): # @step:entry', '    b() # @step:body'],
        javascript: ['// t', 'function a() { // @step:entry', '  b(); // @step:body', '}'],
      },
    };
    const registry = createStageCodeRegistry<'a'>('fac3', templates);
    registry.register();

    const entry = registry.getAnchor(1, 'a', 'entry');
    const body = registry.getAnchor(1, 'a', 'body');
    const hasDiff = ['java', 'cpp', 'python', 'javascript'].some(
      lang => (entry as any)[lang] !== (body as any)[lang]
    );
    expect(hasDiff).toBe(true);
  });

  it('different stages produce different keys', () => {
    const templates: StageCodeMap = {
      'a:s1': {
        java: ['// s1', 'void a() { // @step:entry', '}'],
        cpp: ['// s1', 'void a() { // @step:entry', '}'],
        python: ['# s1', 'def a(): # @step:entry', 'pass'],
        javascript: ['// s1', 'function a() { // @step:entry', '}'],
      },
      'a:s2': {
        java: ['// s2', 'void b() {}', 'int c() { // @step:entry', '}'],
        cpp: ['// s2', 'void b() {}', 'int c() { // @step:entry', '}'],
        python: ['# s2', 'def b(): pass', 'def c(): # @step:entry', 'pass'],
        javascript: ['// s2', 'function b() {}', 'function c() { // @step:entry', '}'],
      },
    };
    const registry = createStageCodeRegistry<'a'>('fac4', templates);
    registry.register();

    const s1 = registry.getAnchor(1, 'a', 'entry');
    const s2 = registry.getAnchor(2, 'a', 'entry');
    const hasDiff = ['java', 'cpp', 'python', 'javascript'].some(
      lang => (s1 as any)[lang] !== (s2 as any)[lang]
    );
    expect(hasDiff).toBe(true);
  });

  it('different kinds produce different keys', () => {
    const templates: StageCodeMap = {
      'x:s1': {
        java: ['// x', 'void x() { // @step:entry', '}'],
        cpp: ['// x', 'void x() { // @step:entry', '}'],
        python: ['# x', 'def x(): # @step:entry', 'pass'],
        javascript: ['// x', 'function x() { // @step:entry', '}'],
      },
      'y:s1': {
        java: ['// y', 'void y() {}', 'void z() { // @step:entry', '}'],
        cpp: ['// y', 'void y() {}', 'void z() { // @step:entry', '}'],
        python: ['# y', 'def y(): pass', 'def z(): # @step:entry', 'pass'],
        javascript: ['// y', 'function y() {}', 'function z() { // @step:entry', '}'],
      },
    };
    const registry = createStageCodeRegistry<'x' | 'y'>('fac5', templates);
    registry.register();

    const a = registry.getAnchor(1, 'x', 'entry');
    const b = registry.getAnchor(1, 'y', 'entry');
    const hasDiff = ['java', 'cpp', 'python', 'javascript'].some(
      lang => (a as any)[lang] !== (b as any)[lang]
    );
    expect(hasDiff).toBe(true);
  });
});
