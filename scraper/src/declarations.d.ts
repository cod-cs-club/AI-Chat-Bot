// Some packages we're using don't have type definitions available, so we need to add them

declare module "html-to-text" {
  export function convert(html: string, options?: any, metadata?: any): string
}

declare module "pdf-parse-fork" {
  export default async function (dataBuffer: Response | string, options?: any): Promise<{
    numpages: number,
    numrender: number,
    text: string,
  }>
}