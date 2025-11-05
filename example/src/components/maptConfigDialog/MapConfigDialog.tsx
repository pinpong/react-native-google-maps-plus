import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { type Struct, validate } from 'superstruct';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  formatSuperstructError,
  parseWithUndefined,
  stringifyWithUndefined,
} from './utils';
import type { AppTheme } from '../../theme';

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

  const handleChange = useCallback(
    (value: string) => {
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
    },
    [validator]
  );

  const handleSave = useCallback(() => {
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
  }, [isValid, error, text, validator, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setText(stringifyWithUndefined(initialData));
    setIsValid(true);
    setError(null);
    onClose();
  }, [initialData, onClose]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.headerButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.headerButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>

          <View style={isValid ? styles.body : styles.bodyWithError}>
            <TextInput
              scrollEnabled
              value={text}
              onChangeText={handleChange}
              multiline
              style={[styles.input, !isValid && styles.error]}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              textAlignVertical="top"
            />
            {!isValid && (
              <Text style={styles.errorText}>
                {error ?? 'Invalid JSON or schema mismatch'}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.overlay,
      paddingHorizontal: 16,
    },
    dialog: {
      width: '100%',
      maxWidth: 700,
      backgroundColor: theme.bgPrimary,
      borderRadius: 16,
      maxHeight: '85%',
      flexShrink: 1,
      overflow: 'visible',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      backgroundColor: theme.bgPrimary,
    },
    headerActions: { flexDirection: 'row', gap: 8 },
    headerButtonText: {
      color: theme.textPrimary,
      fontWeight: '600',
      fontSize: 14,
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
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    body: {
      flexShrink: 1,
      padding: 16,
    },
    bodyWithError: {
      flexShrink: 1,
      padding: 16,
      paddingBottom: 50,
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
      minHeight: 100,
    },
    errorText: {
      marginTop: 6,
      color: theme.errorBorder,
      fontSize: 12,
      fontFamily: 'monospace',
    },
    error: { borderColor: theme.errorBorder },
  });
