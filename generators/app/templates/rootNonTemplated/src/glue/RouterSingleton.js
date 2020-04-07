import Router from './Router';

/**
 * @returns {Router} router
 */
export default function routerSingleton() {
  if (!routerSingleton.singleton) {
    routerSingleton.singleton = new Router();
  }

  return routerSingleton.singleton;
}
