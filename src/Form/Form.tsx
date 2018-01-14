import {capitalize, cloneDeep, forEach} from 'lodash';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {Keyboard, View, ViewStyle} from 'react-native';

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
  add: (field: FormFieldType) => void;
  errors: object;
  isFormValid: () => void;
  reset: () => void;
  submit: () => void;
  update: (field: FormFieldType) => void;
  validate: () => void;
  values: object;
}

export interface FormFieldListType {
  [key: string]: FormFieldType;
}

export interface FormFieldType {
  readonly actionType?: string;
  readonly name: string;
  readonly blur?: () => Promise<void>;
  readonly isUpdated?: boolean;
  readonly types?: string[];
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
    this.submit = this.submit.bind(this);
    this.update = this.update.bind(this);
    this.validate = this.validate.bind(this);

    // Properties
    const {values} = props;

    // Fields
    this.values = cloneDeep(values);
  }

  componentWillReceiveProps(props): void {
    const {values} = props;

    if(!Object.is(this.values, values)) {
      this.values = cloneDeep(values);
      this.validate();
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

  addField(field: FormFieldType): void {
    const {name} = field;
    const existingField: FormFieldType = this.fields[name];

    if(name) {
      if(!existingField) {
        this.fields[name] = field;
      }

      this.validate('init');
    }
  }

  isFormValid(): boolean {
    // Return status
    const errorKeys = Object.keys(this.errors);
    return errorKeys.length === 0;
  }

  validate(actionType?: string): void {
    let extraErrors: object = {};
    const {onValidate} = this.props;

    // If there are extra validations, make sure those are included
    if(onValidate) {
      extraErrors = onValidate(this.fields) || {};
    }

    forEach(this.fields, (field: FormFieldType) => {
      const {isUpdated, name, types} = field;
      const value = this.values[name];
      this.errors[name] = (types || [])
        .map((errorType: string): any => {
          switch(errorType) {
            case 'required':
              if(!value && (isUpdated && actionType !== 'submit')) {
                return {errorType, message: `${capitalize(name)} is required.`, actionType};
              }

              return null;
            case 'email':
              break;
            case 'url':
              break;
            default:
              return null;
          }
        })
        .filter((errorObj: object) => !!errorObj);

      if(extraErrors[name]) {
        this.errors[name].concat(extraErrors[name]);
      }

      if(!this.errors[name].length) {
        delete this.errors[name];
      }
    });
  }

  update(updatedField: FormFieldType): void {
    const {actionType, name, value} = updatedField;
    const {onUpdate} = this.props;

    if(!name) {
      return;
    }

    const field: FormFieldType = this.fields[name];

    if(field) {
      this.values = {
        ...this.values,
        [name]: value
      };

      const validateField: FormFieldType = {
        ...field,
        isUpdated: true
      };

      this.fields[name] = validateField;
      this.validate(actionType);
    }

    if(onUpdate) {
      const valid: boolean = this.isFormValid();
      const updateProps: FormUpdateProps = {
        actionType,
        name,
        valid,
        value,
        values: this.values
      };

      onUpdate(updateProps);
    } else {
      this.setState({values: cloneDeep(this.values)});
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
      const promises = [];

      if(blurOnSubmit) {
        forEach(this.fields, (field: FormFieldType) => {
          const blur = field.blur;

          if(blur) {
            const p = blur();

            // If blur function returns a promise, queue promise to wait on
            if(p && typeof p.then === 'function') {
              promises.push(p);
            }
          }
        });
      }

      Promise.all(promises)
        .then(() => {
          // Submit
          if(onSubmit) {
            onSubmit(this.values);
          }

          if(onReset) {
            onReset();
          }
        });
    }
  }

  render(): JSX.Element {
    const {children, style} = this.props;
    return <View style={style}>{children}</View>;
  }
}
