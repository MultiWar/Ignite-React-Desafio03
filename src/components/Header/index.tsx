import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './header.module.scss'

export default function Header() {
  const router = useRouter()
  const alternativeClass = router?.asPath === '/' ? styles.alternative : ''
  // TODO
  return (
    <header className={`${styles.headerContent} ${alternativeClass}`}>
      <Link href='/'>
        <a>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
