import { callAuthedFunction } from '@/util/functionsClient'

export const fetchSchema = async (collection) =>
	callAuthedFunction('orgSettings', { path: `/schema?collection=${collection}` })
