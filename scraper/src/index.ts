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

// exponentialBackoff is the amount of time per thread to wait before scraping again --> measure for slowing down scrape if website complains.
// It expotentially backs off
async function scrape(exponentialBackoff: number) {
  if (!links[index]) {
    console.log("Shutting down thread.")
    return
  }

  const url = links[index][0]
  const amountOfRetries = links[index][1]

  index++
  stats.linksCrawled++

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
      const result = await Promise.resolve(convert(html))

      db.run("INSERT INTO documents (url, content) VALUES (?, ?)", [url, result])
      stats.linksSaved++

      // Find all links on page and add them to the links array
      $("a").each((_, element) => {
        let link = $(element).attr("href")
        if (!link) return
        if (link.endsWith(".zip")) return
        if (link[0] == "/") { // Is a relative URL
          const originURL = res.url.slice(-1) == "/" ? res.url.slice(0, -1) : res.url // Needs to remove trailing slash
          link = originURL + link
          // console.log(originURL, link)
        }
        // if (link.startsWith("..")) {
        //   link = url + link //check if this is right, might need to cut off the ..
        // }
        try {
          const domain = new URL(link).hostname
          if (!config.allowedDomains.includes(domain)) return
          for (let i = 0; i < config.blacklistMatches.length; i++) {
            if (link.includes(config.blacklistMatches[i])) return
          }

          // If link is not already in links array, add it
          if (!links.some(linkArr => linkArr[0] == link)) {
            links.push([link, 0])
          }
        }
        catch {
          return //not a link
        }
      })
    }
    if (exponentialBackoff != 1) {
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
      return
    }
    if (amountOfRetries < 5) {
      links.push([url, amountOfRetries + 1])
      console.log("too many retries, skipping link.")
    }
    scrape(exponentialBackoff * 2)
  }
}