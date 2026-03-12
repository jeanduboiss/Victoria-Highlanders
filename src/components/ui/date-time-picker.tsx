'use client'

import { format, parseISO } from 'date-fns'
import { es, enGB, fr } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useLocale } from 'next-intl'

const DATE_FNS_LOCALES = {
  es,
  en: enGB,
  fr,
} as const

interface DateTimePickerProps {
  value?: string          // ISO datetime string: 'YYYY-MM-DDTHH:mm'
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

/**
 * DateTimePicker — Calendar for date + time input.
 * Stores value as ISO datetime string (YYYY-MM-DDTHH:mm).
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Selecciona fecha y hora',
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const dateFnsLocale = DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] || es

  const dateStr = value?.split('T')[0] ?? ''
  const timeStr = value?.split('T')[1]?.slice(0, 5) ?? '12:00'
  const selected = dateStr ? parseISO(dateStr) : undefined

  function handleDateSelect(date: Date | undefined) {
    if (!date) return
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    onChange(`${iso}T${timeStr}`)
    setOpen(false)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!dateStr) return
    onChange(`${dateStr}T${e.target.value}`)
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'flex-1 justify-start text-left font-normal h-9',
              !selected && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0" />
            {selected
              ? format(selected, 'PPP', { locale: dateFnsLocale })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2035}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timeStr}
        onChange={handleTimeChange}
        disabled={disabled || !dateStr}
        className="w-28 h-9"
      />
    </div>
  )
}
