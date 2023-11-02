import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icon'
import styles from './Home.module.scss'

// Home page
export default function Home() {
  return (
    <main className={styles.home}>
      <div className={styles.card}>
        <div className={styles.left}>
          <Image src="/logo.png" alt="Logo" width="80" height="80" />
        </div>
        <div className={styles.right}>
          <h1><span>COD</span>GPT</h1>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex, obcaecati rerum ratione sit magnam aspernatur?</p>
          <div className={styles.links}>
            <Link href="/chat" className={styles.chat}>
              <Icon name="chat" />
              Start Chat &rarr;
            </Link>
            <Link href="/about" className={styles.about}>Learn More</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
