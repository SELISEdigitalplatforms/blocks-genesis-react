"use client"

import { Check, Copy } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState, type MouseEvent, type ReactNode } from "react"

import { Button } from "@blocks-kit/ui/components/button"
import { cn } from "@blocks-kit/ui/lib/utils"
import { fadeTransition } from "@blocks-kit/ui/lib/motion-presets"

export type CopyToClipboardButtonProps = {
  textToCopy: string
  children: ReactNode
  isHoverable?: boolean
  copyLabel?: string
  copiedLabel?: string
  className?: string
}

export const CopyToClipboardButton = ({
  textToCopy,
  children,
  isHoverable = false,
  copyLabel = "Copy",
  copiedLabel = "Copied!",
  className,
}: CopyToClipboardButtonProps) => {
  const [isCopying, setIsCopying] = useState(false)

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isCopying) return

    setIsCopying(true)

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = textToCopy
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("Failed to copy:", error)
      setIsCopying(false)
      return
    }

    window.setTimeout(() => setIsCopying(false), 1000)
  }

  return (
    <div className={cn("group flex items-center gap-2", className)}>
      {children}
      <motion.div
        layout
        className={cn(
          "relative flex min-w-[70px] items-center gap-1",
          isHoverable ? "opacity-0 group-hover:opacity-100" : "opacity-100",
        )}
        initial={false}
        animate={{ opacity: isHoverable ? undefined : 1 }}
        transition={fadeTransition}
      >
        <Button
          type="button"
          variant="ghost"
          className="peer h-auto p-1 transition-colors hover:bg-muted"
          onClick={handleCopy}
          disabled={isCopying}
          aria-label={isCopying ? copiedLabel : copyLabel}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCopying ? (
              <motion.span
                key="copied"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={fadeTransition}
              >
                <Check className="size-4 text-green-600 dark:text-green-500" aria-hidden />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={fadeTransition}
              >
                <Copy className="size-4 text-muted-foreground" aria-hidden />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <motion.span
          layout
          className="pointer-events-none absolute left-8 top-1/2 z-10 hidden -translate-y-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md peer-hover:block"
          animate={{ opacity: isCopying ? 1 : 0.9 }}
          transition={fadeTransition}
        >
          {isCopying ? copiedLabel : copyLabel}
        </motion.span>
      </motion.div>
    </div>
  )
}
