import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted">{t('common.pageNotFound', 'Page not found.')}</p>
    </div>
  )
}

export default NotFoundPage
