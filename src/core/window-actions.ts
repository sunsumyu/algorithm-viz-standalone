/**
 * Window Actions 管理
 * 用于在 window 对象上注册和注销全局方法
 */

export type WindowActions = Record<string, unknown>;

type WindowActionRegistry = Record<string, WindowActions>;

export type WindowActionOptions = {
  namespace?: string;
};

type WindowActionTarget = Window & {
  __windowActionNamespaces__?: Record<string, WindowActions>;
  __windowActionRegistry__?: WindowActionRegistry;
  [key: string]: unknown;
};

function getRegistry(target: WindowActionTarget): WindowActionRegistry {
  if (!target.__windowActionRegistry__) {
    target.__windowActionRegistry__ = {};
  }
  return target.__windowActionRegistry__;
}

function getNamespacedActions(target: WindowActionTarget, namespace: string): WindowActions {
  if (!target.__windowActionNamespaces__) {
    target.__windowActionNamespaces__ = {};
  }

  if (!target.__windowActionNamespaces__[namespace]) {
    target.__windowActionNamespaces__[namespace] = {};
  }

  return target.__windowActionNamespaces__[namespace];
}

export function registerWindowActions(
  actions: WindowActions,
  options?: WindowActionOptions
): Window {
  const namespace = options?.namespace ?? '';
  const target = window as unknown as WindowActionTarget;

  Object.assign(target, actions);

  if (namespace) {
    Object.assign(getNamespacedActions(target, namespace), actions);
    getRegistry(target)[namespace] = {
      ...(getRegistry(target)[namespace] ?? {}),
      ...actions,
    };
  }

  return target;
}

export function unregisterWindowActions(
  actions: WindowActions,
  options?: WindowActionOptions
): Window {
  const namespace = options?.namespace ?? '';
  const target = window as unknown as WindowActionTarget;

  Object.entries(actions).forEach(([name, action]) => {
    if (target[name] === action) {
      delete target[name];
    }
  });

  if (namespace && target.__windowActionNamespaces__?.[namespace]) {
    const namespacedActions = target.__windowActionNamespaces__[namespace];
    Object.entries(actions).forEach(([name, action]) => {
      if (namespacedActions[name] === action) {
        delete namespacedActions[name];
      }
    });

    if (Object.keys(namespacedActions).length === 0) {
      delete target.__windowActionNamespaces__[namespace];
    }

    if (target.__windowActionRegistry__?.[namespace]) {
      delete target.__windowActionRegistry__[namespace];
    }
  }

  return target;
}