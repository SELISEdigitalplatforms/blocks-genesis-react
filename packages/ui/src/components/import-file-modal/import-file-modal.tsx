"use client"

import { useState, type ReactNode } from "react"
import { ArrowDownToLine, CloudUpload, Paperclip, TriangleAlert } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@blocks-kit/ui/components/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@blocks-kit/ui/components/dialog"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@blocks-kit/ui/components/file-uploader"
import { cn } from "@blocks-kit/ui/lib/utils"
import { fadeInScale, fadeTransition } from "@blocks-kit/ui/lib/motion-presets"

export type ImportFileModalDropzoneOptions = {
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
}

export type ImportFileModalContentProps = {
  dialogTitle: string
  dialogDescription?: string
  warningTitle?: string
  warningDescription?: string
  acceptedFormatsLabel?: string
  templateLabel?: string
  uploadLabel?: string
  cancelLabel?: string
  processingTitle?: string
  processingDescription?: string
  checkActivityLabel?: string
  dropzoneOptions?: ImportFileModalDropzoneOptions
  dropzoneContent?: ReactNode
  onUpload?: (files: File[]) => void
  onCheckActivity?: () => void
  onCancel?: () => void
  onDownloadTemplate?: () => void
  className?: string
}

const DefaultDropzoneContent = ({
  acceptedFormatsLabel = "SVG, PNG, JPG or GIF",
}: {
  acceptedFormatsLabel?: string
}) => (
  <>
    <CloudUpload className="mb-3 size-8 text-muted-foreground" aria-hidden />
    <p className="mb-1 text-sm text-foreground">
      <span className="font-semibold text-primary">Click to upload</span>
      {" "}
      or drag and drop
    </p>
    <p className="text-xs text-muted-foreground">{acceptedFormatsLabel}</p>
  </>
)

export const ImportFileModalContent = ({
  dialogTitle,
  dialogDescription = "Upload a file using the template format.",
  warningTitle = "File format",
  warningDescription = "Download the template and re-upload with your data to avoid errors.",
  acceptedFormatsLabel,
  templateLabel = "File Template",
  uploadLabel = "Upload",
  cancelLabel = "Cancel",
  processingTitle = "Processing request",
  processingDescription = "You will be notified when the file is ready. Check activity for details.",
  checkActivityLabel = "Check Activity",
  dropzoneOptions = { maxFiles: 5, maxSize: 1024 * 1024 * 4, multiple: true },
  dropzoneContent,
  onUpload,
  onCheckActivity,
  onCancel,
  onDownloadTemplate,
  className,
}: ImportFileModalContentProps) => {
  const [files, setFiles] = useState<File[] | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleUpload = () => {
    if (files?.length) {
      onUpload?.(files)
    }
    setShowConfirmation(true)
  }

  return (
    <DialogContent className={cn("rounded-md sm:max-w-[450px]", className)}>
      <AnimatePresence mode="wait">
        {!showConfirmation ? (
          <motion.div
            key="upload-form"
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fadeTransition}
          >
            <DialogHeader>
              <DialogTitle className="text-left">{dialogTitle}</DialogTitle>
              <DialogDescription className="text-left">{dialogDescription}</DialogDescription>
            </DialogHeader>
            <motion.div
              className="flex flex-col rounded-md bg-muted/50 px-3 py-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fadeTransition, delay: 0.05 }}
            >
              <motion.div className="flex flex-row items-center">
                <TriangleAlert className="size-4 text-amber-600 dark:text-amber-500" aria-hidden />
                <p className="ml-2 text-sm font-semibold text-foreground">{warningTitle}</p>
              </motion.div>
              <p className="mt-2 text-sm text-muted-foreground">{warningDescription}</p>
            </motion.div>
            <FileUploader
              value={files}
              onValueChange={setFiles}
              dropzoneOptions={dropzoneOptions}
              className="relative my-2 rounded-lg"
            >
              <FileInput className="rounded border border-dashed border-border">
                <div className="flex w-full flex-col items-center justify-center py-4">
                  {dropzoneContent ?? (
                    <DefaultDropzoneContent acceptedFormatsLabel={acceptedFormatsLabel} />
                  )}
                </div>
              </FileInput>
              <FileUploaderContent>
                <AnimatePresence>
                  {files?.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={fadeTransition}
                    >
                      <FileUploaderItem index={index}>
                        <Paperclip className="size-4 stroke-current" aria-hidden />
                        <span>{file.name}</span>
                      </FileUploaderItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </FileUploaderContent>
            </FileUploader>
            <DialogFooter className="mr-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="mt-2 flex flex-row items-center gap-2 text-sm font-medium text-primary"
                onClick={onDownloadTemplate}
              >
                <ArrowDownToLine className="size-5" aria-hidden />
                {templateLabel}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="default" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button type="button" size="default" onClick={handleUpload}>
                  {uploadLabel}
                </Button>
              </div>
            </DialogFooter>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fadeTransition}
          >
            <DialogHeader>
              <DialogTitle className="text-left">{processingTitle}</DialogTitle>
              <DialogDescription className="mt-4 text-sm text-muted-foreground">
                {processingDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-0 flex flex-row-reverse gap-2">
              {onCheckActivity ? (
                <DialogTrigger asChild>
                  <Button type="button" size="default" variant="outline" onClick={onCheckActivity}>
                    {checkActivityLabel}
                  </Button>
                </DialogTrigger>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContent>
  )
}
