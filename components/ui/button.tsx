"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Button as AstryxButton } from "@astryxdesign/core/Button"

import { cn } from "@/lib/utils"

/**
 * Astryx-backed Button that keeps the shadcn prop API (variant/size/asChild/
 * className/children) so the ~40 existing call sites don't change. Per the
 * Astryx migration guide we *replace* the primitive's implementation rather
 * than restyle shadcn — this file now renders `@astryxdesign/core/Button`.
 *
 * `buttonVariants` is preserved (unchanged) because a few non-Button call
 * sites borrow its class string; it still resolves under Tailwind v4.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// shadcn variant/size → Astryx equivalents. Astryx has no `outline`/`link`
// variants (→ secondary/ghost) and no `icon` size (→ isIconOnly).
const VARIANT_MAP = {
  default: "primary",
  destructive: "destructive",
  outline: "secondary",
  secondary: "secondary",
  ghost: "ghost",
  link: "ghost",
} as const

const SIZE_MAP = { default: "md", sm: "sm", lg: "lg", icon: "md" } as const

/** Best-effort visible-text extraction from children, for the required a11y label. */
function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join(" ").trim()
  if (React.isValidElement(node))
    return extractText((node.props as { children?: React.ReactNode }).children)
  return ""
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Explicit a11y label; falls back to aria-label, then text extracted from children. */
  label?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      disabled,
      label,
      type,
      ...props
    },
    ref
  ) => {
    // Legacy Slot path (asChild) is unused by app call sites but kept for safety.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    const isIcon = size === "icon"
    const ariaLabel = (props as { "aria-label"?: string })["aria-label"]
    const resolvedLabel = label ?? ariaLabel ?? extractText(children) ?? ""

    return (
      <AstryxButton
        ref={ref}
        variant={VARIANT_MAP[variant ?? "default"]}
        size={SIZE_MAP[size ?? "default"]}
        isIconOnly={isIcon}
        icon={isIcon ? children : undefined}
        isDisabled={disabled}
        type={type ?? "button"}
        label={resolvedLabel}
        className={className}
        {...props}
      >
        {isIcon ? undefined : children}
      </AstryxButton>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
