import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { type Struct, validate } from 'superstruct';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  formatSuperstructError,
  parseWithUndefined,
  stringifyWithUndefined,
} from './utils';

type Props<T> = {
  visible: boolean;
  title: string;
  initialData: T;
  onClose: () => void;
  onSave: (updated: T) => void;
  validator?: Struct<T, any>;
};

export default function MapConfigDialog<T>({
  visible,
  title,
  initialData,
  onClose,
  onSave,
  validator,
}: Props<T>) {
  const theme = useAppTheme();
  const styles = getThemedStyles(theme);

  const [text, setText] = useState(() => stringifyWithUndefined(initialData));
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(stringifyWithUndefined(initialData));
    setIsValid(true);
    setError(null);
  }, [initialData]);

  const handleChange = (value: string) => {
    setText(value);
    try {
      const parsed = parseWithUndefined(value);

      if (validator) {
        const [err] = validate(parsed, validator);
        if (err) {
          setIsValid(false);
          setError(formatSuperstructError(err, validator));
          return;
        }
      }

      setIsValid(true);
      setError(null);
    } catch (e: any) {
      setIsValid(false);
      setError(e.message);
    }
  };

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('Invalid JSON', error ?? 'Please fix JSON before saving.');
      return;
    }

    try {
      const parsed = parseWithUndefined(text);

      if (validator) {
        const [err, value] = validate(parsed, validator);
        if (err) {
          Alert.alert(
            'Validation Error',
            formatSuperstructError(err, validator)
          );
          return;
        }
        onSave(value as T);
      } else {
        onSave(parsed as T);
      }

      onClose();
    } catch (e: any) {
      Alert.alert('Invalid JSON', e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TextInput
              value={text}
              onChangeText={handleChange}
              multiline
              style={[styles.input, styles.multiline, !isValid && styles.error]}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
            />
            {!isValid && (
              <Text style={[styles.errorText]}>
                {error ?? 'Invalid JSON or schema mismatch'}
              </Text>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialog: {
      width: '85%',
      maxHeight: '85%',
      backgroundColor: theme.bgPrimary,
      borderRadius: 12,
      flexShrink: 1,
    },
    scroll: { padding: 12 },
    title: {
      padding: 12,
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
      borderColor: theme.border,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
      fontFamily: 'monospace',
    },
    multiline: { minHeight: 250, textAlignVertical: 'top' },
    errorText: {
      marginTop: 6,
      color: theme.errorBorder,
      fontSize: 12,
      fontFamily: 'monospace',
    },
    error: {
      borderColor: theme.errorBorder,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 12,
    },
    cancelButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: theme.cancelBg,
      marginRight: 8,
    },
    saveButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: theme.bgAccent,
    },
    buttonText: { color: theme.textOnAccent, fontWeight: '500' },
  });
