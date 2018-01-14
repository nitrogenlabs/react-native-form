import {DateUtils} from '@nlabs/react-native-utils';
import {Flux, FluxAction} from 'arkhamjs-native';
import moment, {Moment} from 'moment-timezone';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  View,
  ViewStyle
} from 'react-native';
import {ComponentConstants} from '../constants/ComponentConstants';
import {FormFieldType} from '../Form/Form';
import {FormField, FormFieldProps} from '../FormField/FormField';
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

export class DateTimeField extends React.Component<DateTimeFieldProps, object> {
  private componentTheme: any;

  static propTypes: object = {
    ...FormField.propTypes,
    dateFormat: PropTypes.string,
    label: PropTypes.string,
    labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    minimumDate: PropTypes.number,
    minuteInterval: PropTypes.number,
    mode: PropTypes.string,
    onClick: PropTypes.func,
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
    textStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
    theme: PropTypes.object,
    timezone: PropTypes.string
  };

  static defaultProps: object = {
    format: 'M/D/YY h:mm a',
    label: '',
    minuteInterval: 1,
    mode: 'datetime',
    placeholder: '',
    theme: {},
    timezone: 'America/Chicago'
  };

  static contextTypes: object = {
    add: PropTypes.func.isRequired,
    errors: PropTypes.object,
    update: PropTypes.func.isRequired,
    validate: PropTypes.func,
    values: PropTypes.object.isRequired
  };

  constructor(props: DateTimeFieldProps) {
    super(props);

    // Methods
    this.blur = this.blur.bind(this);
    this.convertTime = this.convertTime.bind(this);
    this.focus = this.focus.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.openDateTime = this.openDateTime.bind(this);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentWillMount(): void {
    const {name} = this.props;

    Flux.on(`${ComponentConstants.DATETIME_OPEN}${name}`, this.onUpdate);
    Flux.on(`${ComponentConstants.PICKER_CHANGE}${name}`, this.onUpdate);
    Flux.on(`${ComponentConstants.PICKER_CLOSE}${name}`, this.onClose);
  }

  componentDidMount(): void {
    const {name, required} = this.props;
    const types: string[] = ['dateTime'];

    if(required) {
      types.push('required');
    }

    this.context.add({name, types});
  }

  componentWillUnmount(): void {
    const {name} = this.props;

    Flux.off(`${ComponentConstants.DATETIME_OPEN}${name}`, this.onUpdate);
    Flux.off(`${ComponentConstants.PICKER_CHANGE}${name}`, this.onUpdate);
    Flux.off(`${ComponentConstants.PICKER_CLOSE}${name}`, this.onClose);
  }

  focus(): void {
    this.onClick();
  }

  blur(): void {
    this.onClose();
  }

  async openDateTime(config: DateTimeConfigType): Promise<FluxAction> {
    const {name, value, label, minimumDate, minuteInterval, mode, timezone} = config;
    await Flux.dispatch({type: `${ComponentConstants.DATETIME_OPEN}${name}`, name, value});
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

  onClick(): void {
    const {label, minimumDate, minuteInterval, mode, name, timezone} = this.props;
    const minimumDateObj: Date = new Date(minimumDate);
    const value: number = this.getValue();
    const offset: string = moment().format('Z');
    const defaultValue: number = isNaN(value) ? +(new Date()) : value;
    const dateObj: Moment = mode === 'time' ? DateUtils.resetDay(moment(defaultValue))
      : DateUtils.cleanTime(moment(defaultValue));
    const formatted: string = dateObj.tz(timezone).format(`YYYY-MM-DD HH:mm:00.000[${offset}]`);
    const dateValue: Date = moment(formatted).toDate();

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

    if(onSubmitEditing) {
      onSubmitEditing(null);
    }
  }

  onUpdate(data): void {
    const value: number = this.convertTime(data.value, false);
    const {onUpdate} = this.props;

    this.updateValue(value, 'change');

    if(onUpdate) {
      onUpdate(value);
    }
  }

  updateValue(value: number, actionType: string): void {
    const {name} = this.props;
    const field: FormFieldType = {
      actionType,
      name,
      value
    };

    this.context.update(field);
  }

  getValue(): number {
    const {name, value} = this.props;
    return this.context.values[name] || value;
  }

  convertTime(value: number, defaultOffset = false): number {
    const {timezone} = this.props;
    let dateTime: number;
    const dateObj: Moment = moment(value).second(0).millisecond(0);

    if(!defaultOffset && timezone) {
      /* offset = moment().tz(timezone).format('Z');*/
      dateTime = +(dateObj.tz(timezone).format(`x`));
    } else {
      /* offset = moment().format('Z');*/
      dateTime = +(dateObj.format(`x`));
    }

    return dateTime;
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

    if(label !== '') {
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
    const defaultValue: number = this.getValue();
    const defaultDate: number = isNaN(defaultValue) ? +(new Date()) : defaultValue;
    const value: number = this.convertTime(defaultDate, true);
    const label = value ? moment(value).tz(timezone).format(format) : placeholder;
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
          onPress={this.onClick}>
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
