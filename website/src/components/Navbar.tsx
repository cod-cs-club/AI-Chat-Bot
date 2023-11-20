'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icon'
// import styles from './Navbar.module.scss'

const links = [
  { name: 'Home', href: '/', icon: <Icon name="home" /> },
  { name: 'Chat', href: '/chat', icon: <Icon name="chat" /> },
  { name: 'About', href: '/about', icon: <Icon name="info" /> },
]

// Global navbar/header component
export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed z-10 top-0 left-0 w-full h-navbar-height flex justify-between items-center gap-1 py-0 px-4 bg-black-900 overflow-hidden">
      <h1 className="tracking-wide text-2xl font-bold">ChapGPT</h1>
      <nav className="flex items-center h-full">
        {links.map(link => (
          <Link
            key={link.name}
            href={link.href}
            className={pathname === link.href ? "flex items-center gap-1 h-full px-2 decoration-none font-bold" : "flex items-center gap-1 h-full px-2 decoration-none"}
          >{link.icon}{link.name}</Link>
        ))}
      </nav>
    </header>
  )
}