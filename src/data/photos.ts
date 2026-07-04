export interface Photo {
  src: string
  width: number
  height: number
  /** Camera settings shown in the lightbox, extracted from EXIF */
  exif?: string
}

const A7IV = 'Sony α7 IV'
const EOS7D = 'Canon EOS 7D'

// All non-animal photos displayed together under the "Photos" tab
export const generalPhotos: Photo[] = [
  // Hawaii
  { src: '/photos/hawaii/DSC00383.jpg', width: 1920, height: 1283, exif: `${A7IV} · 31mm · f/8 · 1/40s · ISO 100` },
  { src: '/photos/hawaii/DSC00390.jpg', width: 1920, height: 1280, exif: `${A7IV} · 28mm · f/2.8 · 30s · ISO 800` },
  { src: '/photos/hawaii/DSC00547.jpg', width: 1920, height: 1031, exif: `${A7IV} · 41mm · f/8 · 1/640s · ISO 800` },
  { src: '/photos/hawaii/DSC00853.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/8 · 1/160s · ISO 100` },
  { src: '/photos/hawaii/DSC00862.jpg', width: 1920, height: 1280, exif: `${A7IV} · 28mm · f/8 · 1/160s · ISO 100` },
  { src: '/photos/hawaii/DSC00957.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/2.8 · 1/500s · ISO 100` },
  { src: '/photos/hawaii/DSC00976.jpg', width: 1920, height: 1280, exif: `${A7IV} · 28mm · f/8 · 1/160s · ISO 100` },
  { src: '/photos/hawaii/DSC01059.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/2.8 · 1/40s · ISO 2500` },
  { src: '/photos/hawaii/DSC01137.jpg', width: 1280, height: 1920, exif: `${A7IV} · 36mm · f/2.8 · 1/5000s · ISO 800` },
  { src: '/photos/hawaii/DSC01149.jpg', width: 1920, height: 1280, exif: `${A7IV} · 28mm · f/4.5 · 1/250s · ISO 100` },
  { src: '/photos/hawaii/DSC01210.jpg', width: 1280, height: 1920, exif: `${A7IV} · 28mm · f/4 · 1/60s · ISO 160` },
  { src: '/photos/hawaii/DSC01290.jpg', width: 1920, height: 1280, exif: `${A7IV} · 74mm · f/2.8 · 1/6s · ISO 800` },
  { src: '/photos/hawaii/DSC01297.jpg', width: 1920, height: 1280, exif: `${A7IV} · 73mm · f/2.8 · 1/8s · ISO 2000` },
  { src: '/photos/hawaii/DSC01298.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/2.8 · 1/8s · ISO 2000` },
  { src: '/photos/hawaii/IMG_8862.jpg', width: 1920, height: 1466, exif: `${EOS7D} · 141mm · f/16 · 30s · ISO 100` },
  // Gma Bday
  { src: '/photos/gma-bday/DSC01361.jpg', width: 1920, height: 1134, exif: `${A7IV} · 75mm · f/2.8 · 1/200s · ISO 800` },
  { src: '/photos/gma-bday/DSC01369.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/2.8 · 1/4000s · ISO 800` },
  { src: '/photos/gma-bday/DSC01378.jpg', width: 1920, height: 1280, exif: `${A7IV} · 75mm · f/2.8 · 1/250s · ISO 800` },
  { src: '/photos/gma-bday/DSC01384.jpg', width: 1920, height: 1280, exif: `${A7IV} · 49mm · f/2.8 · 1/320s · ISO 800` },
  { src: '/photos/gma-bday/DSC01393.jpg', width: 1920, height: 1151, exif: `${A7IV} · 75mm · f/2.8 · 1/400s · ISO 800` },
  // General
  { src: '/photos/general/DSC01448.jpg', width: 1920, height: 1536, exif: `${A7IV} · 455mm · f/6.3 · 1/400s · ISO 100` },
  { src: '/photos/general/DSC01449.jpg', width: 1920, height: 1536, exif: `${A7IV} · 500mm · f/6.7 · 1/3200s · ISO 800` },
  { src: '/photos/general/DSC01454.jpg', width: 1920, height: 1536, exif: `${A7IV} · 500mm · f/6.7 · 1/3200s · ISO 800` },
  { src: '/photos/general/DSC01460.jpg', width: 1536, height: 1920, exif: `${A7IV} · 500mm · f/6.7 · 1/3200s · ISO 800` },
  { src: '/photos/general/DSC01476.jpg', width: 1920, height: 1536, exif: `${A7IV} · 45mm · f/2.8 · 1/800s · ISO 100` },
  { src: '/photos/general/DSC01479.jpg', width: 1536, height: 1920, exif: `${A7IV} · 28mm · f/2.8 · 1/500s · ISO 100` },
  { src: '/photos/general/DSC01480.jpg', width: 1536, height: 1920, exif: `${A7IV} · 75mm · f/2.8 · 1/250s · ISO 100` },
  { src: '/photos/general/DSC01482.jpg', width: 1536, height: 1920, exif: `${A7IV} · 75mm · f/2.8 · 1/1250s · ISO 100` },
  { src: '/photos/general/DSC01500.jpg', width: 1920, height: 1715, exif: `${A7IV} · 500mm · f/6.7 · 1/320s · ISO 100` },
]

// Animals — shown on its own tab
export const animalPhotos: Photo[] = [
  { src: '/photos/animals/IMG_8368.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 135mm · f/5 · 1/500s · ISO 640` },
  { src: '/photos/animals/IMG_8398.JPG', width: 1920, height: 1401, exif: `${EOS7D} · 259mm · f/5.6 · 1/2000s · ISO 800` },
  { src: '/photos/animals/IMG_8439.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 176mm · f/4.5 · 1/4000s · ISO 640` },
  { src: '/photos/animals/IMG_8442.JPG', width: 1920, height: 1308, exif: `${EOS7D} · 300mm · f/5.6 · 1/6400s · ISO 640` },
  { src: '/photos/animals/IMG_8445.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 300mm · f/5.6 · 1/3200s · ISO 500` },
  { src: '/photos/animals/IMG_8466.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 300mm · f/6.3 · 1/1250s · ISO 1000` },
  { src: '/photos/animals/IMG_8479.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 238mm · f/6.3 · 1/320s · ISO 640` },
  { src: '/photos/animals/IMG_8485.JPG', width: 1920, height: 1325, exif: `${EOS7D} · 209mm · f/6.3 · 1/1600s · ISO 800` },
  { src: '/photos/animals/IMG_8489.JPG', width: 1920, height: 1280, exif: `${EOS7D} · 218mm · f/6.3 · 1/1000s · ISO 800` },
  { src: '/photos/animals/IMG_8495.JPG', width: 1920, height: 1362, exif: `${EOS7D} · 300mm · f/6.3 · 1/4000s · ISO 800` },
]
