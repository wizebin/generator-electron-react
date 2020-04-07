import React from 'react';
import './App.css';
import 'typeface-roboto/index.css';
import routerSingleton from './glue/RouterSingleton';
import { listenForIpcMessages, stopListeningForIpcMessages } from './controller/ipc';
import Home from './pages/Home';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.router = routerSingleton();
    this.router.setDefault(Home);
  }

  logMainMessages = (sender, { data }) => {
    console.log('MAIN: ', ...data);
  }

  componentDidMount() {
    this.router.listen(this.onRouteChange);
    listenForIpcMessages('consolelog', this.logMainMessages);
  }

  componentWillUnmount() {
    this.router.unlisten(this.onRouteChange);
    stopListeningForIpcMessages('consolelog', this.logMainMessages);
  }

  onRouteChange = ({ component, props }) => {
    this.setState({ View: component, viewProps: props });
  }

  render() {
    const { View, viewProps } = this.state;

    if (!View) {
      return <div>Loading</div>;
    }

    return <View {...viewProps} />;
  }
}
