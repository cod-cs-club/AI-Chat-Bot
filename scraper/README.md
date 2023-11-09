# AI Chat Bot - Web Scraper
A Node.js application that crawls COD's website and compiles all relevant text into markdown format and stores it into a `documents.db` sqlite database file.

## Requirements
- `Node.js` >= v18

## Run Application
To start the application, simply run `npm start`.

## Configuration
To easily change the behavior of the scraper, edit the `config.json` file.

- `numberOfThreads`: The maxiumum amount of scraping threads at one time, might need to be adjusted based off computer specs or desired speed. (Type: number)
- `startingLinks`: List of links from where the application will start crawling from. (Type: string[])
- `whitelistDomains`: List of domains that the application is allowed to scrape, if a page references a domain not in the list, it will ignore it. (Type: string[])
- `blacklistMatches`: List of blacklisted text matches, if any part of a link contains text from this list, it will be ignored. (Type: string[])

## Database
The output `documents.db` file is a sqlite database file with a table named `documents` with the following fields:
- `url`: The full link to the page where the text was scraped from. (Type: TEXT, Primary key)
- `content`: The converted content from that page in markdown format. (Type: TEXT)