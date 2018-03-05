import {Flux, FluxAction} from 'arkhamjs';
import {DateTime} from 'luxon';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  Animated,
  DatePickerIOS,
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewProperties
} from 'react-native';
import {Button} from '../Button/Button';
import {ComponentConstants} from '../constants/ComponentConstants';
import {uiTheme} from '../UITheme';

export interface DateTimePickerProps extends ViewProperties {
  readonly closeText?: string;
  readonly date?: Date;
  readonly maximumDate?: Date;
  readonly minimumDate?: Date;
  readonly minuteInterval?: 1 | 12 | 30 | 20 | 15 | 5 | 6 | 10 | 3 | 2 | 4;
  readonly mode?: 'date' | 'time' | 'datetime';
  readonly onDateChange?: (newDate: Date) => void;
  readonly theme: any;
  readonly timeZoneOffsetInMinutes?: number;
}

export interface DateTimePickerState {
  readonly bgOpacityValue: Animated.Value;
  readonly label?: string;
  readonly minimumDate?: Date;
  readonly minuteInterval?: 1 | 12 | 30 | 20 | 15 | 5 | 6 | 10 | 3 | 2 | 4;
  readonly mode?: 'date' | 'time' | 'datetime';
  readonly name?: string;
  readonly pickerHeight: number;
  readonly pickerOpacityValue: Animated.Value;
  readonly pickerYValue: Animated.Value;
  readonly selectedValue?: Date;
  readonly showPicker?: boolean;
  readonly timezone: string;
}

export class DateTimePicker extends React.PureComponent<DateTimePickerProps, DateTimePickerState> {
  private componentTheme: any;

  static propTypes = {
    closeText: PropTypes.string,
    date: PropTypes.object,
    maximumDate: PropTypes.object,
    minimumDate: PropTypes.object,
    minuteInterval: PropTypes.number,
    mode: PropTypes.string,
    onDateChange: PropTypes.func,
    theme: PropTypes.object,
    timeZoneOffsetInMinutes: PropTypes.number
  };

  static defaultProps = {
    closeText: 'Done',
    date: new Date(),
    minuteInterval: 1,
    mode: 'datetime',
    theme: {}
  };

  constructor(props: DateTimePickerProps) {
    super(props);

    // Methods
    this.onChange = this.onChange.bind(this);
    this.closePicker = this.closePicker.bind(this);
    this.openPicker = this.openPicker.bind(this);
    this.animatePicker = this.animatePicker.bind(this);

    // Initial state
    const {date: selectedValue, minuteInterval, mode} = props;

    this.state = {
      bgOpacityValue: new Animated.Value(0),
      minuteInterval,
      mode,
      name: '',
      pickerHeight: 250,
      pickerOpacityValue: new Animated.Value(0),
      pickerYValue: new Animated.Value(250),
      selectedValue,
      showPicker: false,
      timezone: DateTime.local().toFormat('z')
    };

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentDidMount(): void {
    Flux.on(ComponentConstants.DATETIME_OPEN, this.openPicker);
  }

  componentWillUnmount(): void {
    Flux.off(ComponentConstants.DATETIME_OPEN, this.openPicker);
  }

  openPicker(data): void {
    const {
      minuteInterval: defaultInterval,
      mode: defaultMode
    } = this.props;
    const {
      minuteInterval = defaultInterval,
      label,
      minimumDate,
      mode = defaultMode,
      name,
      timezone,
      value: selectedValue = new Date()
    } = data;

    Keyboard.dismiss();

    this.setState({
      label,
      minimumDate,
      minuteInterval,
      mode,
      name,
      selectedValue,
      showPicker: true,
      timezone
    });
  }

  async closePicker(): Promise<void> {
    const {
      bgOpacityValue,
      pickerHeight,
      pickerYValue,
      pickerOpacityValue,
      name,
      selectedValue = new Date()
    } = this.state;
    const value: number = DateTime.fromJSDate(selectedValue).set({second: 0, millisecond: 0}).ts;

    await this.pickerChange(name, value);
    await this.pickerClose(name);

    Animated.parallel([
      Animated.timing(bgOpacityValue, {
        duration: 250,
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.timing(pickerOpacityValue, {
        duration: 250,
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.timing(pickerYValue, {
        duration: 250,
        toValue: pickerHeight,
        useNativeDriver: true
      })
    ]).start(() => {
      this.setState({name: '', label: '', selectedValue: new Date(value), showPicker: false});
    });

  }

  animatePicker(): void {
    const {bgOpacityValue, pickerYValue, pickerOpacityValue} = this.state;

    Animated.parallel([
      Animated.timing(bgOpacityValue, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.timing(pickerOpacityValue, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.spring(pickerYValue, {
        bounciness: 6,
        speed: 5,
        toValue: 10,
        useNativeDriver: true
      })
    ]).start();

    this.setState({showPicker: true});
  }

  async pickerChange(name: string, value): Promise<FluxAction> {
    return Flux.dispatch({type: ComponentConstants.PICKER_CHANGE, name, value});
  }

  async pickerClose(name: string): Promise<FluxAction> {
    return Flux.dispatch({type: ComponentConstants.PICKER_CLOSE, name});
  }

  onChange(selectedValue: Date = new Date()): void {
    const {name} = this.state;
    const dateTime: number = DateTime.fromJSDate(selectedValue).ts;
    this.pickerChange(name, dateTime);
    this.setState({selectedValue});
  }

  renderLabel(): JSX.Element {
    let labelElement;
    const {label} = this.state;

    if(label) {
      const {
        selectPickerFont = 'Helvetica',
        selectPickerLabelColor = '#fff',
        selectPickerLabelSize = 14
      } = this.componentTheme;
      const labelStyle: TextStyle = {
        color: selectPickerLabelColor,
        fontFamily: selectPickerFont,
        fontSize: selectPickerLabelSize
      };
      labelElement = <Text style={[viewStyles.label, labelStyle]}>{label}</Text>;
    }

    return <View style={viewStyles.labelContainer}>{labelElement}</View>;
  }

  render(): JSX.Element {
    const {closeText} = this.props;
    const {
      bgOpacityValue,
      minimumDate,
      minuteInterval,
      mode,
      pickerHeight,
      pickerYValue,
      selectedValue,
      showPicker,
      timezone
    } = this.state;
    const {selectPickerSelectorBg} = this.componentTheme;
    const pickerStyle = {
      backgroundColor: selectPickerSelectorBg,
      height: pickerHeight,
      transform: [{translateY: pickerYValue}]
    };
    const selectedDate: Date = DateTime.fromJSDate(selectedValue).toJSDate();
    const offsetInMin: number = +(DateTime.local().setZone(timezone).toFormat('Z')) * 60;
    const {locale} = DateTime.local();

    if(showPicker) {
      return (
        <View key="container" style={viewStyles.container} onLayout={this.animatePicker}>
          <TouchableWithoutFeedback key="overlay" onPress={this.closePicker}>
            <Animated.View style={[viewStyles.overlay, {opacity: bgOpacityValue}]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[viewStyles.selector, pickerStyle]}>
            <View key="picker">
              <View style={viewStyles.pickerHeader}>
                {this.renderLabel()}
                <Button
                  size="sm"
                  width={60}
                  style={viewStyles.closeBtn}
                  onPress={this.closePicker}
                  theme={this.componentTheme}>
                  {closeText}
                </Button>
              </View>
              <DatePickerIOS style={viewStyles.picker}
                date={selectedDate}
                locale={locale}
                minimumDate={minimumDate}
                minuteInterval={minuteInterval}
                mode={mode}
                onDateChange={this.onChange}
                timeZoneOffsetInMinutes={offsetInMin} />
            </View>
          </Animated.View>
        </View>
      );
    }

    return null;
  }
}
const windowSize = Dimensions.get('window');
const viewStyles = StyleSheet.create({
  closeBtn: {
    height: 30,
    paddingBottom: 3,
    paddingTop: 2
  },
  container: {
    bottom: 0,
    height: windowSize.height,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: windowSize.width
  },
  label: {
    textAlign: 'center'
  },
  labelContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 60,
    width: windowSize.width - 180
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  picker: {
    width: windowSize.width
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15
  },
  selector: {
    borderRadius: 3,
    bottom: 0,
    flexDirection: 'column',
    left: 0,
    paddingBottom: 15,
    position: 'absolute',
    right: 0
  }
});
