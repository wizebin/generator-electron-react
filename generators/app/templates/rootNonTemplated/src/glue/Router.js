export default class Router {
  listeners = [];
  defaultView = null;
  viewStack = [];

  setDefault = (view) => {
    this.defaultView = view;
  }

  listen = (callback, { noFirstCall = false } = {}) => {
    this.unlisten(callback);
    this.listeners.push(callback);
    if (!noFirstCall) callback(this.getCurrentBreadcrumb());
  }

  unlisten = (callback) => {
    return this.listeners.filter(item => item !== callback);
  }

  notifyListeners() {
    if (this.listeners) {
      const breadcrumb = this.getCurrentBreadcrumb();

      for (let dex = 0; dex < this.listeners.length; dex += 1) {
        this.listeners[dex](breadcrumb);
      }
    }
  }

  /**
   * @param {{ component: React.Component, props: Object }|React.Component} page
   */
  push = (page) => {
    this.viewStack.push(page);
    this.notifyListeners();
  }

  /**
   * @param {{ component: React.Component, props: Object }|React.Component} page
   */
  replace = (page) => {
    if (this.viewStack.length > 0) this.viewStack[this.viewStack.length - 1] = page;
    this.notifyListeners();
  }

  pop = () => {
    this.viewStack.pop();
    this.notifyListeners();
  }

  back = () => {
    this.pop();
    this.notifyListeners();
  }

  wipe = () => {
    this.viewStack = [];
    this.notifyListeners();
  }

  /**
   * param {{ headerLeft, headerRight, title }} data
   */
  setViewData = (data) => {
    if (this.viewStack.length > 0) {
      const view = this.viewStack[this.viewStack.length - 1];

      Object.assign(view, data);
      this.notifyListeners();
    }
  }

  getCurrentBreadcrumb = () => {
    const component = (this.viewStack.length > 0) ? this.viewStack[this.viewStack.length - 1] : this.defaultView;
    if (component && component.component) return component;
    return { component, props: {} };
  }
}
