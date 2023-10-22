import fetch from 'node-fetch'
import fs from 'fs'
import cheerio from 'cheerio'
import 'colors'

console.clear()
console.log('Starting scraper...'.gray)

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

const stats = {
  linksCrawled: 0,
  linksSaved: 0,
  linksSkipped: 0,
}

async function scrape(url, retrySeconds) {
  try {
    // console.log(`Fetching ${url}...`)
    stats.linksCrawled++

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
          stats.linksSaved++
          scrape(link, 1)
        }
      } catch (error) {
        console.log('Not a link: ' + link)
        stats.linksSkipped++
      }
    })
  } catch (err) {
    // console.error(err) // errors confusing, so commented out
    setTimeout(() => {
      if (retrySeconds < 32) {
        scrape(url, retrySeconds * 2)
        return
      }
      console.log('too many retries, skipping link.')
    }, retrySeconds * 1000)
  }
}

scrape(baseUrl,1)
scrape('https://www.cod.edu/student_life/resources/counseling/pdf/student_planning/student-planning-as-21-23.pdf', 1)

// Prints status message
function printStats() {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(
    'Scraping...'.gray +
    ` ${stats.linksCrawled} crawled`.cyan +
    ` ${stats.linksSaved} saved`.green +
    ` ${stats.linksSkipped} skipped`.yellow
  )
  process.stdout.cursorTo(0)
}

// Print status 20 times per second
setInterval(printStats, 50)