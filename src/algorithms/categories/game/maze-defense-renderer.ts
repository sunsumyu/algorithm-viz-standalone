/**
 * 迷宫塔防·寻路破坏者 (Maze Tower Defense: Shortest Path & Graph Topology)
 * 沉浸式 60 FPS 迷宫造路塔防游戏与图论算法实验室
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  MazeDefenseVisualizer,
  MAZE_DEFENSE_TEMPLATE,
  TowerType,
  GridBuilding,
  Monster,
  Projectile,
  FloatingText,
} from './maze-defense-visualizer';

export {
  MazeDefenseVisualizer,
  MAZE_DEFENSE_TEMPLATE,
  type TowerType,
  type GridBuilding,
  type Monster,
  type Projectile,
  type FloatingText,
};

registerAlgorithm({
  id: 'maze-defense',
  name: '迷宫塔防·寻路破坏者',
  viewId: 'algo-maze-defense-view',
  category: 'game',
  description: '图论塔防游戏：建造石墙改变网格拓扑、怪兽 Dijkstra 最短路逃逸、打造蛇形迷宫全歼敌军',
  icon: '🏰',
  template: MAZE_DEFENSE_TEMPLATE,
  Visualizer: MazeDefenseVisualizer,
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握动态图最短路径算法（Dijkstra / BFS）、拓扑连通性与最小割阻断对抗原理',
});
