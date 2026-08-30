"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function LandingAccordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root className={cn("flex w-full flex-col gap-2", className)} {...props} />
}

function LandingAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "border-x-0 border-t-0 border-b border-b-[var(--paper-border)] bg-transparent px-5 rounded-none",
        className
      )}
      {...props}
    />
  )
}

function LandingAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-start justify-start gap-4 rounded-md py-5 text-left text-lg font-medium text-[var(--paper-ink)] transition-all outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 [&[data-state=open]>svg]:rotate-45 [&[data-state=open]>svg]:text-[#DA5CC7]",
          className
        )}
        {...props}
      >
        <Plus className="pointer-events-none mt-1 size-5 shrink-0 text-[#DA5CC7] transition-transform duration-300" />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function LandingAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-base"
      {...props}
    >
      <div
        className={cn("cursor-pointer pb-5 text-[var(--paper-muted)] leading-relaxed", className)}
        onClick={(e) => {
          // Clicking the answer collapses the item
          const region = e.currentTarget.closest("[role='region']")
          const trigger = region?.parentElement?.querySelector("button")
          if (trigger) trigger.click()
        }}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { LandingAccordion, LandingAccordionItem, LandingAccordionTrigger, LandingAccordionContent }
