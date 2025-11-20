import { Code, House, Mail, PanelsTopLeft, User } from "lucide-react"
import Link from "next/link"

const Navbar = () => {
  return (
    <div className="absolute right-0 w-15 h-svh flex flex-col items-center justify-center space-y-6 p-4">
      <Link href=""><House /></Link>
      <Link href=""><User /></Link>
      <Link href=""><Code /></Link>
      <Link href=""><PanelsTopLeft /></Link>
      <Link href=""><Mail /></Link>
    </div>
  )
}

export default Navbar