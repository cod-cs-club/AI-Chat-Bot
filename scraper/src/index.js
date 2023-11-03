import fetch from "node-fetch";
import fs from "fs";
import cheerio from "cheerio";
import pdf from "pdf-parse-fork";
import { convert } from "html-to-text";
import "colors";
import "./logger.js";
const WHITELIST_DOMAINS = ["www.cod.edu", "catalog.cod.edu"];
const BLACKLIST_MATCHES = [
  "https://www.cod.edu/about/police_department/pdf/incident_reports/",
  "https://www.cod.edu/about/administration/planning_and_reporting_documents/pdf/disbursements",
  "https://www.cod.edu/student_life/resources/counseling/pdf/student_planning/student-planning",
  "https://www.cod.edu/faculty/websites/pearson/documents/student-portfolios/",
  "https://www.cod.edu/about/purchasing",
  // 'dc.cod.edu',
  // 'library.cod.edu'
];

const OUT_FOLDER = "scraped/";

var numberOfThreads = 60;

export const stats = {
  linksCrawled: 0,
  linksSaved: 0,
};
//link=[[url, amountofRetries]]
var links = [
  ["https://www.cod.edu", 0],
  [
    "https://www.cod.edu/student_life/resources/counseling/pdf/student_planning/student-planning-as-21-23.pdf",
    0,
  ],
];
var index = 0;
//exponentialBackoff is the amount of time per thread to wait before scraping again --> measure for slowing down scrape if website complains.
//It expotentially backs off
async function scrape(exponentialBackoff) {
  try {
    try {
      var url = links[index][0];
      var amountOfRetries = links[index][1];
    } catch {
      throw new Error("shutting down thread");
    }
    index++;
    stats.linksCrawled++;
    //console.log(`Fetching ${url}...`)
    const res = await fetch(url, { rejectUnauthorized: false });
    const html = await res.text();
    const $ = cheerio.load(html);

    if (url.endsWith(".pdf")) {
      const data = await pdf(res);
      const urlToFilePath =
        OUT_FOLDER +
        new URL(url).hostname.replace(/\//g, "-") +
        new URL(url).pathname.replace(/\//g, "-") +
        ".txt";
      fs.appendFile(urlToFilePath, url + "\n" + data.text, (err) => {});
      stats.linksSaved++;
    } else {
      //save html page in foler with link
      const urlToFilePath =
        OUT_FOLDER +
        new URL(url).hostname.replace(/\//g, "-") +
        new URL(url).pathname.replace(/\//g, "-") +
        ".txt";
      const result = await Promise.resolve(convert(html));
      fs.appendFile(urlToFilePath, url + "\n" + result, (err) => {});
      stats.linksSaved++;

      $("a").each((_, element) => {
        var link = $(element).attr("href");
        if (!link) {
          return;
        }
        if (link[0] == "/") {
          link = "https://www.cod.edu" + link; //for relative URLs
        }
        if (link.startsWith("..")) {
          link = url + link; //check if this is right, might need to cut off the ..
        }
        if (!link.endsWith(".zip")) {
          try {
            var newUrl = new URL(link);
            if (WHITELIST_DOMAINS.includes(newUrl.hostname)) {
              // Loop through BLACKLIST_MATCHES to check for includes on each individual string, not just generally in BLACKLIST_MATCHES
              for (let i = 0; i < BLACKLIST_MATCHES.length; i++) {
                if (link.includes(BLACKLIST_MATCHES[i])) {
                  return;
                }
              }
              if (!links.includes(link)) {
                links.push([link, amountOfRetries]);
                fs.appendFile('links.txt', link + '\n', (err) => {})
              }
            }
          } catch {
            return; //not a link
          }
        }
      });
    }
    if (exponentialBackoff != 1) {
      scrape(exponentialBackoff / 2);
    } else {
      scrape(exponentialBackoff); //no errors continue scraping immediately
    }
  } catch (err) {
    if(err.code!="UNABLE_TO_VERIFY_LEAF_SIGNATURE"){
    console.error(err);
    }
    if (err == "shutting down thread") {
      return;
    }
    if (exponentialBackoff > 32) {
      console.log("Too many errors: you might be accessing COD website too fast. Shutting thread down.",);
    } else {
      if (amountOfRetries < 5) {
        links.push([url, amountOfRetries + 1]);
        console.log("too many retries, skipping link.");
      }
      scrape(exponentialBackoff * 2);
    }
  }
}

//boot 60 scraping threads --> in the future maybe, depending on ram check how many concurrent requests can be made and go from there
var threads = setInterval(function () {
  console.log("starting thread...");
  scrape(1);
  numberOfThreads--;
  if (numberOfThreads == 0) {
    clearInterval(threads);
  }
}, 1000);
