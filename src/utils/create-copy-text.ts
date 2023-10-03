import { ICurrentRun } from './currentRun'

const copyRunDetailsToClipboard = async (runInfo: ICurrentRun) => {
  const runInfoString = `
    Run: ${runInfo.number}
    Date: ${runInfo.date}
    Start Time: ${runInfo.startTime}!!!
    Location: ${runInfo.runSiteName}
    Hares: ${runInfo.hares}
    Occasion: ${runInfo.occasion}
    Coordinates: ${runInfo.coordinates.join(' ')}
    Google maps: ${runInfo.googleMapsLink}
    ${runInfo.remark}`

  try {
    await navigator.clipboard.writeText(runInfoString)
    console.log('Content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

export default copyRunDetailsToClipboard
