import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { DropdownSelect, type DropdownSelectOption } from '@/components/ui/dropdown-select'

interface FormDropdownSelectProps<
  TFieldValues extends FieldValues,
  T extends string | number = string,
> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  options: DropdownSelectOption<T>[]
  ariaLabel: string
  align?: 'left' | 'right'
  fullWidth?: boolean
  disabled?: boolean
}

export function FormDropdownSelect<
  TFieldValues extends FieldValues,
  T extends string | number = string,
>({
  name,
  control,
  options,
  ariaLabel,
  align = 'left',
  fullWidth = true,
  disabled,
}: FormDropdownSelectProps<TFieldValues, T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DropdownSelect
          value={field.value as T}
          options={options}
          onChange={field.onChange}
          ariaLabel={ariaLabel}
          align={align}
          fullWidth={fullWidth}
          disabled={disabled}
        />
      )}
    />
  )
}
