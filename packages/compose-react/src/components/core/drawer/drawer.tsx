import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: any) => {
  const Root = DrawerPrimitive.Root as any
  return (
    <Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  )
}
Drawer.displayName = "Drawer"

const DrawerTrigger: any = DrawerPrimitive.Trigger

const DrawerPortal: any = DrawerPrimitive.Portal

const DrawerClose: any = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  any,
  any
>(({ className, ...props }, ref) => {
  const Overlay = DrawerPrimitive.Overlay as any
  return (
    <Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  )
})
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  any,
  any
>(({ className, children, ...props }, ref) => {
  const Content = DrawerPrimitive.Content as any
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  any,
  any
>(({ className, ...props }, ref) => {
  const Title = DrawerPrimitive.Title as any
  return (
    <Title
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
})
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  any,
  any
>(({ className, ...props }, ref) => {
  const Description = DrawerPrimitive.Description as any
  return (
    <Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
