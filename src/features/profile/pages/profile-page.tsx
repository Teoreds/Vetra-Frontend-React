import { useRef, useState } from "react";
import { Camera, KeyRound, User } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { useUploadAvatar } from "../hooks/use-upload-avatar";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export function ProfilePage() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [infoForm, setInfoForm] = useState({ display_name: "", email: "" });
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const avatarUrl = user?.profile_picture_path
    ? `/api/auth/me/avatar?t=${Date.now()}`
    : null;

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoError("");
    setInfoSuccess(false);
    const body: Record<string, string> = {};
    if (infoForm.display_name.trim()) body.display_name = infoForm.display_name.trim();
    if (infoForm.email.trim()) body.email = infoForm.email.trim();
    if (!Object.keys(body).length) return;
    try {
      await updateProfile.mutateAsync(body);
      setInfoSuccess(true);
      setInfoForm({ display_name: "", email: "" });
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail ?? "Errore durante il salvataggio";
      setInfoError(msg);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("Le password non coincidono");
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError("La nuova password deve essere di almeno 6 caratteri");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess(true);
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail ?? "Errore durante il cambio password";
      setPwError(msg);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Il mio profilo"
        description="Gestisci le tue informazioni personali e la sicurezza dell'account."
        leading={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-4.5 w-4.5 text-primary" />
          </div>
        }
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ── Colonna sinistra: avatar ── */}
        <Card className="w-full lg:w-64 shrink-0">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar.Root className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/10 overflow-hidden">
                {avatarUrl && (
                  <Avatar.Image
                    src={avatarUrl}
                    alt={user?.display_name}
                    className="h-full w-full object-cover"
                  />
                )}
                <Avatar.Fallback className="text-2xl font-semibold text-primary">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                title="Cambia foto"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="text-center">
              <p className="text-[14px] font-semibold">{user?.display_name}</p>
              <p className="text-[12px] text-muted-foreground capitalize">{user?.role_code?.toLowerCase()}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{user?.email}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-[12px]"
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              {uploadAvatar.isPending ? "Caricamento..." : "Cambia foto"}
            </Button>

            {uploadAvatar.isError && (
              <p className="text-[11px] text-destructive text-center">
                {(uploadAvatar.error as { detail?: string })?.detail ?? "Errore caricamento foto"}
              </p>
            )}
            {uploadAvatar.isSuccess && (
              <p className="text-[11px] text-green-600 text-center">Foto aggiornata</p>
            )}
          </CardContent>
        </Card>

        {/* ── Colonna destra: form ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Informazioni profilo */}
          <Card>
            <CardHeader>
              <h2 className="text-[15px] font-semibold">Informazioni profilo</h2>
              <p className="text-[11px] text-muted-foreground">Aggiorna nome visualizzato ed email.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-muted-foreground">
                      Username (non modificabile)
                    </label>
                    <Input value={user?.username ?? ""} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium" htmlFor="display_name">
                      Nome visualizzato
                    </label>
                    <Input
                      id="display_name"
                      placeholder={user?.display_name ?? ""}
                      value={infoForm.display_name}
                      onChange={(e) => setInfoForm((f) => ({ ...f, display_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[12px] font-medium" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={user?.email ?? ""}
                      value={infoForm.email}
                      onChange={(e) => setInfoForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                {infoError && <p className="text-[12px] text-destructive">{infoError}</p>}
                {infoSuccess && <p className="text-[12px] text-green-600">Profilo aggiornato con successo.</p>}

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Salvataggio..." : "Salva modifiche"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Cambia password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">Cambia password</h2>
              </div>
              <p className="text-[11px] text-muted-foreground">Scegli una password di almeno 6 caratteri.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium" htmlFor="current_password">
                    Password corrente
                  </label>
                  <Input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium" htmlFor="new_password">
                      Nuova password
                    </label>
                    <Input
                      id="new_password"
                      type="password"
                      autoComplete="new-password"
                      value={pwForm.new_password}
                      onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium" htmlFor="confirm_password">
                      Conferma password
                    </label>
                    <Input
                      id="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      value={pwForm.confirm_password}
                      onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
                    />
                  </div>
                </div>

                {pwError && <p className="text-[12px] text-destructive">{pwError}</p>}
                {pwSuccess && <p className="text-[12px] text-green-600">Password cambiata con successo.</p>}

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Salvataggio..." : "Cambia password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
