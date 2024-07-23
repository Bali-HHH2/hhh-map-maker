addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // this is wrapped in an `async` function
  // you can use await throughout the function

  const isInCurrentWeek = (date) => {
    const WEEK_LENGTH = 604800000
    let lastMonday = new Date() // Creating new date object for today
    lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() - 1)) // Setting date to last monday
    lastMonday.setHours(0, 0, 0, 0) // Setting Hour to 00:00:00:00

    return (
      lastMonday.getTime() <= date.getTime() &&
      date.getTime() < lastMonday.getTime() + WEEK_LENGTH
    ) // true / false
  }

  const getHareLine = async () => {
    const request = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/2022?alt=json&key=${GSHEETS_API_KEY}`
    )
    const response = await request.json()
    return response.values
  }

  const formRunObject = (currentRun, hareLine) => {
    const number = currentRun[0] || '?'
    const date = currentRun[1] || '?'
    const hares = currentRun[2] || '?'
    const googleMapsLink = currentRun[5] || '?'
    const occasion = currentRun[3] || '?'
    const runSiteName = currentRun[4] || 'Waiting on hares...'
    const startTime = currentRun[6] || '?'
    return {
      number,
      date,
      hares,
      googleMapsLink,
      occasion,
      runSiteName,
      coordinates: currentRun[5],
      filteredHareLine: hareLine.slice(1),
      startTime
    }
  }

  const currentRun = (hareLine) => {
    const currentRun = hareLine.find((e) => {
      return isInCurrentWeek(new Date(e[1]))
    })
    return formRunObject(currentRun, hareLine)
  }

  const hareline = await getHareLine()

  const fullHareLine = hareline.filter(
    (e) =>
      // First items needs to be a run number, and the rest need to be present to be a valid run.
      parseInt(e[0]) && e[1] && e[2] && e[4] && e[5]
  )

  const run = currentRun(fullHareLine)

  return new Response(JSON.stringify(run), {
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    json: true
  })
}
