<script setup lang="ts">
import { todayInputValue } from "~/core/format";
import { fallbackCoordinate } from "~/core/map/projection";
import {
  ATMOSPHERE_OPTIONS,
  type Atmosphere,
  type CafeInput,
  type CafeRecord,
  type PlaceSuggestion,
} from "~/types/cafe";

/** 등록과 수정이 같은 폼을 쓴다. 다른 건 초기값과 버튼 문구뿐. */
const props = withDefaults(
  defineProps<{
    mode: "create" | "edit";
    initial?: CafeRecord | null;
    submitting?: boolean;
  }>(),
  { initial: null, submitting: false },
);

const emit = defineEmits<{
  submit: [input: CafeInput];
  cancel: [];
}>();

const name = ref(props.initial?.name ?? "");
const locationQuery = ref(props.initial?.address ?? "");
const district = ref(props.initial?.district ?? "");
const latitude = ref(props.initial?.latitude ?? 0);
const longitude = ref(props.initial?.longitude ?? 0);
const photoUrl = ref(props.initial?.photoUrl ?? "");
const atmosphere = ref<Atmosphere[]>([...(props.initial?.atmosphere ?? [])]);
const memo = ref(props.initial?.memo ?? "");
const visitedAt = ref(props.initial?.visitedAt ?? todayInputValue());

const nameError = ref("");
const locationError = ref("");

const submitLabel = computed(() =>
  props.mode === "create" ? "기록 저장" : "수정 저장",
);

const locationSummary = computed(() =>
  district.value ? `${district.value} 근처로 지도에 표시됨` : "",
);

/** 이름 칸에서 장소를 고르면 위치까지 한 번에 채운다 */
function onNamePlaceSelect(place: PlaceSuggestion) {
  name.value = place.name;
  applyPlace(place);
  nameError.value = "";
}

function onLocationPlaceSelect(place: PlaceSuggestion) {
  applyPlace(place);
}

function applyPlace(place: PlaceSuggestion) {
  locationQuery.value = place.address;
  district.value = place.district;
  latitude.value = place.latitude;
  longitude.value = place.longitude;
  locationError.value = "";
}

function toggleAtmosphere(tag: Atmosphere) {
  atmosphere.value = atmosphere.value.includes(tag)
    ? atmosphere.value.filter((item) => item !== tag)
    : [...atmosphere.value, tag];
}

function validate(): boolean {
  nameError.value = name.value.trim() ? "" : "카페 이름을 입력해줘";
  locationError.value = locationQuery.value.trim() ? "" : "위치를 선택해줘";
  return !nameError.value && !locationError.value;
}

function onSubmit() {
  if (!validate()) return;

  const address = locationQuery.value.trim();
  // 검색 결과를 고르지 않고 직접 적었으면 좌표를 임시로 만들어 지도에 올린다
  const coordinate =
    latitude.value && longitude.value
      ? { latitude: latitude.value, longitude: longitude.value }
      : fallbackCoordinate(address);

  emit("submit", {
    name: name.value.trim(),
    address,
    district:
      district.value.trim() || address.split(" ").slice(-1)[0] || address,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    photoUrl: photoUrl.value,
    atmosphere: atmosphere.value,
    memo: memo.value.trim(),
    visitedAt: visitedAt.value,
  });
}
</script>

<template>
  <form class="pb-28 sm:pb-0" novalidate @submit.prevent="onSubmit">
    <div class="flex flex-col gap-7">
      <PlaceSearchField
        v-model="name"
        label="카페 이름"
        placeholder="카페 이름 검색"
        required
        :error="nameError"
        @select="onNamePlaceSelect"
      />

      <PlaceSearchField
        v-model="locationQuery"
        label="위치"
        placeholder="주소나 동네 검색"
        required
        :error="locationError"
        :selected-summary="locationSummary"
        @select="onLocationPlaceSelect"
      />

      <PhotoUploader v-model="photoUrl" />

      <fieldset>
        <legend class="mb-3 text-label text-ink-soft">어떤 분위기였는지</legend>
        <div class="flex flex-wrap gap-2">
          <AtmosphereTag
            v-for="tag in ATMOSPHERE_OPTIONS"
            :key="tag"
            :value="tag"
            size="md"
            interactive
            :selected="atmosphere.includes(tag)"
            @toggle="toggleAtmosphere"
          />
        </div>
      </fieldset>

      <UiTextarea
        v-model="memo"
        label="한 줄 메모"
        placeholder="기억해두고 싶은 점"
      />

      <UiTextField v-model="visitedAt" label="방문한 날" type="date" />
    </div>

    <!-- 모바일에서는 하단 고정, 넓은 화면에서는 폼 끝에 붙는다 -->
    <div
      class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-sand-50/95 px-5 py-3 backdrop-blur safe-bottom sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none"
    >
      <div class="mx-auto flex max-w-form gap-2">
        <UiButton
          variant="outline"
          size="lg"
          :disabled="submitting"
          class="sm:w-32"
          block
          @click="emit('cancel')"
        >
          취소
        </UiButton>
        <UiButton type="submit" size="lg" :disabled="submitting" block>
          {{ submitLabel }}
        </UiButton>
      </div>
    </div>
  </form>
</template>
