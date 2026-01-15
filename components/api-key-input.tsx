"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveApiKey, saveUserName } from "@/lib/api-key-store"
import { Card } from "@/components/ui/card"

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState("")
  const [userName, setUserName] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim() && userName.trim()) {
      saveApiKey(apiKey)
      saveUserName(userName)
      router.push("/chat-list")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">축의금 추천 서비스</h1>
          <p className="text-muted-foreground">시작하려면 정보를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">이름</label>
            <Input
              type="text"
              placeholder="카카오톡에 표시되는 이름을 입력하세요"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">채팅방에서 '나'로 표시될 이름입니다</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gemini API 키</label>
            <Input
              type="password"
              placeholder="Gemini API 키를 입력하세요"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">API 키는 로컬에만 저장되며 외부로 전송되지 않습니다</p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={!apiKey.trim() || !userName.trim()}
          >
            시작하기
          </Button>
        </form>
      </Card>
    </div>
  )
}
