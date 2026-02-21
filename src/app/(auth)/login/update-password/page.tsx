import { UpdatePasswordForm } from './_components/update-password-form'

export default function UpdatePasswordPage() {
    return (
        <div className="w-full space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Crea tu contraseña</h1>
                <p className="text-muted-foreground text-sm">
                    Para completar tu registro, elige una contraseña segura.
                </p>
            </div>
            <UpdatePasswordForm />
        </div>
    )
}
