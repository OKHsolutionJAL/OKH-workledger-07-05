const networkErrorMessage = "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em alguns minutos.";
const configErrorMessage = "Configuração do Supabase incompleta. Verifique as variáveis do projeto.";

function readErrorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    return [record.name, record.code, record.status, record.message].filter(Boolean).join(" ");
  }

  return String(error ?? "");
}

function normalizeError(error: unknown) {
  return readErrorText(error).toLowerCase();
}

export function isNetworkAuthError(error: unknown) {
  const normalized = normalizeError(error);
  return (
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("networkerror") ||
    normalized.includes("network request failed")
  );
}

export function isConfigAuthError(error: unknown) {
  const normalized = normalizeError(error);
  return normalized.includes("supabaseconfigerror") || normalized.includes("configuração do supabase incompleta");
}

export function getLoginErrorMessage(error: unknown) {
  const normalized = normalizeError(error);

  if (normalized.includes("invalid_credentials") || normalized.includes("invalid login credentials") || normalized.includes("invalid credentials")) {
    return "E-mail ou senha inválidos.";
  }

  if (isNetworkAuthError(error)) {
    return networkErrorMessage;
  }

  if (isConfigAuthError(error)) {
    return configErrorMessage;
  }

  return "Não foi possível fazer login agora. Tente novamente.";
}

export function getRegisterErrorMessage(error: unknown) {
  const normalized = normalizeError(error);

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("email_exists") ||
    normalized.includes("user_already_exists")
  ) {
    return "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.";
  }

  if (isNetworkAuthError(error)) {
    return networkErrorMessage;
  }

  if (isConfigAuthError(error)) {
    return configErrorMessage;
  }

  return "Não foi possível criar a conta agora. Tente novamente.";
}

export function getPasswordResetErrorMessage(error: unknown) {
  if (isNetworkAuthError(error)) {
    return networkErrorMessage;
  }

  if (isConfigAuthError(error)) {
    return configErrorMessage;
  }

  return "Não foi possível enviar o link agora. Tente novamente.";
}

export function getPasswordUpdateErrorMessage(error: unknown) {
  if (isNetworkAuthError(error)) {
    return networkErrorMessage;
  }

  if (isConfigAuthError(error)) {
    return configErrorMessage;
  }

  return "Não foi possível atualizar a senha agora. Tente novamente.";
}
