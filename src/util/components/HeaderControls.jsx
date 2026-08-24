import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDoc, getDocs, doc, collection, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { useLogout } from '@/auth/useAuth'
import { useAuthStore } from '@/auth/store'

export const useUserOrg = companyId =>
  useQuery({
    queryKey: ['user-company', companyId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'erp-companies', companyId))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    },
    enabled: !!companyId,
    staleTime: Infinity,
  })

const useAccessibleCompanies = user =>
  useQuery({
    queryKey: ['accessible-companies', user?.companyIds],
    queryFn: async () => {
      const companies = await Promise.all(
        user.companyIds.map(async (companyId) => {
          const snap = await getDoc(doc(db, 'erp-companies', companyId))
          return snap.exists() ? { id: snap.id, ...snap.data() } : null
        }),
      )
      return companies.filter(Boolean)
    },
    enabled: !!user?.companyIds?.length,
    staleTime: Infinity,
  })

const priorityClasses = {
  urgent: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-gray-400',
}

const usePendingJobs = () =>
  useQuery({
    queryKey: ['navbar-jobs'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'erp-jobs'), where('status', '==', 'pending')))
      return snap.docs.slice(0, 20).map((d) => ({ id: d.id, ...d.data() }))
    },
  })

const NotificationTray = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { data: jobs = [], isLoading } = usePendingJobs()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 flex items-center justify-center rounded-full transition-opacity opacity-70 hover:opacity-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {jobs.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
            {jobs.length > 9 ? '9+' : jobs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 flex flex-col border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 py-3 flex items-center justify-between border-b border-black/10">
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">
              {t('common.pendingJobs', 'Pending Jobs')}
            </span>
            <button
              onClick={() => { navigate('/app/jobs'); setOpen(false) }}
              className="text-xs transition-opacity opacity-60 hover:opacity-100"
            >
              {t('common.viewAll', 'View all →')}
            </button>
          </div>

          {isLoading ? (
            <p className="px-4 py-3 text-sm text-black/50">{t('common.loading', 'Loading…')}</p>
          ) : jobs.length === 0 ? (
            <p className="px-4 py-3 text-sm text-black/50">{t('common.noPendingJobs', 'No pending jobs')}</p>
          ) : (
            <div className="flex flex-col max-h-80 overflow-y-auto">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="px-4 py-3 flex items-center justify-between gap-3 border-b border-black/10"
                >
                  <span className="text-sm truncate">
                    {job.name ?? job.notes ?? t('common.untitledJob', 'Untitled job')}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.priority && (
                      <span className={`text-xs font-medium capitalize ${priorityClasses[job.priority] ?? 'text-gray-400'}`}>
                        {job.priority}
                      </span>
                    )}
                    <span className="text-xs text-black/50">
                      {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const UserMenu = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const logout = useLogout()
  const user = useAuthStore((s) => s.user)
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId)
  const setActiveCompany = useAuthStore((s) => s.setActiveCompany)
  const { data: companies = [] } = useAccessibleCompanies(user)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSelectCompany = (companyId) => {
    setActiveCompany(companyId)
    setOpen(false)
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full flex items-center justify-center bg-black text-white text-xs font-bold"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 flex flex-col border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 py-3 border-b border-black/10">
            <p className="text-xs text-black/50 truncate">{user?.email}</p>
          </div>

          {companies.length > 0 && (
            <div className="border-b border-black/10">
              <p className="px-4 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-black/40">
                {t('common.companies', 'Companies')}
              </p>
              <div className="flex flex-col max-h-48 overflow-y-auto">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company.id)}
                    className={`px-4 py-2 text-sm text-left truncate transition-opacity hover:opacity-100 ${
                      company.id === activeCompanyId ? 'font-semibold opacity-100' : 'opacity-70'
                    }`}
                  >
                    {company.id === activeCompanyId ? '✓ ' : ''}{company.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { navigate('/app/settings'); setOpen(false) }}
            className="px-4 py-2.5 text-sm text-left transition-opacity opacity-70 hover:opacity-100"
          >
            {t('common.profile', 'Profile')}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 text-sm text-left transition-opacity opacity-70 hover:opacity-100 border-t border-black/10"
          >
            {t('common.logout', 'Logout')}
          </button>
        </div>
      )}
    </div>
  )
}

const HeaderControls = () => (
  <div className="flex items-center gap-3">
    <NotificationTray />
    <UserMenu />
  </div>
)

export default HeaderControls
