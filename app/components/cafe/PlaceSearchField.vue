<script setup lang="ts">
import { IconMapPin, IconSearch } from "@tabler/icons-vue";
import { searchPlaces } from "~/data/mockPlaces";
import type { PlaceSuggestion } from "~/types/cafe";

/**
 * 장소 검색 콤보박스. 지금은 목업 데이터에서 찾고,
 * 나중에 장소 검색 API 응답을 PlaceSuggestion 으로 변환해 searchPlaces 자리만 바꾸면 된다.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    /** 선택된 장소를 아래에 요약해 보여준다 */
    selectedSummary?: string;
  }>(),
  { placeholder: "", required: false, error: "", selectedSummary: "" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [place: PlaceSuggestion];
}>();

const id = useId();
const listId = computed(() => `${id}-list`);
const errorId = computed(() => `${id}-error`);

const isOpen = ref(false);
const activeIndex = ref(-1);

const results = computed<PlaceSuggestion[]>(() =>
  isOpen.value ? searchPlaces(props.modelValue) : [],
);

watch(results, () => {
  activeIndex.value = -1;
});

function onInput(event: Event) {
  isOpen.value = true;
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}

function choose(place: PlaceSuggestion) {
  emit("select", place);
  isOpen.value = false;
  activeIndex.value = -1;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
    return;
  }

  if (results.value.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % results.value.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex.value =
      activeIndex.value <= 0 ? results.value.length - 1 : activeIndex.value - 1;
  } else if (event.key === "Enter") {
    const place = results.value[activeIndex.value];
    if (place) {
      event.preventDefault();
      choose(place);
    }
  }
}

/** 목록 안을 클릭하는 중에는 닫히면 안 되므로 다음 틱에 판단한다 */
function onBlur() {
  setTimeout(() => {
    isOpen.value = false;
  }, 120);
}
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-label text-ink-soft">
      {{ label }}
      <span v-if="required" class="text-clay" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <IconSearch
        :size="18"
        :stroke-width="1.6"
        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        :id="id"
        type="text"
        role="combobox"
        autocomplete="off"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-expanded="isOpen && results.length > 0"
        :aria-controls="listId"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        :aria-activedescendant="
          activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        "
        class="h-12 w-full rounded-field border bg-paper pl-11 pr-4 text-body-1 text-ink transition-colors duration-150 ease-soft placeholder:text-ink-faint"
        :class="error ? 'border-clay' : 'border-line hover:border-ink-faint'"
        @input="onInput"
        @focus="isOpen = true"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <ul
        v-if="results.length"
        :id="listId"
        role="listbox"
        class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-field border border-line bg-paper shadow-lift"
      >
        <li
          v-for="(place, index) in results"
          :id="`${id}-option-${index}`"
          :key="place.id"
          role="option"
          :aria-selected="index === activeIndex"
        >
          <button
            type="button"
            class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ease-soft"
            :class="index === activeIndex ? 'bg-sand-100' : 'hover:bg-sand-100'"
            @mousedown.prevent="choose(place)"
          >
            <IconMapPin
              :size="18"
              :stroke-width="1.5"
              class="mt-0.5 shrink-0 text-ink-faint"
            />
            <span class="min-w-0">
              <span class="block truncate text-body-1 text-ink">
                {{ place.name }}
              </span>
              <span class="block truncate text-caption text-ink-soft">
                {{ place.address }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <p v-if="error" :id="errorId" class="mt-2 text-caption text-clay">
      {{ error }}
    </p>
    <p
      v-else-if="selectedSummary"
      class="mt-2 flex items-center gap-1.5 text-caption text-ink-soft"
    >
      <IconMapPin :size="14" :stroke-width="1.6" class="shrink-0" />
      {{ selectedSummary }}
    </p>
  </div>
</template>
