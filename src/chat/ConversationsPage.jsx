import { useTranslation } from 'react-i18next'
import PageShell from '@/util/components/PageShell'

const ConversationsPage = () => {
	const { t } = useTranslation()
	return <PageShell title={t('chat.conversationsTitle', 'Conversations')} />
}

export default ConversationsPage
