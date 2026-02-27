import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const id = '28586055-4edf-4922-9c96-70bd41ee0af9'

    const player = await prisma.player.findUnique({ where: { id } }).catch(() => null)
    if (player) console.log("ES UN JUGADOR:", player.firstName, player.lastName)

    const match = await prisma.match.findUnique({ where: { id } }).catch(() => null)
    if (match) console.log("ES UN PARTIDO:", match.homeScore, match.awayScore)

    const article = await prisma.article.findUnique({ where: { id } }).catch(() => null)
    if (article) console.log("ES UN ARTICULO:", article.title)

    const team = await prisma.team.findUnique({ where: { id } }).catch(() => null)
    if (team) console.log("ES UN EQUIPO:", team.name)

    process.exit(0)
}

main()
