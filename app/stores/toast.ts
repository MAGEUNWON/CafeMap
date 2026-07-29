import { defineStore } from "pinia";

export type ToastTone = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const DURATION = 2600;

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [] as ToastItem[],
    seq: 0,
  }),

  actions: {
    show(message: string, tone: ToastTone) {
      this.seq += 1;
      const id = this.seq;
      this.items.push({ id, message, tone });
      setTimeout(() => this.dismiss(id), DURATION);
    },

    success(message: string) {
      this.show(message, "success");
    },

    error(message: string) {
      this.show(message, "error");
    },

    dismiss(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
    },
  },
});
