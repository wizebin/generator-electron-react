import { hot } from 'react-hot-loader/root';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const AppView = hot(App);

if (!document.getElementById('root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

ReactDOM.render(<AppView />, document.getElementById('root'));

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
});
