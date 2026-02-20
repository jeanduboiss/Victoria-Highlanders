interface InviteUserEmailProps {
  inviteLink: string
  organizationName: string
  role: string
  firstName?: string
}

const ROLE_LABELS: Record<string, string> = {
  CLUB_ADMIN: 'Club Admin',
  CLUB_MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
}

export function inviteUserEmailHtml({ inviteLink, organizationName, role, firstName }: InviteUserEmailProps): string {
  const roleLabel = ROLE_LABELS[role] ?? role
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación a ${organizationName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Victoria <span style="color:#f59e0b;">Highlanders</span>
              </span>
            </td>
          </tr>

          <tr>
            <td style="background-color:#141414;border:1px solid #262626;border-radius:12px;padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">
                Invitación al equipo
              </p>
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${greeting}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#a3a3a3;line-height:1.6;">
                Fuiste invitado a unirte a <strong style="color:#ffffff;">${organizationName}</strong> con el rol de
                <strong style="color:#f59e0b;">${roleLabel}</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:#1a1a1a;border:1px solid #262626;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#737373;text-transform:uppercase;letter-spacing:0.8px;">Tu rol</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#f59e0b;">${roleLabel}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}"
                       style="display:inline-block;background-color:#f59e0b;color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.2px;">
                      Aceptar invitación
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#525252;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#404040;word-break:break-all;">${inviteLink}</p>

              <hr style="border:none;border-top:1px solid #1f1f1f;margin:32px 0;" />

              <p style="margin:0;font-size:12px;color:#404040;line-height:1.5;">
                Este enlace expirará en <strong style="color:#525252;">24 horas</strong>. Si no esperabas esta invitación, puedes ignorar este correo con seguridad.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#404040;">
                © ${new Date().getFullYear()} Victoria Highlanders. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
