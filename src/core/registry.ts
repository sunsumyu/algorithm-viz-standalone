/**
 * 算法清单注册表（自描述模式）
 * 每个算法在自己的 renderer 文件中 export 一个 manifest，
 * 在此处集中聚合，避免在 algorithm-manager.ts 中分散手改五处。
 */

import type { IVisualizer } from './interfaces';

/** 算法元数据 — AlgorithmManifest 和 AlgorithmConfig 共享的基础字段 */
export interface AlgorithmMetadata {
  id: string;
  name: string;
  viewId: string;
  category: string;
  description: string;
  icon: string;
  /** 难度：1=🟢入门 2=🟡进阶 3=🔴挑战 */
  difficulty: 1 | 2 | 3;
  /** 在同分类中的关卡顺序（从小到大） */
  levelOrder: number;
  /** 本关的学习目标（一句话） */
  learningGoal?: string;
}

export interface AlgorithmManifest extends AlgorithmMetadata {
  template: string;
  Visualizer: new () => IVisualizer;
}

/** 所有自描述算法清单（按添加顺序注册） */
const manifests: Map<string, AlgorithmManifest> = new Map();

/**
 * 注册一个算法清单
 */
export function registerAlgorithm(manifest: AlgorithmManifest): void {
  if (manifests.has(manifest.id)) {
    return;
  }
  manifests.set(manifest.id, manifest);
}

/**
 * 获取指定 ID 的算法清单
 */
export function getManifest(id: string): AlgorithmManifest | undefined {
  return manifests.get(id);
}

/**
 * 判断指定 ID 的算法清单是否已注册
 */
export function hasManifest(id: string): boolean {
  return manifests.has(id);
}

/**
 * 获取所有已注册的算法清单
 */
export function getAllManifests(): AlgorithmManifest[] {
  return Array.from(manifests.values());
}

