import { Pencil, Trash2, UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_ADMIN } from "@/lib/bootstrap";
import { formatDateTime } from "@/lib/time";
import { ActionForm, Badge, Card, Field, PageHeader, SubmitButton, inputClass } from "@/components/admin/ui";
import { createUser, deleteUser, updateUser } from "@/app/admin/actions";

export const metadata = { title: "Yöneticiler" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  const onlyOne = users.length <= 1;

  return (
    <>
      <PageHeader
        title="Yöneticiler"
        description="Yönetim paneline giriş yapabilen kişiler. Her yönetici diğerlerini ekleyebilir, düzenleyebilir ve kaldırabilir."
      />

      {users.some((u) => u.email === DEFAULT_ADMIN.email) && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200 sm:px-6">
          İlk kurulum hesabı ({DEFAULT_ADMIN.email}) hâlâ duruyor. Kendi hesabınızı ekledikten sonra bu hesabı silin ya da
          şifresini değiştirin.
        </div>
      )}

      <Card padded={false}>
        <ul className="divide-y divide-line">
          {users.map((user) => (
            <li key={user.id} className="px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-black text-white">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toLocaleUpperCase("tr")}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-bold text-ink">
                      {user.name}
                      {user.id === me.id && <Badge tone="navy">Siz</Badge>}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {user.email} · eklendi {formatDateTime(user.createdAt)}
                    </p>
                  </div>
                </div>
                <ActionForm action={deleteUser}>
                  <input type="hidden" name="id" value={user.id} />
                  <SubmitButton
                    tone="danger"
                    size="sm"
                    confirm={
                      user.id === me.id
                        ? "Kendi hesabınızı silmek üzeresiniz; oturumunuz kapanacak. Emin misiniz?"
                        : `${user.name} yönetici olarak kaldırılsın mı?`
                    }
                  >
                    <Trash2 className="size-4" />
                    {onlyOne ? "Son yönetici" : "Kaldır"}
                  </SubmitButton>
                </ActionForm>
              </div>
              <details className="mt-2 sm:ml-13">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                  <Pencil className="size-3.5" /> Düzenle
                </summary>
                <ActionForm action={updateUser} className="mt-4">
                  <input type="hidden" name="id" value={user.id} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Ad soyad">
                      <input name="name" required defaultValue={user.name} className={inputClass} />
                    </Field>
                    <Field label="E-posta">
                      <input name="email" type="email" required defaultValue={user.email} className={inputClass} />
                    </Field>
                    <Field label="Yeni şifre" hint="Değiştirmeyecekseniz boş bırakın (en az 8 karakter).">
                      <input name="password" type="password" autoComplete="new-password" className={inputClass} />
                    </Field>
                  </div>
                  <SubmitButton tone="navy" className="mt-4">
                    Kaydet
                  </SubmitButton>
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Yönetici ekle" actions={<UserPlus className="size-5 text-brand" />}>
        <ActionForm action={createUser}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ad soyad">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="E-posta">
              <input name="email" type="email" required className={inputClass} />
            </Field>
            <Field label="Şifre" hint="En az 8 karakter.">
              <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
            </Field>
          </div>
          <SubmitButton className="mt-4">
            <UserPlus className="size-4" /> Yöneticiyi ekle
          </SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
