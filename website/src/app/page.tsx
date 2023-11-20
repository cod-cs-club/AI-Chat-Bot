import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icon'

// Home page
export default function Home() {
  return (
    <main className="h-[100vh] flex flex-col justify-center items-center bg-bg-1 bg-home-bg bg-blend-darken bg-no-repeat bg-center bg-cover">
      <div className="flex items-start gap-4 p-8 bg-gray-950 rounded-lg">
        <div>
          <h2 className="text-5xl font-bold">WELCOME</h2>
          <p className="my-8 text-lg text-text-2">Let me help you in your journey</p>
          <div className="flex items-center gap-6 mt-4">
            <Link href="/chat" className="flex items-center gap-1 p-2 no-underline font-medium text-lg text-text-1 bg-green-500 rounded-lg">
              <Icon name="chat" />Start
            </Link>
            <Link href="/about" className="text-text-2 hover:underline">Learn more...</Link>
          </div>
        </div>
        <Image src="/logo.png" alt="Logo" width="320" height="320" />
      </div>
    </main>
  )
  // return (
  //   <main className="flex justify-center items-center">
  //     <div className="flex items-start gap-4 p-4 rounded-lg">
  //       <div>
  //         <h2 className="text-5xl font-bold">WELCOME</h2>
  //         <p className="text-lg text-text-2">Let me help you in your journey</p>
  //         <div className="flex items-center gap-4 mt-4">
  //           <Link href="/chat" className="flex items-center gap-1 no-underline font-medium text-lg text-text-1">
  //             <Icon name="chat" />Start
  //           </Link>
  //           <Link href="/about" className="">Learn more...</Link>
  //         </div>
  //       </div>
  //       <Image src="/logo.png" alt="Logo" width="320" height="320" />
  //     </div>
  //   </main>
  // )
}
