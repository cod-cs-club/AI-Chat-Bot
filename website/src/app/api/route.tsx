// import fetch from 'node-fetch';
import { NextRequest, NextResponse } from "next/server";
export async function OPTIONS(req: NextRequest) {
return NextResponse.json({status: 200})
}
export async function POST(req: NextRequest) {
    try {
      const data = await req.text();
      
      var response=fetch('http://127.0.0.1:5000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      })

      if(!((await response).status)) throw new Error(`HTTP error!`);
      return NextResponse.json((await(await response).text()) , {status: 200});
    } catch (error) {
      console.error('Error processing the request:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, {status: 500});
    }
  }
  