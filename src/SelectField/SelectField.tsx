import {Flux, FluxAction} from 'arkhamjs-native';
import {head} from 'lodash';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  StyleSheet,
  Text, TextStyle,
  TouchableOpacity,
  View, ViewStyle
} from 'react-native';
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

export class SelectField extends FormField<SelectFieldProps, FormFieldState> {
  static propTypes: object = {
    ...FormField.propTypes,
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    label: PropTypes.string,
    labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    list: PropTypes.array,
    name: PropTypes.string.isRequired,
    onPress: PropTypes.func,
    placeholder: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
  };

  static defaultProps: object = {
    ...FormField.defaultProps,
    label: '',
    list: [],
    placeholder: 'Select...'
  };

  static contextTypes: object = {
    add: PropTypes.func.isRequired,
    errors: PropTypes.object,
    update: PropTypes.func.isRequired,
    validate: PropTypes.func,
    values: PropTypes.object.isRequired
  };

  constructor(props: SelectFieldProps) {
    super(props);

    // Methods
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onPress = this.onPress.bind(this);
  }

  componentWillMount(): void {
    const {name} = this.props;

    // Add listener
    Flux.on(`${ComponentConstants.PICKER_CHANGE}${name}`, this.onChange);
    Flux.on(`${ComponentConstants.PICKER_CLOSE}${name}`, this.onClose);
  }

  componentDidMount(): void {
    const {name, required, type} = this.props;
    const types: string[] = [type];

    if(required) {
      types.push('required');
    }

    this.context.add({name, types});
  }

  componentWillUnmount(): void {
    const {name} = this.props;

    // Remove listener
    Flux.off(`${ComponentConstants.PICKER_CHANGE}${name}`, this.onChange);
    Flux.off(`${ComponentConstants.PICKER_CLOSE}${name}`, this.onClose);
  }

  focus(): void {
    this.onPress();
  }

  blur(): void {
    this.onClose();
  }

  onPress(): void {
    const {disabled, label, list, name, value} = this.props;

    if(!disabled) {
      let selectedValue: string = '';

      if(!value) {
        selectedValue = this.getValue();
      }

      this.pickerOpen(name, list, selectedValue, label);
    }
  }

  onChange(data): void {
    const {value} = data;
    const {onChange} = this.props;

    this.updateValue(value, 'change');

    if(onChange) {
      onChange(value);
    }
  }

  onClose(): void {
    const {onSubmitEditing} = this.props;

    if(onSubmitEditing) {
      onSubmitEditing(null);
    }
  }

  updateValue(value, action): void {
    const {name} = this.props;
    const field = {
      action,
      name,
      value
    };

    this.context.update(field);
  }

  pickerOpen(name: string, list, value, label: string): Promise<FluxAction> {
    return Flux.dispatch({type: ComponentConstants.PICKER_OPEN, label, list, name, value});
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
    const value = this.getValue();
    const {disabled, list = [], placeholder} = this.props;
    const selectedLabel = (head(list.filter((li: SelectOptionType) => li.value === value)) || {label: ''}).label;
    const {
      inputFieldErrorColor = '#D70303',
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
    const disabledStyle = disabled ? {color: inputFieldErrorColor} : {};

    if(selectedLabel) {
      return <Text style={[themeStyle, disabledStyle]}>{selectedLabel}</Text>;
    } else {
      return <Text style={[themeStyle, disabledStyle]}>{placeholder}</Text>;
    }
  }

  render(): JSX.Element {
    const {containerStyle, disabled, style} = this.props;

    // Theme colors
    const {
      inputFieldBorderColor = '#222',
      inputFieldDisabledBg = '#333',
      inputFieldErrorColor = '#D70303'
    } = this.componentTheme;
    const themeStyle: TextStyle = {borderBottomColor: inputFieldBorderColor};

    // Disabled styles
    const disabledStyle: ViewStyle = disabled ? {
      backgroundColor: inputFieldDisabledBg,
      borderBottomColor: inputFieldErrorColor
    } : null;

    return (
      <View style={[viewStyles.inputBox, containerStyle]}>
        {this.renderLabel()}
        <TouchableOpacity activeOpacity={0.5} onPress={this.onPress}>
          <View style={[viewStyles.textInput, themeStyle, style, disabledStyle]}>
            {this.renderText()}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const viewStyles = StyleSheet.create({
  inputBox: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    marginBottom: 0
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
