import React from 'react';
import ReactDOM from 'react-dom';
import { animationDriver, Div, animate } from '../src/index';

const App = React.createClass({
  getInitialState() {
    return {
      flip1: false,
      flip2: false,
      anim1: animationDriver(0),
      anim2: animationDriver(0),
      anim3: animationDriver(1.0),
    };
  },
  run1() {
    if (this.state.flip1) {
      this.setState({ flip1: !this.state.flip1 });
      animate(this.state.anim1, { toValue: 0 }).start();
    } else {
      this.setState({ flip1: !this.state.flip1 });
      animate(this.state.anim1, { toValue: 600 }).start();
    }
  },
  run2() {
    if (this.state.flip2) {
      this.setState({ flip2: !this.state.flip2 });
      animate(this.state.anim2, { toValue: 0, steps: 60 }).start();
    } else {
      this.setState({ flip2: !this.state.flip2 });
      animate(this.state.anim2, { toValue: 600, steps: 60 }).start();
    }
  },
  reset() {
    this.state.anim1.reset();
    this.state.anim2.reset();
  },
  go() {
    animate(this.state.anim2, { toValue: 600, steps: 60 }).start();
  },
  back() {
    animate(this.state.anim2, { toValue: 0, steps: 60 }).start();
  },
  handleMouseDown() {
    animate(this.state.anim3, { toValue: 0.8, steps: 20 }).start();
  },
  handleMouseUp() {
    animate(this.state.anim3, { toValue: 1.0, steps: 20 }).start();
  },
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: 60 }}>
          <Div style={{ left: this.state.anim1, position: 'absolute', display: 'inline-block' }}>
            <button type="button" style={{ width: 40, height: 40 }} onClick={this.run1}>Click</button>
          </Div>
        </div>
        <div style={{ position: 'relative', height: 60 }}>
          <Div style={{ left: this.state.anim2, position: 'absolute', display: 'inline-block' }}>
            <button type="button" style={{ width: 40, height: 40 }} onClick={this.run2}>Click</button>
          </Div>
        </div>
        <Div
          style={{ width: 40, height: 40, border: '1px solid red', transform: [{ scale: this.state.anim3 }] }}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}>
          Click
        </Div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <button type="button" onClick={this.reset}>Reset</button>
          <button type="button" onClick={this.go}>go</button>
          <button type="button" onClick={this.back}>back</button>
        </div>
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
