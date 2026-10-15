export interface PageEdits {
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

const sendEdits = async (method: 'PUT' | 'DELETE', body: object) => {
  const response = await fetch('/api/edits', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) throw new Error(await response.text())
}

export const saveEdits = (run: string, edits: PageEdits, password: string) =>
  sendEdits('PUT', { run, edits, password })

export const deleteEdits = (run: string, password: string) =>
  sendEdits('DELETE', { run, password })
