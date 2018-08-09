import {DeviceUtils} from '@nlabs/react-native-utils';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';

import {uiTheme} from '../UITheme';

const scale = DeviceUtils.getScale();

export interface ButtonProps {
  readonly bgColor?: string;
  readonly btnStyle?: ViewStyle | ViewStyle[];
  readonly children?: React.ReactChild;
  readonly disabled?: boolean;
  readonly icon?: string;
  readonly iconAlign?: string;
  readonly isSubmit?: boolean;
  readonly labelColor?: string;
  readonly labelStyle?: ViewStyle | ViewStyle[];
  readonly onPress?: () => void;
  readonly size?: string;
  readonly style?: ViewStyle | ViewStyle[];
  readonly theme?: any;
  readonly type?: string;
  readonly width?: number;
}

export interface ButtonStyleObject {
  button: ViewStyle;
  label: TextStyle;
}

const viewStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  container: {
    alignSelf: 'stretch',
    backfaceVisibility: 'hidden',
    flexDirection: 'column'
  },
  icon: {
    fontSize: 24,
    marginRight: 5,
    marginTop: 5
  },
  iconBg: {
  },
  iconBtn: {
    fontSize: 36
  },
  label: {
    justifyContent: 'center',
    textAlign: 'center'
  }
});

export class Button extends React.PureComponent<ButtonProps, object> {
  static defaultProps: object = {
    bgColor: '#000000',
    disabled: false,
    iconAlign: 'left',
    isSubmit: false,
    size: 'md',
    style: {},
    type: 'primary'
  };

  static contextTypes: object = {
    isFormValid: PropTypes.func,
    submit: PropTypes.func
  };

  private componentTheme: any;

  constructor(props) {
    super(props);

    // Methods
    this.onPress = this.onPress.bind(this);

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  getStyles(): ButtonStyleObject {
    const {buttonFont} = this.componentTheme;
    const scaleFontSize = scale < 1 ? 16 : 18;
    const scalePadding = scale < 1 ? 7 : 10;

    const button: ViewStyle = {
      borderRadius: scalePadding,
      paddingBottom: scalePadding,
      paddingTop: scalePadding
    };
    const label: TextStyle = {
      fontFamily: buttonFont,
      fontSize: scaleFontSize
    };
    const {type} = this.props;

    switch(type) {
      case 'primary':
        return this.getPrimaryStyles(button, label);
      case 'secondary':
        return this.getSecondaryStyles(button, label);
      case 'link':
        return this.getLinkStyles(button, label);
      case 'ghost':
        return this.getGhostStyles(button, label);
      case 'icon':
        return this.getIconStyles(button, label);
      default:
        return this.getDefaultSyles(button, label);
    }
  }

  getAttributeStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {icon, iconAlign, size, type, width} = this.props;
    let updatedButton: ViewStyle = button;

    if(size === 'sm') {
      label.fontSize = 14;

      if(type !== 'link') {
        updatedButton = {
          ...updatedButton,
          borderRadius: 5,
          borderWidth: 1,
          paddingBottom: 3,
          paddingTop: 2
        };
      }
    }

    if(width) {
      updatedButton.width = width;
    } else {
      if(size === 'sm') {
        updatedButton = {
          ...updatedButton,
          paddingLeft: 10,
          paddingRight: 10
        };
      } else {
        updatedButton = {
          ...updatedButton,
          paddingLeft: 15,
          paddingRight: 15
        };
      }
    }

    if(icon) {
      if(iconAlign === 'left') {
        updatedButton.paddingLeft = 0;
      } else if(iconAlign === 'right') {
        updatedButton.paddingRight = 0;
      }
    }

    return {button: updatedButton, label};
  }

  getPrimaryStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonPrimaryBgColor, buttonPrimaryLabelColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      ...button,
      backgroundColor: buttonPrimaryBgColor,
      borderColor: buttonPrimaryBgColor
    };

    const updatedLabel: TextStyle = {
      ...label,
      color: labelColor || buttonPrimaryLabelColor,
      fontWeight: '500'
    };

    return this.getAttributeStyles(updatedButton, updatedLabel);
  }

  getSecondaryStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonSecondaryBgColor, buttonSecondaryLabelColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      ...button,
      backgroundColor: buttonSecondaryBgColor,
      borderColor: buttonSecondaryBgColor
    };

    const updatedLabel: TextStyle = {
      ...label,
      color: labelColor || buttonSecondaryLabelColor,
      fontWeight: '700'
    };

    return this.getAttributeStyles(updatedButton, updatedLabel);
  }

  getDefaultSyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonDefaultBgColor, buttonDefaultLabelColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      ...button,
      backgroundColor: buttonDefaultBgColor,
      borderRadius: 8
    };

    const updatedLabel: TextStyle = {
      ...label,
      color: labelColor || buttonDefaultLabelColor,
      fontSize: 18,
      fontWeight: '700'
    };

    return this.getAttributeStyles(updatedButton, updatedLabel);
  }

  getLinkStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonLinkLabelColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      backgroundColor: 'transparent',
      paddingBottom: 5,
      paddingTop: 5
    };

    const updatedLabel: TextStyle = {
      ...label,
      color: labelColor || buttonLinkLabelColor
    };

    return this.getAttributeStyles(updatedButton, updatedLabel);
  }

  getGhostStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor, size} = this.props;
    const {buttonFont, buttonPrimaryBgColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      ...button,
      backgroundColor: 'transparent',
      borderColor: labelColor || buttonPrimaryBgColor
    };

    const updatedLabel: TextStyle = {
      ...label,
      color: labelColor || buttonPrimaryBgColor,
      fontFamily: buttonFont,
      fontWeight: '500'
    };

    if(size === 'sm') {
      updatedButton.borderWidth = 1;
    } else {
      updatedLabel.fontSize = 16;
      updatedButton.borderWidth = 2;
    }

    return this.getAttributeStyles(updatedButton, updatedLabel);
  }

  getIconStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {buttonPrimaryBgColor} = this.componentTheme;

    const updatedButton: ViewStyle = {
      alignItems: 'center',
      backgroundColor: buttonPrimaryBgColor,
      borderRadius: 18,
      flex: 0,
      height: 36,
      justifyContent: 'center',
      width: 36
    };

    return {button: updatedButton, label};
  }

  onPress(): void {
    const {disabled, isSubmit, onPress} = this.props;

    if(disabled) {
      return;
    }

    if(isSubmit && this.context.submit) {
      this.context.submit();
    }

    if(onPress) {
      onPress();
    }
  }

  renderIcon(): JSX.Element {
    const styles = this.getStyles();
    const {icon, labelColor, labelStyle, type} = this.props;
    const {buttonPrimaryLabelColor} = this.componentTheme;

    if(type === 'icon') {
      return <Ionicon style={[viewStyles.iconBtn, {color: buttonPrimaryLabelColor}]} name={icon} />;
    }
    return <Ionicon style={[styles.label, viewStyles.icon, labelStyle]} name={icon} color={labelColor} />;
  }

  renderLeftIcon(): JSX.Element {
    const {icon, iconAlign} = this.props;

    if(icon && iconAlign === 'left') {
      return this.renderIcon();
    }

    return null;
  }

  renderRightIcon(): JSX.Element {
    const {icon, iconAlign} = this.props;

    if(icon && iconAlign === 'right') {
      return this.renderIcon();
    }

    return null;
  }

  renderButton(): JSX.Element {
    const styles: ButtonStyleObject = this.getStyles();
    const {btnStyle, children, disabled, labelStyle, type} = this.props;
    const enabledStyle = disabled ? {opacity: 0.3} : {};

    if(type === 'icon') {
      return (
        <View style={[viewStyles.button, styles.button, btnStyle, enabledStyle, viewStyles.iconBg]}>
          {this.renderIcon()}
        </View>
      );
    }

    return (
      <View style={[viewStyles.button, styles.button, btnStyle, enabledStyle]}>
        {this.renderLeftIcon()}
        <Text style={[viewStyles.label, styles.label, labelStyle]}>
          {children}
        </Text>
        {this.renderRightIcon()}
      </View>
    );
  }

  render(): JSX.Element {
    const {disabled, style} = this.props;

    return (
      <TouchableOpacity
        activeOpacity={disabled ? 0.3 : 0.7}
        disabled={disabled}
        style={[viewStyles.container, style]}
        onPress={this.onPress}>
        {this.renderButton()}
      </TouchableOpacity>
    );
  }
}
