import * as React from 'react';

import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';
import {TextField} from '../TextField/TextField';
import {uiTheme} from '../UITheme';

export type AutoCapitalizeType = 'none' | 'sentences' | 'words' | 'characters';
export type KeyboardType = 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'ascii-capable' |
  'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'decimal-pad' | 'twitter' | 'web-search';
export type ReturnKeyType = 'done' | 'go' | 'next' | 'search' | 'send' | 'none' | 'previous' | 'default' |
  'emergency-call' | 'google' | 'join' | 'route' | 'yahoo';

export interface InputFieldProps extends FormFieldProps {
  readonly autoCapitalize?: AutoCapitalizeType;
  readonly autoCorrect?: boolean;
  readonly autoFocus?: boolean;
  readonly borderColor?: string;
  readonly clearTextOnFocus?: boolean;
  readonly errorColor?: string;
  readonly help?: string;
  readonly keyboardType?: KeyboardType;
  readonly label: string;
  readonly labelColor?: string;
  readonly multiline?: boolean;
  readonly name: string;
  readonly prefix?: string;
  readonly returnKeyType?: ReturnKeyType;
  readonly secureTextEntry?: boolean;
  readonly selectionColor?: string;
  readonly softMax?: number;
  readonly suffix?: string;
  readonly textColor?: string;
  readonly tintColor?: string;
}

export class InputField extends FormField<InputFieldProps, FormFieldState> {
  static defaultProps: object = {
    autoCapitalize: 'none',
    autoCorrect: false,
    autoFocus: false,
    clearTextOnFocus: false,
    direction: 'row',
    disabled: false,
    keyboardType: 'default',
    multiline: false,
    required: false,
    returnKeyType: 'default',
    secureTextEntry: false,
    type: 'text'
  };

  constructor(props: InputFieldProps) {
    super(props);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  updateValue(value): void {
    if(this.value !== value) {
      this.isUpdated = true;
      this.value = value === null || value === undefined ? '' : value.toString();
      this.setState({value: this.value});
    }
  }

  render(): JSX.Element {
    const {
      autoCapitalize,
      autoCorrect,
      autoFocus,
      borderColor,
      clearTextOnFocus,
      disabled,
      editable,
      errorColor,
      help,
      keyboardType,
      label,
      labelColor,
      maxLength,
      multiline,
      onSubmitEditing,
      prefix,
      returnKeyType,
      secureTextEntry,
      selectionColor,
      softMax,
      style,
      suffix,
      theme,
      textColor,
      tintColor,
      type
    } = this.props;

    const {value} = this.state;

    let updatedAutoCapitalize: AutoCapitalizeType = autoCapitalize;
    let updatedAutoCorrect: boolean = autoCorrect;
    let updatedClearTextOnFocus: boolean = clearTextOnFocus;
    let updatedKeyboardType: KeyboardType = keyboardType;
    let updatedMultiline: boolean = multiline;
    let updatedSecureTextEntry: boolean = secureTextEntry;

    switch(type) {
      case 'password':
        updatedAutoCapitalize = 'none';
        updatedAutoCorrect = false;
        updatedSecureTextEntry = true;
        updatedClearTextOnFocus = true;
        break;
      case 'email':
        updatedAutoCapitalize = 'none';
        updatedAutoCorrect = false;
        updatedKeyboardType = 'email-address';
        break;
      case 'float':
        updatedKeyboardType = 'decimal-pad';
        break;
      case 'numeric':
        updatedKeyboardType = 'numeric';
        break;
      case 'phone':
        updatedKeyboardType = 'phone-pad';
        break;
      case 'search':
        updatedKeyboardType = 'web-search';
        break;
      case 'textarea':
        updatedAutoCapitalize = 'sentences';
        updatedAutoCorrect = true;
        updatedMultiline = true;
        break;
      case 'url':
        updatedKeyboardType = 'url';
        break;
      case 'username':
        updatedAutoCapitalize = 'none';
        updatedAutoCorrect = false;
        break;
      default:
        break;
    }

    // Theme colors
    const {
      inputFieldBorderColor,
      inputFieldErrorColor,
      inputFieldFont,
      inputFieldKeyboardAppearance,
      inputFieldLabelColor,
      inputFieldLabelSize,
      inputFieldSelectionColor,
      inputFieldTextColor,
      inputFieldTextSize
    } = this.componentTheme;

    return (
      <TextField
        animationDuration={150}
        autoCapitalize={updatedAutoCapitalize}
        autoCorrect={updatedAutoCorrect}
        autoFocus={autoFocus}
        baseColor={textColor || inputFieldTextColor}
        borderColor={borderColor || inputFieldBorderColor}
        blurOnSubmit={false}
        clearTextOnFocus={updatedClearTextOnFocus}
        clearButtonMode="while-editing"
        characterRestriction={softMax}
        disabled={disabled}
        editable={!disabled && editable}
        enablesReturnKeyAutomatically
        errorColor={errorColor || inputFieldErrorColor}
        fontFamily={inputFieldFont}
        fontSize={inputFieldTextSize}
        help={help}
        keyboardAppearance={inputFieldKeyboardAppearance}
        keyboardType={updatedKeyboardType}
        label={label}
        labelColor={labelColor || inputFieldLabelColor}
        labelFontSize={inputFieldLabelSize}
        maxLength={maxLength}
        multiline={updatedMultiline}
        onBlur={this.onBlur}
        onChangeText={this.onUpdate}
        onFocus={this.onFocus}
        onSubmitEditing={onSubmitEditing}
        prefix={prefix}
        returnKeyType={returnKeyType}
        ref={(ref) => this.inputField = ref}
        secureTextEntry={updatedSecureTextEntry}
        selectionColor={selectionColor || inputFieldSelectionColor}
        style={style}
        suffix={suffix}
        textColor={textColor || inputFieldTextColor}
        theme={theme}
        tintColor={tintColor || inputFieldSelectionColor}
        value={value} />
    );
  }
}
