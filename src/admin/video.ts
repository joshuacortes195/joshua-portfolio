import { SHRINK_VIDEO_MB } from './config'

// videos wider than this get shrunk, the cards never show them bigger
const MAX_WIDTH = 1280

// turns any video the browser can read, like a QuickTime .mov, into a small mp4 for the site
export async function toMp4(file: File, onProgress: (fraction: number) => void) {
  // the converter is big, so it only loads when a video actually needs converting
  const { Input, Output, Conversion, ALL_FORMATS, BlobSource, Mp4OutputFormat, BufferTarget, QUALITY_MEDIUM } =
    await import('mediabunny')

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
  const track = await input.getPrimaryVideoTrack()
  if (!track) throw new Error('No video found in that file')
  const width = await track.getDisplayWidth()
  // small clips that are already the right kind of video just get repackaged, with no loss in quality
  const shrink = width > MAX_WIDTH || file.size > SHRINK_VIDEO_MB * 1024 * 1024

  // mp4 laid out so it can start playing before it has fully downloaded
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() })
  const conversion = await Conversion.init({
    input,
    output,
    tracks: 'primary',
    // h264 plays everywhere, and the clips are shown at most 1280 wide
    video: shrink ? { codec: 'avc', quality: QUALITY_MEDIUM, ...(width > MAX_WIDTH ? { width: MAX_WIDTH } : {}) } : { codec: 'avc' },
    // project clips play muted, so the sound is dropped to save space
    audio: { discard: true },
    showWarnings: false,
  })
  if (!conversion.isValid) throw new Error("This browser can't convert that video")

  conversion.onProgress = onProgress
  await conversion.execute()

  // same name as the original, with an mp4 ending
  const name = file.name.replace(/\.[^.]+$/, '') + '.mp4'
  return new File([output.target.buffer!], name, { type: 'video/mp4' })
}
