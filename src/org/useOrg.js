import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { applyTheme } from '@/themes'

const RESERVED_SUBDOMAINS = ['www', 'app', 'localhost']

const resolveSubdomainSlug = () => {
	const { hostname } = window.location
	const hostParts = hostname.split('.')
	const subdomain = hostParts[0]
	if (hostParts.length >= 3 && !RESERVED_SUBDOMAINS.includes(subdomain)) {
		return subdomain
	}
	return null
}

export const useOrg = slug => {
	const resolvedSlug = slug ?? resolveSubdomainSlug() ?? import.meta.env.VITE_ORG_ID ?? 'default'

	return useQuery({
		queryKey: ['org', resolvedSlug],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-companies'), where('slug', '==', resolvedSlug), limit(1)),
			)
			const org = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
			if (org?.brandIdentity?.template) {
				applyTheme(org.brandIdentity.template)
			}
			return org
		},
		staleTime: Infinity,
	})
}
