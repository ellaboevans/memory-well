import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { GenericDataModel } from "convex/server";
import type { EmailConfig } from "@convex-dev/auth/server";
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: "password",
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? undefined,
        };
      },
      verify: ResendOTP as unknown as EmailConfig<GenericDataModel>,
      reset: ResendOTPPasswordReset as unknown as EmailConfig<GenericDataModel>,
    }),
  ],
});

export { getAuthUserId } from "@convex-dev/auth/server";
