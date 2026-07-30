<script setup lang="ts">
import { loadKakaoMaps } from "~/core/map/kakaoSdk";
import type { CafeRecord } from "~/types/cafe";

/**
 * 카카오 지도.
 *
 * 마커는 기본 핀 이미지가 아니라 CustomOverlay 안에 CafeMapMarker 를 Teleport 해서
 * 그린다. 그래야 사진 썸네일 마커가 Vue 컴포넌트 그대로 남아
 * 선택 상태·클릭·Tailwind 클래스가 전부 살아 있다.
 */
const props = withDefaults(
  defineProps<{
    cafes: CafeRecord[];
    selectedId?: number | null;
    /** 마커를 누를 수 없고 지도도 움직이지 않는 미리보기 모드 (랜딩·상세 화면) */
    preview?: boolean;
  }>(),
  { selectedId: null, preview: false },
);

const emit = defineEmits<{ select: [id: number] }>();

/** 기록이 하나도 없을 때의 기본 위치 — 성수역 일대 */
const DEFAULT_CENTER = { latitude: 37.5445, longitude: 127.0557 };
const DEFAULT_LEVEL = 5;
const SINGLE_LEVEL = 3;
const BOUNDS_PADDING = 40;
/** 이만큼 움직이면 마커를 누른 게 아니라 지도를 끈 것으로 본다 (px) */
const DRAG_THRESHOLD = 4;

const config = useRuntimeConfig();
const container = ref<HTMLElement | null>(null);

const status = ref<"loading" | "ready" | "failed">("loading");
const failReason = ref("");

interface MarkerHost {
  id: number;
  cafe: CafeRecord;
  el: HTMLElement;
}

/** DOM 엘리먼트를 반응형 프록시로 감싸지 않도록 shallow 로 둔다 */
const markerHosts = shallowRef<MarkerHost[]>([]);

let map: kakao.maps.Map | null = null;
let observer: ResizeObserver | null = null;
/** 사용자가 지도를 직접 옮겼는지 — 그 뒤로는 시야를 마음대로 되돌리지 않는다 */
let interacted = false;
/** 코드가 바꾼 것인지 구분해 사용자 조작으로 오해하지 않게 한다 */
let programmatic = false;

function runProgrammatic(fn: () => void) {
  programmatic = true;
  fn();
  window.setTimeout(() => {
    programmatic = false;
  }, 0);
}
const overlays = new Map<number, kakao.maps.CustomOverlay>();
const hostElements = new Map<number, HTMLElement>();

/**
 * 마커에서 시작한 드래그로도 지도가 움직이게 한다.
 *
 * clickable 인 CustomOverlay 는 카카오가 지도로 가는 이벤트를 막아버려서,
 * 마커를 짚고 끌면 지도가 제자리에 선다. 마커가 화면을 꽤 덮으므로
 * 그 경우 우리가 직접 중심을 옮기고, 끈 뒤에는 클릭으로 치지 않는다.
 */
function enableMarkerPan(element: HTMLElement) {
  // 터치로 끌 때 브라우저가 스크롤로 채가지 않도록
  element.style.touchAction = "none";

  element.addEventListener("pointerdown", (event: PointerEvent) => {
    if (props.preview || !map || event.button !== 0) return;

    const target = map;
    const start = { x: event.clientX, y: event.clientY };
    // 끄는 동안 지도에 되물으면 좌표 변환 오차가 쌓여 손보다 덜 움직인다.
    // 누른 순간의 중심을 기준점으로 잡고 그 자리에서 총 이동량만큼 옮긴다.
    const projection = target.getProjection();
    const origin = projection.pointFromCoords(target.getCenter());
    let dragging = false;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      if (!dragging && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;

      dragging = true;
      interacted = true;
      target.setCenter(
        projection.coordsFromPoint(
          new kakao.maps.Point(origin.x - dx, origin.y - dy),
        ),
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!dragging) return;

      // 끌어서 놓은 것이므로 뒤따라오는 click 은 선택으로 보지 않는다
      const swallow = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
      };
      element.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(
        () => element.removeEventListener("click", swallow, true),
        0,
      );
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}

function latLngOf(cafe: CafeRecord): kakao.maps.LatLng {
  return new kakao.maps.LatLng(cafe.latitude, cafe.longitude);
}

/** props.cafes 와 오버레이를 맞춘다. 전체를 다시 만들지 않고 추가·제거만 한다. */
function syncMarkers() {
  if (!map) return;

  const next: MarkerHost[] = [];
  const alive = new Set<number>();

  for (const cafe of props.cafes) {
    alive.add(cafe.id);

    let element = hostElements.get(cafe.id);
    if (!element) {
      element = document.createElement("div");
      enableMarkerPan(element);
      hostElements.set(cafe.id, element);

      const overlay = new kakao.maps.CustomOverlay({
        position: latLngOf(cafe),
        content: element,
        xAnchor: 0.5,
        yAnchor: 0.5,
        clickable: true,
      });
      overlay.setMap(map);
      overlays.set(cafe.id, overlay);
    } else {
      overlays.get(cafe.id)?.setPosition(latLngOf(cafe));
    }

    // 선택된 마커가 다른 마커에 가리지 않도록
    overlays.get(cafe.id)?.setZIndex(props.selectedId === cafe.id ? 20 : 10);
    next.push({ id: cafe.id, cafe, el: element });
  }

  for (const [id, overlay] of overlays) {
    if (alive.has(id)) continue;
    overlay.setMap(null);
    overlays.delete(id);
    hostElements.delete(id);
  }

  markerHosts.value = next;
}

/** 저장한 카페가 전부 보이도록 시야를 맞춘다 */
function fitToCafes() {
  const target = map;
  if (!target) return;

  runProgrammatic(() => {
    const first = props.cafes[0];
    if (!first) {
      target.setCenter(
        new kakao.maps.LatLng(
          DEFAULT_CENTER.latitude,
          DEFAULT_CENTER.longitude,
        ),
      );
      target.setLevel(DEFAULT_LEVEL);
      return;
    }

    if (props.cafes.length === 1) {
      target.setCenter(latLngOf(first));
      target.setLevel(SINGLE_LEVEL);
      return;
    }

    const bounds = new kakao.maps.LatLngBounds();
    props.cafes.forEach((cafe) => bounds.extend(latLngOf(cafe)));
    target.setBounds(
      bounds,
      BOUNDS_PADDING,
      BOUNDS_PADDING,
      BOUNDS_PADDING,
      BOUNDS_PADDING,
    );
  });
}

async function init() {
  try {
    await loadKakaoMaps(config.public.kakaoMapKey);
  } catch (err) {
    status.value = "failed";
    failReason.value =
      err instanceof Error ? err.message : "카카오 지도를 불러오지 못함";
    return;
  }

  if (!container.value) return;

  map = new kakao.maps.Map(container.value, {
    center: new kakao.maps.LatLng(
      DEFAULT_CENTER.latitude,
      DEFAULT_CENTER.longitude,
    ),
    level: DEFAULT_LEVEL,
    draggable: !props.preview,
    disableDoubleClick: props.preview,
    disableDoubleClickZoom: props.preview,
  });

  if (props.preview) map.setZoomable(false);

  const created = map;
  kakao.maps.event.addListener(created, "dragstart", () => {
    if (!programmatic) interacted = true;
  });
  kakao.maps.event.addListener(created, "zoom_start", () => {
    if (!programmatic) interacted = true;
  });

  status.value = "ready";
  syncMarkers();
  fitToCafes();

  // 목록/지도 전환이나 창 크기 변화로 상자 크기가 바뀌면 다시 그려야 한다.
  // 상자가 커지기 전에 잡은 시야는 어긋나 있으므로, 사용자가 아직 지도를
  // 만지지 않았다면 시야도 다시 맞춘다.
  observer = new ResizeObserver(() => {
    if (!map) return;
    const center = map.getCenter();
    map.relayout();
    if (interacted) map.setCenter(center);
    else fitToCafes();
  });
  observer.observe(container.value);
}

/** 카페 구성이 바뀔 때만 시야를 다시 맞춘다 (선택만 바뀐 경우는 제외) */
const cafeKey = computed(() => props.cafes.map((cafe) => cafe.id).join(","));

watch(cafeKey, () => {
  if (!map) return;
  syncMarkers();
  fitToCafes();
});

// 기록을 수정하면 좌표·사진이 바뀔 수 있어 오버레이를 갱신한다
watch(
  () => props.cafes,
  () => syncMarkers(),
  { deep: true },
);

watch(
  () => props.selectedId,
  (id) => {
    if (!map) return;
    syncMarkers();
    if (id === null || props.preview) return;
    const cafe = props.cafes.find((item) => item.id === id);
    if (cafe) map.panTo(latLngOf(cafe));
  },
);

onMounted(() => {
  void init();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  overlays.forEach((overlay) => overlay.setMap(null));
  overlays.clear();
  hostElements.clear();
  markerHosts.value = [];
  map = null;
});
</script>

<template>
  <!-- 부모가 relative 인 어떤 상자든 그대로 채운다 -->
  <div class="absolute inset-0 overflow-hidden bg-sand-100">
    <div ref="container" class="cafe-map-canvas h-full w-full" />

    <!-- 마커 — CustomOverlay 가 만든 엘리먼트 안으로 보낸다 -->
    <template v-for="host in markerHosts" :key="host.id">
      <Teleport :to="host.el">
        <CafeMapMarker
          :cafe="host.cafe"
          :selected="selectedId === host.id"
          :class="preview ? 'pointer-events-none' : ''"
          @select="emit('select', $event)"
        />
      </Teleport>
    </template>

    <div
      v-if="status === 'loading'"
      class="absolute inset-0 animate-pulse bg-sand-200"
      aria-hidden="true"
    />

    <div
      v-else-if="status === 'failed'"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sand-100 px-6 text-center"
    >
      <span class="block h-px w-10 bg-line" aria-hidden="true" />
      <p class="mt-4 text-title-3 text-ink">지도를 불러오지 못함</p>
      <p class="text-body-2 text-ink-soft">{{ failReason }}</p>
    </div>

    <!-- 지도 위에 얹는 안내 문구 등 -->
    <div class="pointer-events-none absolute inset-0 z-10">
      <slot />
    </div>
  </div>
</template>

<style>
/*
  카카오 기본 지도는 색이 강해 우드톤 사진 마커가 묻힌다.
  타일 이미지만 채도를 낮추고 살짝 따뜻하게 만든다.
  마커 사진(data-marker-photo)은 오버레이로 같은 컨테이너 안에 들어오므로 제외한다.
  scoped 를 쓰면 Teleport 된 마커에 속성이 붙지 않아 전역으로 두되 선택자를 좁힌다.
*/
.cafe-map-canvas img:not([data-marker-photo]) {
  filter: saturate(0.45) sepia(0.14) brightness(1.06) contrast(0.94);
}
</style>
