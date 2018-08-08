import * as React from 'react';
import {Animated, Platform, StyleSheet, TextInput, TextInputProperties, TextStyle, View, ViewStyle} from 'react-native';

import {uiTheme} from '../UITheme';
import {Affix} from './Affix';
import {Counter} from './Counter';
import {Helper} from './Helper';
import {Label} from './Label';
import {Line} from './Line';

export interface TextFieldProps extends TextInputProperties {
  readonly animationDuration?: number;
  readonly baseColor?: string;
  readonly borderColor?: string;
  readonly characterRestriction?: number;
  readonly containerStyle?: ViewStyle | ViewStyle[];
  readonly disabled?: boolean;
  readonly error?: string;
  readonly errorColor?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly help?: string;
  readonly inputStyle?: TextStyle | TextStyle[];
  readonly label?: string;
  readonly labelColor?: string;
  readonly labelFontSize?: number;
  readonly prefix?: string;
  readonly renderAccessory?: () => JSX.Element;
  readonly textColor?: string;
  readonly theme?: any;
  readonly tintColor?: string;
  readonly suffix?: string;
}

export interface TextFieldState {
  readonly error?: string;
  readonly errored?: boolean;
  readonly focus?: Animated.Value;
  readonly isFocused?: boolean;
  readonly height?: number;
  readonly receivedFocus?: boolean;
  readonly text?: string;
}

export class TextField extends React.PureComponent<TextFieldProps, TextFieldState> {
  private componentTheme: any;
  private mounted: boolean = false;
  input;

  static defaultProps: object = {
    animationDuration: 225,
    autoCapitalize: 'sentences',
    baseColor: 'rgba(0, 0, 0, .5)',
    borderColor: '#000',
    disabled: false,
    editable: true,
    errorColor: 'rgb(213, 0, 0)',
    fontSize: 16,
    labelColor: '#000',
    labelFontSize: 12,
    theme: {},
    tintColor: 'rgb(0, 145, 234)',
    underlineColorAndroid: 'transparent'
  };

  constructor(props: TextFieldProps) {
    super(props);

    // Methods
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.focus = this.focus.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);

    // Initial state
    const {value, error, fontSize} = this.props;

    this.state = {
      error,
      errored: !!error,
      focus: new Animated.Value(error ? -1 : 0),
      height: fontSize * 1.5,
      isFocused: false,
      receivedFocus: false,
      text: value
    };

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentWillReceiveProps(props: TextFieldProps): void {
    const {error: stateError} = this.state;
    const {error: oldError} = this.props;
    const {error: newError, value} = props;

    if(null !== value) {
      this.setState({text: value});
    }

    if(newError && newError !== stateError) {
      this.setState({error: newError});
    }

    if(newError !== oldError) {
      this.setState({errored: !!newError});
    }
  }

  componentDidMount(): void {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  componentWillUpdate(props, state): void {
    const {error, animationDuration} = this.props;
    const {focus, isFocused} = this.state;

    if(props.error !== error || (isFocused !== state.isFocused)) {
      Animated
        .timing(focus, {
          duration: animationDuration,
          toValue: props.error ? -1 : (state.isFocused ? 1 : 0)
        })
        .start(() => {
          if(this.mounted) {
            this.setState((stateVal, {error: errorVal}) => ({error: errorVal}));
          }
        });
    }
  }

  focus(): void {
    const {disabled, editable} = this.props;

    if(this.input && !disabled && editable) {
      this.input.focus();
    }
  }

  blur(): void {
    if(this.input) {
      this.input.blur();
    }
  }

  clear(): void {
    /*
    this.textInput.clear();
    */
  }

  value(): string {
    const {text, receivedFocus} = this.state;
    const {value, defaultValue} = this.props;

    return (receivedFocus || null !== value || null === defaultValue) ? text : defaultValue;
  }

  isRestricted(): boolean {
    const {characterRestriction} = this.props;
    const {text = ''} = this.state;

    return characterRestriction < text.length;
  }

  onBlur(event): void {
    const {onBlur} = this.props;

    if('function' === typeof onBlur) {
      onBlur(event);
    }

    this.setState({isFocused: false});
  }

  onChange(event): void {
    const {onChange, multiline} = this.props;

    if('function' === typeof onChange) {
      onChange(event);
    }

    /* XXX: onContentSizeChange is not called on RN 0.44 */
    if(multiline && 'android' === Platform.OS) {
      this.onContentSizeChange(event);
    }
  }

  onChangeText(text): void {
    const {onChangeText} = this.props;
    this.setState({text});

    if('function' === typeof onChangeText) {
      onChangeText(text);
    }
  }

  onContentSizeChange(event): void {
    const {onContentSizeChange, fontSize} = this.props;
    const {height} = event.nativeEvent.contentSize;

    if('function' === typeof onContentSizeChange) {
      onContentSizeChange(event);
    }

    this.setState({height: Math.max(fontSize * 1.5, Math.ceil(height))});
  }

  onFocus(event): void {
    const {onFocus} = this.props;

    if('function' === typeof onFocus) {
      onFocus(event);
    }

    this.setState({isFocused: true, receivedFocus: true});
  }

  renderAccessory(): JSX.Element {
    const {renderAccessory} = this.props;

    if('function' !== typeof renderAccessory) {
      return null;
    }

    return (
      <View style={viewStyles.accessory}>
        {renderAccessory()}
      </View>
    );
  }

  renderAffix(type: 'prefix' | 'suffix', active: boolean, isFocused: boolean): JSX.Element {
    const {
      inputFieldFont = 'Helvetica',
      inputFieldTextSize = 18,
      inputFieldTextColor = '#000'
    } = this.componentTheme;
    const {
      [type]: affix,
      fontFamily = inputFieldFont,
      fontSize = inputFieldTextSize,
      baseColor = inputFieldTextColor,
      animationDuration
    } = this.props;

    if(!affix) {
      return null;
    }

    const props = {
      active,
      animationDuration,
      baseColor,
      fontFamily,
      fontSize,
      isFocused,
      type
    };

    return (
      <Affix {...props}>{affix}</Affix>
    );
  }

  renderHelp(): JSX.Element {
    const {
      inputFieldFont = 'Helvetica',
      inputFieldErrorColor = '#D70303',
      inputFieldHelpSize = 12,
      inputFieldTextColor = '#000'
    } = this.componentTheme;
    const {
      baseColor = inputFieldTextColor,
      characterRestriction: limit,
      defaultValue,
      errorColor = inputFieldErrorColor,
      fontFamily = inputFieldFont,
      help,
      value
    } = this.props;
    const {error, focus, receivedFocus, text = ''} = this.state;
    const defaultVisible = !(receivedFocus || null !== value || null === defaultValue);
    const inputValue: string = defaultVisible ? defaultValue : text;
    const count: number = inputValue.length;

    const errorStyle = {
      color: errorColor,
      fontFamily,
      fontSize: help ?
        inputFieldHelpSize :
        focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [12, 0, 0]
        }),
      opacity: focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [1, 0, 0]
      })
    };

    const helpStyle: TextStyle = {
      color: baseColor,
      fontFamily,
      fontSize: inputFieldHelpSize,
      fontStyle: 'italic',
      fontWeight: '100',
      opacity: 0.7
    };

    const helperContainerStyle = {
      flexDirection: 'row',
      height: (help || limit) ?
        inputFieldHelpSize * 1.5 :
        focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [24, 8, 8]
        })
    };

    if(help || error) {
      const helper = error ? <Helper style={errorStyle}>{error}</Helper> : <Helper style={helpStyle}>{help}</Helper>;
      return (
        <Animated.View style={helperContainerStyle}>
          <View style={viewStyles.flex}>
            {helper}
          </View>
          <Counter {...{baseColor, errorColor, count, limit}} />
        </Animated.View>
      );
    }

    return null;
  }

  render(): JSX.Element {
    const {
      inputFieldBorderColor = '#000',
      inputFieldBorderWidth = 1,
      inputFieldDisabledColor = '#999',
      inputFieldFont = 'Helvetica',
      inputFieldErrorColor = '#D70303',
      inputFieldLabelColor = '#333',
      inputFieldLabelSize = 13,
      inputFieldSelectionColor = '#10C3D2',
      inputFieldTextColor = '#000',
      inputFieldTextSize = 18
    } = this.componentTheme;
    const {receivedFocus, focus, isFocused, errored, height, text = ''} = this.state;
    const {
      animationDuration,
      baseColor = inputFieldLabelColor,
      borderColor = inputFieldBorderColor,
      characterRestriction: limit,
      containerStyle,
      defaultValue,
      disabled,
      editable,
      errorColor = inputFieldErrorColor,
      fontFamily = inputFieldFont,
      fontSize = inputFieldTextSize,
      inputStyle,
      label,
      labelColor = inputFieldLabelColor,
      labelFontSize: activeFontSize = inputFieldLabelSize,
      style,
      textColor = inputFieldTextColor,
      tintColor = inputFieldSelectionColor,
      value,
      ...props
    } = this.props;

    const defaultVisible = !(receivedFocus || null !== value || null === defaultValue);
    const inputValue: string = defaultVisible ? defaultValue : text;
    const active: boolean = !!(inputValue || props.placeholder);
    const count: number = inputValue.length;
    const restricted: boolean = limit < count;

    let borderBottomColor;
    let borderBottomWidth;
    const hasBorder: boolean = borderColor !== 'transparent';

    if(hasBorder) {
      borderBottomColor = restricted ?
        errorColor :
        focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [errorColor, borderColor, tintColor]
        });

      borderBottomWidth = restricted ?
        inputFieldBorderWidth :
        focus.interpolate({inputRange: [-1, 0, 1], outputRange: [2, StyleSheet.hairlineWidth, 2]});
    } else {
      borderBottomColor = 'transparent';
      borderBottomWidth = 0;
    }

    const updateContainerStyle = {
      borderBottomColor,
      borderBottomWidth,
      overflow: 'visible',
      ...(props.multiline ? {height: 40 + height} : {height: 40 + fontSize * 1.5})
    };

    const updateInputStyle = {
      color: defaultVisible ? baseColor : textColor,
      ...(props.multiline ?
        {
          height: fontSize * 1.5 + height,
          ...Platform.select({android: {top: 0}, ios: {top: -1}})
        } : {height: fontSize * 1.5}),
      fontFamily,
      fontSize
    };

    const labelProps = {
      active,
      activeFontSize,
      animationDuration,
      baseColor: labelColor,
      errorColor,
      errored,
      fontFamily,
      fontSize,
      isFocused,
      restricted,
      tintColor
    };

    if(disabled) {
      labelProps.baseColor = inputFieldDisabledColor;
      updateContainerStyle.borderBottomWidth = 0;
      updateContainerStyle.overflow = 'hidden';
      updateInputStyle.color = inputFieldDisabledColor;
    } else {
      updateContainerStyle.borderBottomColor = borderBottomColor;
      updateContainerStyle.borderBottomWidth = borderBottomWidth;
    }

    const inputMargin: number = label ? 32 : 0;

    return (
      <View
        style={[viewStyles.container, style]}
        onStartShouldSetResponder={() => true}
        onResponderRelease={this.focus}>
        <Animated.View style={[viewStyles.textField, updateContainerStyle, containerStyle]}>
          {disabled && <Line type="dotted" color={inputFieldDisabledColor} />}
          {label && <Label {...labelProps}>{label}</Label>}
          <View style={viewStyles.row}>
            {this.renderAffix('prefix', active, isFocused)}

            <TextInput
              {...props}
              editable={!disabled && editable}
              onBlur={this.onBlur}
              onChange={this.onChange}
              onChangeText={this.onChangeText}
              onContentSizeChange={this.onContentSizeChange}
              onFocus={this.onFocus}
              selectionColor={tintColor}
              ref={(r) => this.input = r}
              style={[viewStyles.input, {marginTop: inputMargin}, updateInputStyle, inputStyle]}
              value={inputValue} />

            {this.renderAffix('suffix', active, isFocused)}
            {this.renderAccessory()}
          </View>
        </Animated.View>

        {this.renderHelp()}
      </View>
    );
  }
}

const viewStyles = StyleSheet.create({
  accessory: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    top: 2
  },
  container: {
    flexGrow: 1,
    flexShrink: 0,
    marginBottom: 5
  },
  flex: {
    flexGrow: 1,
    flexShrink: 0
  },
  input: {
    flex: 1,
    padding: 0,
    top: 2
  },
  row: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 0
  },
  textField: {
    backgroundColor: 'transparent',
    flexDirection: 'column'
  }
});
