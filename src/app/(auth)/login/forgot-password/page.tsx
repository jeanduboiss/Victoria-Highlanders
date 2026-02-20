import { ForgotPasswordForm } from './_components/forgot-password-form'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
                    <p className="text-muted-foreground text-sm">
                        Ingresa tu correo y te enviaremos un enlace para restablecerla.
                    </p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    )
}
