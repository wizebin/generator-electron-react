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

    // setup state sync here if you want it, example code uses mutastate
    // const receiver = singleton().replicate({ send: data => sendIpcMessage('state-sync', data), primary: false, ignore: ['ephemeral', 'navigation'] });
    // listenForIpcMessages('state-sync', (sender, data) => receiver(data));
    // sendIpcMessage('request-state-sync');
  }

  componentWillUnmount() {
    stopListeningForIpcMessages('consolelog', this.logMainMessages);
    // stopListeningForIpcMessages('state-sync', this.logMainMessages);
  }

  render() {
    return <StateLoader><Home /></StateLoader>;
  }
}
