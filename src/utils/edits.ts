export interface PageEdits {
  text?: Record<string, string>
  coordinates?: string[]
  images?: object
}

export const fetchEdits = async (run: string): Promise<PageEdits> => {
  try {
    const response = await fetch(`/api/edits?run=${encodeURIComponent(run)}`)
    return response.ok ? await response.json() : {}
  } catch {
    // No API (plain vite dev) or bad JSON. Show the page unedited.
    return {}
  }
}

export const saveEdits = async (run: string, edits: PageEdits, password: string) => {
  const response = await fetch('/api/edits', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ run, edits, password })
  })
  if (!response.ok) throw new Error(await response.text())
}
