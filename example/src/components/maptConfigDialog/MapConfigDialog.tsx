import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Struct } from 'superstruct';
import { validate } from 'superstruct';
import { useAppTheme } from '../../theme';

type FieldType = 'text' | 'number' | 'boolean' | 'json';

export type FieldSchema<T> = {
  key: keyof T;
  label?: string;
  type: FieldType;
  multiline?: boolean;
  placeholder?: string;
  options?: any[];
};

type Props<T> = {
  visible: boolean;
  title: string;
  initialData: T;
  onClose: () => void;
  onSave: (updated: T) => void;
  validator?: Struct<T, any>;
};

const boolOptions = [true, false] as const;

export default function MapConfigDialog<T>({
  visible,
  title,
  initialData,
  onClose,
  onSave,
  validator,
}: Props<T>) {
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);
  const [draft, setDraft] = useState<T>(initialData);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const autoSchema: FieldSchema<T>[] = useMemo(() => {
    if (!validator || !('schema' in validator)) return [];
    const unwrap = (s: any): any => {
      let base = s;
      while (
        base &&
        ['optional', 'nullable', 'defaulted'].includes(base.type)
      ) {
        if (base._values && base.schema && !base.schema._values)
          base.schema._values = base._values;
        if (base._schema && base.schema && !base.schema._schema)
          base.schema._schema = base._schema;
        base = base.schema;
      }
      return base;
    };

    const extractOptions = (schema: any): string[] | undefined => {
      let v = schema;
      while (v && ['optional', 'nullable', 'defaulted'].includes(v.type)) {
        v = v.schema;
      }

      if (!v) return;
      if (
        Array.isArray(v._values) &&
        v._values.every((x: any) => typeof x === 'string')
      ) {
        return v._values;
      }

      if (v.type === 'enums' && v.schema && typeof v.schema === 'object') {
        const vals = Object.values(v.schema).filter(
          (x): x is string => typeof x === 'string'
        );
        if (vals.length) {
          return vals;
        }
      }

      if (v.type === 'union' && Array.isArray(v._schema)) {
        const literals = v._schema
          .map((x: any) => {
            return typeof x === 'object' &&
              x.schema &&
              typeof x.schema === 'string'
              ? x.schema
              : (x.value ?? x._value);
          })
          .filter((x: any): x is string => typeof x === 'string');
        if (literals.length) {
          return literals;
        }
      }

      if (v.type === 'union' && Array.isArray(v.schema)) {
        const literals = v.schema
          .map((x: any) => {
            return typeof x === 'object' &&
              x.schema &&
              typeof x.schema === 'string'
              ? x.schema
              : (x.value ?? x._value);
          })
          .filter((x: any): x is string => typeof x === 'string');
        if (literals.length) {
          return literals;
        }
      }

      return undefined;
    };

    const result: FieldSchema<T>[] = [];

    for (const [key, raw] of Object.entries((validator as any).schema)) {
      const unwrapped = unwrap(raw);

      const options = extractOptions(raw);

      let type: FieldType = 'text';
      if (!options) {
        if (unwrapped?.type === 'boolean') type = 'boolean';
        else if (unwrapped?.type === 'number') type = 'number';
        else if (unwrapped?.type === 'object' || unwrapped?.type === 'array')
          type = 'json';
      }

      result.push({
        key: key as keyof T,
        label: key,
        type,
        options,
        multiline: type === 'json',
      });
    }

    return result;
  }, [validator]);

  const [jsonInputs, setJsonInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    autoSchema.forEach((f) => {
      if (f.type !== 'json') return;
      const key = String(f.key);
      const v = (initialData as any)[key];
      initial[key] =
        v && typeof v === 'object'
          ? JSON.stringify(v, null, 2)
          : String(v ?? '');
    });
    return initial;
  });

  const updateField = (key: keyof T, value: any, type: FieldType) => {
    setDraft((prev) => ({
      ...(prev as any),
      [key]:
        type === 'number'
          ? value === ''
            ? undefined
            : /^-?\d*\.?\d*$/.test(value)
              ? value
              : prev[key]
          : value,
    }));
  };

  const handleSave = () => {
    const updated: any = { ...(draft as any) };
    for (const f of autoSchema) {
      const k = String(f.key);
      if (f.type === 'json') {
        const jsonStr = jsonInputs[k] ?? '';
        if (jsonStr.trim().length === 0) {
          updated[k] = undefined;
        } else {
          try {
            updated[k] = JSON.parse(jsonStr);
          } catch (e: any) {
            Alert.alert('Invalid JSON', `${f.label ?? k}: ${e.message}`);
            return;
          }
        }
      }
    }
    for (const f of autoSchema) {
      const k = String(f.key);
      if (f.type === 'number') {
        const val = updated[k];
        if (val === '' || val == null) {
          updated[k] = undefined;
        } else if (typeof val === 'string') {
          const parsed = Number(val.replace(',', '.'));
          if (isNaN(parsed)) {
            Alert.alert('Validation Error', `${f.label ?? k}: Invalid number`);
            return;
          }
          updated[k] = parsed;
        }
      }
    }
    if (validator) {
      const [err, value] = validate(updated, validator);
      if (err) {
        Alert.alert(
          'Validation Error',
          `${err.path?.join('.') || '(root)'}: ${err.message}`
        );
        return;
      }
      onSave(value as T);
    } else {
      onSave(updated as T);
    }
    onClose();
  };

  const renderDropdown = (
    key: keyof T,
    label: string,
    value: any,
    options: any[]
  ) => (
    <View key={String(key)} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setActiveDropdown(String(key))}
        style={[
          styles.dropdownTrigger,
          activeDropdown === String(key) && { borderColor: theme.bgAccent },
        ]}
      >
        <Text
          style={[styles.dropdownText, !value && { color: theme.placeholder }]}
        >
          {value?.toString() ?? 'Select...'}
        </Text>
      </Pressable>

      {activeDropdown === String(key) && (
        <Modal transparent animationType="fade">
          <View style={styles.dropdownOverlay}>
            <Pressable
              style={styles.dropdownBackdrop}
              onPress={() => setActiveDropdown(null)}
            />
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeader}>{label}</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={() => [styles.dropdownItem]}
                    onPress={() => {
                      updateField(key, item, 'text');
                      setActiveDropdown(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {item.toString()}
                    </Text>
                  </Pressable>
                )}
              />
              <Pressable
                onPress={() => setActiveDropdown(null)}
                style={styles.dropdownCancel}
              >
                <Text style={styles.dropdownCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );

  const renderMultilineInput = (
    k: string,
    value: string,
    onChangeText: (v: string) => void,
    placeholder?: string
  ) => (
    <View key={k} style={styles.field}>
      <Text style={styles.label}>{k}</Text>
      <ScrollView
        style={styles.innerScroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? '{}'}
          placeholderTextColor={styles.placeholder.color}
          style={[styles.input, styles.multilineInput]}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {autoSchema.map((f) => {
              const key = f.key;
              const k = String(key);
              const label = f.label ?? k;
              const value = (draft as any)[k];

              if (f.options?.length) {
                return renderDropdown(key, label, value, f.options);
              }

              if (f.type === 'boolean') {
                return renderDropdown(key, label, value, boolOptions as any);
              }

              if (f.type === 'json') {
                const jsonValue = jsonInputs[k] ?? '';
                return renderMultilineInput(
                  k,
                  jsonValue,
                  (v) => setJsonInputs((prev) => ({ ...prev, [k]: v })),
                  f.placeholder ?? '{}'
                );
              }

              if (f.multiline) {
                const str = value?.toString() ?? '';
                return renderMultilineInput(
                  k,
                  str,
                  (v) => updateField(key, v, f.type),
                  f.placeholder ?? label
                );
              }

              return (
                <View key={k} style={styles.field}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    keyboardType={
                      f.type === 'number' ? 'decimal-pad' : 'default'
                    }
                    value={value?.toString() ?? ''}
                    onChangeText={(v) => updateField(key, v, f.type)}
                    placeholder={f.placeholder ?? label}
                    placeholderTextColor={styles.placeholder.color}
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              );
            })}
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
    scroll: { paddingBottom: 12, margin: 12 },
    title: {
      padding: 12,
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 12,
    },
    field: { marginBottom: 12 },
    label: { fontSize: 14, marginBottom: 4, color: theme.label },
    placeholder: { color: theme.placeholder },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 13,
      borderColor: theme.border,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
      fontFamily: 'monospace',
    },
    multilineInput: { minHeight: 90, textAlignVertical: 'top' },
    innerScroll: { borderRadius: 8 },
    dropdownOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    dropdownContainer: {
      width: '80%',
      maxHeight: '70%',
      borderRadius: 12,
      backgroundColor: theme.bgPrimary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    dropdownHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 10,
      textAlign: 'center',
    },
    dropdownItem: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    dropdownCancel: {
      marginTop: 10,
      backgroundColor: theme.cancelBg,
      alignSelf: 'center',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    dropdownCancelText: {
      color: theme.textOnAccent,
      fontWeight: '500',
      fontSize: 14,
    },
    dropdownTrigger: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderColor: theme.border,
      backgroundColor: theme.inputBg,
    },
    dropdownText: { fontSize: 14, color: theme.textPrimary },
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
