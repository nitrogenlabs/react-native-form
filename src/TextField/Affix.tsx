import * as PropTypes from 'prop-types';
import * as React from 'react';

import {
  Animated,
  StyleSheet,
  TextStyle
} from 'react-native';
import Value = Animated.Value;

export interface AffixProps {
  readonly active?: any;
  readonly animationDuration?: number;
  readonly baseColor?: string;
  readonly children?: React.ReactNode;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly isFocused?: boolean;
  readonly numberOfLines?: number;
  readonly type?: 'prefix' | 'suffix';
}

export interface AffixState {
  opacity: Value;
}

export class Affix extends React.PureComponent<AffixProps, AffixState> {
  static propTypes = {
    active: PropTypes.bool,
    animationDuration: PropTypes.number,
    baseColor: PropTypes.string,
    children: PropTypes.node,
    fontFamily: PropTypes.string,
    fontSize: PropTypes.number.isRequired,
    isFocused: PropTypes.bool,
    numberOfLines: PropTypes.number,
    type: PropTypes.oneOf(['prefix', 'suffix'])
  };

  static defaultProps = {
    active: false,
    animationDuration: 150,
    baseColor: '#000',
    isFocused: false,
    numberOfLines: 1,
    type: 'prefix'
  };

  constructor(props) {
    super(props);

    const {active, isFocused} = this.props;

    this.state = {
      opacity: new Animated.Value((active || isFocused) ? 1 : 0)
    };
  }

  componentWillReceiveProps(props): void {
    const {opacity} = this.state;
    const {active, isFocused, animationDuration} = this.props;

    if((isFocused !== props.isFocused) || (active !== props.active)) {
      Animated
        .timing(opacity, {
          duration: animationDuration,
          toValue: (props.active || props.isFocused) ? 1 : 0,
          useNativeDriver: true
        })
        .start();
    }
  }

  render(): JSX.Element {
    const {opacity} = this.state;
    const {children, type, fontFamily, fontSize, baseColor: color} = this.props;
    const padding: number = 3;
    const containerStyle = {
      height: fontSize * 1.5,
      opacity,
      paddingLeft: 0,
      paddingRight: 0
    };
    const textStyle: TextStyle = {
      color,
      fontFamily,
      fontSize,
      opacity: 0.7
    };

    switch(type) {
      case 'prefix':
        containerStyle.paddingRight = padding;
        textStyle.textAlign = 'left';
        break;
      case 'suffix':
        containerStyle.paddingLeft = padding;
        textStyle.textAlign = 'right';
        break;
      default:
        break;
    }

    return (
      <Animated.View style={[viewStyles.affix, containerStyle]}>
        <Animated.Text style={textStyle}>{children}</Animated.Text>
      </Animated.View>
    );
  }
}

const viewStyles = StyleSheet.create({
  affix: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    top: 2
  }
});
