import {Flux} from '@nlabs/arkhamjs';
import head from 'lodash/head';
import * as React from 'react';
import {StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';

import {ComponentConstants} from '../constants/ComponentConstants';
import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';
import {SelectOptionType} from '../types/InputTypes';


export interface SelectFieldProps extends FormFieldProps {
  readonly containerStyle?: ViewStyle;
  readonly label?: string;
  readonly labelStyle?: ViewStyle;
  readonly list?: SelectOptionType[];
  readonly name: string;
  readonly onPress?: () => void;
  readonly placeholder?: string;
  readonly style?: ViewStyle;
}

const viewStyles = StyleSheet.create({
  inputBox: {
    flex: 1,
    flexDirection: 'column',
    marginBottom: 0,
    overflow: 'hidden'
  },
  textInput: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    justifyContent: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    paddingTop: 5
  }
});

export class SelectField extends FormField<SelectFieldProps, FormFieldState> {
  static defaultProps: object = {
    ...FormField.defaultProps,
    label: '',
    list: [],
    placeholder: 'Select...'
  };

  constructor(props: SelectFieldProps) {
    super(props);

    // Methods
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.onPress = this.onPress.bind(this);
  }

  focus(): void {
    this.onPress();
  }

  blur(): void {
    this.close();
  }

  onPress(): void {
    const {disabled, label, list, name} = this.props;

    if(!disabled) {
      Flux.dispatch({label, list, name, type: ComponentConstants.PICKER_OPEN, value: this.value});
    }
  }

  renderLabel(): JSX.Element {
    const {label, labelStyle} = this.props;
    const {
      inputFieldFont = 'Helvetica',
      inputFieldTextColor = '#000',
      inputFieldLabelSize = 13
    } = this.componentTheme;
    const themeStyle: TextStyle = {
      color: inputFieldTextColor,
      fontFamily: inputFieldFont,
      fontSize: inputFieldLabelSize
    };

    if(label) {
      return <Text style={[themeStyle, labelStyle]}>{label}</Text>;
    }

    return null;
  }

  renderText(): JSX.Element {
    const {value} = this.state;
    const {disabled, list = [], placeholder} = this.props;
    const selectedLabel = (head(list
      .filter((li: SelectOptionType) => li.value === value)) || {label: ''}).label;
    const {
      inputFieldDisabledColor = '#D70303',
      inputFieldFont = 'Helvetica',
      inputFieldTextColor = '#000',
      inputFieldTextSize = '14'
    } = this.componentTheme;
    const themeStyle: TextStyle = {
      color: inputFieldTextColor,
      fontFamily: inputFieldFont,
      fontSize: inputFieldTextSize
    };

    // Disabled styles
    const disabledStyle = disabled ? {color: inputFieldDisabledColor} : {};

    if(selectedLabel) {
      return <Text style={[themeStyle, disabledStyle]}>{selectedLabel}</Text>;
    }
    return <Text style={[themeStyle, disabledStyle]}>{placeholder}</Text>;
  }

  render(): JSX.Element {
    const {containerStyle, disabled, style} = this.props;

    // Theme colors
    const {
      inputFieldBorderColor = '#222',
      inputFieldDisabledColor = '#ccc'
    } = this.componentTheme;
    const themeStyle: TextStyle = {borderBottomColor: inputFieldBorderColor};

    // Disabled styles
    const disabledStyle: ViewStyle = disabled ? {
      borderBottomColor: inputFieldDisabledColor
    } : null;

    return (
      <View style={[viewStyles.inputBox, containerStyle]}>
        {this.renderLabel()}
        <TouchableOpacity activeOpacity={disabled ? 1 : 0.5} onPress={this.onPress}>
          <View style={[viewStyles.textInput, themeStyle, style, disabledStyle]}>
            {this.renderText()}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
