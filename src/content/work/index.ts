import type { WorkContent, WorkItem } from "../types";

const projectContext = require.context("./projects", false, /\.ts$/);

const projects: WorkItem[] = projectContext.keys().map((key) => {
  const moduleExports = projectContext<WorkItem>(key);
  const candidate =
    (moduleExports.default as WorkItem | undefined) ??
    (Object.values(moduleExports).find(
      (value): value is WorkItem => typeof value === "object" && value !== null && "id" in value
    ) ?? null);

  if (!candidate) {
    throw new Error(`Project module "${key}" does not export a WorkItem`);
  }

  return candidate;
});

export const workContent: WorkContent = {
  filterTabs: ["All", "Photography", "Web design", "Other"],
  projects,
};
