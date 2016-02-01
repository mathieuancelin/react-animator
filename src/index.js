/* eslint no-console: 0, no-param-reassign: 0 */
import React from 'react';
import invariant from 'invariant';
import easing from 'easing';

function isObject(χ) {
  return !!χ && (typeof χ === 'object' || typeof χ === 'function');
}

export function Value(v) {
  const listeners = [];
  let value = v;
  const initValue = v;
  let currentAnimation;
  return {
    __animatedvalue: true,
    currentAnimation(id) {
      if (id) {
        currentAnimation = id;
      }
      return currentAnimation;
    },
    reset() {
      value = initValue;
      listeners.forEach(l => l(initValue));
    },
    getValue() {
      return value;
    },
    setValue(val) {
      value = val;
      listeners.forEach(l => l(val));
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },
  };
}

export function animate(value, options, callback) {
  invariant(options.hasOwnProperty('toValue'), 'You should specify a toValue options');
  window.cancelAnimationFrame(value.currentAnimation());
  const startValue = value.getValue();
  const stopValue = options.toValue;
  const steps = options.steps || 100;
  const shape = options.shape || 'quadratic';
  const stepWidth = Math.abs(stopValue - startValue) / steps;
  const values = easing(steps, shape, { endToEnd: true });
  const easingRatio = 100 / values.reduce((a, b) => a + b);
  let index = 0;
  function nextStep(val, from, to, idx) {
    return val.getValue() + ((stepWidth * values[idx]) * easingRatio);
  }
  function update() {
    const newValue = (options.nextStep || nextStep)(value, startValue, stopValue, index, options);
    index += 1;
    if (newValue < stopValue) {
      value.setValue(newValue);
      const requestID = window.requestAnimationFrame(update);
      value.currentAnimation(requestID);
    } else {
      value.setValue(stopValue);
      if (callback) {
        callback();
      }
    }
  }
  return {
    start() {
      update();
    },
    stop() {
      window.cancelAnimationFrame(value.currentAnimation());
    },
  };
}

export const AnimatedDiv = React.createClass({
  propTypes: {
    style: React.PropTypes.object.isRequired,
    children: React.PropTypes.oneOfType([
      React.PropTypes.element,
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.arrayOf(React.PropTypes.element),
    ]).isRequired,
  },
  componentWillMount() {
    this.unsubscribe = [];
    this._style = this.props.style;
    this.subscribe(this.props.style, []);
  },
  componentWillUnmount() {
    this.unsubscribe.map(u => u());
  },
  computeFirstStyle() {
    const newStyle = { ...this._style };
    const infect = (what) => {
      for (const key in what) {
        if (what.hasOwnProperty(key)) {
          const value = what[key];
          if (value.__animatedvalue) {
            what[key] = value.getValue();
          } else if (isObject(value)) {
            infect(value);
          } else if (Array.isArray(value)) {
            infect(value);
          }
        }
      }
    };
    infect(newStyle);
    return newStyle;
  },
  listenToChanges(name, path, value) {
    const style = this.ref.style;
    let current = style;
    // TODO : handle complex imbrication
    for (const key in path) {
      if (path.hasOwnProperty(key)) {
        current = current[path[key]];
      }
    }
    current[name] = `${value}px`; // TODO : handle px case
  },
  subscribe(what, path) {
    for (const key in what) {
      if (what.hasOwnProperty(key)) {
        const value = what[key];
        if (value.__animatedvalue) {
          this.unsubscribe.push(value.subscribe(this.listenToChanges.bind(this, key, path)));
        } else if (isObject(value)) {
          this.subscribe(value, [...path, key]);
        } else if (Array.isArray(value)) {
          this.subscribe(value, [...path, key]);
        }
      }
    }
  },
  render() {
    return (
      <div ref={(ref) => this.ref = ref} {...this.props} style={this.computeFirstStyle()}>
        {this.props.children}
      </div>
    );
  },
});
