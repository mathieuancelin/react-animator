/* eslint no-unused-vars:0, no-undef:0, no-unused-expressions:0, react/no-multi-comp: 0 */

import React from 'react';
import chai, { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';

import { enhanceWithValidState, __subscribeToErrors } from '../src/index';

let passed = false;

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Hello',
      age: 42,
    };
  }
  componentWillUpdate(nextProps, nextState) {
    passed = true;
  }
  click() {
    this.setState({ name: 42 });
  }
  render() {
    return (
      <div>
        <h1>Hello {this.state.name}!</h1>
        <button type="button" onClick={this.click.bind(this)}>click</button>
      </div>
    );
  }
}

MyComponent.stateTypes = {
  name: React.PropTypes.string.isRequired,
  age: React.PropTypes.number.isRequired,
};

const MyComponent2 = React.createClass({
  getInitialState() {
    return {
      name: 'Hello',
      age: 42,
    };
  },
  componentWillUpdate(nextProps, nextState) {
    passed = true;
  },
  stateTypes: {
    name: React.PropTypes.string.isRequired,
    age: React.PropTypes.number.isRequired,
  },
  click() {
    this.setState({ name: 42 });
  },
  render() {
    return (
      <div>
        <h1>Hello {this.state.name}!</h1>
        <button type="button" onClick={this.click}>click</button>
      </div>
    );
  },
});

class Message {
  constructor(value) {
    this.value = value;
  }
}

const AllPropTypesComponent = React.createClass({
  getInitialState() {
    return {
      optionalArray: {},
      optionalBool: 'true',
      optionalFunc: 42,
      optionalNumber: '42',
      optionalObject: true,
      optionalString: 42,
      optionalNode: undefined,
      optionalElement: new Message('yo'),
      optionalMessage: 'Yo',
      optionalEnum: 'Image',
      optionalUnion: true,
      optionalArrayOf: ['42'],
      optionalObjectOf: { key: '42' },
      optionalObjectWithShape: {
        color: 42,
        fontSize: '42',
      },
    };
  },
  stateTypes: {
    optionalArray: React.PropTypes.array,
    optionalBool: React.PropTypes.bool,
    optionalFunc: React.PropTypes.func,
    optionalNumber: React.PropTypes.number,
    optionalObject: React.PropTypes.object,
    optionalString: React.PropTypes.string,
    optionalNode: React.PropTypes.node,
    optionalElement: React.PropTypes.element,
    optionalMessage: React.PropTypes.instanceOf(Message),
    optionalEnum: React.PropTypes.oneOf(['News', 'Photos']),
    optionalUnion: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.instanceOf(Message),
    ]),
    optionalArrayOf: React.PropTypes.arrayOf(React.PropTypes.number),
    optionalObjectOf: React.PropTypes.objectOf(React.PropTypes.number),
    optionalObjectWithShape: React.PropTypes.shape({
      color: React.PropTypes.string,
      fontSize: React.PropTypes.number,
    }),
    requiredFunc: React.PropTypes.func.isRequired,
    requiredAny: React.PropTypes.any.isRequired,
    customProp(props, propName, componentName) {
      if (!/matchme/.test(props[propName])) {
        return new Error('Validation failed!');
      }
    },
  },
  render() {
    return (
      <h1>Yo!</h1>
    );
  },
});

describe('react-state-validator', () => {
  it('should validate state with class components', () => {
    let err;
    passed = false;
    const unsubscribe = __subscribeToErrors((name, errors) => {
      if (name === 'MyComponent') {
        err = errors[0];
      }
    });
    const App = enhanceWithValidState(MyComponent);
    const app = ReactTestUtils.renderIntoDocument(<App />);
    const h1 = ReactTestUtils.findRenderedDOMComponentWithTag(app, 'h1');
    const button = ReactTestUtils.findRenderedDOMComponentWithTag(app, 'button');
    expect(passed).to.be.equal(false);
    expect(h1.textContent).to.be.equal('Hello Hello!');
    ReactTestUtils.Simulate.click(button);
    expect(err.message).to.be.equal('Invalid state `name` of type `number` supplied to `MyComponent`, expected `string`.');
    expect(h1.textContent).to.be.equal('Hello 42!');
    expect(passed).to.be.equal(true);
    unsubscribe();
  });
  it('should validate state with creatClass components', () => {
    let err;
    passed = false;
    const unsubscribe = __subscribeToErrors((name, errors) => {
      if (name === 'MyComponent2') {
        err = errors[0];
      }
    });
    const App = enhanceWithValidState(MyComponent2);
    const app = ReactTestUtils.renderIntoDocument(<App />);
    const h1 = ReactTestUtils.findRenderedDOMComponentWithTag(app, 'h1');
    const button = ReactTestUtils.findRenderedDOMComponentWithTag(app, 'button');
    expect(passed).to.be.equal(false);
    expect(h1.textContent).to.be.equal('Hello Hello!');
    ReactTestUtils.Simulate.click(button);
    expect(err.message).to.be.equal('Invalid state `name` of type `number` supplied to `MyComponent2`, expected `string`.');
    expect(h1.textContent).to.be.equal('Hello 42!');
    expect(passed).to.be.equal(true);
    unsubscribe();
  });
  it('should validate state with all kind of types', () => {
    let errs;
    passed = false;
    const unsubscribe = __subscribeToErrors((name, errors) => {
      errs = errors;
    });
    const App = enhanceWithValidState(AllPropTypesComponent);
    const app = ReactTestUtils.renderIntoDocument(<App />);
    const h1 = ReactTestUtils.findRenderedDOMComponentWithTag(app, 'h1');
    expect(h1.textContent).to.be.equal('Yo!');
    expect(errs.length).to.be.equal(16);
    unsubscribe();
  });
});
