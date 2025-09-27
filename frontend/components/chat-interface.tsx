"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Send, MoreVertical, Flag, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ReportModal } from "@/components/report-modal"
import { BlockUserModal } from "@/components/block-user-modal"

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  sender: {
    first_name: string
    last_name: string
    profile_photo_url?: string
  }
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  profile_photo_url?: string
  major: string
  graduation_year: number
}

interface ChatInterfaceProps {
  matchId: string
  currentUser: Profile
  otherUser: Profile
  initialMessages: Message[]
}

export function ChatInterface({ matchId, currentUser, otherUser, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id}))`,
        },
        async (payload) => {
          // Get the full message with sender info
          const { data: newMessage } = await supabase
            .from("messages")
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(first_name, last_name, profile_photo_url)
            `)
            .eq("id", payload.new.id)
            .single()

          if (newMessage) {
            setMessages((prev) => [...prev, newMessage])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUser.id, otherUser.id, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        match_id: matchId,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return formatDistanceToNow(date, { addSuffix: true })
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 bg-card border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/matches">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {otherUser.profile_photo_url ? (
              <img
                src={otherUser.profile_photo_url || "/placeholder.svg"}
                alt={`${otherUser.first_name} ${otherUser.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary/60">
                  {otherUser.first_name[0]}
                  {otherUser.last_name[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="font-semibold">
              {otherUser.first_name} {otherUser.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {otherUser.major} • Class of {otherUser.graduation_year}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ReportModal
              reportedUserId={otherUser.id}
              reportedUserName={`${otherUser.first_name} ${otherUser.last_name}`}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              }
            />
            <BlockUserModal
              blockedUserId={otherUser.id}
              blockedUserName={`${otherUser.first_name} ${otherUser.last_name}`}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <UserX className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-6 text-center max-w-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Start the conversation!</h3>
              <p className="text-sm text-muted-foreground">
                You and {otherUser.first_name} both liked each other. Say hello!
              </p>
            </Card>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUser.id
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                    {!isCurrentUser && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {message.sender.profile_photo_url ? (
                          <img
                            src={message.sender.profile_photo_url || "/placeholder.svg"}
                            alt={`${message.sender.first_name} ${message.sender.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary/60">{message.sender.first_name[0]}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                        }`}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-card">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${otherUser.first_name}...`}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
