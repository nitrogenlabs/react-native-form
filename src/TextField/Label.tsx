import * as React from 'react';
import {Animated, TextStyle} from 'react-native';

import Value = Animated.Value;

export interface LabelProps {
  readonly active?: any;
  readonly activeFontSize?: number;
  readonly animationDuration?: number;
  readonly baseColor?: string;
  readonly children?: React.ReactNode;
  readonly errorColor?: string;
  readonly errored?: any;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly isFocused?: any;
  readonly numberOfLines?: number;
  readonly restricted?: boolean;
  readonly style?: TextStyle;
  readonly tintColor: string;
}

export interface LabelState {
  readonly errorValue: Value;
  readonly inputValue: Value;
}

export class Label extends React.PureComponent<LabelProps, LabelState> {
  static defaultProps: object = {
    active: false,
    activeFontSize: 14,
    animationDuration: 150,
    baseColor: '#000',
    errorColor: '#f00',
    errored: false,
    fontFamily: 'Helvetica',
    fontSize: 18,
    isFocused: false,
    numberOfLines: 1,
    restricted: false,
    tintColor: '#ccc'
  };

  constructor(props) {
    super(props);

    const {active, isFocused, errored} = this.props;

    this.state = {
      errorValue: new Animated.Value(errored ? -1 : (isFocused ? 1 : 0)),
      inputValue: new Animated.Value((active || isFocused) ? 1 : 0)
    };
  }

  componentWillReceiveProps(props): void {
    const {errorValue, inputValue} = this.state;
    const {active, isFocused, errored, animationDuration} = this.props;

    if ((isFocused !== props.isFocused) || (active !== props.active)) {
      Animated.timing(inputValue, {
        duration: animationDuration,
        toValue: (props.active || props.isFocused) ? 1 : 0
      }).start();
    }

    if ((isFocused !== props.isFocused) || (errored !== props.errored)) {
      Animated.timing(errorValue, {
        duration: animationDuration,
        toValue: props.errored ? -1 : (props.isFocused ? 1 : 0)
      }).start();
    }
  }

  render(): JSX.Element {
    const {errorValue, inputValue} = this.state;
    const {
      activeFontSize,
      animationDuration,
      baseColor,
      children,
      errored,
      errorColor,
      fontFamily,
      fontSize,
      isFocused,
      restricted,
      tintColor,
      ...props
    } = this.props;

    const color = restricted ?
      errorColor :
      errorValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [errorColor, baseColor, tintColor]
      });

    const top = inputValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        32 + fontSize * 0.25,
        32 - fontSize * 0.25 - activeFontSize
      ]
    });

    const textStyle = {
      color,
      fontFamily,
      fontSize: inputValue.interpolate({
        inputRange: [0, 1],
        outputRange: [fontSize, activeFontSize]
      })
    };

    const containerStyle = {
      position: 'absolute',
      top
    };

    return (
      <Animated.View style={containerStyle}>
        <Animated.Text style={textStyle} {...props}>{children}</Animated.Text>
      </Animated.View>
    );
  }
}
