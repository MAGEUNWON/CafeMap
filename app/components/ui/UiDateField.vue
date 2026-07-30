<script setup lang="ts">
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-vue";
import { formatDateDot, todayInputValue } from "~/core/format";

/**
 * 날짜 입력.
 *
 * 브라우저 기본 달력은 OS 마다 생김새가 제각각이라 화면 톤과 겉돈다.
 * 값은 <input type="date"> 와 같은 "YYYY-MM-DD" 문자열 그대로 주고받되,
 * 고르는 화면만 직접 그린다. 모바일은 바텀시트, sm 이상은 팝오버.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    required?: boolean;
    error?: string;
    hint?: string;
    /** 고를 수 있는 마지막 날 — 기본은 오늘 (다녀온 날이라 미래는 막는다) */
    max?: string;
    /** 고를 수 있는 첫 날 */
    min?: string;
  }>(),
  { required: false, error: "", hint: "", max: "", min: "" },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const id = useId();
const errorId = computed(() => `${id}-error`);
const hintId = computed(() => `${id}-hint`);
const gridId = computed(() => `${id}-grid`);

const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);
const anchor = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const trigger = ref<HTMLElement | null>(null);

/** 입력칸 아래에 자리가 없으면 위로 펼친다 (sm 이상 팝오버일 때만) */
const placement = ref<"below" | "above">("below");
/** 입력칸과 달력 사이 간격 */
const GAP = 6;
/** 이보다 더 줄이면 달력 구실을 못 한다 */
const MIN_PANEL_HEIGHT = 240;

/** 위로 펼칠 때는 아래에서가 아니라 위에서 내려오듯 움직인다 */
const slideFrom = computed(() =>
  placement.value === "above" ? "sm:-translate-y-1" : "sm:translate-y-1",
);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** "YYYY-MM-DD" → 그 날 자정의 로컬 Date. new Date(문자열) 은 UTC 로 읽혀 하루 밀린다. */
function toDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function toValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  // 1일을 기준으로 옮겨야 31일 → 다음달 넘어감 사고가 없다
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

const today = computed(() => todayInputValue());
const maxValue = computed(() => props.max || today.value);

const selected = computed(() => toDate(props.modelValue));
const triggerText = computed(() =>
  props.modelValue ? formatDateDot(props.modelValue) : "날짜 선택",
);

/** 펼쳐 놓은 달의 1일 */
const viewMonth = ref(new Date());
/** 키보드로 옮겨 다니는 커서 */
const cursor = ref<Date>(new Date());

const monthLabel = computed(
  () =>
    `${viewMonth.value.getFullYear()}년 ${viewMonth.value.getMonth() + 1}월`,
);

function isDisabled(value: string): boolean {
  if (props.min && value < props.min) return true;
  return Boolean(maxValue.value) && value > maxValue.value;
}

/** 달력 한 판 — 앞뒤 달로 채워 항상 6주 42칸 */
const days = computed(() => {
  const first = new Date(
    viewMonth.value.getFullYear(),
    viewMonth.value.getMonth(),
    1,
  );
  const start = addDays(first, -first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const value = toValue(date);
    return {
      value,
      day: date.getDate(),
      outside: date.getMonth() !== viewMonth.value.getMonth(),
      isToday: value === today.value,
      isSelected: value === props.modelValue,
      disabled: isDisabled(value),
    };
  });
});

const canGoPrev = computed(() => {
  if (!props.min) return true;
  const last = new Date(
    viewMonth.value.getFullYear(),
    viewMonth.value.getMonth(),
    0,
  );
  return toValue(last) >= props.min;
});

const canGoNext = computed(() => {
  if (!maxValue.value) return true;
  return toValue(addMonths(viewMonth.value, 1)) <= maxValue.value;
});

/** 어제는 오늘이 고를 수 있을 때만 뜻이 있다 */
const yesterday = computed(() => toValue(addDays(new Date(), -1)));

function open() {
  const base = selected.value ?? toDate(today.value) ?? new Date();
  viewMonth.value = new Date(base.getFullYear(), base.getMonth(), 1);
  cursor.value = base;
  isOpen.value = true;
}

function close(restoreFocus = true) {
  if (!isOpen.value) return;
  isOpen.value = false;
  if (restoreFocus) {
    void nextTick(() => trigger.value?.focus({ preventScroll: true }));
  }
}

/** 모바일은 바텀시트라 위아래를 따질 게 없다 */
function isSheet(): boolean {
  return window.matchMedia("(max-width: 639px)").matches;
}

/**
 * 입력칸 아래에 자리가 없으면 위로 펼치고, 위아래 모두 모자라면
 * 남은 만큼으로 높이를 잘라 안에서 스크롤시킨다. 화면 밖으로는 절대 안 나간다.
 *
 * 높이 제한은 :style 바인딩 대신 직접 건다 — 자연 높이를 다시 재려면
 * 이전에 걸어둔 제한을 그 자리에서 풀었다 재야 하기 때문.
 */
function updatePlacement() {
  const element = panel.value;
  if (!anchor.value || !element) return;

  if (isSheet()) {
    placement.value = "below";
    element.style.maxHeight = "";
    return;
  }

  element.style.maxHeight = "";
  const natural = element.offsetHeight;

  const rect = anchor.value.getBoundingClientRect();
  const roomBelow = window.innerHeight - rect.bottom - GAP;
  const roomAbove = rect.top - GAP;

  const above = roomBelow < natural && roomAbove > roomBelow;
  placement.value = above ? "above" : "below";

  const room = above ? roomAbove : roomBelow;
  element.style.maxHeight =
    natural <= room ? "" : `${Math.max(MIN_PANEL_HEIGHT, Math.floor(room))}px`;
}

function choose(value: string) {
  if (isDisabled(value)) return;
  emit("update:modelValue", value);
  close();
}

function shiftMonth(months: number) {
  viewMonth.value = addMonths(viewMonth.value, months);
}

/** 커서를 옮기고, 다른 달로 넘어가면 화면도 따라간다 */
function moveCursor(days: number) {
  const next = addDays(cursor.value, days);
  const value = toValue(next);
  if (maxValue.value && value > maxValue.value) return;
  if (props.min && value < props.min) return;

  cursor.value = next;
  if (
    next.getMonth() !== viewMonth.value.getMonth() ||
    next.getFullYear() !== viewMonth.value.getFullYear()
  ) {
    viewMonth.value = new Date(next.getFullYear(), next.getMonth(), 1);
  }
  void nextTick(focusCursor);
}

function focusCursor() {
  // preventScroll 이 없으면 브라우저가 날짜 칸을 화면에 넣으려고 페이지를 끌어내린다
  panel.value
    ?.querySelector<HTMLElement>(`[data-date="${toValue(cursor.value)}"]`)
    ?.focus({ preventScroll: true });
}

function onGridKeydown(event: KeyboardEvent) {
  const steps: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
  };

  const step = steps[event.key];
  if (step !== undefined) {
    event.preventDefault();
    moveCursor(step);
    return;
  }

  if (event.key === "PageUp") {
    event.preventDefault();
    shiftMonth(-1);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    if (canGoNext.value) shiftMonth(1);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value || event.key !== "Escape") return;
  event.preventDefault();
  close();
}

function onPointerDown(event: PointerEvent) {
  if (!isOpen.value) return;
  if (root.value?.contains(event.target as Node)) return;
  close(false);
}

function onViewportChange() {
  if (isOpen.value) updatePlacement();
}

watch(isOpen, async (value) => {
  if (!value) return;
  // 그려진 뒤에 높이를 재야 위아래를 정할 수 있다. nextTick 은 페인트 전이라
  // 자리를 옮겨도 깜빡이지 않는다.
  await nextTick();
  updatePlacement();
  focusCursor();
});

/** 달이 바뀌어도 칸 수는 그대로지만, 창 크기가 바뀌면 다시 따져야 한다 */
onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", onViewportChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("resize", onViewportChange);
});
</script>

<template>
  <div ref="root">
    <span :id="id" class="mb-2 block text-label text-ink-soft">
      {{ label }}
      <span v-if="required" class="text-clay" aria-hidden="true">*</span>
    </span>

    <!-- 팝오버는 라벨이 아니라 입력칸을 기준으로 붙는다 -->
    <div ref="anchor" class="relative">
      <button
        ref="trigger"
        type="button"
        :aria-labelledby="id"
        :aria-expanded="isOpen"
        :aria-controls="isOpen ? gridId : undefined"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : hint ? hintId : undefined"
        class="flex h-12 w-full items-center gap-3 rounded-field border bg-paper px-4 text-left text-body-1 transition-colors duration-150 ease-soft"
        :class="[
          error ? 'border-clay' : 'border-line hover:border-ink-faint',
          modelValue ? 'text-ink' : 'text-ink-faint',
        ]"
        @click="isOpen ? close() : open()"
      >
        <IconCalendar
          :size="18"
          :stroke-width="1.6"
          class="shrink-0 text-ink-soft"
        />
        <span class="text-index">{{ triggerText }}</span>
      </button>

      <!-- 모바일은 화면 아래에서 올라오고, sm 이상은 입력칸 아래 붙는다 -->
      <Transition
        enter-active-class="transition-opacity duration-150 ease-soft"
        leave-active-class="transition-opacity duration-100 ease-soft"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-40 bg-ink/25 sm:hidden"
          aria-hidden="true"
          @click="close(false)"
        />
      </Transition>

      <Transition
        enter-active-class="transition duration-200 ease-soft"
        leave-active-class="transition duration-150 ease-soft"
        :enter-from-class="`opacity-0 translate-y-3 ${slideFrom}`"
        :leave-to-class="`opacity-0 translate-y-3 ${slideFrom}`"
      >
        <div
          v-if="isOpen"
          ref="panel"
          role="dialog"
          :aria-labelledby="id"
          class="fixed inset-x-0 bottom-0 z-50 rounded-t-card border border-line bg-paper p-5 shadow-lift safe-bottom sm:absolute sm:inset-x-auto sm:left-0 sm:w-[320px] sm:overflow-y-auto sm:rounded-card"
          :class="
            placement === 'above'
              ? 'sm:bottom-[calc(100%+6px)] sm:top-auto'
              : 'sm:bottom-auto sm:top-[calc(100%+6px)]'
          "
        >
          <div class="mb-4 flex items-center justify-between">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-pill text-ink-soft transition-colors duration-150 ease-soft hover:bg-sand-100 disabled:opacity-30 disabled:hover:bg-transparent"
              :disabled="!canGoPrev"
              aria-label="이전 달"
              @click="shiftMonth(-1)"
            >
              <IconChevronLeft :size="18" :stroke-width="1.75" />
            </button>

            <span aria-live="polite" class="text-title-3 text-ink">
              {{ monthLabel }}
            </span>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-pill text-ink-soft transition-colors duration-150 ease-soft hover:bg-sand-100 disabled:opacity-30 disabled:hover:bg-transparent"
              :disabled="!canGoNext"
              aria-label="다음 달"
              @click="shiftMonth(1)"
            >
              <IconChevronRight :size="18" :stroke-width="1.75" />
            </button>
          </div>

          <div class="grid grid-cols-7 gap-y-1">
            <span
              v-for="weekday in WEEKDAYS"
              :key="weekday"
              class="pb-1 text-center text-label-sm text-ink-faint"
              aria-hidden="true"
            >
              {{ weekday }}
            </span>
          </div>

          <div
            :id="gridId"
            role="grid"
            :aria-label="monthLabel"
            class="grid grid-cols-7 gap-y-1"
            @keydown="onGridKeydown"
          >
            <button
              v-for="date in days"
              :key="date.value"
              type="button"
              role="gridcell"
              :data-date="date.value"
              :disabled="date.disabled"
              :tabindex="date.value === toValue(cursor) ? 0 : -1"
              :aria-selected="date.isSelected"
              :aria-current="date.isToday ? 'date' : undefined"
              :aria-label="formatDateDot(date.value)"
              class="mx-auto flex h-10 w-10 items-center justify-center rounded-pill text-body-2 text-index transition-colors duration-150 ease-soft disabled:cursor-not-allowed"
              :class="[
                date.isSelected
                  ? 'bg-walnut text-sand-50'
                  : date.disabled
                    ? 'text-ink-faint/40'
                    : date.outside
                      ? 'text-ink-faint hover:bg-sand-100'
                      : 'text-ink hover:bg-sand-100',
                date.isToday && !date.isSelected
                  ? 'ring-1 ring-inset ring-moss'
                  : '',
              ]"
              @click="choose(date.value)"
            >
              {{ date.day }}
            </button>
          </div>

          <div class="mt-4 flex gap-2 border-t border-line pt-4">
            <button
              type="button"
              class="h-9 flex-1 rounded-pill border border-line text-label text-ink-soft transition-colors duration-150 ease-soft hover:border-ink-faint hover:text-ink"
              @click="choose(today)"
            >
              오늘
            </button>
            <button
              type="button"
              class="h-9 flex-1 rounded-pill border border-line text-label text-ink-soft transition-colors duration-150 ease-soft hover:border-ink-faint hover:text-ink"
              @click="choose(yesterday)"
            >
              어제
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-caption text-clay">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="mt-2 text-caption text-ink-faint">
      {{ hint }}
    </p>
  </div>
</template>
