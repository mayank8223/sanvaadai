import { AuthApiError, AuthError } from '@supabase/supabase-js';

import { AUTH_COPY } from '../../constants';

const INVALID_CREDENTIAL_ERROR_CODE = 'invalid_credentials';
const INVALID_CREDENTIAL_STATUS = 400;

const mapAuthErrorToMessage = (error: AuthError): string => {
  if (
    error instanceof AuthApiError &&
    error.status === INVALID_CREDENTIAL_STATUS &&
    error.code === INVALID_CREDENTIAL_ERROR_CODE
  ) {
    return AUTH_COPY.invalidCredentialsMessage;
  }

  return AUTH_COPY.genericAuthErrorMessage;
};

export { mapAuthErrorToMessage };
