import { type ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

const variantStyles = {
  default: 'bg-primary active:opacity-90',
  secondary: 'bg-secondary active:opacity-90',
  outline: 'border border-border bg-transparent active:bg-muted',
  ghost: 'active:bg-muted',
} as const;

const sizeStyles = {
  default: 'px-4 py-2.5',
  sm: 'px-3 py-1.5',
  lg: 'px-6 py-3',
} as const;

export type AppButtonVariant = keyof typeof variantStyles;
export type AppButtonSize = keyof typeof sizeStyles;

export type AppButtonProps = ComponentProps<typeof Pressable> & {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  label: string;
  className?: string;
  textClassName?: string;
};

const DEFAULT_VARIANT: AppButtonVariant = 'default';
const DEFAULT_SIZE: AppButtonSize = 'default';

const AppButton = ({
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  label,
  className = '',
  textClassName = '',
  disabled,
  ...pressableProps
}: AppButtonProps) => {
  const base = 'rounded-lg items-center justify-center';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const textColor =
    variant === 'default' || variant === 'secondary'
      ? 'text-primary-foreground'
      : 'text-foreground';

  return (
    <Pressable
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      {...pressableProps}
    >
      <Text
        className={`text-base font-medium ${textColor} ${textClassName}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default AppButton;
