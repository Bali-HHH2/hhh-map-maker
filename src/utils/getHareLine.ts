const getHareLine = async () => {
  const request = await fetch('https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/2022?alt=json&key=AIzaSyCqwiqxassrTcxREEM76PUP24qQ5GQFUm0')
  const response = await request.json()
  return response.values
}

export default getHareLine
