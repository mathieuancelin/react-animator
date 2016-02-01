import React from 'react';
import ReactDOM from 'react-dom';
import { AnimatedValue, AnimatedDiv, animate } from '../src/index';

const App = React.createClass({
  getInitialState() {
    return {
      flip1: false,
      flip2: false,
      anim1: new AnimatedValue(0),
      anim2: new AnimatedValue(0),
      anim3: new AnimatedValue(1.0),
    };
  },
  run1() {
    if (this.state.flip1) {
      animate(this.state.anim1, { toValue: 0 }, () => this.setState({ flip1: !this.state.flip1 })).start();
    } else {
      animate(this.state.anim1, { toValue: 600 }, () => this.setState({ flip1: !this.state.flip1 })).start();
    }
  },
  run2() {
    if (this.state.flip2) {
      animate(this.state.anim2, { toValue: 0, steps: 60 }, () => this.setState({ flip2: !this.state.flip2 })).start();
    } else {
      animate(this.state.anim2, { toValue: 600, steps: 60 }, () => this.setState({ flip2: !this.state.flip2 })).start();
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
          <AnimatedDiv style={{ left: this.state.anim1, position: 'absolute', display: 'inline-block' }}>
            <button type="button" style={{ width: 40, height: 40 }} onClick={this.run1}>Click</button>
          </AnimatedDiv>
        </div>
        <div style={{ position: 'relative', height: 60 }}>
          <AnimatedDiv style={{ left: this.state.anim2, position: 'absolute', display: 'inline-block' }}>
            <button type="button" style={{ width: 40, height: 40 }} onClick={this.run2}>Click</button>
          </AnimatedDiv>
        </div>
        <AnimatedDiv
          style={{ width: 40, height: 40, border: '1px solid red', transform: [{ scale: this.state.anim3 }] }}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}>
          Click
        </AnimatedDiv>
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
