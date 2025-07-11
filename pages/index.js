export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Teleflix</h1>
      <p>Stream and download your favorite movies, TV series, and anime.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Browse Content</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
          <a href="/movies" style={{ background: 'blue', color: 'white', padding: '10px', textAlign: 'center', textDecoration: 'none' }}>
            Movies
          </a>
          <a href="/series" style={{ background: 'green', color: 'white', padding: '10px', textAlign: 'center', textDecoration: 'none' }}>
            Series
          </a>
          <a href="/anime" style={{ background: 'purple', color: 'white', padding: '10px', textAlign: 'center', textDecoration: 'none' }}>
            Anime
          </a>
          <a href="/recent" style={{ background: 'orange', color: 'white', padding: '10px', textAlign: 'center', textDecoration: 'none' }}>
            Recent
          </a>
        </div>
      </div>
    </div>
  )
}