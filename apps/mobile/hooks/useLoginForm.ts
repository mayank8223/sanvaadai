import { useCallback, useMemo, useState } from 'react';

type LoginValues = {
  email: string;
  password: string;
};

type UseLoginFormInput = {
  onSubmit: (values: LoginValues) => Promise<void>;
};

const EMPTY_VALUES: LoginValues = {
  email: '',
  password: '',
};

const useLoginForm = ({ onSubmit }: UseLoginFormInput) => {
  const [email, setEmail] = useState<string>(EMPTY_VALUES.email);
  const [password, setPassword] = useState<string>(EMPTY_VALUES.password);

  const canSubmit = useMemo<boolean>(() => {
    return email.trim().length > 0 && password.length > 0;
  }, [email, password]);

  const handleSubmit = useCallback(async () => {
    await onSubmit({
      email: email.trim(),
      password,
    });
  }, [email, onSubmit, password]);

  return {
    email,
    password,
    canSubmit,
    setEmail,
    setPassword,
    handleSubmit,
  };
};

export default useLoginForm;
