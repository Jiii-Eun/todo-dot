import { StyleSheet, Text, View } from 'react-native';
import { AnimatedModal } from '@/components/ui/AnimatedModal';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  description,
  confirmText = '삭제',
  cancelText = '취소',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmModalProps) {
  return (
    <AnimatedModal visible={visible} onRequestClose={onCancel} variant="fade">
      <View style={styles.card}>
        <Text style={styles.icon}>{destructive ? '⚠️' : 'ℹ️'}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.actions}>
          <Button label={cancelText} compact onPress={onCancel} variant="secondary" style={styles.action} />
          <Button
            label={confirmText}
            compact
            onPress={onConfirm}
            variant={destructive ? 'danger' : 'primary'}
            disabled={confirmDisabled}
            style={styles.action}
          />
        </View>
      </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  action: {
    flex: 1,
  },
});
