const getHairLine = async () => {
  const request = await fetch('https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/2022?alt=json&key=AIzaSyCqwiqxassrTcxREEM76PUP24qQ5GQFUm0')
  const response = await request.json()
  const filtered = response.values.filter((value) =>
    parseInt(value[0]) > 1500 &&
    value[2] &&
    new Date(value?.[1]) > new Date())
  return filtered
}

export default getHairLine
