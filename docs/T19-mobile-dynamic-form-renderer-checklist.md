# T19 – Mobile dynamic form renderer checklist

## Scope

- Render form fields from a `FormDefinition` instead of hardcoded mobile inputs.
- Validate required and typed values before submit.
- Keep UI and form-state logic separated for reuse and testability.

## Delivered

- Added mobile form flow orchestration in `apps/mobile/hooks/useCollectorFormFlow.ts`:
  - opens selected form from list
  - fetches full definition from web API
  - exposes loading/error state for form details.
- Added reusable dynamic form state hook in `apps/mobile/hooks/useDynamicFormDraft.ts`:
  - default draft answers from field definitions
  - per-field updates
  - validation trigger with typed answer output.
- Added dynamic helpers in `apps/mobile/lib/forms/dynamic.ts`:
  - field defaults for `text`, `number`, `date`, `select`, `file`, `location`
  - validation and parsing for required/typed fields
  - submission payload builder helper.
- Added dynamic renderer UI in `apps/mobile/features/forms/DynamicFormScreen.tsx`:
  - generic field rendering by `FormFieldDefinition.type`
  - inline field-level error messaging
  - back/submit/retry actions.
- Updated forms list and authenticated shell integration:
  - `apps/mobile/features/forms/FormsScreen.tsx` has open-form CTA per form
  - `apps/mobile/features/auth/AuthenticatedHome.tsx` switches between list and dynamic fill screen
  - `apps/mobile/App.tsx` wires form flow + dynamic draft hooks.
- Added unit tests in `apps/mobile/lib/forms/dynamic.test.ts`.

## Validation

- Collector can open a published form and see its dynamic fields.
- Required fields and invalid values are blocked with specific inline errors.
- Typed values (number/date/select/location) are normalized before submit.
- Dynamic helper unit tests pass for defaulting and validation logic.
