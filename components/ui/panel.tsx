import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const panelVariants = cva(
  "relative transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#FFFFFF] border-[2.5px] border-[#292929] text-[#292929] shadow-[4px_4px_0px_#292929]",
        paddock:
          "bg-[#FFFFFF] border-[3px] border-[#292929] text-[#292929] shadow-[6px_6px_0px_#292929]",
        racing:
          "bg-[#FFFFFF] border-[2.5px] border-[#292929] text-[#292929] shadow-[4px_4px_0px_#FF8A32]",
        orange:
          "bg-[#FFB36B] border-[2.5px] border-[#292929] text-[#292929] shadow-[4px_4px_0px_#292929]",
        peach:
          "bg-[#F5D9C0] border-2 border-[#292929] text-[#292929] shadow-[3px_3px_0px_#292929]",
        cream:
          "bg-[#FFF9F3] border-2 border-[#292929] text-[#292929] shadow-[3.5px_3.5px_0px_#292929]",
        brutal:
          "bg-[#FFFFFF] border-[3px] border-[#292929] text-[#292929] shadow-[6px_6px_0px_#292929]",
        cyan:
          "bg-[#08121f] border-2 border-[#00f0ff] text-[#f0f6ff] shadow-[4px_4px_0px_#00f0ff]",
        arcade:
          "bg-[#081711] border-2 border-[#00ff88] text-[#f0f6ff] shadow-[4px_4px_0px_#00ff88]",
        hazard:
          "bg-[#180a0f] border-2 border-[#ff2a55] text-[#f0f6ff] shadow-[4px_4px_0px_#ff2a55]",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-5",
        lg: "p-7",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded",
        default: "rounded-md",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      radius: "default",
    },
  }
)

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {
  headerTitle?: string
  headerBadge?: React.ReactNode
  accentCorner?: boolean
}

function Panel({
  className,
  variant,
  padding,
  radius,
  headerTitle,
  headerBadge,
  accentCorner = false,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        panelVariants({ variant, padding, radius }),
        accentCorner && "before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:bg-[#ff5500]",
        className
      )}
      {...props}
    >
      {(headerTitle || headerBadge) && (
        <div className="flex items-center justify-between border-b-2 border-black/50 pb-3 mb-4">
          {headerTitle && (
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-[#ffaa00] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5500] inline-block shadow-[0_0_8px_#ff5500]" />
              {headerTitle}
            </h3>
          )}
          {headerBadge && <div>{headerBadge}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export { Panel, panelVariants }
