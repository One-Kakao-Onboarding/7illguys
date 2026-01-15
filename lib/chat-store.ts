"use client"

export interface ChatMessage {
  timestamp: string
  sender: string
  content: string
  type: "text" | "image" | "settlement" | "gift" | "transfer"
  transferAmount?: number
}

export interface ChatRoom {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  messages: ChatMessage[]
}

const CHAT_ROOMS_KEY = "kakao_chat_rooms"

export function saveChatRooms(rooms: ChatRoom[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHAT_ROOMS_KEY, JSON.stringify(rooms))
  }
}

export function getChatRooms(): ChatRoom[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(CHAT_ROOMS_KEY)
    return data ? JSON.parse(data) : []
  }
  return []
}

export function addChatRoom(room: ChatRoom): void {
  const rooms = getChatRooms()
  rooms.push(room)
  saveChatRooms(rooms)
}

export function clearAllChatRooms(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHAT_ROOMS_KEY)
  }
}
