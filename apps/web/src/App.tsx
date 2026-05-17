import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Bell,
  Bold,
  Calendar as CalendarIcon,
  ChevronRight,
  Copy,
  CreditCard,
  Github,
  Italic,
  LogOut,
  Mail,
  Menu,
  Paperclip,
  Plus,
  Settings,
  Underline,
  Upload,
  User as UserIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@blocks/ui/components/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@blocks/ui/components/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@blocks/ui/components/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@blocks/ui/components/avatar";
import { Badge } from "@blocks/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@blocks/ui/components/breadcrumb";
import { Button } from "@blocks/ui/components/button";
import { Calendar } from "@blocks/ui/components/calendar";
import { DateRangePicker } from "@blocks/ui/components/date-range-picker";
import type { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@blocks/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@blocks/ui/components/carousel";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@blocks/ui/components/chart";
import { Checkbox } from "@blocks/ui/components/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@blocks/ui/components/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@blocks/ui/components/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@blocks/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@blocks/ui/components/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@blocks/ui/components/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@blocks/ui/components/form";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@blocks/ui/components/file-uploader";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@blocks/ui/components/hover-card";
import { KanbanBoard } from "@blocks/ui/components/kanban";
import { Input } from "@blocks/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@blocks/ui/components/input-otp";
import { Label } from "@blocks/ui/components/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@blocks/ui/components/menubar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@blocks/ui/components/pagination";
import { PasswordInput } from "@blocks/ui/components/password-input";
import { Popover, PopoverContent, PopoverTrigger } from "@blocks/ui/components/popover";
import { Progress } from "@blocks/ui/components/progress";
import { RadioGroup, RadioGroupItem } from "@blocks/ui/components/radio-group";
import { ScrollArea } from "@blocks/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@blocks/ui/components/select";
import { Separator } from "@blocks/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@blocks/ui/components/sheet";
import { Skeleton } from "@blocks/ui/components/skeleton";
import { Slider } from "@blocks/ui/components/slider";
import { Spinner } from "@blocks/ui/components/spinner";
import { Stepper } from "@blocks/ui/components/stepper";
import { Switch } from "@blocks/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blocks/ui/components/table";
import { TablePagination } from "@blocks/ui/components/table-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@blocks/ui/components/tabs";
import { Textarea } from "@blocks/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@blocks/ui/components/toggle-group";
import { Toaster, toast } from "@blocks/ui/components/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@blocks/ui/components/tooltip";

import { CommandShowcase } from "./components/command-showcase";
import { DataTableShowcase } from "./components/data-table-showcase";
import { PortedComponentsShowcase } from "./components/ported-components-showcase";
import { PlaygroundSectionNav } from "./components/playground-section-nav";
import { Row, Section } from "./components/section";
import { ThemeToggle } from "./components/theme-toggle";

/* ------------------------------------------------------------------ */
/* Showcase sub-components                                             */
/* ------------------------------------------------------------------ */

function ButtonsShowcase() {
  return (
    <div className="space-y-6">
      <Row label="Variants">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive-outline">Destructive Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </Row>
      <Row label="Sizes">
        <Button size="xxs">xxs</Button>
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon" aria-label="Add">
          <Plus className="h-4 w-4" />
        </Button>
      </Row>
      <Row label="With icons / state">
        <Button>
          <Mail className="mr-2 h-4 w-4" /> Email
        </Button>
        <Button variant="secondary">
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Button>
        <Button disabled>
          <Spinner className="mr-2" size="sm" /> Loading
        </Button>
        <Button variant="outline" disabled>
          Disabled
        </Button>
      </Row>
    </div>
  );
}

function BadgesShowcase() {
  return (
    <Row>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </Row>
  );
}

function TypographyShowcase() {
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert">
      <h3>The quick brown fox</h3>
      <p>
        Tailwind <strong>Typography</strong> renders this <em>prose</em> block. Inline{" "}
        <code>code</code>, <a href="#typography">links</a> and lists all use design-system tokens.
      </p>
      <ul>
        <li>First item</li>
        <li>Second item with <code>monospace</code></li>
        <li>Third item</li>
      </ul>
      <blockquote>Good design is as little design as possible. — Dieter Rams</blockquote>
    </article>
  );
}

function InputsShowcase() {
  const [otp, setOtp] = React.useState("");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" type="email" placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="demo-pw">Password</Label>
        <PasswordInput id="demo-pw" placeholder="••••••••" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="demo-textarea">Bio</Label>
        <Textarea id="demo-textarea" placeholder="Tell us a bit about yourself…" rows={3} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>One-time code</Label>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
}

function FileUploaderShowcase() {
  const [files, setFiles] = React.useState<File[] | null>(null);

  const dropzoneOptions = {
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 5,
    maxSize: 4 * 1024 * 1024,
    multiple: true,
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag and drop or click to browse. Up to 5 files, 4MB each (images or PDF).
      </p>
      <FileUploader value={files} onValueChange={setFiles} dropzoneOptions={dropzoneOptions}>
        <FileInput className="rounded-lg border-2 border-dashed border-border bg-muted/30 outline-none">
          <div className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm">
              <span className="font-semibold text-primary">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP, or PDF</p>
          </div>
        </FileInput>
        <FileUploaderContent>
          {files?.map((file, index) => (
            <FileUploaderItem key={`${file.name}-${index}`} index={index}>
              <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{file.name}</span>
            </FileUploaderItem>
          ))}
        </FileUploaderContent>
      </FileUploader>
      {files && files.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} selected (
          {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB total)
        </p>
      ) : null}
    </div>
  );
}


function SelectionsShowcase() {
  const [agree, setAgree] = React.useState<boolean | "indeterminate">(false);
  const [plan, setPlan] = React.useState("pro");
  const [notify, setNotify] = React.useState(true);
  const [volume, setVolume] = React.useState([60]);
  const [style, setStyle] = React.useState<string[]>(["bold"]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Label>Checkbox</Label>
        <div className="flex items-center gap-2">
          <Checkbox id="agree" checked={agree} onCheckedChange={setAgree} />
          <Label htmlFor="agree" className="text-sm font-normal">
            I agree to the terms
          </Label>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Radio Group</Label>
        <RadioGroup value={plan} onValueChange={setPlan} className="flex gap-4">
          {(["free", "pro", "team"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <RadioGroupItem id={`plan-${p}`} value={p} />
              <Label htmlFor={`plan-${p}`} className="text-sm font-normal capitalize">
                {p}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-3">
        <Label htmlFor="notify">Switch</Label>
        <div className="flex items-center gap-2">
          <Switch id="notify" checked={notify} onCheckedChange={setNotify} />
          <span className="text-sm text-muted-foreground">
            Notifications {notify ? "on" : "off"}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Slider — volume {volume[0]}</Label>
        <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
      </div>
      <div className="space-y-3 md:col-span-2">
        <Label>Toggle Group</Label>
        <ToggleGroup type="multiple" value={style} onValueChange={setStyle}>
          <ToggleGroupItem value="bold" aria-label="Bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

function SelectShowcase() {
  return (
    <div className="max-w-xs space-y-2">
      <Label htmlFor="framework">Framework</Label>
      <Select defaultValue="react">
        <SelectTrigger id="framework">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
          <SelectItem value="svelte">Svelte</SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* --- Form (RHF + zod) --- */

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

function FormShowcase() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    toast.success("Signed in", { description: values.email });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>We never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="At least 8 chars" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign in</Button>
      </form>
    </Form>
  );
}

function CardsShowcase() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Acme Plan</CardTitle>
          <CardDescription>Everything you need to ship.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Unlimited blocks, 5 seats, audit log, priority support.
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-2xl font-semibold">
            $29<span className="text-sm font-normal text-muted-foreground">/mo</span>
          </span>
          <Button>Upgrade</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="Alex" />
            <AvatarFallback>AX</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-base">Alex Park</CardTitle>
            <CardDescription>Product Designer · @alex</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">Building a calm and confident design system at Blocks.</p>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertsShowcase() {
  return (
    <div className="space-y-3">
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can use the design tokens however you like.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Please review your input and try again.</AlertDescription>
      </Alert>
    </div>
  );
}

function ProgressShowcase() {
  const [value, setValue] = React.useState(33);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Upload progress</span>
          <span className="tabular-nums text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} />
        <Row>
          <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 10))}>
            -10
          </Button>
          <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(100, v + 10))}>
            +10
          </Button>
        </Row>
      </div>
      <Row label="Spinner">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
      </Row>
      <div className="space-y-2">
        <Label>Stepper</Label>
        <Stepper
          currentStep={1}
          steps={[
            { id: "account", title: "Account" },
            { id: "profile", title: "Profile" },
            { id: "review", title: "Review" },
          ]}
        />
      </div>
    </div>
  );
}

function DisclosureShowcase() {
  const [open, setOpen] = React.useState(false);
  return (
    <Tabs defaultValue="tabs" className="w-full">
      <TabsList>
        <TabsTrigger value="tabs">Tabs</TabsTrigger>
        <TabsTrigger value="accordion">Accordion</TabsTrigger>
        <TabsTrigger value="collapsible">Collapsible</TabsTrigger>
      </TabsList>
      <TabsContent value="tabs" className="text-sm text-muted-foreground">
        Tabs let you switch between related views in the same context.
      </TabsContent>
      <TabsContent value="accordion">
        <Accordion type="single" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>Yes — it ships with the WAI-ARIA pattern.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>Tokens come from your design system.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
      <TabsContent value="collapsible">
        <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              {open ? "Hide" : "Show"} details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            Hidden content revealed on toggle.
          </CollapsibleContent>
        </Collapsible>
      </TabsContent>
    </Tabs>
  );
}

function OverlaysShowcase() {
  return (
    <TooltipProvider>
      <div className="grid gap-3 md:grid-cols-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover for tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Quick label</TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-2">
            <p className="text-sm font-medium">Adjust settings</p>
            <p className="text-xs text-muted-foreground">
              Popovers are useful for inline forms.
            </p>
          </PopoverContent>
        </Popover>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Hover card</Button>
          </HoverCardTrigger>
          <HoverCardContent className="flex gap-3">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=5" alt="Nora" />
              <AvatarFallback>NV</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Nora V.</p>
              <p className="text-xs text-muted-foreground">Designs systems for a living.</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </TooltipProvider>
  );
}

function MenusShowcase() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <UserIcon className="mr-2 h-4 w-4" /> Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" /> Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" /> Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContextMenu>
        <ContextMenuTrigger className="flex h-20 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <Copy className="mr-2 h-4 w-4" /> Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>New window</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Share</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}

function DialogsShowcase() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They will receive an email with a join link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" placeholder="teammate@example.com" />
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive-outline">Delete account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Configure how you want to be notified.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="n1">Mentions</Label>
              <Switch id="n1" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="n2">Replies</Label>
              <Switch id="n2" />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Quick action</DrawerTitle>
              <DrawerDescription>Mobile-friendly bottom sheet.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2 text-sm text-muted-foreground">
              Drawers slide up from the bottom and are great on touch devices.
            </div>
            <DrawerFooter>
              <Button>Confirm</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function CalendarShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [createRange, setCreateRange] = React.useState<DateRange | undefined>();
  const [updateRange, setUpdateRange] = React.useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
      <Row label="Date range pickers">
        <DateRangePicker label="Create Date" value={createRange} onChange={setCreateRange} />
        <DateRangePicker
          label="Last Update Date"
          value={updateRange}
          onChange={setUpdateRange}
        />
      </Row>
      <div className="flex flex-wrap items-start gap-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-55 justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? date.toDateString() : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function CarouselShowcase() {
  return (
    <Carousel className="mx-auto w-full max-w-md">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, i) => (
          <CarouselItem key={i}>
            <Card>
              <CardContent className="flex aspect-video items-center justify-center text-3xl font-semibold">
                {i + 1}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

function NavigationShowcase() {
  const [page, setPage] = React.useState(2);
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Navigation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <TablePagination
        pageIndex={page}
        pageCount={12}
        pageSize={20}
        onPageChange={setPage}
        onPageSizeChange={() => undefined}
      />
    </div>
  );
}

function ScrollSeparatorShowcase() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ScrollArea className="h-48 w-full rounded-md border border-border p-3">
        <ul className="space-y-1 text-sm">
          {Array.from({ length: 40 }).map((_, i) => (
            <li key={i} className="rounded px-2 py-1 hover:bg-muted">
              Item {i + 1}
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="space-y-2 text-sm">
        <div>Top section</div>
        <Separator />
        <div>Middle section</div>
        <Separator />
        <div className="flex items-center gap-2">
          <span>One</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Two</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Three</span>
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  { id: 1, name: "Acme Inc.", plan: "Team", status: "Active" },
  { id: 2, name: "Globex", plan: "Pro", status: "Trial" },
  { id: 3, name: "Hooli", plan: "Free", status: "Active" },
  { id: 4, name: "Initech", plan: "Pro", status: "Past due" },
];

function TableShowcase() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{row.plan}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={row.status === "Active" ? "secondary" : "destructive"}>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];
const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--primary))" },
  mobile: { label: "Mobile", color: "hsl(var(--accent-foreground))" },
} satisfies ChartConfig;

function ChartsShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-medium">Area</p>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="desktop"
              type="monotone"
              fill="var(--color-desktop)"
              stroke="var(--color-desktop)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Bar</p>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function ToastsShowcase() {
  return (
    <Row>
      <Button onClick={() => toast("Saved", { description: "Your changes are saved." })}>
        Default toast
      </Button>
      <Button variant="secondary" onClick={() => toast.success("All systems go!")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.info("FYI — new release out.")}>
        Info
      </Button>
      <Button variant="destructive" onClick={() => toast.error("Failed to save")}>
        Error
      </Button>
    </Row>
  );
}

function KanbanShowcase() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Accessible Kanban with{" "}
        <a
          href="https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          @dnd-kit
        </a>
        . Drag cards between columns; use Space + arrows for keyboard control.
      </p>
      <KanbanBoard />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections registry — single source of truth for nav + render        */
/* ------------------------------------------------------------------ */

const SECTIONS: Array<{ id: string; title: string; description?: string; render: () => React.ReactNode }> = [
  { id: "buttons", title: "Buttons", description: "Variants, sizes and stateful buttons.", render: () => <ButtonsShowcase /> },
  { id: "badges", title: "Badges", description: "Compact status & metadata labels.", render: () => <BadgesShowcase /> },
  { id: "typography", title: "Typography", description: "Prose styling via @tailwindcss/typography.", render: () => <TypographyShowcase /> },
  { id: "inputs", title: "Inputs", description: "Text, password, textarea and OTP.", render: () => <InputsShowcase /> },
  {
    id: "file-uploader",
    title: "File Uploader",
    description: "Drag-and-drop zone with react-dropzone — images and PDF.",
    render: () => <FileUploaderShowcase />,
  },
  { id: "selections", title: "Selections", description: "Checkbox, radio, switch, slider, toggle.", render: () => <SelectionsShowcase /> },
  { id: "select", title: "Select", render: () => <SelectShowcase /> },
  { id: "form", title: "Form", description: "react-hook-form + zod resolver.", render: () => <FormShowcase /> },
  { id: "cards", title: "Cards", description: "Card, Avatar, Skeleton composed together.", render: () => <CardsShowcase /> },
  { id: "alerts", title: "Alerts", render: () => <AlertsShowcase /> },
  { id: "progress", title: "Progress · Spinner · Stepper", render: () => <ProgressShowcase /> },
  { id: "disclosure", title: "Tabs · Accordion · Collapsible", render: () => <DisclosureShowcase /> },
  { id: "overlays", title: "Tooltip · Popover · Hover Card", render: () => <OverlaysShowcase /> },
  { id: "menus", title: "Dropdown · Context · Menubar", render: () => <MenusShowcase /> },
  { id: "dialogs", title: "Dialog · Alert Dialog · Sheet · Drawer", render: () => <DialogsShowcase /> },
  { id: "command", title: "Command", description: "Press ⌘K / Ctrl+K to open the command dialog.", render: () => <CommandShowcase /> },
  { id: "calendar", title: "Calendar", render: () => <CalendarShowcase /> },
  { id: "carousel", title: "Carousel", render: () => <CarouselShowcase /> },
  { id: "navigation", title: "Breadcrumb · Pagination · Table Pagination", render: () => <NavigationShowcase /> },
  { id: "scroll", title: "Scroll Area · Separator", render: () => <ScrollSeparatorShowcase /> },
  { id: "table", title: "Table", render: () => <TableShowcase /> },
  {
    id: "data-table",
    title: "DataTable",
    description: "TanStack Table + Fuse.js search, column filters, sort, pagination.",
    render: () => <DataTableShowcase />,
  },
  {
    id: "ported-components",
    title: "Ported components",
    description: "Masked text, multi-select, infinite scroll, wizard stepper, timeline, import modal.",
    render: () => <PortedComponentsShowcase />,
  },
  { id: "charts", title: "Charts", description: "Recharts wrapped with theme-aware ChartContainer.", render: () => <ChartsShowcase /> },
  {
    id: "kanban",
    title: "Kanban (DnD)",
    description: "@dnd-kit drag-and-drop board — keyboard accessible.",
    render: () => <KanbanShowcase />,
  },
  { id: "toasts", title: "Toasts (Sonner)", render: () => <ToastsShowcase /> },
];

const SECTION_LINKS = SECTIONS.map(({ id, title, description }) => ({
  id,
  title,
  description,
}));

/* ------------------------------------------------------------------ */
/* Top-level App                                                       */
/* ------------------------------------------------------------------ */

export function App() {
  const [navOpen, setNavOpen] = React.useState(false);

  const sectionNav = (
    <PlaygroundSectionNav
      sections={SECTION_LINKS}
      onNavigate={() => setNavOpen(false)}
    />
  );

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Sections</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{sectionNav}</div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Blocks UI — Playground</h1>
              <p className="text-xs text-muted-foreground">
                Every component, in one place. Toggle the theme to test dark mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
                shadcn <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">{sectionNav}</aside>
        <main className="space-y-10">
          {SECTIONS.map((s) => (
            <Section key={s.id} id={s.id} title={s.title} description={s.description}>
              {s.render()}
            </Section>
          ))}
        </main>
      </div>

      <Toaster richColors closeButton />
    </div>
  );
}

export default App;
