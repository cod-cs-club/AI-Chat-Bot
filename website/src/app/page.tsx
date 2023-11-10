import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icon'
import styles from './Home.module.scss'

// Home page
export default function Home() {
  return (
    <main className={styles.home}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h2>WELCOME</h2>
          <p>Let me help you in your journey</p>
          <div className={styles.links}>
            <Link href="/chat" className={styles.chat}>
              <Icon name="chat" />Start
            </Link>
            <Link href="/about" className={styles.about}>Learn more...</Link>
          </div>
        </div>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Logo" width="320" height="320" />
        </div>
      </div>
    </main>
  )
}
