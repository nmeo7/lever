import { callAuthedFunction } from '@/util/functionsClient'

export const fetchPlans = async () => {
	const { plans } = await callAuthedFunction('plans')
	return plans
}

export const createPlan = async (plan) => {
	return callAuthedFunction('plans', { method: 'POST', body: plan })
}

export const batchUpsertPlans = async (rows) => {
	return callAuthedFunction('plans', { method: 'POST', path: '/batch', body: { rows } })
}

export const PLAN_TYPES = [
	{ value: 'income', label: 'Income' },
	{ value: 'expense', label: 'Expense' },
	{ value: 'goal', label: 'Goal' },
	{ value: 'milestone', label: 'Milestone' },
	{ value: 'reminder', label: 'Reminder' },
	{ value: 'event', label: 'Event' },
]

export const PLAN_STATUSES = [
	{ value: 'expected', label: 'Expected' },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'cancelled', label: 'Cancelled' },
	{ value: 'realized', label: 'Realized' },
]

export const PLAN_PRIORITIES = [
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' },
	{ value: 'critical', label: 'Critical' },
]

export const DEFAULT_CURRENCY = 'FRW'
