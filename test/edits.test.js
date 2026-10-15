import { expect, test } from 'bun:test'
import { onRequestDelete, onRequestGet, onRequestPut } from '../functions/api/edits.js'

const fakeEnv = () => {
  const store = new Map()
  return {
    PASSWORD: 'secret',
    EDITS: {
      get: async (key) => store.get(key) ?? null,
      put: async (key, value) => store.set(key, value),
      delete: async (key) => store.delete(key)
    }
  }
}

const put = (env, body) =>
  onRequestPut({
    env,
    request: new Request('http://x/api/edits', { method: 'PUT', body: JSON.stringify(body) })
  })

const remove = (env, body) =>
  onRequestDelete({
    env,
    request: new Request('http://x/api/edits', { method: 'DELETE', body: JSON.stringify(body) })
  })

const get = (env, run) =>
  onRequestGet({ env, request: new Request(`http://x/api/edits?run=${run}`) })

test('wrong password is rejected', async () => {
  const response = await put(fakeEnv(), { password: 'nope', run: '2100', edits: {} })
  expect(response.status).toBe(401)
})

test('saved edits come back from GET', async () => {
  const env = fakeEnv()
  await put(env, { password: 'secret', run: '2100', edits: { text: { hares: 'Bob' } } })
  expect(await (await get(env, '2100')).json()).toEqual({ text: { hares: 'Bob' } })
})

test('bad run number is rejected', async () => {
  const response = await put(fakeEnv(), { password: 'secret', run: '../x', edits: {} })
  expect(response.status).toBe(400)
})

test('deleted edits are gone', async () => {
  const env = fakeEnv()
  await put(env, { password: 'secret', run: '2100', edits: { text: { hares: 'Bob' } } })
  await remove(env, { password: 'secret', run: '2100' })
  expect(await (await get(env, '2100')).json()).toEqual({})
})

test('delete with wrong password is rejected', async () => {
  const response = await remove(fakeEnv(), { password: 'nope', run: '2100' })
  expect(response.status).toBe(401)
})
