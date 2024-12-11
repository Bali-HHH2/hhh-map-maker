const getHareLine = async () => {
  const request = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/${new Date().getFullYear()}?alt=json&key=${import.meta.env.VITE_GOOGLEMAPS_API_KEY}`
  )
  const response = await request.json()
  return response.values
}

export default getHareLine
