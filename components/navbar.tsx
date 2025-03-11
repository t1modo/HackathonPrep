"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, FileText, Upload, Settings, LogOut, User } from "lucide-react"

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">826 Valencia</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex md:gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/feedback">
              <Button variant="ghost" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Feedback
              </Button>
            </Link>
            <Link href="/submissions">
              <Button variant="ghost" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Submissions
              </Button>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.email}
                <div className="text-xs text-muted-foreground">
                  {user?.role === "teacher" ? "Teacher/Admin" : "Student"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

