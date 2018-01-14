import {Flux, FluxAction} from 'arkhamjs-native';
import moment from 'moment-timezone';
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
  readonly date?: Date;
  readonly maximumDate?: Date;
  readonly minimumDate?: Date;
  readonly minuteInterval?: number;
  readonly mode?: 'date' | 'time' | 'datetime';
  readonly onDateChange?: (newDate: Date) => void;
  readonly timeZoneOffsetInMinutes?: number;
  readonly theme: any;
}

export interface DateTimePickerState {
  readonly bgOpacityValue: Animated.Value;
  readonly label?: string;
  readonly minimumDate?: Date;
  readonly minuteInterval?: number;
  readonly mode?: 'date' | 'time' | 'datetime';
  readonly name?: string;
  readonly pickerHeight: number;
  readonly pickerOpacityValue: Animated.Value;
  readonly pickerYValue: Animated.Value;
  readonly selectedValue?: Date;
  readonly showPicker?: boolean;
}

export class DateTimePicker extends React.PureComponent<DateTimePickerProps, DateTimePickerState> {
  private componentTheme: any;

  static propTypes = {
    date: PropTypes.object,
    minuteInterval: PropTypes.number,
    mode: PropTypes.string,
    theme: PropTypes.object
  };

  static defaultProps = {
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
      showPicker: false
    };

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentWillMount(): void {
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
      showPicker: true
    });
  }

  closePicker(): void {
    const {
      bgOpacityValue,
      pickerHeight,
      pickerYValue,
      pickerOpacityValue,
      name,
      selectedValue = new Date()
    } = this.state;
    const value: number = +(moment(selectedValue).second(0).millisecond(0).format('x'));

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
      this.setState({name: '', label: '', selectedValue: new Date(value), showPicker: false}, () => {
        this.pickerChange(name, value);
        this.pickerClose(name);
      });
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
    await Flux.dispatch({type: ComponentConstants.PICKER_CHANGE, name, value});
    return Flux.dispatch({type: `${ComponentConstants.PICKER_CHANGE}${name}`, value});
  }

  async pickerClose(name: string): Promise<FluxAction> {
    await Flux.dispatch({type: ComponentConstants.PICKER_CLOSE});
    return Flux.dispatch({type: `${ComponentConstants.PICKER_CLOSE}${name}`});
  }

  onChange(selectedValue: Date = new Date()): void {
    const {name} = this.state;
    const dateTime: number = +(moment(selectedValue).format('x'));
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
    const {
      bgOpacityValue,
      minimumDate,
      minuteInterval,
      mode,
      pickerHeight,
      pickerYValue,
      showPicker
    } = this.state;
    const pickerStyle = {height: pickerHeight, transform: [{translateY: pickerYValue}]};
    const {selectedValue} = this.state;
    const selectedDate: Date = moment(+(selectedValue)).toDate();

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
                  onPress={this.closePicker}>
                  Done
                </Button>
              </View>
              <DatePickerIOS style={viewStyles.picker}
                date={selectedDate}
                minimumDate={minimumDate}
                minuteInterval={minuteInterval}
                mode={mode}
                onDateChange={this.onChange} />
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
