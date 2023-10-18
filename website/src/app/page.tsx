import Image from 'next/image'
import styles from './Home.module.scss'

// Home page
export default function Home() {
  return (
    <main className={styles.home}>
      <img src="/logo.png" alt="Logo" width="50" height="50" />
      <h1>Hello World!</h1>
    </main>
  )
}
