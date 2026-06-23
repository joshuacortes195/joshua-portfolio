import { gameList, type GameEntry } from '../data/games'

function GamePanelRow({
  game,
  index,
  total,
}: {
  game: GameEntry
  index: number
  total: number
}) {
  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Background */}
      {game.banner ? (
        <img
          src={game.banner}
          alt=""
          aria-hidden="true"
          loading={index < 2 ? 'eager' : 'lazy'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            filter: 'brightness(0.45) saturate(1.1)',
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 60% 40%, ${game.themeColor}55 0%, #050a0e 65%)`,
          }}
        />
      )}

      {/* Cinematic gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Colored left accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: game.themeColor,
          opacity: 0.8,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          padding: '0 2.5rem 2.5rem 2.5rem',
          paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))',
        }}
      >
        <p
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: game.themeColor,
            marginBottom: '0.6rem',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#FFFFFF',
            textShadow: `0 0 60px ${game.themeColor}70, 0 2px 10px rgba(0,0,0,0.9)`,
          }}
        >
          {game.title}
        </h2>
      </div>

      {/* Scroll arrow */}
      {index < total - 1 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '2rem',
            bottom: '2rem',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '1.2rem',
            pointerEvents: 'none',
            animation: 'scrollBounce 2s ease-in-out infinite',
          }}
        >
          ↓
        </div>
      )}
    </div>
  )
}

export default function VideoGamesPanel() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Persistent section label */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '1.1rem 2.5rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          pointerEvents: 'none',
        }}
      >
        video games I play
      </div>

      {/* Snap scroll container */}
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {gameList.map((game, i) => (
          <GamePanelRow
            key={game.id}
            game={game}
            index={i}
            total={gameList.length}
          />
        ))}
      </div>
    </div>
  )
}
