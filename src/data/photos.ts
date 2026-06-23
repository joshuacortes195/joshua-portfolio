export interface PhotoAlbum {
  id: string
  title: string
  photos: string[]
}

export const albums: PhotoAlbum[] = [
  {
    id: 'hawaii',
    title: 'Hawaii',
    photos: [
      '/photos/hawaii/DSC00383.jpg',
      '/photos/hawaii/DSC00390.jpg',
      '/photos/hawaii/DSC00547.jpg',
      '/photos/hawaii/DSC00853.jpg',
      '/photos/hawaii/DSC00862.jpg',
      '/photos/hawaii/DSC00957.jpg',
      '/photos/hawaii/DSC00976.jpg',
      '/photos/hawaii/DSC01059.jpg',
      '/photos/hawaii/DSC01137.jpg',
      '/photos/hawaii/DSC01149.jpg',
      '/photos/hawaii/DSC01210.jpg',
      '/photos/hawaii/DSC01290.jpg',
      '/photos/hawaii/DSC01297.jpg',
      '/photos/hawaii/DSC01298.jpg',
    ],
  },
  {
    id: 'gma-bday',
    title: 'Gma Bday',
    photos: [
      '/photos/gma-bday/DSC01361.jpg',
      '/photos/gma-bday/DSC01368.jpg',
      '/photos/gma-bday/DSC01369.jpg',
      '/photos/gma-bday/DSC01378.jpg',
      '/photos/gma-bday/DSC01384.jpg',
      '/photos/gma-bday/DSC01393.jpg',
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    photos: [
      '/photos/animals/IMG_8368.JPG',
      '/photos/animals/IMG_8398.JPG',
      '/photos/animals/IMG_8439.JPG',
      '/photos/animals/IMG_8442.JPG',
      '/photos/animals/IMG_8445.JPG',
      '/photos/animals/IMG_8466.JPG',
      '/photos/animals/IMG_8479.JPG',
      '/photos/animals/IMG_8485.JPG',
      '/photos/animals/IMG_8489.JPG',
      '/photos/animals/IMG_8495.JPG',
    ],
  },
]
