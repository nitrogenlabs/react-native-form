import * as PropTypes from 'prop-types';
import * as React from 'react';

import {
  Animated,
  StyleSheet,
  View
} from 'react-native';

export interface HelperProps {
  readonly children: React.ReactNode;
  readonly style;
}

export class Helper extends React.PureComponent<HelperProps, object> {
  static defaultProps = {
    numberOfLines: 1
  };

  static propTypes = {
    children: PropTypes.node,
    style: Animated.Text.propTypes.style
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

const viewStyles = StyleSheet.create({
  helper: {
    ...StyleSheet.absoluteFillObject,
    paddingVertical: 4
  },
  text: {
    backgroundColor: 'transparent'
  }
});
