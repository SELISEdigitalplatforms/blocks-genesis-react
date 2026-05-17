"use client"

import { Check, PlusCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@blocks/ui/components/badge"
import { Button } from "@blocks/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@blocks/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@blocks/ui/components/popover"
import { Separator } from "@blocks/ui/components/separator"
import { useDebouncedFuseFilter } from "@blocks/ui/hooks/use-debounced-fuse-filter"
import { useIsMobile } from "@blocks/ui/hooks/use-mobile"
import { usePopoverWidth } from "@blocks/ui/hooks/use-popover-width"
import { cn } from "@blocks/ui/lib/utils"
import { fadeTransition } from "@blocks/ui/lib/motion-presets"

export type MultiSelectOption = {
  label: string
  value: string
}

export type MultiSelectProps = {
  title?: string
  options: MultiSelectOption[]
  selected: string[]
  onSelectChange: (values: string[]) => void
  searchPlaceholder?: string
  emptyMessage?: string
  clearLabel?: string
}

export const MultiSelect = ({
  title,
  options,
  onSelectChange,
  selected,
  searchPlaceholder,
  emptyMessage = "No results found.",
  clearLabel = "Clear",
}: MultiSelectProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(selected)
  const [search, setSearch] = useState("")
  const [buttonRef, popoverWidth] = usePopoverWidth()
  const isMobile = useIsMobile()

  useEffect(() => {
    setSelectedValues(selected)
  }, [selected])

  const fuseOptions = useMemo(
    () => ({ keys: ["label", "value"], threshold: 0.35 }),
    [],
  )
  const filteredOptions = useDebouncedFuseFilter(options, search, fuseOptions)

  const handleSelect = (value: string) => {
    setSelectedValues((prev) => {
      const next = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      onSelectChange(next)
      return next
    })
  }

  const handleReset = () => {
    onSelectChange([])
    setSelectedValues([])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button ref={buttonRef} variant="outline" size="sm" className="h-8 border-dashed">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <PlusCircle className="mr-2 size-4" aria-hidden />
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{title?.split(" ")[0]}</span>
            </div>
            <AnimatePresence mode="popLayout">
              {selectedValues.length > 0 ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={fadeTransition}
                  className="flex items-center"
                >
                  <Separator orientation="vertical" className="hidden h-4 sm:mx-2 sm:block" />
                  <motion.div layout className="flex space-x-1">
                    {selectedValues.length > 2 ? (
                      <motion.div layout key="count" transition={fadeTransition}>
                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                          {selectedValues.length} selected
                        </Badge>
                      </motion.div>
                    ) : (
                      options
                        .filter((option) => selectedValues.includes(option.value))
                        .map((option) => (
                          <motion.div
                            layout
                            key={option.value}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={fadeTransition}
                          >
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                              {option.label}
                            </Badge>
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 sm:w-full"
        align="start"
        style={isMobile ? { width: popoverWidth ? `${popoverWidth}px` : "auto" } : undefined}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder ?? title}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <motion.div
                      layout
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                      animate={{ scale: isSelected ? 1 : 0.92 }}
                      transition={fadeTransition}
                    >
                      <AnimatePresence>
                        {isSelected ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={fadeTransition}
                          >
                            <Check className="size-4" aria-hidden />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleReset}
                    className="justify-center text-center"
                  >
                    {clearLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
