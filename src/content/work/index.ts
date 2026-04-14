import type { WorkContent, WorkItem } from "../types";

const projectModules = import.meta.glob("./projects/*.{ts,tsx}", { eager: true });

const projects: WorkItem[] = Object.entries(projectModules)
  .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
  .map(([key, moduleExports]) => {
    const typedModuleExports = moduleExports as { default?: WorkItem } & Record<string, unknown>;
    const candidate =
      typedModuleExports.default ??
      (Object.values(typedModuleExports).find(
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
