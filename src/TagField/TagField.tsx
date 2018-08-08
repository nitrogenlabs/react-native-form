import * as React from 'react';
import {ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {FormField, FormFieldProps, FormFieldState} from '../FormField/FormField';
import {TextField} from '../TextField/TextField';
import {SelectOptionType} from '../types/InputTypes';
import {uiTheme} from '../UITheme';

export interface TagFieldProps extends FormFieldProps {
  readonly animationDuration?: number;
  readonly containerStyle?: ViewStyle;
  readonly help?: string;
  readonly inputStyle?: TextStyle;
  readonly label?: string;
  readonly labelStyle?: TextStyle;
  readonly limit?: number;
  readonly onUpdate?: (tags: SelectOptionType[]) => void;
  readonly showSearch?: boolean;
  readonly tags?: SelectOptionType[];
}

export interface TagFieldState extends FormFieldState {
  readonly searchFilterTags?: SelectOptionType[];
  readonly searchQuery?: string;
  readonly selectedTags?: SelectOptionType[];
  readonly tags?: SelectOptionType[];
}

export class TagField extends FormField<TagFieldProps, TagFieldState> {
  static defaultProps: object = {
    animationDuration: 150,
    label: 'Tags',
    limit: 0,
    showSearch: true,
    tags: [],
    theme: {}
  };

  constructor(props) {
    super(props);

    // Methods
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onUpdateSearch = this.onUpdateSearch.bind(this);
    this.onUpdateTags = this.onUpdateTags.bind(this);
    this.formatTag = this.formatTag.bind(this);
    this.getSelectedItem = this.getSelectedItem.bind(this);
    this.getAvailableItems = this.getAvailableItems.bind(this);

    // Initial state
    const {tags} = this.props;

    const state: TagFieldState = {
      isFocused: false,
      searchFilterTags: tags,
      searchQuery: '',
      selectedTags: [],
      tags
    };
    this.state = state as any;

    // Get component theme
    this.componentTheme = {...uiTheme, ...props.theme};
  }

  onBlur(event): void {
    const {onBlur} = this.props;

    if (typeof onBlur === 'function') {
      onBlur(event);
    }

    this.setState({isFocused: false});
  }

  onFocus(event): void {
    const {onFocus} = this.props;

    if (typeof onFocus === 'function') {
      onFocus(event);
    }

    this.setState({isFocused: true});
  }

  onSubmitEditing(event: {nativeEvent: {text: string}}): void {
    const text: string = event.nativeEvent.text;
    const formatQuery: string = this.formatTag(text);
    const item: SelectOptionType = this.getSelectedItem(formatQuery);

    if (item) {
      this.addTag(item);
    }

    this.setState({searchQuery: ''});
  }

  onUpdateSearch(searchQuery: string): void {
    this.setState({searchQuery});
  }

  onUpdateTags(): void {
    const {onUpdate} = this.props;

    if (onUpdate) {
      const {selectedTags} = this.state;
      onUpdate(selectedTags);
    }
  }

  addTag(item: SelectOptionType): void {
    const {searchFilterTags, selectedTags} = this.state;

    // Add tag to selected tag list
    selectedTags.push(item);

    // Remove tag from search list
    const filteredTags: SelectOptionType[] = searchFilterTags
      .filter((tag: SelectOptionType) => tag.label !== item.label);

    // Update state
    this.setState({
      searchFilterTags: filteredTags,
      selectedTags
    }, this.onUpdateTags);
  }

  formatTag(str): string {
    return str
      .replace(/#/g, '')
      .trim()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  getSelectedItem(query: string): SelectOptionType {
    const {selectedTags, tags} = this.state;

    // Make sure the tag isn't already selected
    const isNotSelected: boolean = selectedTags
      .findIndex((existingItem: SelectOptionType) => existingItem.label === query) < 0;

    if (isNotSelected) {
      // If not already selected, see if it is an existing tag.
      let item: SelectOptionType = tags.find((tagItem: SelectOptionType) => {
        const {label = ''} = tagItem;
        return label.toLowerCase() === query.toLowerCase();
      });

      // If not existent, create a new tag.
      if (!item) {
        item = {label: query, value: ''};
      }

      return item;
    }

    return null;
  }

  getAvailableItems(): SelectOptionType[] {
    const {searchQuery, selectedTags, tags} = this.state;

    return tags.filter((item: SelectOptionType) => {
      const {label = ''} = item;
      return label.includes(searchQuery) && selectedTags
        .findIndex((existingItem: SelectOptionType) => existingItem.label === label) < 0;
    });
  }

  removeTag(item: SelectOptionType): void {
    const {searchFilterTags, selectedTags} = this.state;

    // Add tag to search list
    searchFilterTags.push(item);

    // Remove tag from selected list
    const filteredTags: SelectOptionType[] = selectedTags
      .filter((tag: SelectOptionType) => tag.label !== item.label);

    // Update state
    this.setState({
      searchFilterTags,
      selectedTags: filteredTags
    }, this.onUpdateTags);
  }

  renderAvailable(): JSX.Element {
    const {showSearch} = this.props;
    const {searchFilterTags} = this.state;

    if (showSearch && searchFilterTags.length) {
      // Only use the tags that have not already been selected.
      const availableTags: SelectOptionType[] = this.getAvailableItems();

      if (availableTags.length) {
        const {
          inputFieldSelectionColor,
          inputFieldTextSize,
          tagAvailableBorderColor,
          tagAvailableTextColor,
          tagTextSize
        } = this.componentTheme;
        const availContainerStyle: ViewStyle = {
          backgroundColor: inputFieldSelectionColor
        };
        const availTagStyle: ViewStyle = {
          borderColor: tagAvailableBorderColor
        };
        const availTagIconStyle: TextStyle = {
          color: tagAvailableTextColor,
          fontSize: inputFieldTextSize,
          marginRight: 5
        };
        const availTagTextStyle: TextStyle = {
          color: tagAvailableTextColor,
          fontSize: tagTextSize
        };

        const tagElements: JSX.Element[] = availableTags.map((item: SelectOptionType) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => this.addTag(item)}
            style={[viewStyles.availableTag, availTagStyle]}>
            <Ionicons name="ios-add-circle-outline" style={availTagIconStyle} />
            <Text style={availTagTextStyle}>{item.label}</Text>
          </TouchableOpacity>
        ));

        return (
          <View style={[viewStyles.availableContainer, availContainerStyle]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={viewStyles.availableTagsView}>
                {tagElements}
              </View>
            </ScrollView>
          </View>
        );
      }
    }

    return null;
  }

  renderSelected(): JSX.Element {
    const {selectedTags} = this.state;
    const {
      tagFont,
      tagHeight,
      tagSelectedBgColor,
      tagSelectedCloseBgColor,
      tagSelectedCloseTextSize,
      tagTextColor,
      tagTextSize
    } = this.componentTheme;
    const tagStyle: ViewStyle = {
      backgroundColor: tagSelectedBgColor,
      height: tagHeight
    };
    const labelStyle: TextStyle = {
      color: tagTextColor,
      fontFamily: tagFont,
      fontSize: tagTextSize
    };
    const closeBtnStyle: TextStyle = {
      backgroundColor: tagSelectedCloseBgColor,
      height: tagHeight,
      width: tagHeight
    };
    const closeLabelStyle: TextStyle = {
      color: tagTextColor,
      fontSize: tagSelectedCloseTextSize,
      height: tagSelectedCloseTextSize
    };

    if (selectedTags.length) {
      const selectedElements = selectedTags.map((item: SelectOptionType) => (
        <View
          key={item.label}
          style={[viewStyles.selectedTag, tagStyle]}>
          <Text style={labelStyle}>#{item.label}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.removeTag(item)}
            style={[viewStyles.selectedCloseBtn, closeBtnStyle]}>
            <Ionicons name="ios-close" size={15} style={closeLabelStyle} />
          </TouchableOpacity>
        </View>
      ));

      return (
        <View style={viewStyles.selectedContainer}>
          {selectedElements}
        </View>
      );
    }

    return null;
  }

  render(): JSX.Element {
    const {
      autoFocus,
      containerStyle,
      disabled,
      help,
      inputStyle,
      label,
      maxLength,
      placeholder
    } = this.props;
    const {searchQuery} = this.state;
    const {
      inputFieldErrorColor,
      inputFieldFont,
      inputFieldTextSize,
      inputFieldKeyboardAppearance,
      inputFieldLabelColor,
      inputFieldLabelSize,
      inputFieldSelectionColor,
      inputFieldTextColor
    } = this.componentTheme;

    return (
      <View style={[viewStyles.tagField, containerStyle]}>
        <TextField
          animationDuration={150}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          baseColor={inputFieldTextColor}
          blurOnSubmit={false}
          clearTextOnFocus={false}
          clearButtonMode="while-editing"
          containerStyle={{marginBottom: 0}}
          disabled={disabled}
          editable={!disabled}
          enablesReturnKeyAutomatically={true}
          errorColor={inputFieldErrorColor}
          fontFamily={inputFieldFont}
          fontSize={inputFieldTextSize}
          help={help}
          inputStyle={[{fontFamily: inputFieldFont}, inputStyle]}
          keyboardAppearance={inputFieldKeyboardAppearance}
          keyboardType="default"
          label={label}
          labelColor={inputFieldLabelColor}
          labelFontSize={inputFieldLabelSize}
          maxLength={maxLength}
          onBlur={this.onBlur}
          onChangeText={this.onUpdateSearch}
          onFocus={this.onFocus}
          onSubmitEditing={this.onSubmitEditing}
          placeholder={placeholder}
          prefix="#"
          returnKeyType="default"
          ref={(r) => this.inputField = r}
          selectionColor={inputFieldSelectionColor}
          textColor={inputFieldTextColor}
          tintColor={inputFieldSelectionColor}
          value={searchQuery} />
        {this.renderAvailable()}
        {this.renderSelected()}
      </View>
    );
  }
}

const viewStyles = StyleSheet.create({
  availableContainer: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginBottom: 2,
    marginTop: 0,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5
  },
  availableTag: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3
  },
  availableTagsView: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  selectedCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    paddingBottom: 0,
    paddingTop: 0
  },
  selectedContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3
  },
  selectedTag: {
    alignItems: 'center',
    borderRadius: 3,
    flexDirection: 'row',
    marginBottom: 5,
    marginRight: 5,
    overflow: 'hidden',
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8
  },
  tagField: {
    marginBottom: 5
  }
});
