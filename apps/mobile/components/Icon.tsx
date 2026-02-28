import type { ComponentType } from 'react';

export type IconComponentProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export type IconProps = IconComponentProps & {
  /** Lucide icon component (e.g. CheckCircle2 from lucide-react-native) */
  as: ComponentType<IconComponentProps>;
};

const DEFAULT_SIZE = 24;

const Icon = ({
  as: IconComponent,
  size = DEFAULT_SIZE,
  color,
  strokeWidth,
}: IconProps) => (
  <IconComponent size={size} color={color} strokeWidth={strokeWidth} />
);

export default Icon;
