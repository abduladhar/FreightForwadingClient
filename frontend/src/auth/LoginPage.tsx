import { zodResolver } from "@hookform/resolvers/zod";
import { Globe2, LockKeyhole } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ApiClientError } from "@/api/apiError";
import { checkApiHealth } from "@/api/axiosClient";
import { getLocalizationLanguages } from "@/api/languageApi";
import { env } from "@/app/env";
import { getLanguagePreference, setLanguagePreference } from "@/app/languagePreference";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/auth/useAuth";
import * as authApi from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/components/ui/toast";
import { useEffect, useMemo } from "react";

const loginSchema = z.object({
  tenantCode: z.string().min(2, "Tenant code is required"),
  email: z.string().min(2, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  languageCode: z.string().min(2, "Language is required"),
  cultureCode: z.string().min(2, "Culture is required"),
  rememberMe: z.boolean().default(true)
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAuth();
  const workspace = useWorkspace();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const toast = useToast();
  useDocumentTitle(t("Login.Title", "Login"));
  const savedLanguage = getLanguagePreference();
  const languagesQuery = useQuery({
    queryKey: ["login", "localization-languages"],
    queryFn: getLocalizationLanguages,
    staleTime: 30 * 60_000
  });
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantCode: env.VITE_DEFAULT_TENANT_CODE,
      email: "",
      password: "",
      languageCode: savedLanguage.languageCode,
      cultureCode: savedLanguage.cultureCode,
      rememberMe: true
    }
  });
  const selectedLanguageCode = form.watch("languageCode");
  const languageOptions = useMemo(() => {
    const rows = languagesQuery.data?.length
      ? languagesQuery.data
      : [
          { id: "en", languageCode: "EN", cultureCode: "en-US", name: "English", nativeName: "English", isRightToLeft: false, isDefault: true, sortOrder: 1 },
          { id: "ar", languageCode: "AR", cultureCode: "ar-QA", name: "Arabic", nativeName: "Arabic", isRightToLeft: true, isDefault: false, sortOrder: 2 },
          { id: "hi", languageCode: "HI", cultureCode: "hi-IN", name: "Hindi", nativeName: "Hindi", isRightToLeft: false, isDefault: false, sortOrder: 3 },
          { id: "fr", languageCode: "FR", cultureCode: "fr-FR", name: "French", nativeName: "French", isRightToLeft: false, isDefault: false, sortOrder: 4 },
          { id: "es", languageCode: "ES", cultureCode: "es-ES", name: "Spanish", nativeName: "Spanish", isRightToLeft: false, isDefault: false, sortOrder: 5 },
          { id: "zh", languageCode: "ZH", cultureCode: "zh-CN", name: "Chinese Simplified", nativeName: "Chinese Simplified", isRightToLeft: false, isDefault: false, sortOrder: 6 },
          { id: "tr", languageCode: "TR", cultureCode: "tr-TR", name: "Turkish", nativeName: "Turkish", isRightToLeft: false, isDefault: false, sortOrder: 7 },
          { id: "pt", languageCode: "PT", cultureCode: "pt-PT", name: "Portuguese", nativeName: "Portuguese", isRightToLeft: false, isDefault: false, sortOrder: 8 },
          { id: "ru", languageCode: "RU", cultureCode: "ru-RU", name: "Russian", nativeName: "Russian", isRightToLeft: false, isDefault: false, sortOrder: 9 }
        ];
    return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [languagesQuery.data]);
  const selectedLanguage = languageOptions.find((item) => item.languageCode === selectedLanguageCode) ?? languageOptions[0];

  useEffect(() => {
    let mounted = true;
    void checkApiHealth().then((result) => {
      if (!mounted || result.ok) return;
      toast.error(
        t("Login.BackendUnavailable", "Backend unavailable"),
        t("Login.BackendUnavailableDetail", "Unable to reach {0}. Verify API URL, CORS, and HTTPS trust.").replace("{0}", result.endpoint)
      );
    });
    return () => {
      mounted = false;
    };
  }, [t, toast]);

  useEffect(() => {
    if (!selectedLanguage) return;
    form.setValue("cultureCode", selectedLanguage.cultureCode, { shouldValidate: true });
    setLanguagePreference({ languageCode: selectedLanguage.languageCode, cultureCode: selectedLanguage.cultureCode });
    if (workspace.languageCode !== selectedLanguage.languageCode || workspace.cultureCode !== selectedLanguage.cultureCode) {
      workspace.setLanguage(selectedLanguage.languageCode, selectedLanguage.cultureCode);
      void queryClient.invalidateQueries({ queryKey: ["localization", "resources"] });
    }
  }, [form, queryClient, selectedLanguage, workspace.cultureCode, workspace.languageCode, workspace.setLanguage]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: LoginForm) {
    try {
      await signIn(values);
      const state = location.state as { from?: { pathname?: string } } | null;
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          const normalizedField = field.toLowerCase();
          if (normalizedField === "tenantcode") form.setError("tenantCode", { message });
          if (normalizedField === "usernameoremail" || normalizedField === "email") form.setError("email", { message });
          if (normalizedField === "password") form.setError("password", { message });
        }
      }
      form.setError("root", { message: t("Login.Failed", "Login failed. Check tenant, email, password, and API availability.") });
    }
  }

  async function requestReset() {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { message: t("Login.EnterEmailFirst", "Enter your email or username first.") });
      return;
    }

    try {
      await authApi.requestPasswordReset(email);
      toast.info(
        t("Login.PasswordResetRequested", "Password reset requested"),
        t("Login.PasswordResetRequestedDetail", "If the account exists, reset instructions will be sent.")
      );
    } catch {
      form.setError("root", { message: t("Login.PasswordResetFailed", "Password reset request failed. Please try again.") });
    }
  }

  return (
    <Card className="w-full border-slate-800 bg-white shadow-2xl">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">{t("Login.SignInTitle", "Sign in to Freight ERP")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("Login.SignInSubtitle", "Access your tenant workspace, branch operations, portals, and finance controls.")}
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="tenantCode">{t("Login.TenantCode", "Tenant code")}</Label>
            <Input id="tenantCode" {...form.register("tenantCode")} />
            <FormError message={form.formState.errors.tenantCode?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("Login.EmailOrUsername", "Email or username")}</Label>
            <Input id="email" autoComplete="username" {...form.register("email")} />
            <FormError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("Login.Password", "Password")}</Label>
            <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
            <FormError message={form.formState.errors.password?.message} />
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-blue-700" />
              <Label htmlFor="languageCode">{t("Login.Language", "Language")}</Label>
            </div>
            <select
              id="languageCode"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              {...form.register("languageCode")}
            >
              {languageOptions.map((language) => (
                <option key={language.cultureCode} value={language.languageCode}>
                  {language.name} - {language.nativeName} ({language.cultureCode})
                </option>
              ))}
            </select>
            <input type="hidden" {...form.register("cultureCode")} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {languageOptions.map((language) => (
                <button
                  key={language.cultureCode}
                  type="button"
                  onClick={() => form.setValue("languageCode", language.languageCode, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-md border px-2 py-2 text-left text-xs transition ${
                    selectedLanguage?.languageCode === language.languageCode
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="block font-semibold">{language.name}</span>
                  <span className="block truncate text-slate-500">{language.nativeName}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("Login.LanguageHelp", "Server messages, labels, reports, PDFs, and formatting use the selected language. English is the fallback.")}
            </p>
            <FormError message={form.formState.errors.languageCode?.message ?? form.formState.errors.cultureCode?.message} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" {...form.register("rememberMe")} />
              {t("Login.RememberMe", "Remember me")}
            </label>
            <button type="button" onClick={() => void requestReset()} className="text-sm font-medium text-blue-700 hover:text-blue-900">
              {t("Login.ForgotPassword", "Forgot password?")}
            </button>
          </div>
          <FormError message={form.formState.errors.root?.message} />
          <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("Login.SigningIn", "Signing in...") : t("Login.Continue", "Continue to ERP")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("Login.SecurityNote", "Protected by tenant isolation, branch scope, and permission policies.")}{" "}
            <Link className="font-medium text-blue-700" to="/login">{t("Login.NeedHelp", "Need help?")}</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function FormError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}
