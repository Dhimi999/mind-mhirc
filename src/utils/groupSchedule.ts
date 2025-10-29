export type GroupKey = 'A' | 'B' | 'C'

export type GroupEntry = {
  date?: string | null
  time?: string | null
  link?: string | null
}

export type GroupSchedules = Partial<Record<GroupKey, GroupEntry>>

export function parseGroupSchedule(raw: string | null): GroupSchedules | null {
  if (!raw) return null
  const tryParse = (s: string) => {
    try { return JSON.parse(s) as unknown } catch { return null }
  }
  let parsed = tryParse(raw)
  if (!parsed) {
    try {
      const decoded = decodeURIComponent(raw)
      parsed = tryParse(decoded)
    } catch {
      parsed = null
    }
  }
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as any
  if (obj.A || obj.B || obj.C) return obj as GroupSchedules
  return null
}

export function pickGroupEntry(
  schedules: GroupSchedules,
  group: GroupKey | null
): { entry: GroupEntry | null; usedKey: GroupKey | null } {
  const key: GroupKey | null = group ?? null
  const preferred = key && schedules[key] ? (key as GroupKey) : (schedules.A ? 'A' : schedules.B ? 'B' : schedules.C ? 'C' : null)
  if (!preferred) return { entry: null, usedKey: null }
  return { entry: schedules[preferred] || null, usedKey: preferred }
}
