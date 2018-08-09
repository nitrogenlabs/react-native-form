import {Flux, FluxAction} from '@nlabs/arkhamjs';
import isEmpty from 'lodash/isEmpty';
import * as React from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Picker,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';

import {Button} from '../Button/Button';
import {ComponentConstants} from '../constants/ComponentConstants';
import {PickerConfigType, SelectOptionType} from '../types/InputTypes';
import {uiTheme} from '../UITheme';

export interface SelectPickerProps {
  readonly closeText?: string;
  readonly overlayStyle?: ViewStyle;
  readonly pickerStyle?: ViewStyle;
  readonly theme?: any;
}

export interface SelectPickerState {
  readonly bgOpacityValue: Animated.Value;
  readonly label: string;
  readonly list: SelectOptionType[];
  readonly name: string;
  readonly pickerHeight: number;
  readonly pickerOpacityValue: Animated.Value;
  readonly pickerYValue: Animated.Value;
  readonly selectedValue: string;
  readonly showPicker: boolean;
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

export class SelectPicker extends React.PureComponent<SelectPickerProps, SelectPickerState> {
  static defaultProps = {
    closeText: 'Done',
    theme: {}
  };
  private componentTheme: any;

  constructor(props: SelectPickerProps) {
    super(props, 'selectPicker');

    // Methods
    this.onChange = this.onChange.bind(this);
    this.closePicker = this.closePicker.bind(this);
    this.openPicker = this.openPicker.bind(this);
    this.animatePicker = this.animatePicker.bind(this);

    // Initial state
    this.state = {
      bgOpacityValue: new Animated.Value(0),
      label: '',
      list: [],
      name: '',
      pickerHeight: 250,
      pickerOpacityValue: new Animated.Value(0),
      pickerYValue: new Animated.Value(250),
      selectedValue: '',
      showPicker: false
    };

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  componentDidMount(): void {
    Flux.on(ComponentConstants.PICKER_OPEN, this.openPicker);
  }

  componentWillUnmount(): void {
    Flux.off(ComponentConstants.PICKER_OPEN, this.openPicker);
  }

  openPicker(data: PickerConfigType): void {
    const {
      label = '',
      list = [],
      name,
      value = ''
    } = data;

    let selectedValue: string = value;

    if(!selectedValue && !isEmpty(list[0]) && list[0].value !== undefined) {
      selectedValue = list[0].value;
    }

    if(list.length) {
      Keyboard.dismiss();
      this.setState({label, list, name, selectedValue, showPicker: true});
    } else {
      this.setState({showPicker: false});
    }
  }

  closePicker(): void {
    const {
      bgOpacityValue,
      pickerHeight,
      pickerYValue,
      pickerOpacityValue,
      name,
      selectedValue
    } = this.state;

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
      this.setState({label: '', name: '', showPicker: false}, async () => {
        await this.pickerChange(name, selectedValue);
        await this.pickerClose(name);
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

  pickerChange(name: string, value): Promise<FluxAction> {
    return Flux.dispatch({name, type: ComponentConstants.PICKER_CHANGE, value});
  }

  pickerClose(name: string): Promise<FluxAction> {
    return Flux.dispatch({name, type: ComponentConstants.PICKER_CLOSE});
  }

  onChange(selectedValue): void {
    const {name} = this.state;
    this.pickerChange(name, selectedValue);
    this.setState({selectedValue});
  }

  renderLabel(): JSX.Element {
    const {label} = this.state;
    let labelElement = null;

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

  renderOptions(): JSX.Element[] {
    const {list = []} = this.state;

    return list.map((item, index) => {
      const {label, value} = item;
      return <Picker.Item key={`option_${index}`} label={label} value={value} />;
    });
  }

  render(): JSX.Element {
    const {closeText} = this.props;
    const {bgOpacityValue, pickerHeight, pickerYValue, selectedValue, showPicker} = this.state;
    const {selectPickerSelectorBg} = this.componentTheme;
    const pickerStyle = {
      backgroundColor: selectPickerSelectorBg,
      height: pickerHeight,
      transform: [{translateY: pickerYValue}]
    };

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
              <Picker
                selectedValue={selectedValue}
                onValueChange={this.onChange}>
                {this.renderOptions()}
              </Picker>
            </View>
          </Animated.View>
        </View>
      );
    }

    return null;
  }
}
