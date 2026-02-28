import { type ComponentProps } from 'react';
import { TextInput } from 'react-native';

export type AppInputProps = ComponentProps<typeof TextInput> & {
  className?: string;
};

const DEFAULT_CLASS =
  'h-11 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground';

const AppInput = ({ className = '', ...textInputProps }: AppInputProps) => (
  <TextInput
    className={`${DEFAULT_CLASS} ${className}`}
    placeholderTextColor="#71717a"
    {...textInputProps}
  />
);

export default AppInput;
