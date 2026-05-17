import { useMemo, useState } from "react"

import { Button } from "@blocks/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@blocks/ui/components/card"
import { Dialog, DialogTrigger } from "@blocks/ui/components/dialog"
import { CopyToClipboardButton } from "@blocks/ui/components/copy-to-clipboard-button"
import { ImportFileModalContent } from "@blocks/ui/components/import-file-modal"
import { InfiniteScroller } from "@blocks/ui/components/infinite-scroller"
import { MaskedText } from "@blocks/ui/components/masked-text"
import { MultiSelect } from "@blocks/ui/components/multi-select"
import { Timeline } from "@blocks/ui/components/timeline"
import {
  WizardHorizontalTrackBar,
  WizardStepContent,
  WizardStepperProvider,
  WizardStepViewport,
  WizardVerticalTrackBar,
  useWizardStepper,
} from "@blocks/ui/components/wizard-stepper"

const FILTER_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Japanese", value: "ja" },
]

type LogItem = { id: number; message: string }

const WizardDemoControls = () => {
  const { currentStep, nextStep, previousStep } = useWizardStepper()

  return (
    <div className="mt-4 flex gap-2">
      <Button type="button" variant="outline" disabled={currentStep <= 1} onClick={previousStep}>
        Back
      </Button>
      <Button type="button" onClick={nextStep}>
        Next
      </Button>
    </div>
  )
}

export const PortedComponentsShowcase = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["en"])
  const [logs] = useState<LogItem[]>([
    { id: 1, message: "Initial log entry" },
    { id: 2, message: "Second log entry" },
  ])

  const wizardSteps = useMemo(
    () => [
      { id: 1, title: "Account" },
      { id: 2, title: "Profile" },
      { id: 3, title: "Review" },
    ],
    [],
  )

  const timelineEvents = [
    { time: "10:30 AM", date: "May 17", description: "Translation published" },
    { time: "09:15 AM", date: "May 17", description: "Draft saved" },
    { time: "08:00 AM", date: "May 16", description: "Import started" },
  ]

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Masked text</CardTitle>
        </CardHeader>
        <CardContent>
          <MaskedText text="secret-api-key-12345" showFirstN={4} showLastN={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Copy to clipboard</CardTitle>
        </CardHeader>
        <CardContent>
          <CopyToClipboardButton textToCopy="blocks-ui-demo-token">
            <code className="rounded bg-muted px-2 py-1 text-sm">blocks-ui-demo-token</code>
          </CopyToClipboardButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-select (Fuse + debounce)</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelect
            title="Languages"
            options={FILTER_OPTIONS}
            selected={selectedFilters}
            onSelectChange={setSelectedFilters}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Infinite scroller</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <InfiniteScroller
            initialData={logs}
            getItemKey={(item) => item.id}
            hasTopMore={logs.length < 8}
            pollingInterval={8000}
            loadingIndicator={<p className="py-2 text-center text-sm text-muted-foreground">Loading…</p>}
            topFn={async (first) => {
              const id = (first?.id ?? logs[0]?.id ?? 0) - 1
              if (id < 1) return []
              return [{ id, message: `Older log #${id}` }]
            }}
            pollingFn={async (last) => {
              const id = (last?.id ?? 0) + 1
              if (id > 6) return []
              return [{ id, message: `New log #${id}` }]
            }}
            renderItem={(item) => (
              <p key={item.id} className="border-b px-3 py-2 text-sm">
                {item.message}
              </p>
            )}
            bottomIndicator={(scrollToBottom) => (
              <Button
                type="button"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={scrollToBottom}
              >
                New messages
              </Button>
            )}
            emptyContent="No logs yet"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wizard stepper</CardTitle>
        </CardHeader>
        <CardContent>
          <WizardStepperProvider steps={wizardSteps}>
            <div className="grid gap-6 md:grid-cols-2">
              <WizardVerticalTrackBar />
              <WizardStepViewport className="min-h-24">
                <WizardStepContent currentStep={1} stepNumber={1}>
                  <p className="text-sm text-muted-foreground">Step 1 content</p>
                </WizardStepContent>
                <WizardStepContent currentStep={2} stepNumber={2}>
                  <p className="text-sm text-muted-foreground">Step 2 content</p>
                </WizardStepContent>
                <WizardStepContent currentStep={3} stepNumber={3}>
                  <p className="text-sm text-muted-foreground">Step 3 content</p>
                </WizardStepContent>
                <WizardDemoControls />
              </WizardStepViewport>
            </div>
            <div className="mt-8 hidden md:block">
              <WizardHorizontalTrackBar />
            </div>
          </WizardStepperProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline events={timelineEvents} onRevert={() => undefined} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import file modal</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button">Open import modal</Button>
            </DialogTrigger>
            <ImportFileModalContent
              dialogTitle="Import translations"
              onCheckActivity={() => undefined}
            />
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
