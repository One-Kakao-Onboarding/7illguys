"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getChatRooms, saveChatRooms, type ChatRoom, type ChatMessage } from "@/lib/chat-store"
import { getUserName } from "@/lib/api-key-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, Search } from "lucide-react"
import { GiftRecommendationModal } from "@/components/gift-recommendation-modal"

interface ChatRoomDetailProps {
  roomId: string
}

export function ChatRoomDetail({ roomId }: ChatRoomDetailProps) {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [sendAsMe, setSendAsMe] = useState(true)
  const [showGiftSuggestion, setShowGiftSuggestion] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const rooms = getChatRooms()
    const room = rooms.find((r) => r.id === roomId)
    setChatRoom(room || null)
  }, [roomId])

  useEffect(() => {
    if (!chatRoom || chatRoom.messages.length === 0) {
      setShowGiftSuggestion(false)
      return
    }

    const keywords = ["결혼", "축의", "청모", "모청", "청첩장"]
    const recentMessages = chatRoom.messages.slice(-10)
    const hasKeyword = recentMessages.some((msg) => {
      return keywords.some((keyword) => msg.content.includes(keyword))
    })

    if (hasKeyword) {
      setTimeout(() => setShowGiftSuggestion(true), 300)
    } else {
      setShowGiftSuggestion(false)
    }
  }, [chatRoom])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
    const timer1 = setTimeout(scrollToBottom, 50)
    const timer2 = setTimeout(scrollToBottom, 100)
    const timer3 = setTimeout(scrollToBottom, 200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [chatRoom?.messages])

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

  const isMyMessage = (sender: string) => {
    const myName = getUserName()
    if (myName) {
      return sender.includes(myName)
    }
    return sender.includes("김덕윤")
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !chatRoom) return

    const now = new Date()
    const timestamp = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`

    const myName = getUserName() || "김덕윤"
    const senderName = sendAsMe ? myName : chatRoom.name

    const newMessage: ChatMessage = {
      timestamp,
      sender: senderName,
      content: messageInput,
      type: "text",
    }

    const updatedMessages = [...chatRoom.messages, newMessage]
    const updatedRoom: ChatRoom = {
      ...chatRoom,
      messages: updatedMessages,
      lastMessage: messageInput,
      timestamp,
    }

    const allRooms = getChatRooms()
    const updatedRooms = allRooms.map((room) => (room.id === roomId ? updatedRoom : room))
    saveChatRooms(updatedRooms)

    setChatRoom(updatedRoom)
    setMessageInput("")

    requestAnimationFrame(() => {
      scrollToBottom()
      setTimeout(scrollToBottom, 50)
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 200)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleSendTransfer = (amount: number) => {
    if (!chatRoom) return

    const now = new Date()
    const timestamp = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`

    const myName = getUserName() || "김덕윤"

    const newMessage: ChatMessage = {
      timestamp,
      sender: myName,
      content: `${chatRoom.name}님에게 축의금을 보냈습니다.`,
      type: "transfer",
      transferAmount: amount,
    }

    const updatedMessages = [...chatRoom.messages, newMessage]
    const updatedRoom: ChatRoom = {
      ...chatRoom,
      messages: updatedMessages,
      lastMessage: `축의금 ${new Intl.NumberFormat("ko-KR").format(amount)}원`,
      timestamp,
    }

    const allRooms = getChatRooms()
    const updatedRooms = allRooms.map((room) => (room.id === roomId ? updatedRoom : room))
    saveChatRooms(updatedRooms)

    setChatRoom(updatedRoom)

    requestAnimationFrame(() => {
      scrollToBottom()
      setTimeout(scrollToBottom, 50)
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 200)
    })
  }

  const renderMessage = (message: ChatMessage, index: number) => {
    const isMine = isMyMessage(message.sender)

    if (message.type === "transfer") {
      return (
        <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 px-4`}>
          <div className={`flex gap-2 max-w-[80%] ${isMine ? "flex-row-reverse" : "flex-row"} items-end`}>
            {!isMine && (
              <div className="w-10 h-10 bg-[#A8C7DB] rounded-[16px] flex items-center justify-center flex-shrink-0 mb-5 border border-black/10">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="3.5" fill="white" />
                  <path
                    d="M12 13.5C8.5 13.5 6 15.5 6 18C6 18 6 19 12 19C18 19 18 18 18 18C18 15.5 15.5 13.5 12 13.5Z"
                    fill="white"
                  />
                </svg>
              </div>
            )}
            <div className={`flex flex-col gap-1 min-w-0 ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && <span className="text-[11px] font-semibold px-1">{message.sender}</span>}
              <div className="flex items-end gap-1 min-w-0">
                {isMine && (
                  <span className="text-[10px] text-muted-foreground/80 mb-0.5 flex-shrink-0">
                    {formatTime(message.timestamp)}
                  </span>
                )}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-border/30 min-w-[200px]">
                  <div className="bg-[#FAE100] px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-sm">💸</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#3c1e1e]">축의금 송금</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-center">
                      <div className="text-[11px] text-muted-foreground mb-1">송금 금액</div>
                      <div className="text-[20px] font-bold text-[#3c1e1e]">
                        {message.transferAmount ? new Intl.NumberFormat("ko-KR").format(message.transferAmount) : 0}원
                      </div>
                    </div>
                    <div className="text-center text-[11px] text-muted-foreground">결혼을 진심으로 축하드립니다</div>
                  </div>
                  <div className="bg-muted/30 px-4 py-2 border-t border-border/30">
                    <div className="text-[10px] text-muted-foreground text-center">카카오페이 송금</div>
                  </div>
                </div>
                {!isMine && (
                  <span className="text-[10px] text-muted-foreground/80 mb-0.5 flex-shrink-0">
                    {formatTime(message.timestamp)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (message.type === "settlement") {
      return (
        <div key={index} className="flex justify-start mb-2 px-4">
          <div className="flex gap-2 max-w-[80%]">
            {!isMine && (
              <div className="w-10 h-10 bg-[#A8C7DB] rounded-[16px] flex items-center justify-center flex-shrink-0 border border-black/10">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="3.5" fill="white" />
                  <path
                    d="M12 13.5C8.5 13.5 6 15.5 6 18C6 18 6 19 12 19C18 19 18 18 18 18C18 15.5 15.5 13.5 12 13.5Z"
                    fill="white"
                  />
                </svg>
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              {!isMine && <span className="text-[11px] font-semibold px-1">{message.sender}</span>}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-border/50">
                <div className="text-[13px] space-y-1">
                  <div className="font-bold text-foreground mb-2">💰 정산 요청</div>
                  <div className="text-[12px] text-muted-foreground whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/80 px-1">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        </div>
      )
    }

    if (message.type === "gift") {
      return (
        <div key={index} className="flex justify-start mb-2 px-4">
          <div className="flex gap-2 max-w-[80%]">
            {!isMine && (
              <div className="w-10 h-10 bg-[#A8C7DB] rounded-[16px] flex items-center justify-center flex-shrink-0 border border-black/10">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="3.5" fill="white" />
                  <path
                    d="M12 13.5C8.5 13.5 6 15.5 6 18C6 18 6 19 12 19C18 19 18 18 18 18C18 15.5 15.5 13.5 12 13.5Z"
                    fill="white"
                  />
                </svg>
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              {!isMine && <span className="text-[11px] font-semibold px-1">{message.sender}</span>}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-border/50">
                <div className="text-[13px] font-medium break-words">🎁 {message.content}</div>
              </div>
              <span className="text-[10px] text-muted-foreground/80 px-1">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        </div>
      )
    }

    if (message.type === "image") {
      return (
        <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 px-4`}>
          <div className={`flex gap-2 max-w-[80%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
            {!isMine && (
              <div className="w-10 h-10 bg-[#A8C7DB] rounded-[16px] flex items-center justify-center flex-shrink-0 mb-5 border border-black/10">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="9" r="3.5" fill="white" />
                  <path
                    d="M12 13.5C8.5 13.5 6 15.5 6 18C6 18 6 19 12 19C18 19 18 18 18 18C18 15.5 15.5 13.5 12 13.5Z"
                    fill="white"
                  />
                </svg>
              </div>
            )}
            <div className={`flex flex-col gap-1 min-w-0 ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && <span className="text-[11px] font-semibold px-1 truncate max-w-full">{message.sender}</span>}
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-[13px]">📷 사진</div>
              </div>
              <span className="text-[10px] text-muted-foreground/80 px-1">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 px-4`}>
        <div className={`flex gap-2 max-w-[80%] ${isMine ? "flex-row-reverse" : "flex-row"} items-end`}>
          {!isMine && (
            <div className="w-10 h-10 bg-[#A8C7DB] rounded-[16px] flex items-center justify-center flex-shrink-0 mb-5 border border-black/10">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="9" r="3.5" fill="white" />
                <path
                  d="M12 13.5C8.5 13.5 6 15.5 6 18C6 18 6 19 12 19C18 19 18 18 18 18C18 15.5 15.5 13.5 12 13.5Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
          <div className={`flex flex-col gap-1 min-w-0 ${isMine ? "items-end" : "items-start"}`}>
            {!isMine && <span className="text-[11px] font-semibold px-1 truncate max-w-full">{message.sender}</span>}
            <div className="flex items-end gap-1 min-w-0">
              {isMine && (
                <span className="text-[10px] text-muted-foreground/80 mb-0.5 flex-shrink-0">
                  {formatTime(message.timestamp)}
                </span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl shadow-sm min-w-0 ${
                  isMine ? "bg-[#FAE100] text-[#3c1e1e]" : "bg-white text-foreground border border-border/30"
                }`}
              >
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {message.content}
                </p>
              </div>
              {!isMine && (
                <span className="text-[10px] text-muted-foreground/80 mb-0.5 flex-shrink-0">
                  {formatTime(message.timestamp)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!chatRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">채팅방을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#B2C7D9] relative">
      <header className="bg-[#B2C7D9] border-b border-border/30 shadow-sm sticky top-0 z-20">
        <div className="px-4 py-2.5 flex items-center relative">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => router.push("/chat-list")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-[16px] font-semibold whitespace-nowrap">{chatRoom.name}</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSendAsMe(!sendAsMe)}
              className={`w-6 h-6 rounded-full transition-colors duration-200 shadow-md ${
                sendAsMe ? "bg-[#FAE100]" : "bg-white"
              }`}
              aria-label={sendAsMe ? "나로 대화하기" : "상대방으로 대화하기"}
            />
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="py-4 pb-20">
          {chatRoom.messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <p className="text-foreground/60 text-center text-sm">
                대화내역이 없습니다
                <br />
                <span className="text-xs">파일을 다시 업로드해 보세요</span>
              </p>
            </div>
          ) : (
            chatRoom.messages.map((message, index) => renderMessage(message, index))
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 transition-all duration-500 ${
          showGiftSuggestion ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setShowGiftModal(true)}
          className="bg-white text-foreground px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow text-[14px] font-medium border border-border/20"
        >
          💰 축의금이 고민되시나요?
        </button>
      </div>

      <div className="bg-card border-t border-border px-3 py-2 flex items-center gap-2 sticky bottom-0 z-10">
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-background rounded-full px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-ring border border-border"
        />
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </Button>
      </div>

      <GiftRecommendationModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        messages={chatRoom.messages}
        partnerName={chatRoom.name}
        onSendTransfer={handleSendTransfer}
      />
    </div>
  )
}
