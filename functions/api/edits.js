const RUN_NUMBER = /^\d+$/

export const onRequestGet = async ({ request, env }) => {
  const run = new URL(request.url).searchParams.get('run') ?? ''
  if (!RUN_NUMBER.test(run)) return new Response('Bad run number', { status: 400 })

  const edits = (await env.EDITS.get(run)) ?? '{}'
  return new Response(edits, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  })
}

export const onRequestPut = async ({ request, env }) => {
  const { password, run, edits } = await request.json()
  if (password !== env.PASSWORD) return new Response('Wrong password', { status: 401 })

  const isValid = RUN_NUMBER.test(String(run)) && edits && typeof edits === 'object'
  if (!isValid) return new Response('Bad edits', { status: 400 })

  await env.EDITS.put(String(run), JSON.stringify(edits))
  return new Response(null, { status: 204 })
}
