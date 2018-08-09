import * as React from 'react';
import {Animated, StyleSheet, View} from 'react-native';

export interface HelperProps {
  readonly children: React.ReactNode;
  readonly style;
}

const viewStyles = StyleSheet.create({
  helper: {
    ...StyleSheet.absoluteFillObject,
    paddingVertical: 0
  },
  text: {
    backgroundColor: 'transparent'
  }
});

export class Helper extends React.PureComponent<HelperProps, object> {
  static defaultProps = {
    numberOfLines: 1
  };

  render(): JSX.Element {
    const {children, style, ...props} = this.props;

    return (
      <View style={viewStyles.helper}>
        <Animated.Text style={[viewStyles.text, style]} {...props}>{children}</Animated.Text>
      </View>
    );
  }
}
