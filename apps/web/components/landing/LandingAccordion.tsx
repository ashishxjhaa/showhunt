"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function LandingAccordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root {...props} />
}

function LandingAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] px-5 mb-2",
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
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium text-[var(--paper-ink)] transition-all outline-none hover:text-[#F953C6] focus-visible:ring-2 focus-visible:ring-[#F953C6]/40 [&[data-state=open]>svg]:rotate-45 [&[data-state=open]]:text-[#F953C6]",
          className
        )}
        {...props}
      >
        {children}
        <Plus className="pointer-events-none size-4 shrink-0 text-[var(--paper-muted)] transition-transform duration-300 mt-0.5" />
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
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pb-4 text-[var(--paper-muted)] leading-relaxed", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { LandingAccordion, LandingAccordionItem, LandingAccordionTrigger, LandingAccordionContent }
