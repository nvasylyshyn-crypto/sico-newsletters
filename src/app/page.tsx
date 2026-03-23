export default function Page() {
  const newsletters = [
    { name: '1H 2025', path: '1h25/' },
    { name: '1H 2025 (Archive)', path: '1h2025/' },
    { name: '1H 2024', path: '1h24/' },
    { name: '2H 2023', path: '2h23/' },
    { name: '1Q 2023', path: '1q2023/' },
    { name: '2H 2022', path: '2h2022/' },
    { name: '1H 2022', path: '1h2022/' },
    { name: '2H 2020', path: '2h2020/2h2020-mailshot' },
    { name: 'MailShot (Oldest)', path: 'MailShot/' },
  ];

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#003366' }}>SICO Newsletters Archive</h1>
      <p>Select a newsletter to view:</p>
      <ul style={{ lineHeight: '2' }}>
        {newsletters.map((n) => (
          <li key={n.path}>
            <a href={'/newsletters/' + n.path} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>
              {n.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
