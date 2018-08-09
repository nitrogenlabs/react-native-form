import * as React from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';

export interface CounterProps {
  readonly baseColor: string;
  readonly count: number;
  readonly errorColor: string;
  readonly fontSize?: number;
  readonly limit: number;
}

const viewStyles = StyleSheet.create({
  counter: {
    paddingLeft: 4,
    paddingVertical: 4
  },
  counterText: {
    backgroundColor: 'transparent',
    textAlign: 'right'
  }
});

export class Counter extends React.PureComponent<CounterProps, object> {
  static defaultProps: object = {
    fontSize: 12
  };

  render(): JSX.Element {
    const {count, limit, baseColor, errorColor, fontSize} = this.props;
    const textStyle = {
      color: count > limit ? errorColor : baseColor
    };

    if(!limit) {
      return null;
    }

    const counterStyle: TextStyle = {fontSize};

    return (
      <View style={viewStyles.counter}>
        <Text style={[viewStyles.counterText, counterStyle, textStyle]}>{count} / {limit}</Text>
      </View>
    );
  }
}
