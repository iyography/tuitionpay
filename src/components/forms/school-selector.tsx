'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Search, School } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSchools } from '@/hooks/use-schools'
import { Skeleton } from '@/components/ui/skeleton'

interface SchoolSelectorProps {
  value: string
  onSelect: (schoolId: string, schoolName: string) => void
  disabled?: boolean
}

export function SchoolSelector({ value, onSelect, disabled }: SchoolSelectorProps) {
  const [open, setOpen] = useState(false)
  const { schools, isLoading, error } = useSchools()

  const selectedSchool = schools.find(s => s.id === value)

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load schools. Please refresh the page.
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-12 text-left font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <School className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {selectedSchool ? selectedSchool.name : 'Select your school...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search schools..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center py-6 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No schools found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact us to add your school.
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {schools.map((school) => (
                <CommandItem
                  key={school.id}
                  value={school.name}
                  onSelect={() => {
                    onSelect(school.id, school.name)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === school.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{school.name}</span>
                    {school.address && typeof school.address === 'object' && (
                      <span className="text-xs text-muted-foreground">
                        {(school.address as Record<string, string>).city}, {(school.address as Record<string, string>).state}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
