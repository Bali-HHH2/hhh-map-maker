import isInCurrentWeek from './isInCurrentWeek'
import { Ref } from 'vue'
import { convert } from 'geo-coordinates-parser'

export interface ICurrentRun {
  number: string
  date: string
  hares: string
  googleMapsLink: string
  occasion: string
  runSiteName: string
  coordinates: any
  filteredHareLine: string[]
  startTime: string
  remark: string
}

const currentRun = (hareLine: Ref) => {
  const currentRun = hareLine.value.find((e: string[]) =>
    isInCurrentWeek(new Date(e?.[1]))
  )
  return formRunObject(currentRun, hareLine)
}

// Coordinates are [longitude, latitude].
const parseCoordinates = (text: string): string[] => {
  const converted = convert(text)
  return [converted.verbatimLongitude, converted.verbatimLatitude]
}

const googleMapsLink = (coordinates: string[] | null) =>
  coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
    : '#'

const formRunObject = (currentRun: string[], hareLine: Ref): ICurrentRun => {
  const coordinates = currentRun[5] ? parseCoordinates(currentRun[5]) : null
  const number = currentRun[0] || '?'
  const date = currentRun[1] || '?'
  const hares = currentRun[2] || '?'
  const occasion = currentRun[3]
  const runSiteName = currentRun[4] || 'Waiting on hares...'
  const startTime = currentRun[6] || '?'
  const remark = currentRun[7] || ''
  document.title = `BHHH2 Run #${number} - ${runSiteName}`
  return {
    number,
    date,
    hares,
    googleMapsLink: googleMapsLink(coordinates),
    occasion,
    runSiteName,
    coordinates,
    filteredHareLine: hareLine.value?.slice(1),
    startTime,
    remark
  }
}

export { currentRun, formRunObject }
