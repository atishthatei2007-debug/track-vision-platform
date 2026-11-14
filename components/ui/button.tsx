import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "group/button font-head font-medium inline-flex cursor-pointer items-center justify-center gap-2 rounded whitespace-nowrap select-none transition-all duration-200",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-destructive",
    // Icons keep their own size; we only set a default when none is given so
    // Neobrutalism's h-4/size-4 icons aren't overridden.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-primary text-primary-foreground shadow-md transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "border-2 border-black bg-secondary text-secondary-foreground shadow-md transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-secondary-hover hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        destructive:
          "border-2 border-black bg-destructive text-destructive-foreground shadow-md transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 bg-transparent shadow-md transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg active:translate-x-1 active:translate-y-1 active:shadow-none",
        ghost: "bg-transparent hover:bg-accent",
        link: "bg-transparent hover:underline",
        // GCC Smart Race Control Light Retro × NeoBrutalism × Motorsport Variants
        racing:
          "border-[2.5px] border-[#292929] bg-[#FF8A32] text-[#292929] font-black uppercase tracking-wider shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#ff9847] hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150",
        lightOrange:
          "border-[2.5px] border-[#292929] bg-[#FFB36B] text-[#292929] font-black uppercase tracking-wider shadow-[3.5px_3.5px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#ffbf82] hover:shadow-[6px_6px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150",
        peach:
          "border-2 border-[#292929] bg-[#F5D9C0] text-[#292929] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#292929] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fae3d1] hover:shadow-[5px_5px_0px_#292929] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150",
        white:
          "border-[2.5px] border-[#292929] bg-[#FFFFFF] text-[#292929] font-black uppercase tracking-wider shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#F5D9C0] hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150",
        charcoal:
          "border-2 border-[#292929] bg-[#292929] text-white font-black uppercase tracking-wider shadow-[3px_3px_0px_#FF8A32] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#3d3d3d] hover:shadow-[5px_5px_0px_#FF8A32] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150",
        cyan:
          "border-2 border-[#292929] bg-[#00f0ff] text-[#292929] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#292929] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#33f3ff] hover:shadow-[5px_5px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none",
        arcade:
          "border-2 border-[#292929] bg-[#00ff88] text-[#292929] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#292929] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#33ff9f] hover:shadow-[5px_5px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none",
        hazard:
          "border-2 border-[#292929] bg-[#ff2a55] text-white font-bold uppercase tracking-wider shadow-[3px_3px_0px_#292929] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ff496b] hover:shadow-[5px_5px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none",
      },
      size: {
        default: "px-4 py-1.5 text-base",
        xs: "px-2 py-0.5 text-xs",
        sm: "px-3 py-1 text-sm",
        lg: "px-6 py-2 text-base lg:px-8 lg:py-3 lg:text-lg",
        icon: "p-2",
        "icon-xs": "p-1",
        "icon-sm": "p-1.5",
        "icon-lg": "p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
