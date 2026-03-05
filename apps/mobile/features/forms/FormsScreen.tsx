/* ----------------- Globals --------------- */
import { Text, View } from 'react-native';

import { AppButton } from '../../components';
import { FORMS_COPY } from '../../constants';
import { buildFormMetadataLine, type CollectorFormRecord } from '../../lib/forms/helpers';

/* ----------------- Types --------------- */
export type FormsScreenItem = CollectorFormRecord & {
  organizationName: string | null;
};

export type FormsScreenProps = {
  forms: FormsScreenItem[];
  isLoading: boolean;
  errorMessage: string | null;
  onRefresh: () => Promise<void>;
};

/* ----------------- Component --------------- */
const FormsScreen = ({ forms, isLoading, errorMessage, onRefresh }: FormsScreenProps) => (
  <View className="w-full gap-3">
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-lg font-semibold text-foreground">{FORMS_COPY.title}</Text>
        <Text className="text-xs text-muted-foreground">{FORMS_COPY.subtitle}</Text>
      </View>
      <AppButton
        size="sm"
        variant="outline"
        label={FORMS_COPY.refreshLabel}
        disabled={isLoading}
        onPress={() => {
          void onRefresh();
        }}
      />
    </View>

    {isLoading ? <Text className="text-sm text-muted-foreground">{FORMS_COPY.loadingState}</Text> : null}
    {errorMessage ? <Text className="text-sm text-red-500">{errorMessage}</Text> : null}

    {!isLoading && !errorMessage && forms.length === 0 ? (
      <Text className="text-sm text-muted-foreground">{FORMS_COPY.emptyState}</Text>
    ) : (
      <View className="gap-2">
        {forms.map((form) => (
          <View key={form.id} className="rounded-lg border border-border bg-card p-3">
            <Text className="text-base font-medium text-foreground">{form.title}</Text>
            {form.description ? (
              <Text className="mt-1 text-sm text-muted-foreground">{form.description}</Text>
            ) : null}
            <Text className="mt-2 text-xs text-muted-foreground">{buildFormMetadataLine(form)}</Text>
            {form.organizationName ? (
              <Text className="mt-1 text-xs text-muted-foreground">{form.organizationName}</Text>
            ) : null}
          </View>
        ))}
      </View>
    )}
  </View>
);

export default FormsScreen;
