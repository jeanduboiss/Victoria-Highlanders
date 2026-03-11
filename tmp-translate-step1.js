const fs = require('fs');
const files = [
    { p: 'src/app/admin/[orgSlug]/sports/matches/_components/schedule-match-sheet.tsx', ns: 'admin.pages.sports.scheduleMatch' },
    { p: 'src/app/admin/[orgSlug]/sports/players/_components/create-player-sheet.tsx', ns: 'admin.pages.sports.newPlayer' },
    { p: 'src/app/admin/[orgSlug]/sports/seasons/_components/create-season-sheet.tsx', ns: 'admin.pages.sports.newSeason' },
    { p: 'src/app/admin/[orgSlug]/site/pages/_components/page-editor-form.tsx', ns: 'admin.pages.site.newPageEdit' }
];

for (const { p, ns } of files) {
    let cnt = fs.readFileSync(p, 'utf8');

    // Add imports
    if (!cnt.includes('import { useTranslations }')) {
        cnt = cnt.replace(`'use client'`, `'use client'\nimport { useTranslations } from 'next-intl'`);
    }

    // Inject next-intl useTranslations call inside the main component
    const match = cnt.match(/export (?:default )?function \w+\([^)]*\)\s*\{/);
    if (match && !cnt.includes(`const t = useTranslations('${ns}')`)) {
        cnt = cnt.replace(match[0], `${match[0]}\n  const t = useTranslations('${ns}')`);
    }

    fs.writeFileSync(p, cnt, 'utf8');
}
