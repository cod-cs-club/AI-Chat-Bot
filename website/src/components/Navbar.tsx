'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icon'
import styles from './Navbar.module.scss'

const links = [
  { name: 'Home', href: '/', icon: <Icon name="home" /> },
  { name: 'Chat', href: '/chat', icon: <Icon name="chat" /> },
  { name: 'About', href: '/about', icon: <Icon name="info" /> },
]

// Global navbar/header component
export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <Image src="/logo.png" alt="Logo" width="40" height="40" />
        <h1><span>COD</span>GPT</h1>
      </Link>
      <nav className={styles.navLinks}>
        {links.map(link => (
          <Link
            key={link.name}
            href={link.href}
            className={pathname === link.href ? styles.active : undefined}
          >{link.icon}{link.name}</Link>
        ))}
      </nav>
    </header>
  )
}