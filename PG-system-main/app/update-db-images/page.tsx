"use client"

import { useEffect, useState } from "react"

export default function UpdateDBImagesPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function updateImages() {
      try {
        const response = await fetch("/api/update-images")
        const data = await response.json()
        
        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to update")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Network error")
      }
    }
    
    updateImages()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === "loading" && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Updating database images...</p>
          </div>
        )}
        
        {status === "success" && (
          <div>
            <div className="h-12 w-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <a href="/find-pgs" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
              View PGs
            </a>
          </div>
        )}
        
        {status === "error" && (
          <div>
            <div className="h-12 w-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error!</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
