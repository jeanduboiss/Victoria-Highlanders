const fs = require('fs');
const files = [
    'src/app/admin/[orgSlug]/sports/matches/_components/schedule-match-sheet.tsx',
    'src/app/admin/[orgSlug]/sports/players/_components/create-player-sheet.tsx',
    'src/app/admin/[orgSlug]/sports/seasons/_components/create-season-sheet.tsx',
    'src/app/admin/[orgSlug]/site/pages/_components/page-editor-form.tsx'
];

for (const f of files) {
    let cnt = fs.readFileSync(f, 'utf8');

    // Fix messy imports
    cnt = cnt.replace(/import \{ useTranslations \} from 'next-intl'\/[^\n]+/g, '');

    if (!cnt.includes(`import { useTranslations } from 'next-intl'`)) {
        cnt = cnt.replace(
            `import { cn } from '@/lib/utils'`,
            `import { cn } from '@/lib/utils'\nimport { useTranslations } from 'next-intl'`
        );
        if (!cnt.includes(`import { useTranslations } from 'next-intl'`)) {
            cnt = cnt.replace(
                `import { useRouter } from 'next/navigation'`,
                `import { useRouter } from 'next/navigation'\nimport { useTranslations } from 'next-intl'`
            );
        }
    }

    // Fix button strings
    cnt = cnt.split('>Cancelar<').join('>{t("cancel")}<');
    cnt = cnt.split('>{isPending ? \'Guardando...\' : {t(\'schedule\')}}<').join('>{isPending ? \'Guardando...\' : t(\'schedule\')}<');
    cnt = cnt.split('>{isPending ? \'Guardando...\' : {t(\'createSeason\')}}<').join('>{isPending ? \'Guardando...\' : t(\'create\')}<');
    cnt = cnt.split('>{isPending ? \'Guardando...\' : {t(\'createPlayer\')}}<').join('>{isPending ? \'Guardando...\' : t(\'create\')}<');

    cnt = cnt.replace(/\{t\('schedule'\)\}/g, `t('schedule')`);
    cnt = cnt.replace(/\{t\('create'\)\}/g, `t('create')`);
    cnt = cnt.replace(/\{t\('createPlayer'\)\}/g, `t('create')`);
    cnt = cnt.replace(/\{t\('createSeason'\)\}/g, `t('create')`);

    fs.writeFileSync(f, cnt, 'utf8');
}
