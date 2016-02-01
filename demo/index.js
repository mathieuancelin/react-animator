import React from 'react';
import ReactDOM from 'react-dom';
import { Value, AnimatedDiv, animate } from '../src/index';

const App = React.createClass({
  getInitialState() {
    return {
      anim: new Value(0),
    };
  },
  handleClick() {
    animate(this.state.anim, { toValue: 400 }).start();
  },
  render() {
    return (
      <div>
        <div style={{ position: 'relative', height: 60 }}>
          <AnimatedDiv onClick={this.handleClick} style={{
            left: this.state.anim,
            position: 'absolute',
            display: 'inline-block',
            border: '1px solid red',
            width: 40,
            height: 40 }}>
            Click
          </AnimatedDiv>
        </div>
        <button type="button" onClick={() => this.state.anim.reset()}>Reset</button>
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
