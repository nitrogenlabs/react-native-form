import * as React from 'react';
import {StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';

import {uiTheme} from '../UITheme';

export interface TagItemProps {
  readonly name: string;
  readonly onPress?: () => void;
  readonly theme?: any;
}

const viewStyles = StyleSheet.create({
  tagWrapper: {
    alignItems: 'center',
    borderRadius: 3,
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 5,
    overflow: 'hidden',
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6
  }
});

export class TagItem extends React.PureComponent<TagItemProps, {}> {
  private componentTheme: any;

  constructor(props: TagItemProps) {
    super(props);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  render(): JSX.Element {
    const {name, onPress} = this.props;

    const {
      tagFont,
      tagHeight,
      tagSelectedBgColor,
      tagTextColor,
      tagTextSize
    } = this.componentTheme;
    const wrapThemeStyle: ViewStyle = {
      backgroundColor: tagSelectedBgColor,
      height: tagHeight
    };
    const labelThemeStyle: TextStyle = {
      color: tagTextColor,
      fontFamily: tagFont,
      fontSize: tagTextSize
    };

    return (
      <TouchableOpacity activeOpacity={0.3} onPress={onPress}>
        <View style={[viewStyles.tagWrapper, wrapThemeStyle]}>
          <Text style={labelThemeStyle}>#{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
