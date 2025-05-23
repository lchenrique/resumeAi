"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect } from "react"

export interface ComboboxOption {
  value: string
  label: string
}
export type ComboboxOptionWithCommand<T> = ComboboxOption & T


export interface ComboboxProps<T> {
  onChange: (item: ComboboxOptionWithCommand<T>) => void
  options: ComboboxOptionWithCommand<T>[]
  placeholder?: string
  isOpen?: boolean
}

function ComboboxInner<T extends string | number | symbol>(
  { onChange, options, placeholder = "Select...", isOpen = true }: ComboboxProps<T>,
  ref: React.Ref<HTMLDivElement>
) {

  return (
    <Popover open={true}  >
      <PopoverTrigger >
        <div className="w-[200px] p-0 h-1 " />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" ref={ref} side="bottom" sideOffset={-15}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.value)}
                  onSelect={() => {
                    onChange(option)
                  }}
                >
                  {(option as any).icon}
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Exportando com forwardRef e genéricos
export const Combobox = React.forwardRef(ComboboxInner) as <T extends unknown>(
  props: ComboboxProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement
