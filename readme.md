# react-animator

[![build status][1]][2]

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { animationDriver, Div, animate } from 'react-animator';

const App = React.createClass({
  getInitialState() {
    return {
      flip: false,
      slide: animationDriver(0),
      scale: animationDriver(1.0),
    };
  },
  slide() {
    if (this.state.flip) {
      this.setState({ flip2: !this.state.flip });
      animate(this.state.slide, { toValue: 0, steps: 60 }).start();
    } else {
      this.setState({ flip2: !this.state.flip });
      animate(this.state.slide, { toValue: 600, steps: 60 }).start();
    }
  },
  handleMouseDown() {
    animate(this.state.scale, { toValue: 0.8, steps: 20 }).start();
  },
  handleMouseUp() {
    animate(this.state.scale, { toValue: 1.0, steps: 20 }).start();
  },
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: 60 }}>
          <Div style={{ left: this.state.slide, position: 'absolute', display: 'inline-block' }}>
            <button type="button" style={{ width: 40, height: 40 }} onClick={this.slide}>Click</button>
          </Div>
        </div>
        <Div style={{ width: 40, height: 40, border: '1px solid red', transform: [{ scale: this.state.scale }] }}
          onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
          Click
        </Div>
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
```

[1]: https://api.travis-ci.org/mathieuancelin/react-animator.svg
[2]: https://api.travis-ci.org/mathieuancelin/react-animator
