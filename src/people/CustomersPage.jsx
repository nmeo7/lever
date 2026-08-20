import PageShell from '@/util/components/PageShell'
import { useAuthStore } from '@/auth/store'
import { useUserOrg } from '@/util/components/HeaderControls'
import { useModuleLabels, resolveModuleLabel } from '@/util/moduleLabels'

const CustomersPage = () => {
	const activeCompanyId = useAuthStore(s => s.activeCompanyId)
	const { data: org } = useUserOrg(activeCompanyId)
	const { data: labels } = useModuleLabels(org)
	const title = resolveModuleLabel(labels, 'customers', 'Customers')

	return <PageShell title={title} />
}

export default CustomersPage
