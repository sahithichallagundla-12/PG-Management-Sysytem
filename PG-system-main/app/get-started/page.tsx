"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Users, Shield, ArrowLeft, ArrowRight, Eye, EyeOff, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

type PortalType = "owner" | "tenant" | "service" | null

export default function GetStartedPage() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const portals = [
    {
      id: "owner" as const,
      title: "Owner Portal",
      description: "Manage your PG property, tenants, payments, and complaints",
      icon: Building2,
      color: "bg-primary",
    },
    {
      id: "tenant" as const,
      title: "Tenant Portal",
      description: "Access your room details, food menu, payments, and raise complaints",
      icon: Users,
      color: "bg-primary",
    },
    {
      id: "service" as const,
      title: "Service Portal",
      description: "Handle complaints, assign workers, and track service requests",
      icon: Shield,
      color: "bg-primary",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = await login(email, password)
    if (result.success) {
      if (selectedPortal === "owner") {
        router.push("/owner")
      } else if (selectedPortal === "service") {
        router.push("/service")
      } else {
        router.push("/tenant")
      }
    } else {
      setError(result.error || "Login failed")
    }
    setIsLoading(false)
  }

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = await login(userEmail, userPassword)
    if (result.success) {
      if (selectedPortal === "owner") {
        router.push("/owner")
      } else if (selectedPortal === "service") {
        router.push("/service")
      } else {
        router.push("/tenant")
      }
    } else {
      setError(result.error || "Login failed")
    }
    setIsLoading(false)
  }

  const selectedPortalData = portals.find((p) => p.id === selectedPortal)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">SmartPG</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="text-foreground hover:bg-muted">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <main className="flex flex-col items-center px-6 py-12">
        {!selectedPortal ? (
          <>
            {/* Portal Selection */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Choose Your Portal
              </h1>
              <p className="mt-3 text-muted-foreground">
                Select the portal that matches your role
              </p>
            </div>

            <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
              {portals.map((portal) => {
                const Icon = portal.icon
                return (
                  <Card
                    key={portal.id}
                    className="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] group"
                    onClick={() => setSelectedPortal(portal.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${portal.color}`}>
                        <Icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl text-card-foreground">{portal.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-muted-foreground">
                        {portal.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center justify-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Enter Portal
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Platform Statistics */}
            <div className="mt-12 w-full max-w-2xl rounded-xl border border-border bg-card/50 p-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
                Platform Statistics
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#4F7C82]">116</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Residents</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#4F7C82]">44</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Managed Rooms</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Login Form */}
            <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-500">
              <Button
                variant="ghost"
                className="mb-6 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedPortal(null)
                  setEmail("")
                  setPassword("")
                  setError("")
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portal Selection
              </Button>

              <Card>
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${selectedPortalData?.color}`}>
                    {selectedPortalData && <selectedPortalData.icon className="h-8 w-8 text-primary-foreground" />}
                  </div>
                  <CardTitle className="text-2xl text-card-foreground">
                    {selectedPortalData?.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Sign in to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-input text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-input text-foreground placeholder:text-muted-foreground"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  {/* Login assistance note */}
                  <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground">
                      Use your registered email and password to access the {selectedPortalData?.title}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
