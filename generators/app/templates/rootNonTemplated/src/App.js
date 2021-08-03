import React from 'react';
import './App.css';
import 'typeface-roboto/index.css';
import { listenForIpcMessages, stopListeningForIpcMessages } from './controller/ipc';
import Home from './pages/Home';
import fixPath from 'fix-path';

export default class App extends React.Component {
  logMainMessages = (sender, { data }) => {
    console.log('MAIN: ', ...data);
  }

  componentDidMount() {
    listenForIpcMessages('consolelog', this.logMainMessages);
    fixPath();
  }

  componentWillUnmount() {
    stopListeningForIpcMessages('consolelog', this.logMainMessages);
  }

  render() {
    return <Home />;
  }
}
