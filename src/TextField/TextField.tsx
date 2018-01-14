import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  TextInputProperties,
  TextStyle,
  View, ViewStyle
} from 'react-native';
import {uiTheme} from '../UITheme';
import {Affix} from './Affix';
import {Counter} from './Counter';
import {Helper} from './Helper';
import {Label} from './Label';
import {Line} from './Line';

export interface TextFieldProps extends TextInputProperties {
  readonly animationDuration?: number;
  readonly baseColor?: string;
  readonly characterRestriction?: number;
  readonly containerStyle?: ViewStyle | ViewStyle[];
  readonly disabled?: boolean;
  readonly error?: string;
  readonly errorColor?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly help?: string;
  readonly inputStyle?: TextStyle | TextStyle[];
  readonly label: string;
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

  static propTypes: object = {
    ...TextInput.propTypes,
    animationDuration: PropTypes.number,
    baseColor: PropTypes.string,
    characterRestriction: PropTypes.number,
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    disabled: PropTypes.bool,
    error: PropTypes.string,
    errorColor: PropTypes.string,
    fontFamily: PropTypes.string,
    fontSize: PropTypes.number,
    help: PropTypes.string,
    inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    label: PropTypes.string.isRequired,
    labelFontSize: PropTypes.number,
    prefix: PropTypes.string,
    renderAccessory: PropTypes.func,
    suffix: PropTypes.string,
    textColor: PropTypes.string,
    theme: PropTypes.object,
    tintColor: PropTypes.string
  };

  static defaultProps: object = {
    animationDuration: 225,
    autoCapitalize: 'sentences',
    baseColor: 'rgba(0, 0, 0, .5)',
    blurOnSubmit: true,
    disableFullscreenUI: true,
    disabled: false,
    editable: true,
    errorColor: 'rgb(213, 0, 0)',
    fontSize: 16,
    labelFontSize: 12,
    textColor: 'rgba(0, 0, 0, .8)',
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
    /*
    const {disabled, editable} = this.props;

    if(this.textInput && !disabled && editable) {
      this.textInput.focus();
    }*/
  }

  blur(): void {
    /*
    if(this.textInput) {
      this.textInput.blur();
    }
    */
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

  onBlur(): void {
    const {onBlur} = this.props;

    if('function' === typeof onBlur) {
      onBlur();
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

  onFocus(): void {
    const {onFocus} = this.props;

    if('function' === typeof onFocus) {
      onFocus();
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
      opacity: 0.7
    };

    const helperContainerStyle = {
      flexDirection: 'row',
      height: (help || limit) ?
        inputFieldHelpSize * 2 :
        focus.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [24, 8, 8]
        })
    };

    if(help || error) {
      return (
        <Animated.View style={helperContainerStyle}>
          <View style={viewStyles.flex}>
            <Helper style={errorStyle}>{error}</Helper>
            <Helper style={helpStyle}>{help}</Helper>
          </View>

          <Counter {...{baseColor, errorColor, count, limit}} />
        </Animated.View>
      );
    }

    return null;
  }

  render(): JSX.Element {
    const {
      inputFieldBorderWidth = 1,
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
      labelFontSize: activeFontSize = inputFieldLabelSize,
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

    const borderBottomColor = restricted ?
      errorColor :
      focus.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [errorColor, baseColor, tintColor]
      });

    const borderBottomWidth = restricted ?
      inputFieldBorderWidth :
      focus.interpolate({inputRange: [-1, 0, 1], outputRange: [2, StyleSheet.hairlineWidth, 2]});

    const updateContainerStyle = {
      ...(disabled ? {overflow: 'hidden'} : {borderBottomColor, borderBottomWidth}),
      ...(props.multiline ? {height: 40 + height} : {height: 40 + fontSize * 1.5})
    };

    const updateInputStyle = {
      color: (disabled || defaultVisible) ? baseColor : textColor,
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
      baseColor,
      errorColor,
      errored,
      fontFamily,
      fontSize,
      isFocused,
      restricted,
      tintColor
    };

    return (
      <View onStartShouldSetResponder={() => true} onResponderRelease={this.focus}>
        <Animated.View style={[viewStyles.textField, updateContainerStyle, containerStyle]}>
          {disabled && <Line type="dotted" color={baseColor} />}
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
              style={[viewStyles.input, updateInputStyle, inputStyle]}
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
  flex: {
    flex: 1
  },
  input: {
    flex: 1,
    margin: 0,
    padding: 0,
    top: 2
  },
  row: {
    flexDirection: 'row'
  },
  textField: {
    backgroundColor: 'transparent',
    marginBottom: 8,
    paddingTop: 32
  }
});
