import { useQuery } from '@tanstack/react-query'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

const overridesToMap = overrides =>
	new Map((overrides ?? []).map(({ id, label }) => [id, label]))

export const useModuleLabels = org =>
	useQuery({
		queryKey: ['module-labels', org?.id, org?.typeId, org?.groupId],
		queryFn: async () => {
			const [typeSnap, groupSnap] = await Promise.all([
				org?.typeId ? getDoc(doc(db, 'erp-organizationModel', org.typeId)) : null,
				org?.groupId ? getDoc(doc(db, 'erp-groups', org.groupId)) : null,
			])

			const groupOverrides = overridesToMap(groupSnap?.exists() ? groupSnap.data().moduleOverrides : null)
			const typeOverrides = overridesToMap(typeSnap?.exists() ? typeSnap.data().moduleOverrides : null)
			const companyOverrides = overridesToMap(org?.moduleOverrides)

			return { groupOverrides, typeOverrides, companyOverrides }
		},
		enabled: !!org,
		staleTime: Infinity,
	})

export const resolveModuleLabel = (labels, moduleId, defaultLabel) =>
	labels?.companyOverrides?.get(moduleId)
	?? labels?.typeOverrides?.get(moduleId)
	?? labels?.groupOverrides?.get(moduleId)
	?? defaultLabel
