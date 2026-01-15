import { ChatRoomDetail } from "@/components/chat-room-detail"

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params
  return <ChatRoomDetail roomId={id} />
}
