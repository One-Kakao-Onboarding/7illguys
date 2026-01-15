"use client"

import { useState } from "react"
import { X, Loader2, Check, Users, Clock } from "lucide-react"
import type { ChatMessage } from "@/lib/chat-store"
import { getApiKey } from "@/lib/api-key-store"

interface GiftRecommendationModalProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  partnerName: string
  onSendTransfer?: (amount: number, aiMessage: string) => void
}

interface RecommendationResult {
  intimacyScore: number
  intimacyLevel: string
  intimacyReason: string[]
  weddingGiftRecommendation: {
    practical: number
    recommended: number
    generous: number
  }
  calculationBreakdown?: {
    baseScore: number
    adjustments: {
      reason: string
      amount: number
    }[]
    finalAmount: number
  }
  aiMessage: string
}

const MOCK_FRIENDS = [
  { id: "1", name: "이수민" },
  { id: "2", name: "박준혁" },
  { id: "3", name: "김하늘" },
  { id: "4", name: "정민서" },
  { id: "5", name: "최우진" },
  { id: "6", name: "한소희" },
]

const ANALYSIS_PROMPT = `당신은 한국 문화에 매우 익숙한 인간관계 분석 전문가이자
경조사(결혼·축의금) 컨설턴트입니다.

사용자가 제공한 최근 1년간의 대화 내용을 분석하여,
두 사람의 관계 친밀도를 정량적으로 평가하고
그 결과를 바탕으로 한국 결혼 문화에 적합한 축의금을 추천해야 합니다.

반드시 JSON 형식으로만 응답하세요.

==================================================
[1단계: 정량적 지표 추출]
==================================================

먼저 대화 내용에서 다음 정량적 지표들을 카운트하세요:

1. 이모티콘 사용 횟수 (😊, ❤️, 🎉 등)
2. 웃음 표현 횟수 (ㅋㅋ, ㅎㅎ, ㅋㅋㅋ, ㅎㅎㅎ 등)
3. 반말 사용 비율 (존댓말 vs 반말)
4. 감정 표현 횟수 (좋아, 싫어, 슬퍼, 기뻐, 화나 등)
5. 만남 언급 횟수 (밥, 술, 카페, 만나자, 보자 등)
6. 질문 횟수 (?, 뭐해, 어디야, 언제 등)
7. 호칭 패턴 (님, 씨, 이름만, 별명 등)
8. 대화 길이 평균 (짧은 단답 vs 긴 대화)
9. 응답 패턴 (바로 답장 vs 늦은 답장 힌트)
10. 개인적 이야기 공유 횟수 (가족, 연애, 고민 등)

==================================================
[2단계: 친밀도 단계 판정]
==================================================

추출한 지표를 바탕으로 친밀도를 0~100점으로 산출합니다.

--------------------------------------------------
[1단계 | 친밀도 0~25%] 사회적 가면 (Social Mask)
--------------------------------------------------
- 이모티콘/웃음: 거의 없음 (0~5회)
- 존댓말 비율: 90% 이상
- 호칭: 님, 선배님, 직함 사용
- 개인적 이야기: 거의 없음
- 특징: 업무적, 의례적 대화

--------------------------------------------------
[2단계 | 친밀도 26~50%] 추억 공유자 (Memory Sharer)
--------------------------------------------------
- 이모티콘/웃음: 가끔 (6~20회)
- 반말/존댓말 혼용
- 호칭: 이름 + 님/씨 또는 이름만
- 과거 이야기 위주 ("그때", "예전에")
- 특징: 오랜만에 연락, 동창/동기

--------------------------------------------------
[3단계 | 친밀도 51~75%] 일상 공유자 (Life Sharer)
--------------------------------------------------
- 이모티콘/웃음: 자주 (21~50회)
- 반말 비율: 60% 이상
- 호칭: 이름, 별명
- 현재 일상 공유 ("오늘", "이번 주")
- 만남 언급: 구체적 약속
- 특징: 정기적 연락, 취미/활동 공유

--------------------------------------------------
[4단계 | 친밀도 76~100%] 운명 공동체 (Soulmate)
--------------------------------------------------
- 이모티콘/웃음: 매우 빈번 (50회 이상)
- 반말 비율: 90% 이상
- 호칭: 별명, 애칭
- 깊은 개인적 이야기 (고민, 감정, TMI)
- 명령조 표현 ("사와", "빨리 와")
- 특징: 수시 연락, 높은 신뢰

==================================================
[3단계: 축의금 추천]
==================================================

산출한 친밀도 점수를 바탕으로,
한국 결혼 문화 기준에서 축의금을 3단계로 추천하세요.

1. 실속형: 최소한의 예의를 지키는 금액
2. 추천형: 가장 무난하고 일반적인 금액
3. 넉넉형: 관계를 충분히 고려한 여유 있는 금액

조건:
- 친밀도가 낮을수록 보수적 금액
- 친밀도가 높을수록 점진적 상향
- 사회 초년생·일반 직장인 기준
- 과도하거나 비현실적인 금액은 제외
- 5만 원 단위 우선 고려

==================================================
[4단계: AI 추천 멘트 작성]
==================================================

송금 시 함께 보낼 수 있는 축하 메시지를 작성합니다.

조건:
- 대화 내용에서 파악한 두 사람의 관계성 반영
- 친밀도에 맞는 어투 (반말/존댓말)
- 재치 있고 진심이 담긴 메시지
- 이모티콘 1~2개 포함 가능
- 50자 이내로 작성

예시:
- "현우야! 호텔 밥값 비쌀 텐데 내 마음 보탠다. 결혼 진심으로 축하해! 🎉"
- "결혼 축하드립니다! 두 분의 앞날을 응원합니다 💐"

==================================================
[응답 JSON 형식]
==================================================

중요: intimacyReason은 반드시 "이모지 + 정량적 수치 + 키워드" 형식으로 작성하세요.
예시: 
- "😂 웃음 47회 감지"
- "💬 반말 사용 비율 78%"
- "📅 만남 언급 12회"
- "❤️ 이모티콘 사용 23회"
- "🏠 개인적 이야기 공유 8회"

{
  "intimacyScore": number,
  "intimacyLevel": "Social Mask | Memory Sharer | Life Sharer | Soulmate",
  "intimacyReason": [
    "이모지 + 정량적 수치 + 키워드 형식의 근거 1",
    "이모지 + 정량적 수치 + 키워드 형식의 근거 2",
    "이모지 + 정량적 수치 + 키워드 형식의 근거 3"
  ],
  "weddingGiftRecommendation": {
    "practical": number,
    "recommended": number,
    "generous": number
  },
  "aiMessage": "송금 시 함께 보낼 축하 메시지"
}

==================================================
[대화 기록]
==================================================
`

const FEEDBACK_ANALYSIS_PROMPT = `당신은 한국 문화에 매우 익숙한 인간관계 분석 전문가이자
경조사(결혼·축의금) 컨설턴트입니다.

사용자가 제공한 최근 1년간의 대화 내용과 추가 의견을 분석하여,
두 사람의 관계 친밀도를 정량적으로 평가하고
그 결과를 바탕으로 한국 결혼 문화에 적합한 축의금을 추천해야 합니다.

반드시 JSON 형식으로만 응답하세요.

==================================================
[분석 지침]
==================================================

1. 대화 내용에서 정량적 지표 추출 (이모티콘, 웃음, 반말비율, 만남언급 등)
2. 친밀도 0~100점 산출
3. 사용자 추가 의견을 반영하여 축의금 추천
4. 산출 근거를 한 줄로 간결하게 요약

==================================================
[산출 근거 작성 규칙]
==================================================

calculationBreakdown을 반드시 포함하세요:
- baseScore: 기본 관계 점수 (예: 70000)
- adjustments: 가산/감산 배열, 각 항목의 reason은 10자 이내로 짧게!
  - 예: { "reason": "물가 반영", "amount": 30000 }
  - 예: { "reason": "지갑 사정", "amount": -10000 }
- finalAmount: 최종 금액

==================================================
[응답 JSON 형식]
==================================================

intimacyReason은 "이모지 + 수치 + 키워드" 형식 (예: "😂 웃음 47회")

{
  "intimacyScore": number,
  "intimacyLevel": "Social Mask | Memory Sharer | Life Sharer | Soulmate",
  "intimacyReason": ["근거1", "근거2", "근거3"],
  "weddingGiftRecommendation": {
    "practical": number,
    "recommended": number,
    "generous": number
  },
  "calculationBreakdown": {
    "baseScore": number,
    "adjustments": [{ "reason": "짧은이유", "amount": number }],
    "finalAmount": number
  },
  "aiMessage": "송금 축하 메시지 50자 이내"
}

==================================================
[대화 기록]
==================================================
`

export function GiftRecommendationModal({
  isOpen,
  onClose,
  messages,
  partnerName,
  onSendTransfer,
}: GiftRecommendationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [hasUserSelected, setHasUserSelected] = useState(false)
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([])
  const [hasFeedbackApplied, setHasFeedbackApplied] = useState(false)

  const [transferStep, setTransferStep] = useState<
    "idle" | "confirm" | "group-ask" | "group-select" | "group-request" | "group-waiting" | "group-confirm"
  >("idle")
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>([])

  const getRecentYearMessages = () => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return messages.filter((msg) => {
      const match = msg.timestamp.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/)
      if (match) {
        const [, year, month, day] = match
        const msgDate = new Date(Number(year), Number(month) - 1, Number(day))
        return msgDate >= oneYearAgo
      }
      return true
    })
  }

  const formatMessagesForPrompt = (msgs: ChatMessage[]) => {
    return msgs.map((msg) => `[${msg.timestamp}] ${msg.sender}: ${msg.content}`).join("\n")
  }

  const analyzeChat = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setHasFeedbackApplied(false)

    const apiKey = getApiKey()
    if (!apiKey) {
      setError("API 키가 설정되지 않았습니다.")
      setIsLoading(false)
      return
    }

    const recentMessages = getRecentYearMessages()
    if (recentMessages.length === 0) {
      setError("분석할 대화 내역이 없습니다.")
      setIsLoading(false)
      return
    }

    const formattedMessages = formatMessagesForPrompt(recentMessages)
    const fullPrompt = ANALYSIS_PROMPT + formattedMessages

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.")
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error("응답을 받지 못했습니다.")
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("JSON 형식의 응답을 파싱할 수 없습니다.")
      }

      const parsed: RecommendationResult = JSON.parse(jsonMatch[0])
      setResult(parsed)
      setSelectedAmount(parsed.weddingGiftRecommendation.recommended)
      setHasUserSelected(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const reAnalyzeWithFeedback = async () => {
    if (!feedback.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    const apiKey = getApiKey()
    if (!apiKey) {
      setError("API 키가 설정되지 않았습니다.")
      setIsLoading(false)
      return
    }

    const newFeedbackHistory = [...feedbackHistory, feedback.trim()]
    setFeedbackHistory(newFeedbackHistory)
    setHasFeedbackApplied(true)

    const recentMessages = getRecentYearMessages()
    const formattedMessages = formatMessagesForPrompt(recentMessages)

    const accumulatedFeedback = newFeedbackHistory.map((fb, idx) => `${idx + 1}. ${fb}`).join("\n")

    const feedbackPrompt = `
${FEEDBACK_ANALYSIS_PROMPT}
${formattedMessages}

==================================================
[사용자 추가 의견 (누적)]
==================================================
${accumulatedFeedback}

위 모든 의견을 반영하여 다시 분석해 주세요.
calculationBreakdown의 adjustments에 사용자 의견이 어떻게 반영되었는지 짧게 명시해 주세요.
`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: feedbackPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.")
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error("응답을 받지 못했습니다.")
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("JSON 형식의 응답을 파싱할 수 없습니다.")
      }

      const parsed: RecommendationResult = JSON.parse(jsonMatch[0])
      setResult(parsed)
      setSelectedAmount(parsed.weddingGiftRecommendation.recommended)
      setHasUserSelected(false)
      setFeedback("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getIntimacyLevelKorean = (level: string) => {
    switch (level) {
      case "Social Mask":
        return "사회적 가면"
      case "Memory Sharer":
        return "추억 공유자"
      case "Life Sharer":
        return "일상 공유자"
      case "Soulmate":
        return "운명 공동체"
      default:
        return level
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원"
  }

  const handleSendTransfer = () => {
    if (!selectedAmount || !result) return

    // Check if intimacy is below 50% - show group gift option
    if (result.intimacyScore < 50) {
      setTransferStep("group-ask")
    } else {
      setTransferStep("confirm")
    }
  }

  const handleConfirmTransfer = () => {
    if (selectedAmount && onSendTransfer && result) {
      onSendTransfer(selectedAmount, result.aiMessage)
      setTransferStep("idle")
      onClose()
    }
  }

  const handleSendRequest = () => {
    // Simulate sending request to friends and show waiting screen
    setTransferStep("group-waiting")

    // Simulate friends accepting over time (in real app, this would be async)
    setTimeout(() => {
      // Randomly accept some friends for demo purposes
      const randomAccepted = selectedFriends.filter(() => Math.random() > 0.3)
      setAcceptedFriends(randomAccepted.length > 0 ? randomAccepted : [selectedFriends[0]])
      setTransferStep("group-confirm")
    }, 2000)
  }

  const handleGroupTransfer = () => {
    if (selectedAmount && onSendTransfer && result) {
      const totalPeople = acceptedFriends.length + 1
      const totalAmount = selectedAmount * totalPeople
      onSendTransfer(totalAmount, result.aiMessage)
      setTransferStep("idle")
      setSelectedFriends([])
      setAcceptedFriends([])
      onClose()
    }
  }

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : prev.length < 5 ? [...prev, friendId] : prev,
    )
  }

  if (!isOpen) return null

  if (transferStep === "group-ask") {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] overflow-hidden">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between">
              <button onClick={() => setTransferStep("idle")} className="text-[13px] text-[#3C1E1E] font-medium">
                이전
              </button>
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">송금하기</h2>
              <div className="w-8" />
            </div>

            <div className="p-5 text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FAE100] to-[#F5D800] rounded-full mx-auto flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-[#3C1E1E]" />
              </div>

              <div>
                <h3 className="font-bold text-[16px] text-[#191919] mb-2">
                  함께 축하해주고 싶은
                  <br />
                  친구가 있나요?
                </h3>
                <p className="text-[12px] text-[#666666]">
                  여러 명이 모아서 보내면
                  <br />더 뜻깊은 축하가 될 수 있어요
                </p>
              </div>

              <div className="bg-[#FFF9DB] rounded-2xl p-3">
                <p className="text-[11px] text-[#3C1E1E]">
                  현재 추천 금액: <span className="font-bold">{selectedAmount && formatMoney(selectedAmount)}</span>
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setTransferStep("group-select")}
                  className="w-full bg-[#FAE100] text-[#3C1E1E] py-3.5 rounded-2xl font-bold text-[14px] hover:bg-[#F5D800] transition-all shadow-md active:scale-[0.98]"
                >
                  봉투에 모아 보내기
                </button>
                <button
                  onClick={() => setTransferStep("confirm")}
                  className="w-full bg-white border border-[#E0E0E0] text-[#666666] py-3.5 rounded-2xl font-medium text-[14px] hover:bg-[#F5F5F5] transition-all"
                >
                  혼자 보낼게요
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transferStep === "group-select") {
    const totalPeople = selectedFriends.length + 1
    const totalAmount = selectedAmount ? selectedAmount * totalPeople : 0

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] max-h-[80%] overflow-hidden flex flex-col">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setTransferStep("group-ask")} className="text-[13px] text-[#3C1E1E] font-medium">
                이전
              </button>
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">친구 선택</h2>
              <div className="w-8" />
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-[12px] text-[#666666] text-center mb-3">
                함께 보내고 싶은 친구를 선택해주세요
                <br />
                <span className="text-[#3C1E1E] font-medium">(최대 5명 선택 가능)</span>
              </p>

              <div className="space-y-2">
                {MOCK_FRIENDS.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriendSelection(friend.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedFriends.includes(friend.id)
                        ? "bg-[#FFF9DB] border-2 border-[#FAE100]"
                        : "bg-white border border-[#E0E0E0] hover:border-[#FAE100]"
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#A8C7DB] rounded-[10px] flex items-center justify-center border border-black/10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M12 14c-6 0-8 3-8 6v1h16v-1c0-3-2-6-8-6z" />
                      </svg>
                    </div>
                    <span className="flex-1 text-left text-[14px] font-medium text-[#191919]">{friend.name}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedFriends.includes(friend.id) ? "bg-[#FAE100]" : "bg-[#E0E0E0]"
                      }`}
                    >
                      {selectedFriends.includes(friend.id) && <Check className="w-4 h-4 text-[#3C1E1E]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#E0E0E0] flex-shrink-0">
              {selectedFriends.length > 0 && (
                <div className="bg-[#FFF9DB] rounded-xl p-3 mb-3 text-center">
                  <p className="text-[11px] text-[#666666]">
                    {totalPeople}명이 1인당 {selectedAmount && formatMoney(selectedAmount)}씩 모으면
                  </p>
                  <p className="text-[14px] font-bold text-[#3C1E1E]">총 {formatMoney(totalAmount)}</p>
                </div>
              )}
              <button
                onClick={() => setTransferStep("group-request")}
                disabled={selectedFriends.length === 0}
                className={`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all ${
                  selectedFriends.length > 0
                    ? "bg-[#FAE100] text-[#3C1E1E] hover:bg-[#F5D800] shadow-md active:scale-[0.98]"
                    : "bg-[#E0E0E0] text-[#999999] cursor-not-allowed"
                }`}
              >
                {selectedFriends.length > 0 ? `${selectedFriends.length}명에게 요청하기` : "친구를 선택해주세요"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transferStep === "group-request") {
    const totalPeople = selectedFriends.length + 1
    const totalAmount = selectedAmount ? selectedAmount * totalPeople : 0

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] overflow-hidden">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setTransferStep("group-select")}
                className="text-[13px] text-[#3C1E1E] font-medium"
              >
                이전
              </button>
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">송금 요청</h2>
              <div className="w-8" />
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-[16px] text-[#191919] mb-2">송금 요청을 보낼까요?</h3>
                <p className="text-[12px] text-[#666666]">
                  선택한 친구들에게 함께 축의금을
                  <br />
                  모아 보내자는 요청을 보냅니다
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0]">
                <p className="text-[12px] text-[#666666] mb-2">요청 대상</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFriends.map((friendId) => {
                    const friend = MOCK_FRIENDS.find((f) => f.id === friendId)
                    return (
                      <span
                        key={friendId}
                        className="bg-[#FFF9DB] text-[#3C1E1E] px-3 py-1 rounded-full text-[12px] font-medium"
                      >
                        {friend?.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#FFF9DB] rounded-2xl p-4 text-center">
                <p className="text-[11px] text-[#666666] mb-1">1인당 금액</p>
                <p className="text-[20px] font-bold text-[#3C1E1E]">{selectedAmount && formatMoney(selectedAmount)}</p>
                <p className="text-[11px] text-[#666666] mt-2">
                  {totalPeople}명 참여 시 총 {formatMoney(totalAmount)}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSendRequest}
                  className="w-full bg-[#FAE100] text-[#3C1E1E] py-3.5 rounded-2xl font-bold text-[14px] hover:bg-[#F5D800] transition-all shadow-md active:scale-[0.98]"
                >
                  요청 보내기
                </button>
                <button
                  onClick={() => setTransferStep("group-select")}
                  className="w-full bg-white border border-[#E0E0E0] text-[#666666] py-3.5 rounded-2xl font-medium text-[14px] hover:bg-[#F5F5F5] transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transferStep === "group-waiting") {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] overflow-hidden">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-center">
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">수락 대기 중</h2>
            </div>

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FAE100] to-[#F5D800] rounded-full mx-auto flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8 text-[#3C1E1E]" />
              </div>

              <div>
                <h3 className="font-bold text-[16px] text-[#191919] mb-2">친구들의 수락을 기다리고 있어요</h3>
                <p className="text-[12px] text-[#666666]">
                  {selectedFriends.length}명에게 요청을 보냈습니다
                  <br />
                  수락이 완료되면 송금이 진행됩니다
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-[#FAE100] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#FAE100] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#FAE100] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transferStep === "group-confirm") {
    const totalPeople = acceptedFriends.length + 1
    const totalAmount = selectedAmount ? selectedAmount * totalPeople : 0

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] overflow-hidden">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between">
              <button onClick={() => setTransferStep("idle")} className="text-[13px] text-[#3C1E1E] font-medium">
                취소
              </button>
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">송금 확인</h2>
              <div className="w-8" />
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FAE100] to-[#F5D800] rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg">
                  <Users className="w-8 h-8 text-[#3C1E1E]" />
                </div>
                <h3 className="font-bold text-[16px] text-[#191919]">{acceptedFriends.length}명이 수락했어요!</h3>
                {selectedFriends.length > acceptedFriends.length && (
                  <p className="text-[11px] text-[#999999] mt-1">
                    {selectedFriends.length - acceptedFriends.length}명은 아직 응답하지 않았어요
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0]">
                <p className="text-[12px] text-[#666666] mb-2">참여 인원</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#FAE100] text-[#3C1E1E] px-3 py-1 rounded-full text-[12px] font-medium">나</span>
                  {acceptedFriends.map((friendId) => {
                    const friend = MOCK_FRIENDS.find((f) => f.id === friendId)
                    return (
                      <span
                        key={friendId}
                        className="bg-[#FFF9DB] text-[#3C1E1E] px-3 py-1 rounded-full text-[12px] font-medium"
                      >
                        {friend?.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#FFF9DB] rounded-2xl p-4 text-center">
                <p className="text-[11px] text-[#666666] mb-1">총 송금 금액</p>
                <p className="text-[24px] font-bold text-[#3C1E1E]">{formatMoney(totalAmount)}</p>
                <p className="text-[11px] text-[#666666] mt-2">
                  ({totalPeople}명 x {selectedAmount && formatMoney(selectedAmount)})
                </p>
              </div>

              <p className="text-[11px] text-center text-[#666666]">
                {partnerName}님에게
                <br />총 {formatMoney(totalAmount)}을 송금합니다
              </p>

              <button
                onClick={handleGroupTransfer}
                className="w-full bg-[#FAE100] text-[#3C1E1E] py-3.5 rounded-2xl font-bold text-[14px] hover:bg-[#F5D800] transition-all shadow-md active:scale-[0.98]"
              >
                송금하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transferStep === "confirm") {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] overflow-hidden">
            <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between">
              <button onClick={() => setTransferStep("idle")} className="text-[13px] text-[#3C1E1E] font-medium">
                이전
              </button>
              <h2 className="text-[15px] font-bold text-[#3C1E1E]">송금 확인</h2>
              <div className="w-8" />
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-[12px] text-[#666666] mb-1">{partnerName}님에게</p>
                <p className="text-[28px] font-bold text-[#191919]">{selectedAmount && formatMoney(selectedAmount)}</p>
              </div>

              {result && (
                <div className="bg-[#FFF9DB] rounded-2xl p-4">
                  <p className="text-[11px] text-[#666666] mb-2">AI 추천 메시지</p>
                  <p className="text-[14px] text-[#3C1E1E] font-medium leading-relaxed">{result.aiMessage}</p>
                </div>
              )}

              <p className="text-[11px] text-[#999999] text-center">추천 메시지와 함께 송금하시겠어요?</p>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmTransfer}
                  disabled={!selectedAmount}
                  className={`w-full py-3 rounded-2xl font-bold text-[14px] transition-all ${
                    selectedAmount
                      ? "bg-[#FAE100] text-[#3C1E1E] hover:bg-[#F5D800] shadow-md active:scale-[0.98]"
                      : "bg-[#E0E0E0] text-[#999999] cursor-not-allowed"
                  }`}
                >
                  {selectedAmount ? `${formatMoney(selectedAmount)} 송금하기` : "금액을 선택해주세요"}
                </button>
                <button
                  onClick={() => setTransferStep("idle")}
                  className="w-full bg-white border border-[#E0E0E0] text-[#666666] py-3 rounded-2xl font-medium text-[13px] hover:bg-[#F5F5F5] transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main recommendation screen
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 mx-auto w-full max-w-[430px] bg-black/60 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-[#FAFAFA] rounded-3xl shadow-2xl w-[92%] max-h-[85%] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#FAE100] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="w-8" />
            <h2 className="text-[15px] font-bold text-[#3C1E1E]">축의금 추천</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#3C1E1E]/10 flex items-center justify-center hover:bg-[#3C1E1E]/20 transition-colors"
            >
              <X className="w-4 h-4 text-[#3C1E1E]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {!result && !isLoading && !error && (
              <div className="text-center space-y-3 py-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FAE100] to-[#F5D800] rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <span className="text-3xl">💸</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1 text-[#191919]">{partnerName}님</h3>
                  <p className="text-[12px] text-[#666666] leading-relaxed">
                    AI 서비스 카나나를 통해
                    <br />
                    적절한 축의금 액수를 추천해 드립니다
                  </p>
                </div>
                <button
                  onClick={analyzeChat}
                  className="w-full bg-[#FAE100] text-[#3C1E1E] py-3 rounded-2xl font-bold text-[14px] hover:bg-[#F5D800] transition-all shadow-md active:scale-[0.98]"
                >
                  분석 시작하기
                </button>
              </div>
            )}

            {isLoading && (
              <div className="text-center space-y-3 py-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 bg-[#FAE100]/30 rounded-full animate-ping" />
                  <div className="relative w-16 h-16 bg-[#FAE100] rounded-full flex items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-[#3C1E1E]" />
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#191919]">대화 분석 중...</p>
                  <p className="text-[11px] text-[#999999] mt-1">잠시만 기다려 주세요</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center space-y-3 py-3">
                <div className="w-14 h-14 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl">😢</span>
                </div>
                <p className="text-[12px] text-red-500 font-medium">{error}</p>
                <button
                  onClick={analyzeChat}
                  className="w-full bg-[#FAE100] text-[#3C1E1E] py-2.5 rounded-2xl font-bold text-[13px] hover:bg-[#F5D800] transition-all"
                >
                  다시 시도하기
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                {/* Gift Amount Selection */}
                <div className="bg-white rounded-2xl p-3 shadow-sm">
                  <h4 className="font-bold text-[13px] text-[#191919] mb-2 text-center">추천 축의금</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSelectedAmount(result.weddingGiftRecommendation.practical)
                        setHasUserSelected(true)
                      }}
                      className={`rounded-xl p-2.5 text-center transition-all ${
                        selectedAmount === result.weddingGiftRecommendation.practical
                          ? "bg-[#FAE100] shadow-md scale-[1.02]"
                          : "bg-[#F5F5F5] hover:bg-[#EEEEEE]"
                      }`}
                    >
                      <div className="text-[9px] text-[#999999] mb-0.5">실속형</div>
                      <div className="font-bold text-[12px] text-[#191919]">
                        {formatMoney(result.weddingGiftRecommendation.practical)}
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAmount(result.weddingGiftRecommendation.recommended)
                        setHasUserSelected(true)
                      }}
                      className={`rounded-xl p-2.5 text-center transition-all relative ${
                        selectedAmount === result.weddingGiftRecommendation.recommended
                          ? "bg-[#FAE100] shadow-md scale-[1.02]"
                          : "bg-[#FFF9DB] border-2 border-[#FAE100]"
                      }`}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-[#FAE100] text-[#3C1E1E] text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                        추천
                      </div>
                      <div className="text-[9px] text-[#999999] mb-0.5 mt-0.5">추천</div>
                      <div className="font-bold text-[12px] text-[#191919]">
                        {formatMoney(result.weddingGiftRecommendation.recommended)}
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAmount(result.weddingGiftRecommendation.generous)
                        setHasUserSelected(true)
                      }}
                      className={`rounded-xl p-2.5 text-center transition-all ${
                        selectedAmount === result.weddingGiftRecommendation.generous
                          ? "bg-[#FAE100] shadow-md scale-[1.02]"
                          : "bg-[#F5F5F5] hover:bg-[#EEEEEE]"
                      }`}
                    >
                      <div className="text-[9px] text-[#999999] mb-0.5">넉넉형</div>
                      <div className="font-bold text-[12px] text-[#191919]">
                        {formatMoney(result.weddingGiftRecommendation.generous)}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Calculation Breakdown - only show after feedback */}
                {hasFeedbackApplied && result.calculationBreakdown && (
                  <div className="bg-white rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">🧾</span>
                      <h4 className="font-bold text-[12px] text-[#191919]">산출 근거</h4>
                    </div>
                    <div className="text-[11px] text-[#666666] space-y-1">
                      <div className="flex justify-between">
                        <span>기본 점수</span>
                        <span>{formatMoney(result.calculationBreakdown.baseScore)}</span>
                      </div>
                      {result.calculationBreakdown.adjustments.map((adj, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate max-w-[60%]">
                            {adj.amount >= 0 ? "(+)" : "(-)"} {adj.reason}
                          </span>
                          <span className={adj.amount >= 0 ? "text-green-600" : "text-red-500"}>
                            {adj.amount >= 0 ? "+" : ""}
                            {formatMoney(adj.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-[#EEE] pt-1 flex justify-between font-bold text-[#191919]">
                        <span>합계</span>
                        <span>{formatMoney(result.calculationBreakdown.finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intimacy Analysis */}
                <div className="bg-white rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-3">
                    {/* Circular Progress */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#F5F5F5" strokeWidth="6" />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="#FAE100"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - result.intimacyScore / 100)}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[14px] font-bold text-[#191919]">{result.intimacyScore}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-[#666666] mt-1">
                        {getIntimacyLevelKorean(result.intimacyLevel)}
                      </p>
                    </div>

                    {/* Reasons */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[11px] text-[#191919] mb-1.5">분석 근거</h4>
                      <div className="space-y-1">
                        {result.intimacyReason.slice(0, 3).map((reason, idx) => (
                          <p key={idx} className="text-[10px] text-[#666666] truncate">
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Input */}
                <div className="bg-white rounded-2xl p-3 shadow-sm">
                  <h4 className="font-bold text-[11px] text-[#191919] mb-2">추가 의견</h4>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="예: 요즘 지갑 사정이 안좋아요 / 호텔 결혼식이에요"
                    className="w-full bg-[#F5F5F5] rounded-xl p-2.5 text-[12px] resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[#FAE100] placeholder:text-[#AAAAAA]"
                  />
                  {feedback.trim() && (
                    <button
                      onClick={reAnalyzeWithFeedback}
                      className="w-full mt-2 bg-[#3C1E1E] text-white py-2 rounded-xl font-medium text-[12px] hover:bg-[#2C1515] transition-all"
                    >
                      의견 반영하여 다시 추천받기
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {result && (
            <div className="p-3 border-t border-[#E0E0E0] flex-shrink-0">
              <button
                onClick={handleSendTransfer}
                disabled={!selectedAmount}
                className={`w-full py-3 rounded-2xl font-bold text-[14px] transition-all ${
                  selectedAmount
                    ? "bg-[#FAE100] text-[#3C1E1E] hover:bg-[#F5D800] shadow-md active:scale-[0.98]"
                    : "bg-[#E0E0E0] text-[#999999] cursor-not-allowed"
                }`}
              >
                {selectedAmount ? `${formatMoney(selectedAmount)} 송금하기` : "금액을 선택해주세요"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
