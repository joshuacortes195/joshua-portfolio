export interface GameEntry {
  id: string
  title: string
  banner: string | null
  themeColor: string
}

export const gameList: GameEntry[] = [
  {
    id: 'rainbow-six-siege',
    title: 'Rainbow Six Siege',
    banner: '/games/rainbow-six-siege/banner.jpg',
    themeColor: '#C0392B',
  },
  {
    id: 'league-of-legends',
    title: 'League of Legends',
    banner: '/games/league-of-legends/banner.jpg',
    themeColor: '#C8AA6E',
  },
  {
    id: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima',
    banner: '/games/ghost-of-tsushima/banner.jpg',
    themeColor: '#C62828',
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    banner: '/games/minecraft/banner.jpg',
    themeColor: '#5D8A2B',
  },
  {
    id: 'apex-legends',
    title: 'Apex Legends',
    banner: '/games/apex-legends/banner.jpg',
    themeColor: '#DA292A',
  },
  {
    id: 'fortnite',
    title: 'Fortnite',
    banner: '/games/fortnite/banner.jpg',
    themeColor: '#7928CA',
  },
  {
    id: 'pokemon',
    title: 'Pokémon Gen I – VII',
    banner: null,
    themeColor: '#FFCB05',
  },
  {
    id: 'cod-black-ops-3',
    title: 'Call of Duty: Black Ops 3',
    banner: '/games/cod-black-ops-3/banner.jpg',
    themeColor: '#00A3FF',
  },
  {
    id: 'super-mario-bros',
    title: 'Super Mario Bros',
    banner: null,
    themeColor: '#E04000',
  },
  {
    id: 'super-mario-galaxy',
    title: 'Super Mario Galaxy',
    banner: null,
    themeColor: '#1A237E',
  },
  {
    id: 'skylanders',
    title: 'Skylanders',
    banner: '/games/skylanders/banner.jpg',
    themeColor: '#27AE60',
  },
  {
    id: 'halo-reach',
    title: 'Halo: Reach',
    banner: '/games/halo-reach/banner.jpg',
    themeColor: '#00B4CC',
  },
  {
    id: 'star-wars-jedi-survivor',
    title: 'Star Wars Jedi: Survivor',
    banner: '/games/star-wars-jedi-survivor/banner.jpg',
    themeColor: '#FF6B00',
  },
  {
    id: 'super-smash-bros',
    title: 'Super Smash Bros',
    banner: '/games/super-smash-bros/banner.jpg',
    themeColor: '#E50000',
  },
]
