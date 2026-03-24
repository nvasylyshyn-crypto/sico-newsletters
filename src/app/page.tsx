import Link from 'next/link';

export default function Page() {
  const newsletters = [
    { name: '1H 2025', href: '/1h25/index.html' },
    { name: '1H 2025 (Archive)', href: '/1h2025/index.html' },
    { name: '1H 2024', href: '/1h24/index.html' },
    { name: '2H 2023', href: '/2h23/index.html' },
    { name: '1Q 2023', href: '/1q2023/index.html' },
    { name: '2H 2022', href: '/2h2022/index.html' },
    { name: '1H 2022', href: '/1h2022/index.html' },
    { name: '2H 2020', href: '/2h2020/2h2020-mailshot.html' },
    { name: 'MailShot (Oldest)', href: '/MailShot/index.html' },
  ];

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#003366' }}>SICO Newsletters Archive</h1>
      <p>Select a newsletter to view:</p>
      <ul style={{ lineHeight: '2' }}>
        {newsletters.map((n) => (
          <li key={n.href}>
            <Link href={n.href} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>
              {n.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
