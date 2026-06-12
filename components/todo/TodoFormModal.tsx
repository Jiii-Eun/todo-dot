import { useEffect, useState } from 'react';

import {

  Pressable,

  ScrollView,

  StyleSheet,

  Switch,

  Text,

  TextInput,

  View,

} from 'react-native';

import { Button } from '@/components/ui/Button';

import { AnimatedModal } from '@/components/ui/AnimatedModal';
import { DatePickerSheet } from '@/components/ui/DatePickerSheet';

import { TimePickerSheet } from '@/components/ui/TimePickerSheet';

import {

  PRIORITY,

  PRIORITY_LABELS,

  PRIORITY_STARS,

  REPEAT_DAY_INDICES,

  REPEAT_DAY_LABELS,

  type Priority,

} from '@/constants/priority';

import { colors, radius, spacing } from '@/constants/theme';

import { addMinutesToTime, isTimeAfter } from '@/lib/time/compareTime';
import { formatDurationMinutes, formatTime, parseDateString, toDateString } from '@/lib/time/formatTime';

import {
  validateRepeatDays,
  validateRepeatEndDate,
  validateTodoTimes,
  validateTodoTitle,
} from '@/lib/validation/todo';

import type { Todo, TodoFormValues } from '@/types/todo';

import { createDefaultFormValues, useTodoContext } from '@/contexts/TodoProvider';



interface TodoFormModalProps {

  visible: boolean;

  selectedDate: Date;

  editingTodo: Todo | null;

  onClose: () => void;

  onSave: (values: TodoFormValues) => Promise<void>;

}



type PickerTarget = 'start' | 'end' | 'repeatEnd' | null;



export function TodoFormModal({

  visible,

  selectedDate,

  editingTodo,

  onClose,

  onSave,

}: TodoFormModalProps) {

  const { getRepeatRuleForSeries } = useTodoContext();

  const [form, setForm] = useState<TodoFormValues>(() => createDefaultFormValues(selectedDate));

  const [error, setError] = useState('');

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    if (!visible) {

      setPickerTarget(null);

      return;

    }



    if (editingTodo) {

      const [sh, sm] = editingTodo.startTime.split(':').map(Number);

      const [eh, em] = editingTodo.endTime.split(':').map(Number);

      const start = new Date(selectedDate);

      start.setHours(sh, sm, 0, 0);

      const end = new Date(selectedDate);

      end.setHours(eh, em, 0, 0);

      const seriesId = editingTodo.seriesId ?? editingTodo.id;

      const repeatRule = getRepeatRuleForSeries(seriesId);



      setForm({

        title: editingTodo.title,

        description: editingTodo.description ?? '',

        priority: editingTodo.priority,

        startTime: start,

        endTime: end,

        targetDate: toDateString(selectedDate),

        repeatEnabled: Boolean(editingTodo.seriesId),

        repeatDays: repeatRule?.repeatDays ?? [],

        repeatDate: repeatRule?.repeatDate ? parseDateString(repeatRule.repeatDate) : null,

      });

    } else {

      setForm(createDefaultFormValues(selectedDate));

    }

    setError('');

  }, [visible, editingTodo, selectedDate, getRepeatRuleForSeries]);



  const durationLabel = formatDurationMinutes(form.startTime, form.endTime);

  const timeRangeLabel = `${formatTime(form.startTime)} ~ ${formatTime(form.endTime)}`;



  const toggleRepeatDay = (dayIndex: number) => {

    setForm((prev) => ({

      ...prev,

      repeatDays: prev.repeatDays.includes(dayIndex)

        ? prev.repeatDays.filter((d) => d !== dayIndex)

        : [...prev.repeatDays, dayIndex].sort(),

    }));

  };



  const handleSave = async () => {

    const titleValidation = validateTodoTitle(form.title);

    if (!titleValidation.valid) {

      setError(titleValidation.message);

      return;

    }

    const timeValidation = validateTodoTimes(form.startTime, form.endTime);

    if (!timeValidation.valid) {

      setError(timeValidation.message);

      return;

    }

    const repeatValidation = validateRepeatDays(form.repeatEnabled, form.repeatDays);

    if (!repeatValidation.valid) {

      setError(repeatValidation.message);

      return;

    }

    const repeatEndValidation = validateRepeatEndDate(form.repeatEnabled, form.repeatDate, selectedDate);

    if (!repeatEndValidation.valid) {

      setError(repeatEndValidation.message);

      return;

    }



    setSaving(true);

    try {
      await onSave({ ...form, targetDate: toDateString(selectedDate) });
      onClose();
    } catch {
      setError('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };



  return (

    <AnimatedModal visible={visible} onRequestClose={onClose} variant="slide" dismissOnOverlayPress={false}>

      <View style={styles.container}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >

          <Text style={styles.heading}>{editingTodo ? '할 일 수정' : '할 일 추가'}</Text>



          <Text style={styles.label}>제목 *</Text>

          <TextInput

            value={form.title}

            onChangeText={(title) => setForm((prev) => ({ ...prev, title }))}

            placeholder="헬스장 가기"

            placeholderTextColor={colors.textMuted}

            style={styles.input}

          />



          <Text style={styles.label}>세부 내용</Text>

          <TextInput

            value={form.description}

            onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}

            placeholder="하체 운동, 러닝 30분"

            placeholderTextColor={colors.textMuted}

            style={[styles.input, styles.multiline]}

            multiline

          />



          <Text style={styles.label}>중요도</Text>

          <View style={styles.priorityRow}>

            {([PRIORITY.LOW, PRIORITY.MEDIUM, PRIORITY.HIGH] as Priority[]).map((priority) => (

              <Pressable

                key={priority}

                onPress={() => setForm((prev) => ({ ...prev, priority }))}

                style={[styles.priorityChip, form.priority === priority && styles.priorityChipActive]}

              >

                <Text style={styles.priorityStar}>{PRIORITY_STARS[priority]}</Text>

                <Text style={styles.priorityLabel}>{PRIORITY_LABELS[priority]}</Text>

              </Pressable>

            ))}

          </View>



          <Text style={styles.label}>시간 설정</Text>

          <View style={styles.timeRow}>

            <Pressable style={styles.timeButton} onPress={() => setPickerTarget('start')}>

              <Text style={styles.timeCaption}>시작 시간</Text>

              <Text style={styles.timeValue}>{formatTime(form.startTime)}</Text>

            </Pressable>

            <Pressable style={styles.timeButton} onPress={() => setPickerTarget('end')}>

              <Text style={styles.timeCaption}>종료 시간</Text>

              <Text style={styles.timeValue}>{formatTime(form.endTime)}</Text>

            </Pressable>

          </View>

          <Text style={styles.duration}>

            {timeRangeLabel} · 총 {durationLabel}

          </Text>



          <View style={styles.repeatHeader}>

            <Text style={styles.label}>반복 설정</Text>

            <Switch

              value={form.repeatEnabled}

              onValueChange={(repeatEnabled) => setForm((prev) => ({ ...prev, repeatEnabled }))}

              trackColor={{ true: colors.primaryLight, false: colors.border }}

              thumbColor={form.repeatEnabled ? colors.primary : '#f4f4f5'}

            />

          </View>



          {form.repeatEnabled && (

            <>

              <Text style={styles.label}>반복 요일</Text>

              <View style={styles.repeatDays}>

                {REPEAT_DAY_INDICES.map((dayIndex) => (

                  <Pressable

                    key={dayIndex}

                    onPress={() => toggleRepeatDay(dayIndex)}

                    style={[

                      styles.repeatDay,

                      form.repeatDays.includes(dayIndex) && styles.repeatDayActive,

                    ]}

                  >

                    <Text

                      style={[

                        styles.repeatDayText,

                        form.repeatDays.includes(dayIndex) && styles.repeatDayTextActive,

                      ]}

                    >

                      {REPEAT_DAY_LABELS[dayIndex]}

                    </Text>

                  </Pressable>

                ))}

              </View>



              <Text style={styles.label}>종료일 (선택)</Text>

              <Pressable style={styles.timeButton} onPress={() => setPickerTarget('repeatEnd')}>

                <Text style={[styles.timeValue, !form.repeatDate && styles.placeholder]}>

                  {form.repeatDate ? toDateString(form.repeatDate) : '설정 안 함 (계속 반복)'}

                </Text>

              </Pressable>

              <Text style={styles.repeatHint}>

                선택한 요일마다 반복됩니다. 종료일을 설정하면 해당 날짜까지만 일정이 생성됩니다.

              </Text>

            </>

          )}



          {error ? <Text style={styles.error}>{error}</Text> : null}

        </ScrollView>



        <View style={styles.footer}>

          <Button label="취소" variant="secondary" compact onPress={onClose} style={styles.footerButton} />

          <Button

            label="저장"

            compact

            onPress={() => void handleSave()}

            disabled={saving}

            style={styles.footerButton}

          />

        </View>

      </View>



      <TimePickerSheet

        visible={pickerTarget === 'start'}

        value={form.startTime}

        title="시작 시간"

        onClose={() => setPickerTarget(null)}

        onConfirm={(startTime) =>
          setForm((prev) => {
            const next = { ...prev, startTime };
            if (!isTimeAfter(prev.endTime, startTime)) {
              next.endTime = addMinutesToTime(startTime, 60);
            }
            return next;
          })
        }

      />



      <TimePickerSheet

        visible={pickerTarget === 'end'}

        value={form.endTime}

        title="종료 시간"
        minTime={form.startTime}
        onClose={() => setPickerTarget(null)}

        onConfirm={(endTime) => setForm((prev) => ({ ...prev, endTime }))}

      />



      <DatePickerSheet

        visible={pickerTarget === 'repeatEnd'}

        value={form.repeatDate}

        fallbackDate={selectedDate}

        title="종료일 (선택)"

        minDate={selectedDate}

        optional

        onClose={() => setPickerTarget(null)}

        onConfirm={(repeatDate) => setForm((prev) => ({ ...prev, repeatDate }))}

      />

    </AnimatedModal>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: colors.background,

  },

  content: {

    padding: spacing.lg,

    paddingBottom: spacing.xl,

  },

  heading: {

    fontSize: 22,

    fontWeight: '700',

    color: colors.text,

    marginBottom: spacing.lg,

  },

  label: {

    fontSize: 14,

    fontWeight: '600',

    color: colors.text,

    marginBottom: spacing.sm,

    marginTop: spacing.md,

  },

  input: {

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: radius.md,

    paddingHorizontal: spacing.md,

    paddingVertical: 12,

    fontSize: 16,

    color: colors.textSecondary,

  },

  multiline: {

    minHeight: 88,

    textAlignVertical: 'top',

  },

  priorityRow: {

    flexDirection: 'row',

    gap: spacing.sm,

  },

  priorityChip: {

    flex: 1,

    alignItems: 'center',

    paddingVertical: spacing.sm,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor: colors.border,

    backgroundColor: colors.surface,

  },

  priorityChipActive: {

    borderColor: colors.primary,

    backgroundColor: '#F3E8FF',

  },

  priorityStar: {

    fontSize: 16,

  },

  priorityLabel: {

    marginTop: 4,

    fontSize: 12,

    color: colors.textSecondary,

  },

  timeRow: {

    flexDirection: 'row',

    gap: spacing.sm,

  },

  timeButton: {

    flex: 1,

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: radius.md,

    padding: spacing.md,

  },

  timeCaption: {

    fontSize: 12,

    color: colors.textMuted,

    marginBottom: 4,

  },

  timeValue: {

    fontSize: 18,

    fontWeight: '600',

    color: colors.text,

  },

  placeholder: {

    color: colors.textMuted,

    fontWeight: '400',

  },

  duration: {

    marginTop: spacing.sm,

    fontSize: 13,

    color: colors.textSecondary,

  },

  repeatHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginTop: spacing.md,

  },

  repeatDays: {

    flexDirection: 'row',

    gap: spacing.xs,

  },

  repeatDay: {

    width: 36,

    height: 36,

    borderRadius: radius.full,

    borderWidth: 1,

    borderColor: colors.border,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: colors.surface,

  },

  repeatDayActive: {

    backgroundColor: colors.primary,

    borderColor: colors.primary,

  },

  repeatDayText: {

    fontSize: 12,

    color: colors.textSecondary,

  },

  repeatDayTextActive: {

    color: '#FFFFFF',

    fontWeight: '700',

  },

  repeatHint: {

    marginTop: spacing.sm,

    fontSize: 12,

    color: colors.textMuted,

    lineHeight: 18,

  },

  error: {

    marginTop: spacing.md,

    color: colors.danger,

    fontSize: 14,

  },

  footer: {

    flexDirection: 'row',

    gap: spacing.sm,

    paddingHorizontal: spacing.md,

    paddingVertical: spacing.md,

    borderTopWidth: 1,

    borderTopColor: colors.border,

    backgroundColor: colors.surface,

  },

  footerButton: {

    flex: 1,

  },

});


