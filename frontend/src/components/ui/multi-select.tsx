import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from './checkbox';

export interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    allowCustom?: boolean;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select items...',
    allowCustom = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const handleToggle = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const handleRemove = (value: string) => {
        onChange(selected.filter((item) => item !== value));
    };

    const addCustom = (value: string) => {
        const v = value.trim();
        if (!v) return;
        if (selected.includes(v)) return;
        onChange([...selected, v]);
        setQuery('');
    };

    const optionValues = new Set(options.map((o) => o.value));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-auto min-h-10 py-2"
                >
                    {selected.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-2 w-full">
                            {selected.map((value) => {
                                const label =
                                    options.find((opt) => opt.value === value)?.label || value;
                                return (
                                    <Badge key={value} variant="secondary" className="">
                                        {label}
                                        <button
                                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleRemove(value)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." value={query} onValueChange={setQuery} />
                    <CommandEmpty>
                        {allowCustom ? 'No items found. Type to add.' : 'No matching items.'}
                    </CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleToggle(option.value)}
                                >
                                    <Checkbox
                                        checked={selected.includes(option.value)}
                                        className="mr-2"
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                            {allowCustom &&
                                query &&
                                !optionValues.has(query) &&
                                !selected.includes(query) && (
                                    <CommandItem value={query} onSelect={() => addCustom(query)}>
                                        <Plus />
                                        Add "{query}"
                                    </CommandItem>
                                )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
