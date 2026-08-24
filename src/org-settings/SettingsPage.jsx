import { useTranslation } from 'react-i18next'
import PageShell from '@/util/components/PageShell'

const SettingsPage = () => {
	const { t } = useTranslation()
	return <PageShell title={t('settings.title', 'Settings')} />
}

export default SettingsPage
