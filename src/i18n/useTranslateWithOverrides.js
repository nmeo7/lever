import { useTranslation } from 'react-i18next'
import { useStringOverrides, resolveString } from './useStringOverrides'

const interpolate = (template, options) =>
	Object.entries(options ?? {}).reduce(
		(result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
		template,
	)

export const useT = org => {
	const { t: translate } = useTranslation()
	const { data: overrides } = useStringOverrides(org)

	const t = (key, defaultValue, options) => {
		const overrideValue = resolveString(overrides, key, null)
		if (overrideValue) return interpolate(overrideValue, options)
		return translate(key, defaultValue, options)
	}

	return { t }
}
