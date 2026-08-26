import { UniversalStep } from '../universal-stage-engine';

export enum ActorVisualState {
  ON_CELL = 'ON_CELL',                 // 正常在方块顶面待机/计算
  HOPPING = 'HOPPING',                 // 格点间抛物线跳跃
  IN_RIVER = 'IN_RIVER',               // 越界落入四周护岛河水面 (触水反弹)
  WALL_COLLISION = 'WALL_COLLISION',   // 越界撞击高墙 (撞墙反弹)
  OBSTACLE_BLOCKED = 'OBSTACLE_BLOCKED',// 遭遇障碍物阻断
  CELEBRATING_GOAL = 'CELEBRATING_GOAL' // 达成目标/终点
}

export interface ActorResolution {
  state: ActorVisualState;
  targetPosition: { x: number; y: number; z: number };
  targetFacing?: { x: number; z: number };
  bounceApexPosition?: { x: number; y: number; z: number }; // 触水/撞墙的中间物理碰撞点
  isBounceJump?: boolean;                                   // 是否触发“起跳->触水/撞墙->反弹跃回”物理双段动画
  squash: number;
  rotationX: number;
  splashWater: boolean;
  splashPosition?: { x: number; z: number };
  visible: boolean; // 🌟 核心不变式：在任何算法推导步骤中恒为 true
}

export class ThreeActorStateMachine {
  /**
   * 纯函数状态机解算器：将算法单步快照转化为确定性的 3D 角色物理意图
   */
  public static resolve(
    step: UniversalStep,
    m: number,
    n: number,
    stride: number = 1.14,
    blockBaseH: number = 0.42
  ): ActorResolution {
    const curI = step.i !== undefined ? step.i : 0;
    const curJ = step.j !== undefined ? step.j : 0;
    const fromI = step.fromI !== undefined ? Math.max(0, Math.min(step.fromI, m - 1)) : Math.max(0, Math.min(curI, m - 1));
    const fromJ = step.fromJ !== undefined ? Math.max(0, Math.min(step.fromJ, n - 1)) : Math.max(0, Math.min(curJ, n - 1));
    const isCoordOutOfBounds = curI >= m || curJ >= n || curI < 0 || curJ < 0;
    const isOutOfBounds = step.isOutOfBounds || step.type === 'out-of-bounds' || isCoordOutOfBounds;
    const isObstacle = step.type === 'obstacle-hit' || (step.obstacleGrid?.[curI]?.[curJ] === 1);
    const isGoal = step.type === 'boundary' || step.type === 'return';

    // 1. 越界拦截分支（函数入口稳立岸边探视 -> 拦截步执行“跳向水面->触水激起水花->弹回陆地”完整双段抛物线）
    if (isOutOfBounds) {
      const dir = step.outOfBoundsDir || (curI >= m ? 'river' : (curJ >= n ? 'right-wall' : (curI < 0 ? 'top-wall' : 'left-wall')));
      const isRiver = dir === 'river' || curI >= m || curI < 0;

      // 陆地安全起跳/落脚方块坐标 (fromI, fromJ)
      const safePosX = fromJ * stride;
      const safePosY = blockBaseH / 2 + 0.45;
      const safePosZ = fromI * stride;

      // 探测落水接触点/撞墙接触点坐标 (curJ, curI)
      const probedTargetX = curJ * stride;
      const probedTargetY = isRiver ? -0.05 : blockBaseH / 2 + 0.15;
      const probedTargetZ = curI * stride;

      const isReturnInterceptionStep = step.type === 'out-of-bounds';

      if (isReturnInterceptionStep) {
        // 越界拦截返回步：触发完整的“起跳飞向水面 -> 砸入河水激起浪花 -> 物理反弹弹回方块”双段抛物线动画
        return {
          state: isRiver ? ActorVisualState.IN_RIVER : ActorVisualState.WALL_COLLISION,
          targetPosition: { x: safePosX, y: safePosY, z: safePosZ },
          targetFacing: { x: probedTargetX, z: probedTargetZ },
          bounceApexPosition: { x: probedTargetX, y: probedTargetY, z: probedTargetZ },
          isBounceJump: true,
          squash: isRiver ? 1.15 : 1.35, // 弹回伸展形变
          rotationX: 0,
          splashWater: isRiver,
          splashPosition: { x: probedTargetX, z: probedTargetZ },
          visible: true
        };
      }

      // 函数入口探索步 (dfs-call 进入 dfs(3,0))：小人稳稳立于起跳方块 (fromI, fromJ)，朝向河道探头探视
      return {
        state: ActorVisualState.HOPPING,
        targetPosition: { x: safePosX, y: safePosY, z: safePosZ },
        targetFacing: { x: probedTargetX, z: probedTargetZ },
        squash: 1.0,
        rotationX: 0.15,
        splashWater: false,
        splashPosition: { x: probedTargetX, z: probedTargetZ },
        visible: true
      };
    }

    // 2. 障碍物阻断分支
    if (isObstacle) {
      return {
        state: ActorVisualState.OBSTACLE_BLOCKED,
        targetPosition: {
          x: curJ * stride,
          y: blockBaseH / 2 + 0.28 + 0.45,
          z: curI * stride
        },
        squash: 1.15,
        rotationX: -0.12,
        splashWater: false,
        visible: true
      };
    }

    // 3. 终点达成庆祝分支
    if (isGoal) {
      return {
        state: ActorVisualState.CELEBRATING_GOAL,
        targetPosition: {
          x: curJ * stride,
          y: blockBaseH / 2 + 0.45,
          z: curI * stride
        },
        squash: 1.0,
        rotationX: 0,
        splashWater: false,
        visible: true
      };
    }

    // 4. 正常格点状态 (ON_CELL)
    return {
      state: ActorVisualState.ON_CELL,
      targetPosition: {
        x: curJ * stride,
        y: blockBaseH / 2 + 0.45,
        z: curI * stride
      },
      squash: 1.0,
      rotationX: 0,
      splashWater: false,
      visible: true
    };
  }
}
