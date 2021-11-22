import React from 'react';
import './App.css';
import 'typeface-roboto/index.css';
import { listenForIpcMessages, stopListeningForIpcMessages } from './controller/ipc';
import Home from './pages/Home';
import StateLoader from './scaffolding/StateLoader';

export default class App extends React.Component {
  logMainMessages = (sender, { data }) => {
    console.log('MAIN: ', ...data);
  }

  componentDidMount() {
    listenForIpcMessages('consolelog', this.logMainMessages);
  }

  componentWillUnmount() {
    stopListeningForIpcMessages('consolelog', this.logMainMessages);
  }

  render() {
    return <StateLoader><Home /></StateLoader>;
  }
}
