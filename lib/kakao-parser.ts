"use client"

import type { ChatMessage, ChatRoom } from "./chat-store"

export function parseKakaoChat(content: string, fileName: string): ChatRoom {
  const lines = content.split("\n")
  const messages: ChatMessage[] = []
  const allSenders = new Set<string>()

  let roomName = fileName.replace(".txt", "").replace(/^Talk_/, "")

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Skip metadata and date separator lines (but not empty lines - they might be part of multiline messages)
    if (line.startsWith("저장한 날짜") || line.startsWith("Talk_") || /^\d{4}년 \d{1,2}월 \d{1,2}일/.test(line)) {
      i++
      continue
    }

    // Skip empty lines only if they're not part of a message
    if (line.trim() === "") {
      i++
      continue
    }

    // Check if line starts with timestamp pattern
    const firstComma = line.indexOf(",")

    if (firstComma !== -1 && /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}/.test(line)) {
      const timestamp = line.substring(0, firstComma).trim()

      const afterComma = line.substring(firstComma + 1)
      const firstColon = afterComma.indexOf(":")

      if (firstColon !== -1) {
        const sender = afterComma.substring(0, firstColon).trim()
        allSenders.add(sender)

        let content = afterComma.substring(firstColon + 1).trim()

        let j = i + 1
        while (j < lines.length) {
          const nextLine = lines[j]

          // Stop if we hit another message (starts with timestamp pattern)
          if (/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*\d{1,2}:\d{2}/.test(nextLine)) {
            break
          }

          // Stop if we hit a date separator
          if (/^\d{4}년 \d{1,2}월 \d{1,2}일/.test(nextLine)) {
            break
          }

          // Add this line to content (even if it's empty - it's part of the message)
          if (nextLine.trim() !== "") {
            content += "\n" + nextLine.trim()
          } else {
            // Keep empty lines as separators within the message
            content += "\n"
          }
          j++
        }

        // Determine message type
        let type: ChatMessage["type"] = "text"
        if (content === "사진") {
          type = "image"
        } else if (content.includes("정산 내용을 확인해주세요") || content.includes("정산금액")) {
          type = "settlement"
        } else if (content.includes("선물을 보냈어요")) {
          type = "gift"
        }

        messages.push({
          timestamp,
          sender,
          content,
          type,
        })

        i = j
        continue
      }
    }

    i++
  }

  const otherSenders = Array.from(allSenders).filter((sender) => !sender.includes("김덕윤"))
  if (otherSenders.length > 0) {
    // Use the full name without any modification
    roomName = otherSenders[0]
  }

  const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : ""
  const lastTimestamp = messages.length > 0 ? messages[messages.length - 1].timestamp : ""

  return {
    id: Date.now().toString(),
    name: roomName,
    lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + "..." : lastMessage,
    timestamp: lastTimestamp,
    messages: messages,
  }
}
