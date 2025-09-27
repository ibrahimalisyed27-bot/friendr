"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, UserX } from "lucide-react"
import { useRouter } from "next/navigation"

interface BlockUserModalProps {
  blockedUserId: string
  blockedUserName: string
  trigger?: React.ReactNode
}

export function BlockUserModal({ blockedUserId, blockedUserName, trigger }: BlockUserModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBlock = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Add to blocked users (we'll create this table)
      const { error: blockError } = await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: blockedUserId,
      })

      if (blockError) throw blockError

      // Remove any existing matches
      const { error: matchError } = await supabase
        .from("matches")
        .delete()
        .or(
          `and(user_id.eq.${user.id},target_user_id.eq.${blockedUserId}),and(user_id.eq.${blockedUserId},target_user_id.eq.${user.id})`,
        )

      if (matchError) console.error("Error removing matches:", matchError)

      setIsOpen(false)
      router.push("/matches")
    } catch (error) {
      console.error("Error blocking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <UserX className="w-4 h-4 mr-2" />
            Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Block {blockedUserName}?
          </DialogTitle>
          <DialogDescription>
            Blocking this user will remove them from your matches and prevent future interactions. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What happens when you block someone:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• They won't appear in your swipe deck</li>
              <li>• Any existing matches will be removed</li>
              <li>• You won't be able to message each other</li>
              <li>• They won't be notified that you blocked them</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlock} disabled={isLoading} className="flex-1">
              {isLoading ? "Blocking..." : "Block User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
