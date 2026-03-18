import { FIELD_TYPE_ICONS, type FormFieldType } from '@/lib/forms/contracts';
import { cn } from '@/lib/utils';

type FieldTypeIconProps = {
  type: FormFieldType;
  className?: string;
};

export const FieldTypeIcon = ({ type, className }: FieldTypeIconProps) => {
  const Icon = FIELD_TYPE_ICONS[type];
  return <Icon className={cn('size-4', className)} />;
};
