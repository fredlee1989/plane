import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, XCircle } from "lucide-react";
// services
import { Button, Input, TOAST_TYPE, setToast } from "@plane/ui";
import { ESignInSteps, ForgotPasswordPopover } from "components/account";
import { FORGOT_PASSWORD, SIGN_IN_WITH_PASSWORD } from "constants/event-tracker";
import { checkEmailValidity } from "helpers/string.helper";
import { useApplication, useEventTracker } from "hooks/store";
import { AuthService } from "services/auth.service";
// hooks
// components
// ui
// helpers
// types
import { IPasswordSignInData } from "@plane/types";
// constants

type Props = {
  email: string;
  handleStepChange: (step: ESignInSteps) => void;
  handleEmailClear: () => void;
  onSubmit: () => Promise<void>;
};

type TPasswordFormValues = {
  email: string;
  password: string;
};

const defaultValues: TPasswordFormValues = {
  email: "",
  password: "",
};

const authService = new AuthService();

export const SignInPasswordForm: React.FC<Props> = observer((props) => {
  const { email, handleStepChange, handleEmailClear, onSubmit } = props;
  // states
  const [isSendingUniqueCode, setIsSendingUniqueCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    config: { envConfig },
  } = useApplication();
  const { captureEvent } = useEventTracker();
  // derived values
  const isSmtpConfigured = envConfig?.is_smtp_configured;
  // form info
  const {
    control,
    formState: { errors, isSubmitting, isValid },
    getValues,
    handleSubmit,
    setError,
  } = useForm<TPasswordFormValues>({
    defaultValues: {
      ...defaultValues,
      email,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const handleFormSubmit = async (formData: TPasswordFormValues) => {
    const payload: IPasswordSignInData = {
      email: formData.email,
      password: formData.password,
    };

    await authService
      .passwordSignIn(payload)
      .then(async () => {
        captureEvent(SIGN_IN_WITH_PASSWORD, {
          state: "SUCCESS",
          first_time: false,
        });
        await onSubmit();
      })
      .catch((err) =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.error ?? "Something went wrong. Please try again.",
        })
      );
  };

  const handleSendUniqueCode = async () => {
    const emailFormValue = getValues("email");

    const isEmailValid = checkEmailValidity(emailFormValue);

    if (!isEmailValid) {
      setError("email", { message: "Email is invalid" });
      return;
    }

    setIsSendingUniqueCode(true);

    await authService
      .generateUniqueCode({ email: emailFormValue })
      .then(() => handleStepChange(ESignInSteps.USE_UNIQUE_CODE_FROM_PASSWORD))
      .catch((err) =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.error ?? "Something went wrong. Please try again.",
        })
      )
      .finally(() => setIsSendingUniqueCode(false));
  };

  return (
    <>
      <h1 className="sm:text-2.5xl text-center text-2xl font-medium text-onboarding-text-100">
        Welcome back, let{"'"}s get you on board
      </h1>
      <p className="mt-2.5 text-center text-sm text-onboarding-text-200">
        Get back to your issues, projects and workspaces.
      </p>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto mt-5 space-y-4 sm:w-96">
        <div>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              validate: (value) => checkEmailValidity(value) || "Email is invalid",
            }}
            render={({ field: { value, onChange } }) => (
              <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors.email)}
                  placeholder="name@company.com"
                  className="h-[46px] w-full border border-onboarding-border-100 pr-12 placeholder:text-onboarding-text-400"
                  disabled={isSmtpConfigured}
                />
                {value.length > 0 && (
                  <XCircle
                    className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                    onClick={() => {
                      if (isSmtpConfigured) handleEmailClear();
                      else onChange("");
                    }}
                  />
                )}
              </div>
            )}
          />
        </div>
        <div>
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
            }}
            render={({ field: { value, onChange } }) => (
              <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={value}
                  onChange={onChange}
                  hasError={Boolean(errors.password)}
                  placeholder="Enter password"
                  className="h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 placeholder:text-onboarding-text-400"
                  autoFocus
                />
                {showPassword ? (
                  <EyeOff
                    className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            )}
          />
          <div className="mt-2 w-full pb-3 text-right">
            {isSmtpConfigured ? (
              <Link
                onClick={() => captureEvent(FORGOT_PASSWORD)}
                href={`/accounts/forgot-password?email=${email}`}
                className="text-xs font-medium text-custom-primary-100"
              >
                Forgot your password?
              </Link>
            ) : (
              <ForgotPasswordPopover />
            )}
          </div>
        </div>
        <div className="space-y-2.5">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="xl"
            disabled={!isValid}
            loading={isSubmitting}
          >
            {envConfig?.is_smtp_configured ? "Continue" : "Go to workspace"}
          </Button>
          {envConfig && envConfig.is_smtp_configured && (
            <Button
              type="button"
              onClick={handleSendUniqueCode}
              variant="outline-primary"
              className="w-full"
              size="xl"
              loading={isSendingUniqueCode}
            >
              {isSendingUniqueCode ? "Sending code" : "Sign in with unique code"}
            </Button>
          )}
        </div>
      </form>
    </>
  );
});
