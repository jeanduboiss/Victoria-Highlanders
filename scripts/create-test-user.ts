import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar en config/env')
        process.exit(1)
    }

    // Usamos supabase-js normal con el Service Role para crear el usuario admin
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    console.log('1. Creando usuario en Supabase Auth...')

    // Usamos admin API que bypassea el correo de confirmacion si pasamos email_confirm: true
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'testuser@test.com',
        password: 'test123password',
        email_confirm: true,
    })

    if (userError) {
        console.error('Error creando usuario:', userError.message)
        // Continuamos si el usuario ya existe para asegurar los permisos en base de datos.
    }

    // Buscar ID del usuario (ya sea el recien creado o el que ya existia)
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const user = usersData.users.find((u) => u.email === 'testuser@test.com')

    if (!user) {
        console.error('El usuario no existe.')
        process.exit(1)
    }

    console.log('ID de Auth:', user.id)

    console.log('2. Asegurando existencia de Organización de prueba...')
    const org = await prisma.organization.upsert({
        where: { slug: 'victoria-highlanders' },
        update: {},
        create: {
            name: 'Victoria Highlanders',
            slug: 'victoria-highlanders',
            isActive: true,
        }
    })

    console.log('3. Asegurando usuario sincronizado en base de datos Prisma...')
    await prisma.user.upsert({
        where: { id: user.id },
        update: {
            isActive: true,
            fullName: 'Super Admin Test'
        },
        create: {
            id: user.id,
            email: user.email!,
            fullName: 'Super Admin Test',
            isActive: true
        }
    })

    console.log('4. Creando membresía como SUPER_ADMIN y ACTIVE...')
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org.id,
                userId: user.id
            }
        },
        update: {
            role: 'SUPER_ADMIN',
            status: 'ACTIVE'
        },
        create: {
            organizationId: org.id,
            userId: user.id,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            joinedAt: new Date()
        }
    })

    console.log('\n✅ ¡Usuario test creado y activado exitosamente!')
    console.log('===================================')
    console.log('URL: (Local y Producción)')
    console.log('Email: testuser@test.com')
    console.log('Password: test123password')
    console.log('===================================')
}

main()
    .catch((e) => {
        console.error('Error no manejado:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
