import sqlite3 from "sqlite3"
import cheerio from "cheerio"
import pdf from "pdf-parse-fork"
import { convert } from "html-to-text"
import "colors"

import config from "../config.json"
import "./logger.js"

const db = new sqlite3.Database("./documents.db")

// Reset/create table documents if it doesn't exist
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS documents")
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    url TEXT PRIMARY KEY,
    content TEXT NOT NULL
  )`, (error) => {
    if (error) throw error
    startScraping()
  })
})

export const stats = {
  linksCrawled: 0,
  linksSaved: 0,
}

export let numberOfThreads = 0

// Start creating scraping threads
function startScraping() {
  const threadsLoop = setInterval(() => {
    scrape(1)
    numberOfThreads++
    if (numberOfThreads >= config.numberOfThreads) {
      console.log("Finished creating all threads...".green)
      clearInterval(threadsLoop)
    }
  }, 1000)
}

const links: [string, number][] = config.startingLinks.map(link => [link, 0])
let index = 0

// Function that creates a scraping thread
// exponentialBackoff is the amount of time per thread to wait before scraping again --> measure for slowing down scrape if website complains.
async function scrape(exponentialBackoff: number) {
  if (!links[index]) {
    console.log("Shutting down thread.")
    return
  }

  const url = links[index][0]
  const amountOfRetries = links[index][1]

  index++
  stats.linksCrawled++

  // Exponential backoff
  if (exponentialBackoff > 1) {
    await new Promise(resolve => setTimeout(resolve, exponentialBackoff * 1000))
  }

  try {
    const res = await fetch(url)

    if (url.endsWith(".pdf")) { // Is probably a PDF
      const { text } = await pdf(res)
      db.run("INSERT INTO documents (url, content) VALUES (?, ?)", [url, text])
      stats.linksSaved++
    }
    else { // Is probably a HTML page
      const html = await res.text()
      const $ = cheerio.load(html)
      const mainContent = $("main").html()
      const result = await Promise.resolve(convert(mainContent ? mainContent : html))

      db.run("INSERT INTO documents (url, content) VALUES (?, ?)", [url, result])
      stats.linksSaved++

      // Find all links on page and add them to the links array
      $("a").each((_, element) => {
        let link = $(element).attr("href")

        if (!link) return
        if (link.startsWith("#")) return
        if (link.endsWith(".zip")) return
        
        if (!link.startsWith("http")) { // Is probably a relative URL
          const originURL = res.url.slice(-1) == "/" ? res.url.slice(0, -1) : res.url // Needs to remove trailing slash
          link = originURL + link
        }

        const domain = res.url.split("/")[2]
        if (!config.allowedDomains.includes(domain)) return
        for (let i = 0; i < config.blacklistMatches.length; i++) {
          if (link.includes(config.blacklistMatches[i])) return
        }

        // If link is not already in links array, add it
        if (!links.some(linkArr => linkArr[0] == link)) {
          links.push([link, 0])
        }
      })
    }

    // After successful scrape
    if (exponentialBackoff > 1) {
      scrape(exponentialBackoff / 2)
    } else {
      scrape(exponentialBackoff) //no errors continue scraping immediately
    }
  }
  catch (err) {
    if (!err || typeof err !== "object") return
    if ('code' in err && err.code != "UNABLE_TO_VERIFY_LEAF_SIGNATURE") { //certificate errors are on COD NOT ME!!!!!!!!!!!
      console.error(err)
    }
    if (exponentialBackoff > 32) {
      console.log("Too many errors: you might be accessing COD website too fast. Shutting thread down.",)
    }
    else if (amountOfRetries < 5) {
      links.push([url, amountOfRetries + 1])
      // console.log("too many retries, skipping link.")
    }
    scrape(exponentialBackoff * 2)
  }
}