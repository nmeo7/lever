import { useTranslation } from 'react-i18next'
import PageShell from '@/util/components/PageShell'

const JobsPage = () => {
	const { t } = useTranslation()
	return <PageShell title={t('workflows.jobsTitle', 'Jobs')} />
}

export default JobsPage
