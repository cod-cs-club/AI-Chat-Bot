import fetch from 'node-fetch'
import fs from 'fs'
import cheerio from 'cheerio'

const baseUrl = 'https://www.cod.edu'
const allLinks = new Set()

const WHITELIST_DOMAINS = [
  'www.cod.edu',
  'catalog.cod.edu'
]

const BLACKLIST_MATCHES = [
  'https://www.cod.edu/about/police_department/pdf/incident_reports/',
  'https://www.cod.edu/about/administration/planning_and_reporting_documents/pdf/disbursements',
  'https://www.cod.edu/student_life/resources/counseling/pdf/student_planning/student-planning',
  'https://www.cod.edu/faculty/websites/pearson/documents/student-portfolios/',
  'https://www.cod.edu/about/purchasing'
  // 'dc.cod.edu',
  // 'library.cod.edu'
]

async function scrape(url, retry) {
  try {
    // console.log(`Fetching ${url}...`)
    const res = await fetch(url, { rejectUnauthorized: false })
    const html = await res.text()
    const $ = cheerio.load(html)
    const links = []

    $('a').each((_, element) => {
      let link = $(element).attr('href')
      if (link[0] == '/') {
        link = baseUrl + link
      }
      if (link.startsWith('..')) {
        link = url + link
      }
      try {
        if (!link.startsWith('http') || link.endsWith('.zip')) {
          return
        }
        const newUrl = new URL(link)
        
        if (!WHITELIST_DOMAINS.includes(newUrl.hostname)) {
          return
        }
        // Loop through BLACKLIST_MATCHES with a for loop and check if link is included in a blacklist match
        for (let i = 0; i < BLACKLIST_MATCHES.length; i++) {
          if (link.includes(BLACKLIST_MATCHES[i])) {
            return
          }
        }
        if (link.includes('.pdf')) {
          fs.appendFile('links.txt', link + '\n', (err) => {})
          return
        }
        if (!allLinks.has(link)) {
          allLinks.add(link)
          fs.appendFile('links.txt', link + '\n', (err) => {})
          scrape(link, 1000)
        }
      } catch (error) {
        console.log('Not a link: ' + link)
      }
    })
  } catch (err) {
    // console.error(err) // errors confusing, so commented out
    setTimeout(() => {
      if (retry < 32000) {
        scrape(url, retry * 2)
        return
      }
      console.log('too many retries, skipping link.')
    }, retry) //wait 5 seconds and retry if there is an error
  }
}

scrape(baseUrl,1000)
scrape('https://www.cod.edu/student_life/resources/counseling/pdf/student_planning/student-planning-as-21-23.pdf', 1000)