
import { PrismaClient, Role, MemberStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'victoria-highlanders' },
        update: {},
        create: {
            name: 'Victoria Highlanders',
            slug: 'victoria-highlanders',
            shortName: 'Highlanders',
            primaryColor: '#004A99',
            secondaryColor: '#FFFFFF',
            isActive: true,
        },
    })

    console.log(`✅ Organization created/found: ${org.name} (${org.id})`)

    // Note: We cannot easily create a User because it must match Supabase auth.users.
    // We recommend the user to sign up first, then run a script to link them.

    console.log('\n🚀 Next Steps:')
    console.log('1. Go to http://localhost:3000/login and Sign In/Up with your email.')
    console.log('2. Provide me your Email or User ID (from Supabase Auth) so I can link you to the organization.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
