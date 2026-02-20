import { UpdatePasswordForm } from './_components/update-password-form'

export default function UpdatePasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Actualizar contraseña</h1>
                    <p className="text-muted-foreground text-sm">
                        Ingresa tu nueva contraseña para acceder a la plataforma.
                    </p>
                </div>
                <UpdatePasswordForm />
            </div>
        </div>
    )
}
