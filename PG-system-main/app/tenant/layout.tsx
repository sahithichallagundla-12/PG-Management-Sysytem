"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Utensils,
  AlertCircle,
  Users,
  CreditCard,
  Home,
  LogOut,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/tenant", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenant/food", label: "Food Menu", icon: Utensils },
  { href: "/tenant/complaints", label: "Complaints", icon: AlertCircle },
  { href: "/tenant/roommates", label: "Roommates", icon: Users },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/tenant/room", label: "My Room", icon: Home },
]

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || currentUser?.role?.toLowerCase() !== "tenant") {
        router.push("/get-started")
      }
    }
  }, [isAuthenticated, currentUser, router, loading])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated || currentUser?.role !== "tenant") {
    return null
  }

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2.5 border-b border-border/30 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F7C82] to-[#0B2E33] shadow-sm">
          <Building2 className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="font-semibold text-[#0B2E33]">Tenant Portal</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#4F7C82]/10 text-[#4F7C82] hover:bg-[#4F7C82]/15 font-semibold"
                    : "hover:bg-[#B8E3E9]/15 text-[#5F7A7E] hover:text-[#1F2D2F]"
                }`}
              >
                <item.icon className="mr-3 h-[18px] w-[18px]" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border/30 p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-[#1F2D2F]">{currentUser?.name}</p>
          <p className="text-xs text-[#5F7A7E]">{currentUser?.email}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-[#5F7A7E] hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/30 bg-white/70 backdrop-blur-xl px-4 py-3 lg:hidden">
        <Link href="/tenant" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F7C82] to-[#0B2E33]">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[#0B2E33]">Tenant Portal</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#5F7A7E]">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#F7FAFB]">
            <div className="flex h-full flex-col">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-border/30 bg-white/50 backdrop-blur-md lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <NavContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
