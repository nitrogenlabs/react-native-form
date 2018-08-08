import * as React from 'react';
import {TextInput as RNTextInput, TextInputProperties} from 'react-native';

import {FormField, FormFieldState} from '../FormField/FormField';
import {uiTheme} from '../UITheme';

export interface TextFieldProps extends TextInputProperties {
  readonly autoGrow?: boolean;
  readonly disabled?: boolean;
  readonly maxHeight?: number;
  readonly name: string;
  readonly theme?: any;
  readonly type: string;
}

export class TextInput extends FormField<TextFieldProps, FormFieldState> {
  static defaultProps: object = {
    autoCapitalize: 'none',
    autoCorrect: false,
    autoFocus: false,
    autoGrow: false,
    clearTextOnFocus: false,
    direction: 'row',
    disabled: false,
    keyboardType: 'default',
    multiline: false,
    required: false,
    returnKeyType: 'default',
    secureTextEntry: false,
    theme: {},
    type: 'text'
  };

  constructor(props) {
    super(props);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  onSubmitEditing(event): void {
    const {multiline, type} = this.props;

    if(multiline || type === 'textarea') {
      return;
    }

    super.onSubmitEditing(event);
  }

  render(): JSX.Element {
    const {
      autoFocus,
      disabled,
      maxHeight,
      maxLength,
      name,
      numberOfLines,
      returnKeyType,
      style,
      type
    } = this.props;

    let {
      autoCapitalize,
      autoCorrect,
      autoGrow,
      clearTextOnFocus,
      keyboardType,
      multiline,
      secureTextEntry
    } = this.props;

    switch(type) {
      case 'password':
        autoCapitalize = 'none';
        autoCorrect = false;
        secureTextEntry = true;
        clearTextOnFocus = true;
        break;
      case 'email':
        autoCapitalize = 'none';
        autoCorrect = false;
        keyboardType = 'email-address';
        break;
      case 'float':
        keyboardType = 'decimal-pad';
        break;
      case 'numeric':
        keyboardType = 'numeric';
        break;
      case 'phone':
        keyboardType = 'phone-pad';
        break;
      case 'search':
        keyboardType = 'web-search';
        break;
      case 'textarea':
        autoCapitalize = 'sentences';
        autoCorrect = true;
        autoGrow = true;
        multiline = true;
        break;
      case 'url':
        keyboardType = 'url';
        break;
      case 'username':
        autoCapitalize = 'none';
        autoCorrect = false;
        break;
      default:
        break;
    }

    if(autoGrow) {
      console.log('TODO: update type for TextInput to include maxHeight');
    }

    if(maxHeight) {
      console.log('TODO: update type for TextInput to include maxHeight');
    }

    // Value
    const value = (this.context.values[name] || '').toString();

    // Theme
    const {
      inputFieldFont = 'Helvetica',
      inputFieldSelectionColor = '#10C3D2'
    } = this.componentTheme;
    const inputStyle = {
      fontFamily: inputFieldFont
    };

    return (
      <RNTextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        blurOnSubmit={false}
        clearButtonMode="while-editing"
        clearTextOnFocus={clearTextOnFocus}
        editable={!disabled}
        keyboardAppearance="dark"
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onBlur={this.onBlur}
        onChangeText={this.onUpdate}
        onFocus={this.onFocus}
        onSubmitEditing={this.onSubmitEditing}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        selectionColor={inputFieldSelectionColor}
        style={[inputStyle, style]}
        value={value} />
    );
  }
}
