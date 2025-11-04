import { ICurrentRun } from './currentRun'

const copyRunDetailsToClipboard = async (runInfo: ICurrentRun) => {
  const runInfoString = `
    Map: https://map.balihash2.com/
    Run: ${runInfo.number}
    Date: ${runInfo.date}
    Start Time: ${runInfo.startTime}!!!
    Location: ${runInfo.runSiteName}
    Hares: ${runInfo.hares}
    Occasion: ${runInfo.occasion}
    Coordinates: ${runInfo.coordinates[1]} ${runInfo.coordinates[0]}
    Google maps: ${runInfo.googleMapsLink}
    ${runInfo.remark}`.trim()

  try {
    await navigator.clipboard.writeText(dontIndent(runInfoString))
    console.log('Content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

export default copyRunDetailsToClipboard

function dontIndent(str: string) {
  return ('' + str).replace(/(\n)\s+/g, '$1')
}
