import {DeviceUtils} from '@nlabs/react-native-utils';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import {uiTheme} from '../UITheme';

import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

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

export class Button extends React.PureComponent<ButtonProps, object> {
  private componentTheme: any;

  static propTypes: object = {
    bgColor: PropTypes.string,
    btnStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    children: PropTypes.node,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    iconAlign: PropTypes.string,
    isSubmit: PropTypes.bool,
    labelColor: PropTypes.string,
    labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    onPress: PropTypes.func,
    size: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    theme: PropTypes.object,
    type: PropTypes.string,
    width: PropTypes.number
  };

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

    if(size === 'sm') {
      label.fontSize = 14;

      if(type !== 'link') {
        button = {
          ...button,
          borderRadius: 5,
          borderWidth: 1,
          paddingBottom: 3,
          paddingTop: 2
        };
      }
    }

    if(width) {
      button.width = width;
    } else {
      if(size === 'sm') {
        button = {
          ...button,
          paddingLeft: 10,
          paddingRight: 10
        };
      } else {
        button = {
          ...button,
          paddingLeft: 15,
          paddingRight: 15
        };
      }
    }

    if(icon) {
      if(iconAlign === 'left') {
        button.paddingLeft = 0;
      } else if(iconAlign === 'right') {
        button.paddingRight = 0;
      }
    }

    return {button, label};
  }

  getPrimaryStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonPrimaryBgColor, buttonPrimaryLabelColor} = this.componentTheme;

    button = {
      ...button,
      backgroundColor: buttonPrimaryBgColor,
      borderColor: buttonPrimaryBgColor
    };

    label = {
      ...label,
      color: labelColor || buttonPrimaryLabelColor,
      fontWeight: '500'
    };

    return this.getAttributeStyles(button, label);
  }

  getSecondaryStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonSecondaryBgColor, buttonSecondaryLabelColor} = this.componentTheme;

    button = {
      ...button,
      backgroundColor: buttonSecondaryBgColor,
      borderColor: buttonSecondaryBgColor
    };

    label = {
      ...label,
      color: labelColor || buttonSecondaryLabelColor,
      fontWeight: '700'
    };

    return this.getAttributeStyles(button, label);
  }

  getDefaultSyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonDefaultBgColor, buttonDefaultLabelColor} = this.componentTheme;

    button = {
      ...button,
      backgroundColor: buttonDefaultBgColor,
      borderRadius: 8
    };

    label = {
      color: labelColor || buttonDefaultLabelColor,
      fontSize: 18,
      fontWeight: '700'
    };

    return this.getAttributeStyles(button, label);
  }

  getLinkStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor} = this.props;
    const {buttonLinkLabelColor} = this.componentTheme;

    button = {
      backgroundColor: 'transparent',
      paddingBottom: 5,
      paddingTop: 5
    };

    label = {
      ...label,
      color: labelColor || buttonLinkLabelColor
    };

    return this.getAttributeStyles(button, label);
  }

  getGhostStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {labelColor, size} = this.props;
    const {buttonFont, buttonPrimaryBgColor} = this.componentTheme;

    button = {
      ...button,
      backgroundColor: 'transparent',
      borderColor: labelColor || buttonPrimaryBgColor
    };

    label = {
      color: labelColor || buttonPrimaryBgColor,
      fontFamily: buttonFont,
      fontWeight: '500'
    };

    if(size === 'sm') {
      button.borderWidth = 1;
    } else {
      label.fontSize = 16;
      button.borderWidth = 2;
    }

    return this.getAttributeStyles(button, label);
  }

  getIconStyles(button: ViewStyle, label: TextStyle): ButtonStyleObject {
    const {buttonPrimaryBgColor} = this.componentTheme;

    button = {
      ...button,
      alignItems: 'center',
      backgroundColor: buttonPrimaryBgColor,
      borderRadius: 18,
      flex: 0,
      height: 36,
      justifyContent: 'center',
      width: 36
    };

    return {button, label};
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
    } else {
      return <Ionicon style={[styles.label, viewStyles.icon, labelStyle]} name={icon} color={labelColor} />;
    }
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
    borderWidth: 0,
    paddingTop: 13
  },
  iconBtn: {
    fontSize: 40
  },
  label: {
    justifyContent: 'center',
    textAlign: 'center'
  }
});
