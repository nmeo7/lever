import { useQuery } from '@tanstack/react-query'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

const overridesToMap = overrides =>
	new Map(Object.entries(overrides ?? {}))

export const useStringOverrides = org =>
	useQuery({
		queryKey: ['string-overrides', org?.id, org?.typeId, org?.groupId],
		queryFn: async () => {
			const [typeSnap, groupSnap] = await Promise.all([
				org?.typeId ? getDoc(doc(db, 'erp-organizationModel', org.typeId)) : null,
				org?.groupId ? getDoc(doc(db, 'erp-groups', org.groupId)) : null,
			])

			const groupOverrides = overridesToMap(groupSnap?.exists() ? groupSnap.data().stringOverrides : null)
			const typeOverrides = overridesToMap(typeSnap?.exists() ? typeSnap.data().stringOverrides : null)
			const companyOverrides = overridesToMap(org?.stringOverrides)

			return { groupOverrides, typeOverrides, companyOverrides }
		},
		enabled: !!org,
		staleTime: Infinity,
	})

export const resolveString = (overrides, key, fallback) =>
	overrides?.companyOverrides?.get(key)
	?? overrides?.typeOverrides?.get(key)
	?? overrides?.groupOverrides?.get(key)
	?? fallback
