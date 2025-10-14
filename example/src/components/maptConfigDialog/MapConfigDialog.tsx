import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useForm, Controller, type FieldValues } from 'react-hook-form';
import { validate } from 'superstruct';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props<T> = {
  visible: boolean;
  title: string;
  initialData: T;
  onClose: () => void;
  onSave: (updated: T) => void;
  validator?: any;
};

export default function MapConfigDialog<T extends FieldValues>({
  visible,
  title,
  initialData,
  onClose,
  onSave,
  validator,
}: Props<T>) {
  const theme = useAppTheme();
  const styles = getThemedStyles(theme);
  const { control, handleSubmit, reset } = useForm<T>();

  const onSubmit = (data: T) => {
    if (validator) {
      const [err, value] = validate(data, validator);
      if (err) {
        Alert.alert(
          'Input error',
          `${err.path?.join('.') || '(root)'}: ${err.message}`
        );
        return;
      }
      onSave(value as T);
    } else {
      onSave(data);
    }
    onClose();
  };

  React.useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView contentContainerStyle={styles.scroll}>
            {Object.entries(initialData).map(([key, _]) => (
              <View key={key} style={styles.field}>
                <Text style={styles.label}>{key}</Text>
                <Controller
                  control={control}
                  name={key as any}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      spellCheck={false}
                      autoCapitalize={'none'}
                      autoCorrect={false}
                      value={
                        typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : String(value ?? '')
                      }
                      onChangeText={(v) => {
                        try {
                          onChange(JSON.parse(v));
                        } catch {
                          onChange(v);
                        }
                      }}
                      multiline={typeof value === 'object'}
                    />
                  )}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              style={styles.saveButton}
            >
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
    },
    title: {
      padding: 12,
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    scroll: { padding: 12 },
    field: { marginBottom: 12 },
    label: { fontSize: 14, marginBottom: 4, color: theme.label },
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
