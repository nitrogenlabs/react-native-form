import * as PropTypes from 'prop-types';
import * as React from 'react';
import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';
import {TextField} from '../TextField/TextField';

export interface InputFieldProps extends FormFieldProps {
  readonly autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  readonly autoCorrect?: boolean;
  readonly autoFocus?: boolean;
  readonly clearTextOnFocus?: boolean;
  readonly direction?: string;
  readonly help?: string;
  readonly keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'ascii-capable' |
  'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'decimal-pad' | 'twitter' | 'web-search';
  readonly label: string;
  readonly multiline?: boolean;
  readonly name: string;
  readonly prefix?: string;
  readonly returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'none' | 'previous' | 'default' |
  'emergency-call' | 'google' | 'join' | 'route' | 'yahoo';
  readonly secureTextEntry?: boolean;
  readonly softMax?: number;
  readonly suffix?: string;
}

export class InputField extends FormField<InputFieldProps, FormFieldState> {
  static propTypes: object = {
    ...FormField.propTypes,
    autoCapitalize: PropTypes.string,
    autoCorrect: PropTypes.bool,
    autoFocus: PropTypes.bool,
    clearTextOnFocus: PropTypes.bool,
    direction: PropTypes.string,
    help: PropTypes.string,
    keyboardType: PropTypes.string,
    label: PropTypes.string,
    multiline: PropTypes.bool,
    prefix: PropTypes.string,
    returnKeyType: PropTypes.string,
    secureTextEntry: PropTypes.bool,
    softMax: PropTypes.number,
    suffix: PropTypes.string,
    type: PropTypes.string
  };

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
  }

  render(): JSX.Element {
    const {
      autoFocus,
      disabled,
      editable,
      help,
      label,
      maxLength,
      name,
      onSubmitEditing,
      prefix,
      returnKeyType,
      softMax,
      suffix,
      type
    } = this.props;

    let {
      autoCapitalize,
      autoCorrect,
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

    // Value
    const value = (this.context.values[name] || '').toString();

    // Theme colors
    const {
      inputFieldErrorColor,
      inputFieldFont,
      inputFieldKeyboardAppearance,
      inputFieldLabelSize,
      inputFieldSelectionColor,
      inputFieldTextColor,
      inputFieldTextSize
    } = this.componentTheme;

    return (
      <TextField
        animationDuration={150}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        baseColor={inputFieldTextColor}
        blurOnSubmit={false}
        clearTextOnFocus={clearTextOnFocus}
        clearButtonMode="while-editing"
        characterRestriction={softMax}
        disabled={disabled}
        editable={!disabled && editable}
        enablesReturnKeyAutomatically={true}
        errorColor={inputFieldErrorColor}
        fontFamily={inputFieldFont}
        fontSize={inputFieldTextSize}
        help={help}
        keyboardAppearance={inputFieldKeyboardAppearance}
        keyboardType={keyboardType}
        label={label}
        labelFontSize={inputFieldLabelSize}
        maxLength={maxLength}
        multiline={multiline}
        onBlur={this.onBlur}
        onChangeText={this.onUpdate}
        onFocus={this.onFocus}
        onSubmitEditing={onSubmitEditing}
        prefix={prefix}
        returnKeyType={returnKeyType}
        ref={(r) => this.field = r}
        secureTextEntry={secureTextEntry}
        selectionColor={inputFieldSelectionColor}
        style={{fontFamily: inputFieldFont}}
        suffix={suffix}
        textColor={inputFieldTextColor}
        tintColor={inputFieldSelectionColor}
        value={value} />
    );
  }
}
