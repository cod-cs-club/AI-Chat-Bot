import sqlite3 from "sqlite3"
import cheerio from "cheerio"
import pdf from "pdf-parse-fork"
import { convert } from "html-to-text"
import "colors"
import fetch from "node-fetch"
import config from "../config.json"
import "./logger.js"
import fs from 'fs'

// reset links.txt
if (fs.existsSync('links.txt')) {
  fs.unlinkSync('links.txt');
}
if (fs.existsSync('skipped_links.txt')) {
  fs.unlinkSync('skipped_links.txt');
}

export const stats = {
  linksCrawled: 0,
  linksSaved: 0,
}

export let numberOfThreads = 0
export let ramUsage = 0

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  ramUsage=(100*memoryUsage.heapUsed/memoryUsage.heapTotal).toFixed(2);
}, 100);

// Start creating scraping threads
function startScraping() {
  const threadsLoop = setInterval(() => {
    scrape(1)
    numberOfThreads++
    if (numberOfThreads >= config.numberOfThreads) {
      console.log("Finished creating all threads...".green)
      clearInterval(threadsLoop)
    }
  }, 3000)
}

var links: [string, number][] = config.startingLinks.map(link => [link, 0])
let index = 0

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

//ignore leaf certificate errors from catalog.cod.edu
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 //DO NOT REMOVE!!! (slightly insecure, but we are assuming the cod website is not a virus)
console.log('\nPlease ignore console messages with "Warning: TT: undefined function: 32"\n')
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
    // Certificate errors in the future can be solved by creating a custom agent that ignore untrusted certificates
    const res = await fetch(url)
    fs.appendFile('links.txt',url+'\n',() => {})
    var contentType = res.headers['content-type']; //dont check if it is a pdf because of incorrect content-type returns...
    if (url.endsWith(".pdf")&&contentType!='text/html'&&contentType!='') { // Is probably a PDF
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
        if (link=="/") return
        if (link.startsWith("#")) return
        if (link.endsWith(".zip")) return
        
        if (!link.startsWith("http")) { // Is probably a relative URL --> build it
          let baseUrl = url.replace(/\.(com|edu).*/, '.$1');
          link = baseUrl + link
        }
        //makes wwww.cod.edu/ and www.cod.edu the same link 
        if(link[-1]=="/"){link = link.slice(0, -1);}
        
        for (let i = 0; i < config.blacklistMatches.length; i++) {
          if (link.includes(config.blacklistMatches[i])) return
        }

        if(!config.allowedDomains.some(substring => link.includes(substring))){ 
          fs.appendFile('skipped_links.txt',link+'\n',() => {})
          return
        }

        //if(/\.(?!html$)[a-zA-Z0-9]+$/.test(link)==true) return //if url is not .html or / then remove

        // If link is not already in links array, add it
        if (!links.some(linkArr => linkArr[0] == link)) {
          links.push([link, 0])
        }
      })
    }

    // After successful scrape
    if (exponentialBackoff > 1) { //no errors continue scraping immediately
      scrape(exponentialBackoff / 2)
    } else {
      scrape(exponentialBackoff)
    }
  }
  catch (err) {
    if(err.code != "UNABLE_TO_VERIFY_LEAF_SIGNATURE"){ //certificate errors are on COD NOT ME!!!!!!!!!!! (every site on catalog.cod.edu has a certificate error...)
    console.log(err)
    console.log(url)
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
}