import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const StaffLoginFooter = () => {
	const { t } = useTranslation()
	return (
		<div className='flex flex-col items-center gap-4 py-12'>
			<hr className='w-full' style={{ borderColor: 'var(--color-border)' }} />
			<Link
				to='/login'
				className='text-xs transition-opacity opacity-40 hover:opacity-70'
				style={{ color: 'var(--color-text)' }}>
				{t('salesPortal.staffLogin', 'Staff login')}
			</Link>
		</div>
	)
}

export default StaffLoginFooter
