import {Flux} from 'arkhamjs';
import {cloneDeep, forEach, isEqual} from 'lodash';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Keyboard, View, ViewStyle} from 'react-native';
import {ComponentConstants} from '../constants/ComponentConstants';
import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';

export interface FormUpdateProps {
  readonly actionType: string;
  readonly name: string;
  readonly valid: boolean;
  readonly value: string;
  readonly values: object;
}

export interface FormProps {
  readonly blurOnSubmit?: boolean;
  readonly children?: React.ReactNode;
  readonly errors?: object;
  readonly onReset?: () => void;
  readonly onSubmit?: (values: object) => void;
  readonly onUpdate?: (props: FormUpdateProps) => void;
  readonly onValidate?: (fields: FormFieldListType) => void;
  readonly style?: ViewStyle | ViewStyle[];
  readonly submit?: () => void;
  readonly values?: object;
}

export interface FormContextType {
  add: (field: FormField<FormFieldProps, FormFieldState>) => void;
  errors: object;
  isFormValid: () => void;
  reset: () => void;
  submit: () => void;
  update: (actionType: string, name: string, value: string) => void;
  validate: () => void;
  values: object;
}

export interface FormFieldListType {
  [key: string]: FormField<FormFieldProps, FormFieldState>;
}

export interface FormFieldType {
  readonly name: string;
  readonly value: any;
}

export class Form extends React.Component<FormProps, object> {
  errors: object = {};
  fields: FormFieldListType = {};
  values: object = {};

  static propTypes: object = {
    blurOnSubmit: PropTypes.bool,
    children: PropTypes.node,
    errors: PropTypes.object,
    onReset: PropTypes.func,
    onSubmit: PropTypes.func,
    onUpdate: PropTypes.func,
    onValidate: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    submit: PropTypes.func,
    values: PropTypes.object
  };

  static defaultProps: object = {
    blurOnSubmit: false,
    errors: {},
    style: {},
    values: {}
  };

  static childContextTypes: object = {
    add: PropTypes.func,
    errors: PropTypes.object,
    isFormValid: PropTypes.func,
    reset: PropTypes.func,
    submit: PropTypes.func,
    update: PropTypes.func,
    validate: PropTypes.func,
    values: PropTypes.object
  };

  constructor(props) {
    super(props, 'form');

    // Methods
    this.addField = this.addField.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClose = this.onClose.bind(this);
    this.submit = this.submit.bind(this);
    this.update = this.update.bind(this);
    this.updateFormFields = this.updateFormFields.bind(this);
    this.validate = this.validate.bind(this);

    // Properties
    const {values} = props;

    // Fields
    this.values = cloneDeep(values);
  }

  componentDidMount(): void {
    // Add listeners
    Flux.on(ComponentConstants.PICKER_CHANGE, this.onChange);
    Flux.on(ComponentConstants.PICKER_CLOSE, this.onClose);
  }

  componentWillUnmount(): void {
    // Remove listeners
    Flux.off(ComponentConstants.PICKER_CHANGE, this.onChange);
    Flux.off(ComponentConstants.PICKER_CLOSE, this.onClose);
  }

  componentWillReceiveProps(props): void {
    const {values} = props;

    if(!isEqual(this.values, values)) {
      this.updateFormFields(values);
    }
  }

  getChildContext(): FormContextType {
    return {
      add: this.addField,
      errors: this.errors,
      isFormValid: this.isFormValid,
      reset: this.props.onReset,
      submit: this.submit,
      update: this.update,
      validate: this.validate,
      values: this.values
    };
  }

  addField(field: FormField<FormFieldProps, FormFieldState>): void {
    const {name} = field;

    if(name) {
      if(!this.fields[name]) {
        // Save the reference of the form field if not already saved
        this.fields[name] = field;

        // Update the value of the form field to any set values to the actual form
        this.update('init', name, this.values[name]);
      }
    }
  }

  isFormValid(): boolean {
    // Return status
    const errorKeys = Object.keys(this.errors);
    return errorKeys.length === 0;
  }

  updateFormFields(values): void {
    Object.keys(values).forEach((name: string) => {
      if(!isEqual(this.values[name], values[name])) {
        this.update('change', name, values[name]);
      }
    });
  }

  validate(actionType?: string): void {
    // let extraErrors: object = {};
    // const {onValidate} = this.props;

    // // If there are extra validations, make sure those are included
    // if(onValidate) {
    //   extraErrors = onValidate(this.fields) || {};
    // }

    // forEach(this.fields, (field: FormField<FormFieldProps, FormFieldState>) => {
    //   const {isUpdated, name, types, value} = field;

    //   this.errors[name] = (types || [])
    //     .map((errorType: string): any => {
    //       switch(errorType) {
    //         case 'required':
    //           if(!value && (isUpdated && actionType !== 'submit')) {
    //             return {errorType, message: `${capitalize(name)} is required.`, actionType};
    //           }

    //           return null;
    //         case 'email':
    //           break;
    //         case 'url':
    //           break;
    //         default:
    //           return null;
    //       }
    //     })
    //     .filter((errorObj: object) => !!errorObj);

    //   if(extraErrors[name]) {
    //     this.errors[name].concat(extraErrors[name]);
    //   }

    //   if(!this.errors[name].length) {
    //     delete this.errors[name];
    //   }
    // });
  }

  update(actionType: string, name: string, value: string): void {
    if(!name) {
      return;
    }

    if(this.fields[name]) {
      // Update values in form for submission object
      this.values[name] = cloneDeep(value);

      // Update value in field for display
      this.fields[name].updateValue(value);
    }

    // Only call update listener if a change action has occurred
    if(actionType !== 'init') {
      const {onUpdate} = this.props;

      // Call the form update listener
      if(onUpdate) {
        const updateProps: FormUpdateProps = {
          actionType,
          name,
          valid: this.isFormValid(),
          value,
          values: cloneDeep(this.values)
        };

        onUpdate(updateProps);
      }
    }
  }

  submit(): void {
    const {blurOnSubmit, onReset, onSubmit} = this.props;

    // Close the keyboard
    Keyboard.dismiss();

    // Validate form
    this.validate('submit');

    // Check if valid
    if(this.isFormValid()) {
      // Make sure we blur all fields
      if(blurOnSubmit) {
        forEach(this.fields, (field: FormField<FormFieldProps, FormFieldState>) => {
          field.blur();
        });
      }

      // Submit
      if(onSubmit) {
        onSubmit(this.values);
      }

      if(onReset) {
        onReset();
      }
    }
  }

  onChange(data: FormUpdateProps): void {
    const {name, value} = data;
    this.update('change', name, value);
  }

  onClose(data): void {
    const {name} = data;

    if(this.fields[name]) {
      this.fields[name].close();
    }
  }

  render(): JSX.Element {
    const {children, style} = this.props;
    return <View style={style}>{children}</View>;
  }
}
