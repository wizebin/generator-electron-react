import routerSingleton from '../glue/RouterSingleton';

export function pushView(viewComponent, props) {
  routerSingleton().push({ component: viewComponent, props });
}

export function back() {
  routerSingleton().pop();
}

export function replaceView(viewComponent, props) {
  routerSingleton().replace({ component: viewComponent, props });
}
