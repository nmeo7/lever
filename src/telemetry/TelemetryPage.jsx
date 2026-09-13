import { Box, Video, Sparkles } from 'lucide-react'
import PageShell from '@/util/components/PageShell'

const SECTIONS = [
	{ icon: Box, title: 'Digital Twin', description: 'Live 3D model of your site and equipment.' },
	{ icon: Video, title: 'Live Footage', description: 'Real-time camera feeds from your locations.' },
	{ icon: Sparkles, title: 'AI Comments', description: 'AI-generated observations and alerts.' },
]

const TelemetrySectionCard = ({ icon: Icon, title, description }) => (
	<div
		className='rounded-2xl p-5 flex flex-col gap-3 border'
		style={{ borderColor: 'var(--color-border)' }}>
		<span
			className='w-10 h-10 rounded-xl flex items-center justify-center bg-black/5'>
			<Icon size={20} strokeWidth={1.75} className='text-black' />
		</span>
		<div>
			<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{title}</p>
			<p className='text-xs mt-0.5' style={{ color: 'var(--color-muted)' }}>{description}</p>
		</div>
		<div
			className='rounded-xl flex items-center justify-center h-32 text-xs'
			style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
			Coming soon
		</div>
	</div>
)

const TelemetryPage = () => (
	<PageShell title='Telemetry'>
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
			{SECTIONS.map(section => (
				<TelemetrySectionCard key={section.title} {...section} />
			))}
		</div>
	</PageShell>
)

export default TelemetryPage
