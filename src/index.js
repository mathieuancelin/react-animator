/* eslint no-console: 0, no-param-reassign: 0 */
import React from 'react';
import invariant from 'invariant';
import easing from 'easing';

const noPx = [
  'animationIterationCount',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'fillOpacity',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'stopOpacity',
  'strokeDashoffset',
  'strokeOpacity',
  'strokeWidth',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
];

function extractAnimatedValues(arr) {
  const values = [];
  arr.forEach(item => {
    for (const k in item) {
      if (item.hasOwnProperty(k)) {
        const tValue = item[k];
        if (tValue.__driver) {
          return values.push(tValue);
        }
      }
    }
  });
  return values;
}

export function animationDriver(v) {
  const listeners = [];
  let value = v;
  const initValue = v;
  let currentAnimation;
  return {
    __driver: true,
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
  const startValue = value.getValue();
  const stopValue = options.toValue;
  const steps = options.steps || 100;
  const shape = options.shape || 'quadratic';
  const values = options.values || easing(steps, shape, { endToEnd: true });
  const stepWidth = Math.abs(stopValue - startValue) / steps;
  const easingRatio = steps / values.reduce((a, b) => a + b);
  let index = 0;
  let stopped = false;

  function stop() {
    const { animationId, cb } = value.currentAnimation() || {};
    window.cancelAnimationFrame(animationId);
    if (!stopped && cb) cb();
    stopped = true;
  }
  function nextStep(val, from, to, idx) {
    if (to < from) {
      return val.getValue() - ((stepWidth * values[idx]) * easingRatio);
    }
    return val.getValue() + ((stepWidth * values[idx]) * easingRatio);
  }
  function update() {
    const computeNextStep = options.nextStep || nextStep;
    const newValue = computeNextStep(value, startValue, stopValue, index, options);
    index += 1;
    if (stopValue < startValue && newValue > stopValue) {
      value.setValue(newValue);
      const requestID = window.requestAnimationFrame(update);
      value.currentAnimation({ animationId: requestID, cb: callback });
    } else if (stopValue >= startValue && newValue <= stopValue) {
      value.setValue(newValue);
      const requestID = window.requestAnimationFrame(update);
      value.currentAnimation({ animationId: requestID, cb: callback });
    } else {
      value.setValue(stopValue);
      stop();
    }
  }
  return {
    start() {
      stop();
      update();
      return {
        stop,
      };
    },
    stop,
  };
}

export const Div = React.createClass({
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
    for (const key in newStyle) {
      if (newStyle.hasOwnProperty(key)) {
        const value = newStyle[key];
        if (value.__driver) {
          newStyle[key] = value.getValue();
        } else if (key === 'transform') {
          newStyle[key] = value.map(transform => {
            let result = '';
            for (const k in transform) {
              if (transform.hasOwnProperty(k)) {
                const tValue = transform[k];
                if (tValue.__driver) {
                  result += `${k}(${tValue.getValue()})`;
                } else {
                  result += `${k}(${tValue})`;
                }
              }
            }
            return result;
          }).join(' ');
        }
      }
    }
    return newStyle;
  },
  listenToChanges(name, value) {
    this.ref.style[name] = `${value}${noPx.indexOf(name) > -1 ? '' : 'px'}`;
  },
  listenToChangesInTransform(transformArray) {
    this.ref.style.transform = transformArray.map(transform => {
      let result = '';
      for (const k in transform) {
        if (transform.hasOwnProperty(k)) {
          const tValue = transform[k];
          if (tValue.__driver) {
            result += `${k}(${tValue.getValue()})`;
          } else {
            result += `${k}(${tValue})`;
          }
        }
      }
      return result;
    }).join(' ');
  },
  subscribe(what) {
    for (const key in what) {
      if (what.hasOwnProperty(key)) {
        const value = what[key];
        if (key === 'transform' && Array.isArray(value)) {
          const valuesToListen = extractAnimatedValues(value);
          if (valuesToListen.length > 0) {
            valuesToListen.forEach(item => {
              this.unsubscribe.push(item.subscribe(this.listenToChangesInTransform.bind(this, value)));
            });
          }
        } else {
          if (value.__driver) {
            this.unsubscribe.push(value.subscribe(this.listenToChanges.bind(this, key)));
          }
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
