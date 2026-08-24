import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeaderControls from '@/util/components/HeaderControls'

const PageShell = ({ title, actions, children }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	return (
		<div className='p-6 pt-2 max-w-7xl mx-auto'>
			<div className='flex items-center justify-between mb-4'>
				<div>
					<div className='flex items-center justify-between mb-6'>
						<div>
							<button
								onClick={() => navigate('/app')}
								className='text-xs transition-opacity opacity-50 hover:opacity-100 inline-flex items-center gap-1'
								style={{ color: 'var(--color-text)' }}>
								← {t('common.home', 'Home')}
							</button>
							<h1
								className='text-lg font-semibold'
								style={{ color: 'var(--color-text)' }}>
								{title}
							</h1>
						</div>
						{actions && (
							<div className='flex items-center gap-2'>{actions}</div>
						)}
					</div>
				</div>
				<HeaderControls />
			</div>
			{children ?? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					{t('common.nothingHereYet', 'Nothing here yet')}
				</div>
			)}
		</div>
	)
}

export default PageShell
