import { defineStore } from "pinia";
import { createLocalStorageCafeRepository } from "~/repositories/localStorageCafeRepository";
import type { CafeRepository } from "~/repositories/cafeRepository";
import type { CafeBackup } from "~/types/backup";
import type { Atmosphere, CafeInput, CafeRecord, CafeSort } from "~/types/cafe";

// 백엔드가 붙으면 이 한 줄을 createApiCafeRepository() 로 바꾸면 된다
const repository: CafeRepository = createLocalStorageCafeRepository();

interface CafeState {
  records: CafeRecord[];
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedId: number | null;
  keyword: string;
  activeTags: Atmosphere[];
  sort: CafeSort;
}

export const useCafeStore = defineStore("cafe", {
  state: (): CafeState => ({
    records: [],
    isHydrated: false,
    isLoading: false,
    error: null,
    selectedId: null,
    keyword: "",
    activeTags: [],
    sort: "visitedDesc",
  }),

  getters: {
    /** 검색어 + 태그 필터 + 정렬을 모두 적용한 목록 */
    filtered(state): CafeRecord[] {
      const keyword = state.keyword.trim().toLowerCase();

      const matched = state.records.filter((record) => {
        const byKeyword =
          !keyword ||
          record.name.toLowerCase().includes(keyword) ||
          record.district.toLowerCase().includes(keyword) ||
          record.address.toLowerCase().includes(keyword);

        const byTag =
          state.activeTags.length === 0 ||
          state.activeTags.every((tag) => record.atmosphere.includes(tag));

        return byKeyword && byTag;
      });

      return sortRecords(matched, state.sort);
    },

    /** 방문일 기준 최신 목록 — 랜딩의 "최근에 다녀온 카페" */
    recent(state): CafeRecord[] {
      return sortRecords([...state.records], "visitedDesc");
    },

    selected(state): CafeRecord | null {
      if (state.selectedId === null) return null;
      return state.records.find((r) => r.id === state.selectedId) ?? null;
    },

    /** 필터가 하나라도 걸려 있는지 — 빈 화면 문구를 가르는 기준 */
    hasActiveFilter(state): boolean {
      return state.keyword.trim().length > 0 || state.activeTags.length > 0;
    },
  },

  actions: {
    async hydrate() {
      if (this.isHydrated) return;
      this.isLoading = true;
      this.error = null;
      try {
        this.records = await repository.list();
      } catch (err) {
        // 읽기에 실패해도 화면은 진행시킨다. 예전에는 isHydrated 가 false 로
        // 남아 스켈레톤이 영원히 돌았다 — hydrate 는 한 번만 불리므로.
        this.error = messageOf(err);
        this.records = [];
      } finally {
        this.isHydrated = true;
        this.isLoading = false;
      }
    },

    /** 저장소 오류 배너의 "다시 시도" */
    async retryHydrate() {
      this.isHydrated = false;
      this.error = null;
      await this.hydrate();
    },

    dismissError() {
      this.error = null;
    },

    byId(id: number): CafeRecord | null {
      return this.records.find((record) => record.id === id) ?? null;
    },

    async create(input: CafeInput): Promise<CafeRecord> {
      const record = await repository.create(input);
      this.records = [record, ...this.records];
      return record;
    },

    async update(id: number, input: CafeInput): Promise<CafeRecord> {
      const updated = await repository.update(id, input);
      this.records = this.records.map((record) =>
        record.id === id ? updated : record,
      );
      return updated;
    },

    async remove(id: number): Promise<void> {
      await repository.remove(id);
      this.records = this.records.filter((record) => record.id !== id);
      if (this.selectedId === id) this.selectedId = null;
    },

    select(id: number | null) {
      this.selectedId = id;
    },

    setKeyword(keyword: string) {
      this.keyword = keyword;
    },

    toggleTag(tag: Atmosphere) {
      this.activeTags = this.activeTags.includes(tag)
        ? this.activeTags.filter((item) => item !== tag)
        : [...this.activeTags, tag];
    },

    clearTags() {
      this.activeTags = [];
    },

    setSort(sort: CafeSort) {
      this.sort = sort;
    },

    resetFilters() {
      this.keyword = "";
      this.activeTags = [];
    },

    /** 백업 파일로 내보낼 현재 저장소 전체 */
    async exportBackup(): Promise<CafeBackup> {
      return repository.exportAll();
    },

    /** 백업 가져오기 — 통째로 교체한다 */
    async importBackup(records: CafeRecord[]): Promise<void> {
      this.records = await repository.replaceAll(records);
      this.selectedId = null;
      this.error = null;
    },
  },
});

function sortRecords(records: CafeRecord[], sort: CafeSort): CafeRecord[] {
  const sorted = [...records];
  switch (sort) {
    case "visitedDesc":
      return sorted.sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
    case "visitedAsc":
      return sorted.sort((a, b) => a.visitedAt.localeCompare(b.visitedAt));
    case "createdDesc":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return sorted;
  }
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "기록을 불러오지 못함";
}
