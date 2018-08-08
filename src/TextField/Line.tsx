import * as React from 'react';

import {
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';

export interface LineProps {
  readonly color: string;
  readonly type: 'solid' | 'dotted' | 'dashed';
}

export class Line extends React.PureComponent<LineProps, object> {
  render(): JSX.Element {
    const {color: borderColor, type: borderStyle} = this.props;
    const lineStyle: ViewStyle = {borderColor, borderStyle};

    return (
      <View style={[viewStyles.line, lineStyle]} pointerEvents="none" />
    );
  }
}

const viewStyles = StyleSheet.create({
  line: {
    borderWidth: 1,
    bottom: 0,
    left: -1.5,
    position: 'absolute',
    right: -1.5,
    top: -2
  }
});
