<script setup lang="ts">
/**
 * 모바일에서는 하단 바텀시트, sm 이상에서는 가운데 모달로 뜬다.
 * Esc 로 닫히고, 열려 있는 동안 포커스가 패널 밖으로 나가지 않는다.
 */
const props = defineProps<{
  open: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const panel = ref<HTMLElement | null>(null);
const titleId = useId();
const descId = useId();

let lastFocused: HTMLElement | null = null;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function focusables(): HTMLElement[] {
  if (!panel.value) return [];
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return;

  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
    return;
  }

  if (event.key !== "Tab") return;

  const items = focusables();
  if (items.length === 0) return;

  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      await nextTick();
      (focusables()[0] ?? panel.value)?.focus();
    } else {
      document.body.style.overflow = "";
      lastFocused?.focus();
      lastFocused = null;
    }
  },
);

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-soft"
      leave-active-class="transition-opacity duration-150 ease-soft"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 sm:items-center"
        @click.self="emit('close')"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descId : undefined"
          tabindex="-1"
          class="w-full max-w-[420px] rounded-t-card border border-line bg-paper p-6 shadow-lift outline-none safe-bottom sm:rounded-card"
        >
          <h2 :id="titleId" class="text-title-2 text-ink">{{ title }}</h2>
          <p
            v-if="description"
            :id="descId"
            class="mt-2 text-body-2 text-ink-soft"
          >
            {{ description }}
          </p>

          <div class="mt-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
