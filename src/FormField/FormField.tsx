import * as PropTypes from 'prop-types';
import * as React from 'react';
import {TextInput, TextInputProperties} from 'react-native';
import {uiTheme} from '../UITheme';

export interface FormFieldProps extends TextInputProperties {
  readonly disabled?: boolean;
  readonly name: string;
  readonly onUpdate?: (value: any) => void;
  readonly required?: boolean;
  readonly theme?: any;
  readonly type?: string;
}

export interface FormFieldState extends Readonly<FormFieldState> {
  readonly isFocused?: boolean;
  readonly value?: string;
}

export abstract class FormField<P extends FormFieldProps, S extends FormFieldState> extends React.PureComponent<P, S> {
  private hasSubmit: boolean = false;
  protected componentTheme: any;
  inputField;
  isUpdated: boolean = false;
  types: string[] = [];
  value: string = '';

  static propTypes: object = {
    ...TextInput.propTypes,
    disabled: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    onUpdate: PropTypes.func,
    required: PropTypes.bool,
    theme: PropTypes.object,
    type: PropTypes.string,
    value: PropTypes.string
  };

  static defaultProps: object = {
    disabled: false,
    required: false,
    value: ''
  };

  static contextTypes: object = {
    add: PropTypes.func.isRequired,
    errors: PropTypes.object,
    update: PropTypes.func.isRequired,
    validate: PropTypes.func,
    values: PropTypes.object.isRequired
  };

  constructor(props: FormFieldProps) {
    super(props as any);

    // Methods
    this.close = this.close.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.getError = this.getError.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmitEditing = this.onSubmitEditing.bind(this);
    this.updateValue = this.updateValue.bind(this);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};

    const state: FormFieldState = {
      isFocused: false,
      value: props.value
    };
    this.state = state as any;
  }

  componentDidMount(): void {
    const {required, type, value} = this.props;
    this.types = [type];
    this.value = value;

    if(required) {
      this.types.push('required');
    }

    this.context.add(this);
  }

  get name(): string {
    return this.props.name;
  }

  close(): void {
    const {onSubmitEditing} = this.props;

    if(onSubmitEditing) {
      onSubmitEditing(null);
    }
  }

  updateValue(value: string): void {
    if(this.value !== value) {
      this.isUpdated = true;
      this.value = value;
      this.setState({value});
    }
  }

  onUpdate(value): void {
    if(!this.hasSubmit) {
      // Update the value in the form
      this.context.update('change', this.name, value);

      // Call an update functions
      const {onUpdate} = this.props;

      if(onUpdate) {
        onUpdate(value);
      }
    }
  }

  focus(): void {
    if(this.inputField) {
      this.inputField.focus();
    }
  }

  isValid(): boolean {
    return !(this.context.errors[this.props.name] || []).length;
  }

  onFocus(): void {
    this.setState({isFocused: true});

    if(this.props.onFocus) {
      this.props.onFocus();
    }
  }

  blur(): void {
    if(this.inputField) {
      this.inputField.blur();
    }
  }

  onBlur(): void {
    this.setState({isFocused: false});

    if(this.props.onBlur) {
      this.props.onBlur();
    }
  }

  getError(): string {
    const errors = this.context.errors || {};
    const list = errors[this.props.name] || {};
    return list[0];
  }

  onSubmitEditing(event: {nativeEvent: {text: string}}): void {
    this.hasSubmit = true;
    this.blur();
    const {onSubmitEditing} = this.props;

    if(onSubmitEditing) {
      onSubmitEditing(event);
    }
  }
}
