import {ViewStyle} from 'react-native';

export interface DateTimeConfigType {
  name: string;
  value: any;
  label: string;
  minimumDate: Date;
  minuteInterval: number;
  mode: string;
  timezone: string;
}

export interface MotionItemType {
  readonly key: string;
  readonly style: ViewStyle;
}

export interface SelectOptionType {
  readonly label: string;
  readonly value: any;
}

export interface PickerConfigType {
  readonly label: string;
  readonly list: SelectOptionType[];
  readonly name: string;
  readonly value: string;
}
