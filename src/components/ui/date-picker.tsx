'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string          // ISO date string: 'YYYY-MM-DD'
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  fromYear?: number
  toYear?: number
}

/**
 * DatePicker — wraps shadcn Calendar in a Popover.
 * Works as a controlled component with ISO date strings (YYYY-MM-DD).
 * Drop-in replacement for <Input type="date"> inside FormField.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  disabled,
  fromYear = 1920,
  toYear = new Date().getFullYear() + 5,
}: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined

  function handleSelect(date: Date | undefined) {
    if (!date) return
    // Store as YYYY-MM-DD (local date, avoids timezone shifts)
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    onChange(iso)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !selected && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {selected
            ? format(selected, 'PPP', { locale: es })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
