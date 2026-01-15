"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getChatRooms, addChatRoom, clearAllChatRooms, type ChatRoom } from "@/lib/chat-store"
import { parseKakaoChat } from "@/lib/kakao-parser"
import { Button } from "@/components/ui/button"
import { Settings, Search, Trash2, Plus } from "lucide-react"

export function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const rooms = getChatRooms()
    setChatRooms(rooms)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const txtFiles = files.filter((file) => file.name.endsWith(".txt"))

    for (const file of txtFiles) {
      const content = await file.text()
      const chatRoom = parseKakaoChat(content, file.name)
      addChatRoom(chatRoom)
    }

    const updatedRooms = getChatRooms()
    setChatRooms(updatedRooms)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const txtFiles = Array.from(files).filter((file) => file.name.endsWith(".txt"))

    for (const file of txtFiles) {
      const content = await file.text()
      const chatRoom = parseKakaoChat(content, file.name)
      addChatRoom(chatRoom)
    }

    const updatedRooms = getChatRooms()
    setChatRooms(updatedRooms)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatTime = (timestamp: string) => {
    const match = timestamp.match(/(\d{1,2}):(\d{2})/)
    if (match) {
      const [, hours, minutes] = match
      const hour = Number.parseInt(hours)
      const period = hour >= 12 ? "오후" : "오전"
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${period} ${displayHour}:${minutes}`
    }
    return timestamp
  }

  const handleReset = () => {
    clearAllChatRooms()
    setChatRooms([])
    setShowResetDialog(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt" multiple onChange={handleFileSelect} />

      <header className="bg-background border-b border-border px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-[20px] font-bold">채팅</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-[18px] h-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
            <Search className="w-[18px] h-[18px]" />
          </Button>
          {chatRooms.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-destructive hover:bg-muted hover:text-destructive"
              onClick={() => setShowResetDialog(true)}
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted"
            onClick={() => router.push("/")}
          >
            <Settings className="w-[18px] h-[18px]" />
          </Button>
        </div>
      </header>

      <div
        className={`flex-1 overflow-y-auto ${isDragging ? "bg-primary/10" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">채팅방이 없습니다</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              카카오톡 대화내용 파일을 드래그 앤 드롭하여
              <br />
              채팅방을 추가하세요
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 active:bg-muted transition-colors text-left"
              >
                <div className="w-[48px] h-[48px] flex-shrink-0 mt-0.5 relative">
                  <div className="absolute inset-0 bg-[#A8C7DB] rounded-[16px] border border-black/10" />
                  <svg
                    className="absolute inset-0 w-full h-full p-2"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="18" r="7" fill="white" />
                    <path d="M24 27c-6 0-11 3-11 7v2h22v-2c0-4-5-7-11-7z" fill="white" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h3 className="font-medium text-[15px] truncate pr-2">{room.name}</h3>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">
                      {formatTime(room.timestamp)}
                    </span>
                  </div>
                  <p className="text-[14px] text-muted-foreground truncate leading-tight">
                    {room.lastMessage || "메시지 없음"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isDragging && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-50">
          <div className="bg-background p-8 rounded-2xl shadow-lg border-2 border-dashed border-primary">
            <p className="text-lg font-semibold">파일을 여기에 드롭하세요</p>
          </div>
        </div>
      )}

      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-xl max-w-[280px] w-full overflow-hidden">
            <div className="px-6 py-5 space-y-2.5">
              <h2 className="text-[16px] font-bold text-center">채팅방 전체 삭제</h2>
              <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
                모든 채팅방을 삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex border-t border-border">
              <button
                onClick={() => setShowResetDialog(false)}
                className="flex-1 py-3 text-[14px] font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                취소
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={handleReset}
                className="flex-1 py-3 text-[14px] font-medium text-destructive hover:bg-muted/50 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
