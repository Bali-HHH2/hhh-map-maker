import { subDays } from "date-fns";

const getHareLine = async () => {
  const request = await fetch('https://sheets.googleapis.com/v4/spreadsheets/115xv4g_5lk8u_tPBQqj_f8QnE59oQQwCU2Rbcd_2aik/values/2022?alt=json&key=AIzaSyCqwiqxassrTcxREEM76PUP24qQ5GQFUm0')
  const response = await request.json()
  return response.values.filter((value: string[]) =>
    parseInt(value[0]) > 1500 &&
    value[2] &&
    new Date(value?.[1]) >= subDays(new Date(), 1))
}

export default getHareLine
