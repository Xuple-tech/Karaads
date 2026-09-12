import { apiRequest } from "@/lib/api/http";
import { normalizeUser } from "@/lib/api/normalize";
import { sessionStorage } from "@/lib/storage/secure-store";
import type { UserSummary } from "@/lib/types/domain";
import { useAuthStore } from "./store";

type AuthPayload = {
  user: UserSummary;
  token: string;
};

type LoginInput = {
  email?: string;
  phone?: string;
  identifier?: string;
  password: string;
  two_factor_code?: string;
};

type RegisterInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
};

type VerifyCodeInput = {
  email: string;
  code: string;
};

type VerifyCodeResponse = {
  activation_token: string;
};

type SetPasswordInput = {
  activation_token: string;
  password: string;
  password_confirmation: string;
};

type SetPasswordResponse = {
  success: boolean;
  message: string;
};

type SendVerifyEmailCodeInput = {
  email: string;
};

type SendVerifyEmailCodeResponse = {
  status: string;
};

type VerifyEmailCodeInput = {
  email: string;
  code: string;
};

type VerifyEmailCodeResponse = {
  status: string;
  redirect?: string;
};

type ForgotPasswordInput = {
  identifier: string;
};

type ForgotPasswordResponse = {
  status?: string;
  message?: string;
};

const normalizeAuthPayload = (data: unknown): AuthPayload => {
  const payload = (data ?? {}) as Record<string, unknown>;
  const nestedData = (payload.data ?? payload.result ?? null) as Record<
    string,
    unknown
  > | null;
  const nestedUser =
    payload.user ??
    payload.profile ??
    nestedData?.user ??
    nestedData?.profile ??
    payload.data;
  const nestedUserRecord =
    nestedUser && typeof nestedUser === "object" ? (nestedUser as Record<string, unknown>) : null;
  const token =
    (typeof payload.token === "string" && payload.token) ||
    (typeof payload.access_token === "string" && payload.access_token) ||
    (typeof nestedData?.token === "string" && nestedData.token) ||
    (typeof nestedData?.access_token === "string" && nestedData.access_token) ||
    // The backend nests the Sanctum token inside data.user.token rather than
    // alongside it as a sibling — this is the actual documented shape.
    (typeof nestedUserRecord?.token === "string" && nestedUserRecord.token) ||
    (typeof nestedUserRecord?.access_token === "string" && nestedUserRecord.access_token) ||
    "";

  return {
    user: normalizeUser(nestedUser),
    token,
  };
};

export const authService = {
  async login(input: LoginInput): Promise<AuthPayload> {
    const identifier = (input.identifier ?? input.email ?? input.phone ?? '').trim();

    const response = await apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: {
        email: identifier,
        password: input.password,
        two_factor_code: input.two_factor_code,
      },
      version: "v1_2",
    });

    const payload = normalizeAuthPayload(response.data);
    if (!payload.token.trim()) {
      throw new Error("The server did not issue a login token. Please try again.");
    }
    return payload;
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const identifier = input.identifier.trim();
    const isPhone = identifier.length > 0 && !identifier.includes('@');
    if (isPhone) {
      throw new Error("Password reset by phone is not enabled on the server yet. Please use your email address.");
    }

    const response = await apiRequest<ForgotPasswordResponse>("/auth/password/forgot", {
      method: "POST",
      body: { email: identifier },
      version: "v1_2",
    });

    return response.data;
  },

  async register(input: RegisterInput): Promise<AuthPayload> {
    const response = await apiRequest<AuthPayload>("/auth/register", {
      method: "POST",
      body: input,
      version: "v1_2",
    });

    return normalizeAuthPayload(response.data);
  },

  async me(token: string): Promise<UserSummary> {
    const response = await apiRequest<UserSummary>("/auth/me", {
      token,
      version: "v1_2",
    });

    return normalizeUser(response.data);
  },

  async logout(token: string): Promise<void> {
    await apiRequest<Record<string, unknown>>("/auth/logout", {
      method: "POST",
      token,
      version: "v1_2",
    });
  },

  async verifyActivationCode(
    input: VerifyCodeInput,
  ): Promise<VerifyCodeResponse> {
    const response = await apiRequest<VerifyCodeResponse>(
      "/auth/account-activation/verify-code",
      {
        method: "POST",
        body: input,
        version: "v1_2",
      },
    );

    return response.data;
  },

  async setPassword(input: SetPasswordInput): Promise<SetPasswordResponse> {
    const response = await apiRequest<SetPasswordResponse>(
      "/auth/account-activation/set-password",
      {
        method: "POST",
        body: input,
        version: "v1_2",
      },
    );

    return response.data;
  },

  async sendActivationCode(input: SendVerifyEmailCodeInput): Promise<void> {
    await apiRequest<Record<string, unknown>>(
      "/auth/account-activation/send-code",
      {
        method: "POST",
        body: input,
        version: "v1_2",
      },
    );
  },

  async sendVerifyEmailCode(
    input: SendVerifyEmailCodeInput,
  ): Promise<SendVerifyEmailCodeResponse> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<SendVerifyEmailCodeResponse>(
      "/auth/verify-email/otp/send-code",
      {
        method: "POST",
        token: token ?? undefined,
        body: input,
        version: "v1_2",
      },
    );

    return response.data;
  },

  async verifyEmailCode(
    input: VerifyEmailCodeInput,
  ): Promise<VerifyEmailCodeResponse> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<VerifyEmailCodeResponse>(
      "/auth/verify-email/otp/verify-code",
      {
        method: "POST",
        token: token ?? undefined,
        body: input,
        version: "v1_2",
      },
    );

    return response.data;
  },
};

export const persistSession = async (
  token: string,
  user: UserSummary,
): Promise<void> => {
  useAuthStore.getState().setSession(token, user);
  await sessionStorage.save({ token, user: JSON.stringify(user) });
};

export const clearSession = async (): Promise<void> => {
  const token = useAuthStore.getState().token;
  if (token) {
    try {
      await authService.logout(token);
    } catch {
      // Ignore logout transport errors while clearing local session.
    }
  }

  useAuthStore.getState().clearSession();
  await sessionStorage.clear();
};
