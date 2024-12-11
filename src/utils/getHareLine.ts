const getHareLine = async () => {
  const request = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/${new Date().getFullYear()}?alt=json&key=AIzaSyCJBl1U-PuLxlX6CUuMVjeRMczZDoE3eNU`
  )
  const response = await request.json()
  return response.values
}

export default getHareLine
