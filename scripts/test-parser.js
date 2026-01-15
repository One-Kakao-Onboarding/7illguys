// Inline the parser function for testing
function parseKakaoChat(content, fileName) {
  const lines = content.split("\n")
  const messages = []
  const allSenders = new Set()

  let roomName = fileName.replace(".txt", "").replace(/^Talk_/, "")

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Skip metadata lines, empty lines, date separators
    if (
      line.trim() === "" ||
      line.startsWith("저장한 날짜") ||
      line.startsWith("Talk_") ||
      /^\d{4}년 \d{1,2}월 \d{1,2}일/.test(line)
    ) {
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

        // Look ahead for multiline messages
        let j = i + 1
        while (j < lines.length) {
          const nextLine = lines[j]

          if (/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*\d{1,2}:\d{2}/.test(nextLine)) {
            break
          }

          if (/^\d{4}년 \d{1,2}월 \d{1,2}일/.test(nextLine)) {
            break
          }

          if (nextLine.trim() !== "") {
            content += "\n" + nextLine.trim()
          } else {
            content += "\n"
          }
          j++
        }

        // Determine message type
        let type = "text"
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

  // Extract chat partner name
  const otherSenders = Array.from(allSenders).filter((sender) => !sender.includes("김덕윤"))
  if (otherSenders.length > 0) {
    roomName = otherSenders[0]
      .replace(/^카카오페이/, "")
      .replace(/^카카오원/, "")
      .replace(/[a-z]+$/i, "")
      .trim()
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

const sampleChat1 = `Talk_2026.1.15 12:37-1.txt
저장한 날짜 : 2026. 1. 15. 12:49
2026년 1월 15일 목요일
2026. 1. 15. 10:32, 김덕윤 : 나 결혼해요
2026. 1. 15. 10:32, 김덕윤 : 축하해주세요
2026. 1. 15. 10:37, 카카오페이김수경tasha : 축하
2026. 1. 15. 10:37, 김덕윤 : 축하
2026. 1. 15. 10:37, 김덕윤 : 부고
2026. 1. 15. 10:37, 김덕윤 : 졸업
2026. 1. 15. 10:38, 김덕윤 : 사실결혼안해요
2026. 1. 15. 12:24, 김덕윤 : 축하하지마
2026. 1. 15. 12:24, 김덕윤 : 축하하지마
2026. 1. 15. 12:25, 김덕윤 : 축하하지마
2026. 1. 15. 12:25, 김덕윤 : 축하하지마
2026. 1. 15. 12:33, 김덕윤 : 축하하지마
2026. 1. 15. 12:33, 카카오페이김수경tasha : 축하
2026. 1. 15. 12:34, 김덕윤 : ㅊㅋ
2026. 1. 15. 12:34, 김덕윤 : 축하하지마
2026. 1. 15. 12:34, 김덕윤 : 축하하지마
2026. 1. 15. 12:34, 김덕윤 : 겨로ㅗㄴ 훞갛해요!!!
2026. 1. 15. 12:37, 김덕윤 : 축하
2026. 1. 15. 12:37, 김덕윤 : 축하해`

const sampleChat2 = `Talk_2026.1.13 23:06-1.txt
저장한 날짜 : 2026. 1. 15. 10:24



2026년 1월 10일 토요일
2026. 1. 10. 21:46, 카카오원기훈noone : 배달의민족 선물을 보냈어요.
2026. 1. 10. 21:46, 카카오원기훈noone : duke! 조금 늦었지만 생일 축하해요
2026. 1. 10. 21:47, 카카오원기훈noone : 월욜에 봐요~~
2026. 1. 10. 22:10, 김덕윤 : 헉 감사해요~~~
2026. 1. 10. 22:10, 김덕윤 : 즐겁게보내고있습니다
2026. 1. 10. 22:11, 김덕윤 : ㅋㅋㅌㅋㅋ
2026. 1. 10. 22:11, 김덕윤 : 월요일날봐요

2026년 1월 13일 화요일
2026. 1. 13. 08:26, 카카오원기훈noone : 정산 내용을 확인해주세요.


- 정산금액 : 30,000원
- 요청인원 : 8명
- 정산기한 : 2026. 01. 17.(토) 10:00까지

3,750원을 송금해주세요. * 정산기한이 지나기 전에 정산을 완료해주세요.
2026. 1. 13. 08:40, 김덕윤 : 송금봉투가 도착했어요. 송금 받기 전까지 보낸 분은 내역 상세화면에서 취소할 수 있어요.
2026. 1. 13. 23:06, 카카오원기훈noone : 송금봉투를 받았어요. 받은 카카오페이머니는 송금 및 온/오프라인 결제도 가능해요.`

console.log("=== Test 1: Simple Chat ===")
const result1 = parseKakaoChat(sampleChat1, "Talk_2026.1.15 12:37-1.txt")
console.log("Room name:", result1.name)
console.log("Message count:", result1.messages.length)
console.log("Expected: 19 messages")
console.log("Test 1:", result1.messages.length === 19 ? "✅ PASS" : "❌ FAIL")

if (result1.messages.length > 0) {
  console.log("\nFirst 3 messages:")
  result1.messages.slice(0, 3).forEach((msg, idx) => {
    console.log(`  ${idx + 1}. ${msg.sender}: ${msg.content}`)
  })
}

console.log("\n=== Test 2: Chat with Settlement ===")
const result2 = parseKakaoChat(sampleChat2, "Talk_2026.1.13 23:06-1.txt")
console.log("Room name:", result2.name)
console.log("Message count:", result2.messages.length)
console.log("Expected: 10 messages")
console.log("Test 2:", result2.messages.length === 10 ? "✅ PASS" : "❌ FAIL")

if (result2.messages.length > 0) {
  console.log("\nAll messages:")
  result2.messages.forEach((msg, idx) => {
    const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + "..." : msg.content
    console.log(`  ${idx + 1}. [${msg.type}] ${msg.sender}: ${preview}`)
  })
}

// Check settlement message
const settlementMsg = result2.messages.find((m) => m.type === "settlement")
if (settlementMsg) {
  console.log("\n=== Settlement Message Test ===")
  console.log(
    "Settlement content includes '정산금액':",
    settlementMsg.content.includes("정산금액") ? "✅ PASS" : "❌ FAIL",
  )
} else {
  console.log("\n=== Settlement Message Test ===")
  console.log("❌ FAIL - No settlement message found")
}

console.log("\n=== Summary ===")
console.log("Test 1 (19 messages):", result1.messages.length === 19 ? "✅ PASS" : "❌ FAIL")
console.log("Test 2 (10 messages):", result2.messages.length === 10 ? "✅ PASS" : "❌ FAIL")
console.log("Settlement parsing:", settlementMsg && settlementMsg.content.includes("정산금액") ? "✅ PASS" : "❌ FAIL")
