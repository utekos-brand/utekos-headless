---
title: 'useControllableState'
description:
  'Learn how to install and use @radix-ui/react-use-controllable-state to build flexible shadcn components
  that work seamlessly in both controlled and uncontrolled modes.'
canonical_url: 'https://vercel.com/academy/shadcn-ui/use-controllable-state'
md_url: 'https://vercel.com/academy/shadcn-ui/use-controllable-state.md'
docset_id: 'vercel-academy'
doc_version: '1.0'
last_updated: '2026-06-17T08:13:04.704Z'
content_type: 'lesson'
course: 'shadcn-ui'
course_title: 'React UI with shadcn/ui + Radix + Tailwind'
prerequisites: []
---

<agent-instructions>
Vercel Academy — structured learning, not reference docs.
Lessons are sequenced.
Adapt commands to the human's actual environment (OS, package manager, shell, editor) — detect from project context or ask, don't assume.
The lesson shows one path; if the human's project diverges, adapt concepts to their setup.
Preserve the learning goal over literal steps.
Quizzes are pedagogical — engage, don't spoil.
Quiz answers are included for your reference.
</agent-instructions>

# useControllableState

Building flexible components that work in both controlled and uncontrolled modes is a hallmark of professional
component libraries. Rather than implementing this complex logic ourselves, we can leverage Radix UI's
battle-tested `@radix-ui/react-use-controllable-state` hook to handle this sophisticated state management
pattern with confidence.

## Installing the Radix Hook

The `@radix-ui/react-use-controllable-state` hook is a standalone package that provides robust controllable
state management:

```bash
npm i @radix-ui/react-use-controllable-state
```

This lightweight hook (\~2kb) gives you the same state management patterns used internally by Radix UI's
component library, ensuring your components behave consistently with industry standards.

\*\*Note: Why Use Radix's Hook?\*\*

The `@radix-ui/react-use-controllable-state` hook provides:

- **Battle-tested reliability**: Used in production by thousands of applications
- **Consistent API**: Follows established patterns from Radix UI
- **Edge case handling**: Manages complex scenarios like prop changes and initial values
- **TypeScript support**: Full type safety out of the box
- **Performance optimized**: Minimal re-renders and efficient state updates

## Basic Hook Usage

The hook accepts three main parameters and returns a tuple with the current value and setter:

```tsx title="my-component.tsx"
import { useControllableState } from '@radix-ui/react-use-controllable-state';

function MyComponent({
  value: controlledValue,
  defaultValue,
  onValueChange,
}) {
  const [value, setValue] = useControllableState({
    prop: controlledValue,        // The controlled value prop
    defaultProp: defaultValue,    // Default value for uncontrolled mode
    onChange: onValueChange,      // Called when value changes
  });

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

The hook automatically detects whether the component is in controlled or uncontrolled mode based on whether
the `prop` is defined.

## Building a Dropdown Component

Let's create a simpler dropdown component that demonstrates the key benefits of controllable state:

```tsx title="dropdown.tsx"
'use client';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DropdownProps {
  options: { label: string; value: string }[];
  placeholder?: string;

  // Controllable value state
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  // Controllable open state
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  options,
  placeholder = 'Select an option...',
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DropdownProps) {
  // Two pieces of controllable state using the Radix hook
  const [selectedValue, setSelectedValue] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [isOpen, setIsOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {selectedOption?.label || placeholder}
        <ChevronDownIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 border rounded-md bg-white shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option.value}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                setSelectedValue(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```yaml
quiz:
  question:
    'What is the primary benefit of using @radix-ui/react-use-controllable-state over implementing
    controllable state yourself?'
  choices:
    - id: 'performance'
      text: 'Better performance than custom implementations'
    - id: 'reliability'
      text: 'Battle-tested reliability and edge case handling'
    - id: 'smaller'
      text: 'Smaller bundle size'
    - id: 'syntax'
      text: 'Simpler syntax than useState'
  correctAnswerId: 'reliability'
  feedback:
    "{\n    correct: 'Correct! The Radix hook has been tested in thousands of production applications and
    handles complex edge cases that are easy to miss in custom implementations.',\n    incorrect: 'While these
    might be benefits, the primary advantage is the reliability and robustness that comes from battle-tested
    code used across the ecosystem.'\n  }"
```

## Usage Patterns and Examples

The combobox component above demonstrates multiple controllable state patterns:

### Uncontrolled Usage

This is the uncontrolled usage of the combobox component, meaning the component manages its own state.

```tsx
function UncontrolledExample() {
  return (
    <Combobox
      data={[
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ]}
      type="option"
      defaultValue="opt1"
    >
      <ComboboxTrigger />
      <ComboboxContent>
        <ComboboxInput />
        <ComboboxList>
          <ComboboxEmpty />
          <ComboboxGroup>
            {data.map((item) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

### Controlled Usage

This is the controlled usage of the combobox component, meaning the parent manages the state through the use
of props.

```tsx
function ControlledExample() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      data={options}
      type="option"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
    >
      {/* Same child components */}
    </Combobox>
  );
}
```

### Hybrid Usage

This is a hybrid usage of the combobox component, meaning some state is controlled and some is uncontrolled.

```tsx
function HybridExample() {
  const [value, setValue] = useState('');
  // Open state is uncontrolled, value is controlled

  return (
    <Combobox
      data={options}
      type="option"
      value={value}
      onValueChange={setValue}
      defaultOpen={false}
    >
      {/* Child components */}
    </Combobox>
  );
}
```

## Building a Simple Toggle Component

Let's create a simpler example to demonstrate the basic pattern:

```tsx
'use client';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ToggleProps {
  id?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({
  id,
  label,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
}: ToggleProps) {
  const [checked, setChecked] = useControllableState({
    prop: controlledChecked,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={setChecked}
        disabled={disabled}
      />
      {label && (
        <Label
          htmlFor={id}
          className={disabled ? 'text-muted-foreground' : ''}
        >
          {label}
        </Label>
      )}
    </div>
  );
}

// Usage examples:

// Uncontrolled
<Toggle label="Enable notifications" defaultChecked={true} />

// Controlled
function App() {
  const [notifications, setNotifications] = useState(false);

  return (
    <Toggle
      label="Enable notifications"
      checked={notifications}
      onCheckedChange={setNotifications}
    />
  );
}
```

\*\*Reflection:\*\* Think about a component in your current project that could benefit from controllable
state. What pieces of state should be controllable? How would you design the API to feel natural for both
controlled and uncontrolled usage? Consider validation, error states, and complex interactions.

## Best Practices and Common Patterns

### 1. Prop Naming Convention

Follow the established React convention for controllable props:

```tsx
interface ComponentProps {
  // For boolean state
  checked?: boolean;           // Controlled value
  defaultChecked?: boolean;    // Uncontrolled default
  onCheckedChange?: (checked: boolean) => void;

  // For string/other state
  value?: string;              // Controlled value
  defaultValue?: string;       // Uncontrolled default
  onValueChange?: (value: string) => void;

  // For open/close state
  open?: boolean;              // Controlled value
  defaultOpen?: boolean;       // Uncontrolled default
  onOpenChange?: (open: boolean) => void;
}
```

### 2. Multiple Controllable States

Some components need multiple controllable states:

```tsx
function MultiStateComponent({
  // Selected value
  value,
  defaultValue,
  onValueChange,

  // Open state
  open,
  defaultOpen,
  onOpenChange,

  // Search input
  searchValue,
  defaultSearchValue,
  onSearchValueChange,
}) {
  const [selectedValue, setSelectedValue] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [search, setSearch] = useControllableState({
    prop: searchValue,
    defaultProp: defaultSearchValue,
    onChange: onSearchValueChange,
  });

  // Component implementation...
}
```

### 3. TypeScript Support

The Radix hook provides excellent TypeScript support:

```tsx
interface TypedToggleProps<T = boolean> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
}

function TypedToggle<T = boolean>({
  value,
  defaultValue,
  onValueChange,
}: TypedToggleProps<T>) {
  const [state, setState] = useControllableState<T>({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  // Full type safety maintained
  return <div>{/* Implementation */}</div>;
}
```

The `@radix-ui/react-use-controllable-state` hook provides a robust, battle-tested foundation for building
flexible shadcn components. By leveraging this hook, you can create components that seamlessly adapt between
controlled and uncontrolled modes while maintaining consistent behavior and excellent developer experience.

Key benefits of using this approach:

- **Reliability**: Proven in production across thousands of applications
- **Consistency**: Follows established React patterns and conventions
- **Flexibility**: Easy transition between controlled and uncontrolled modes
- **Performance**: Optimized to minimize unnecessary re-renders
- **TypeScript**: Full type safety and excellent developer experience

---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
