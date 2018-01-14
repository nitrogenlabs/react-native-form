import * as PropTypes from 'prop-types';
import * as React from 'react';
import {TextInput, TextInputProperties} from 'react-native';

import {FormFieldType} from '../Form/Form';
import {uiTheme} from '../UITheme';

export interface FormFieldProps extends TextInputProperties {
  readonly disabled?: boolean;
  readonly name: string;
  readonly onUpdate?: (value: any) => void;
  readonly required?: boolean;
  readonly theme?: any;
  readonly type?: string;
}

export interface FormFieldState extends Readonly<any> {
  readonly isFocused: boolean;
}

export class FormField<P extends FormFieldProps, S extends FormFieldState> extends React.PureComponent<P, S> {
  private hasSubmit: boolean = false;
  protected componentTheme: any;
  protected field;

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
  }

  componentWillMount(): void {
    this.setState({
      isFocused: false
    });
  }

  componentDidMount(): void {
    const {name, onBlur, required, type} = this.props;
    const types = [type];

    if(required) {
      types.push('required');
    }

    this.context.add({name, blur: onBlur, types});
  }

  onUpdate(value): void {
    if(!this.hasSubmit) {
      this.updateValue(value, 'change');

      const {onUpdate} = this.props;

      if(onUpdate) {
        onUpdate(value);
      }
    }
  }

  focus(): void {
    if(this.field && this.field.input) {
      this.field.input.focus();
    }
  }

  getValue(): string {
    const {name, value} = this.props;
    return this.context.values[name] || value;
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
    if(this.field && this.field.input) {
      this.field.input.blur();
    }
  }

  onBlur(): void {
    this.setState({isFocused: false});

    if(this.props.onBlur) {
      this.props.onBlur();
    }
  }

  updateValue(value: string, actionType: string): void {
    const field: FormFieldType = {
      actionType,
      name: this.props.name,
      value
    };

    this.context.update(field);
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
