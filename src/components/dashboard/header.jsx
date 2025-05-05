'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/mode-toggle'
import { Bell, Menu, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

export default function Header({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout } = useAuth()
  const [notify,setNotify]=useState([])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  const token= localStorage.getItem('token')

  useEffect(()=>{
    async function fetchNotifycations() {
      // Fetch notifications from the server
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response.data);
      setNotify(response.data.notifications)
    }
    fetchNotifycations()
  },[])

  function timeDifference(dateString) {
    const givenDate = new Date(dateString);
    const now = new Date();

    const timeDiffMillis = now - givenDate; // Difference in milliseconds

    const secondsInHour = 3600 * 1000;
    const secondsInDay = 24 * secondsInHour;
    const secondsInMonth = 30 * secondsInDay; // Approximate
    const secondsInYear = 365 * secondsInDay; // Approximate

    if (timeDiffMillis < secondsInHour) {
        const hours = Math.floor(timeDiffMillis / (1000 * 60 * 60));
        return `${hours} hours ago`;
    } else if (timeDiffMillis < secondsInMonth) {
        const days = Math.floor(timeDiffMillis / secondsInDay);
        return `${days} days ago`;
    } else if (timeDiffMillis < secondsInYear) {
        const months = Math.floor(timeDiffMillis / secondsInMonth);
        return `${months} months ago`;
    } else {
        const years = Math.floor(timeDiffMillis / secondsInYear);
        return `${years} years ago`;
    }
}

// const dateStr = "2025-05-03T08:58:29.954Z";
// console.log(timeDifference(dateStr));

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">{console.log(mobileMenuOpen)
            }
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            
            { !mobileMenuOpen ? <Menu />: <X size={20} onClick={()=>setMobileMenuOpen(false)} />  }
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">TMS</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                 {notify.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notify.map((n,i)=>(

                <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3" key={n._id}>
                  <div className="font-medium">{n.message}</div>
                  <div className="text-sm text-muted-foreground">{timeDifference(n.updatedAt)} </div>
                </DropdownMenuItem>
                ))}
                {/* <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                  <div className="font-medium">Task deadline approaching</div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                  <div className="font-medium">Comment on your task</div>
                  <div className="text-sm text-muted-foreground">3 hours ago</div>
                </DropdownMenuItem> */}
              </div>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem className="flex cursor-pointer justify-center font-medium text-primary">
                View all notifications
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard/profile" className="flex w-full items-center">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/settings" className="flex w-full items-center">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}