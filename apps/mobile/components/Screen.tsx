import { type ComponentProps } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenProps = ComponentProps<typeof View> & {
  /** If true, adds safe area padding (default: true) */
  safe?: boolean;
  className?: string;
};

const DEFAULT_CLASS = 'flex-1 bg-background';

const Screen = ({
  safe = true,
  className = '',
  style,
  children,
  ...viewProps
}: ScreenProps) => {
  const insets = useSafeAreaInsets();

  const safeStyle = safe
    ? {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    : undefined;

  return (
    <View
      className={`${DEFAULT_CLASS} ${className}`}
      style={[safeStyle, style]}
      {...viewProps}
    >
      {children}
    </View>
  );
};

export default Screen;
