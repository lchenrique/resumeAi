import { ResumeLayout } from "../components/resume/renderer/types";

export function createLayoutConfig<T extends readonly string[]>(
    layout: ResumeLayout<T>
  ): ResumeLayout<T> {
    return layout;
  }