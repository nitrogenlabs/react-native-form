import {Flux, FluxAction} from '@nlabs/arkhamjs';
import {DateTime} from 'luxon';
import * as React from 'react';
import {StyleSheet, Text, TextStyle, TouchableHighlight, View, ViewStyle} from 'react-native';

import {ComponentConstants} from '../constants/ComponentConstants';
import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';
import {DateTimeConfigType} from '../types/InputTypes';
import {uiTheme} from '../UITheme';

export interface DateTimeFieldProps extends FormFieldProps {
  readonly format?: string;
  readonly label?: string;
  readonly labelStyle?: ViewStyle;
  readonly minimumDate?: Date;
  readonly minuteInterval?: number;
  readonly mode?: 'date' | 'time' | 'datetime';
  readonly placeholder?: string;
  readonly placeholderTextColor?: string;
  readonly style?: ViewStyle;
  readonly textStyle?: TextStyle;
  readonly theme?: any;
  readonly timezone?: string;
}

export class DateTimeField extends FormField<DateTimeFieldProps, FormFieldState> {
  static defaultProps: object = {
    format: 'D h:mm a',
    label: '',
    minuteInterval: 1,
    mode: 'datetime',
    placeholder: '',
    theme: {},
    timezone: 'America/Chicago'
  };

  constructor(props: DateTimeFieldProps) {
    super(props);

    // Methods
    this.blur = this.blur.bind(this);
    this.convertTime = this.convertTime.bind(this);
    this.focus = this.focus.bind(this);
    this.onPress = this.onPress.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.openDateTime = this.openDateTime.bind(this);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentDidMount(): void {
    const {required} = this.props;
    this.types = ['dateTime'];

    if (required) {
      this.types.push('required');
    }

    this.context.add(this);
  }

  focus(): void {
    this.onPress();
  }

  blur(): void {
    this.onClose();
  }

  async openDateTime(config: DateTimeConfigType): Promise<FluxAction> {
    const {name, value, label, minimumDate, minuteInterval, mode, timezone} = config;
    return Flux.dispatch({
      label,
      minimumDate,
      minuteInterval,
      mode,
      name,
      timezone,
      type: ComponentConstants.DATETIME_OPEN,
      value
    });
  }

  onPress(): void {
    const {label, minimumDate, minuteInterval, mode, name, timezone} = this.props;
    const minimumDateObj: Date = new Date(minimumDate);
    const numValue: number = +(this.value);
    const defaultValue: number = isNaN(numValue) ? +(new Date()) : numValue;
    const dateValue: Date = DateTime.fromMillis(defaultValue)
      .setZone(timezone)
      .set({second: 0, millisecond: 0})
      .toJSDate();
    this.openDateTime({
      label,
      minimumDate: minimumDateObj,
      minuteInterval,
      mode,
      name,
      timezone,
      value: dateValue
    });
  }

  onClose(): void {
    const {onSubmitEditing} = this.props;

    if (onSubmitEditing) {
      onSubmitEditing(null);
    }
  }

  updateValue(strValue: string): void {
    const value: string = this.convertTime(+(strValue), false).toString();
    this.isUpdated = true;
    this.value = value;
    this.setState({value});

    // Call field update listener
    const {onUpdate} = this.props;

    if (onUpdate) {
      onUpdate(value);
    }
  }

  convertTime(value: number, defaultOffset = false): number {
    const {timezone} = this.props;
    let dateTime: DateTime = DateTime.fromMillis(value).set({second: 0, millisecond: 0});

    if (!defaultOffset && timezone) {
      /* offset = moment().tz(timezone).format('Z');*/
      dateTime = dateTime.setZone(timezone);
    }

    return dateTime.ts;
  }

  renderLabel(): JSX.Element {
    const {label = '', labelStyle} = this.props;
    const {
      inputFieldFont = 'Helvetica',
      inputFieldLabelColor = '#000',
      inputFieldLabelSize = 13
    } = this.componentTheme;
    const themeStyle: TextStyle = {
      color: inputFieldLabelColor,
      fontFamily: inputFieldFont,
      fontSize: inputFieldLabelSize
    };

    if (label !== '') {
      return <Text style={[themeStyle, labelStyle]}>{label}</Text>;
    }

    return null;
  }

  render(): JSX.Element {
    const {format, placeholder, style, textStyle, timezone} = this.props;
    const {
      inputFieldBorderColor = 'rgba(255, 255, 255, 0.3)',
      inputFieldBorderWidth = 1,
      inputFieldFont = 'Helvetica',
      inputFieldPlaceholderColor = '#ccc',
      inputFieldTextColor = '#000',
      inputFieldTextSize = 18
    } = this.componentTheme;
    const defaultValue: number = +(this.value);
    const defaultDate: number = isNaN(defaultValue) ? +(new Date()) : defaultValue;
    const value: number = this.convertTime(defaultDate, true);
    const label = value ? DateTime.fromMillis(value).setZone(timezone).toFormat(format) : placeholder;
    const placeholderStyle = !value ? {color: inputFieldPlaceholderColor} : null;
    const themeLabelStyle: TextStyle = {
      color: inputFieldTextColor,
      fontFamily: inputFieldFont,
      fontSize: inputFieldTextSize
    };
    const themeFieldStyle: ViewStyle = {
      borderBottomColor: inputFieldBorderColor,
      borderBottomWidth: inputFieldBorderWidth
    };

    return (
      <View style={viewStyles.fieldBox}>
        {this.renderLabel()}
        <TouchableHighlight
          style={[viewStyles.field, themeFieldStyle, style]}
          underlayColor="transparent"
          onPress={this.onPress}>
          <Text style={[viewStyles.label, themeLabelStyle, textStyle, placeholderStyle]}>{label}</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const viewStyles = StyleSheet.create({
  field: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    paddingTop: 5
  },
  fieldBox: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    marginTop: 5
  },
  label: {
    flex: 1,
    textAlign: 'left'
  }
});
