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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Flag, AlertTriangle } from "lucide-react"

interface ReportModalProps {
  reportedUserId: string
  reportedUserName: string
  trigger?: React.ReactNode
}

const reportReasons = [
  { value: "inappropriate_content", label: "Inappropriate content or photos" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "fake_profile", label: "Fake or misleading profile" },
  { value: "spam", label: "Spam or promotional content" },
  { value: "underage", label: "Appears to be underage" },
  { value: "other", label: "Other" },
]

export function ReportModal({ reportedUserId, reportedUserName, trigger }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason: reason,
        description: description.trim() || null,
      })

      if (error) throw error

      setIsSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
        setReason("")
        setDescription("")
      }, 2000)
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report {reportedUserName}
          </DialogTitle>
          <DialogDescription>
            Help us keep Campus Connect safe by reporting inappropriate behavior or content.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Report Submitted</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for helping keep our community safe. We'll review this report promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Why are you reporting this user?</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {reportReasons.map((reportReason) => (
                  <div key={reportReason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                    <Label htmlFor={reportReason.value} className="text-sm font-normal">
                      {reportReason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional details (optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide any additional context that might help our review..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={!reason || isLoading} className="flex-1">
                {isLoading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
