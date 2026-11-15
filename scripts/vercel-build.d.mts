export type MigrationPlan = { migrate: boolean; reason?: string; error?: string };
export function migrationPlan(env: Record<string, string | undefined>): MigrationPlan;
