import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrg } from '@/org/useOrg'
import CatalogTemplate from './templates/CatalogTemplate'
import ServicesTemplate from './templates/ServicesTemplate'
import TalentTemplate from './templates/TalentTemplate'
import InformationalTemplate from './templates/InformationalTemplate'

const TEMPLATES = {
	catalog: CatalogTemplate,
	services: ServicesTemplate,
	talent: TalentTemplate,
	informational: InformationalTemplate,
}

const SAMPLE_WHATSAPP = '15550000000'

const FrontdeskPage = () => {
	const { t } = useTranslation()
	const { orgSlug } = useParams()
	const { data: org } = useOrg(orgSlug)

	const whatsapp = org?.contact?.whatsapp ?? SAMPLE_WHATSAPP
	const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(t('salesPortal.whatsappGreeting', "Hi! I'd like to place an order."))}`

	const Template = TEMPLATES[org?.frontdesk?.template] ?? CatalogTemplate

	return <Template org={org} whatsapp={whatsapp} whatsappUrl={whatsappUrl} />
}

export default FrontdeskPage
