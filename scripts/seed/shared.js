import { seedBusinessType, seedModuleDefinitions, seedRoleDefinitions } from './_client.js'

const MODULES = [
	{ id: 'customers', label: 'Customers', description: 'People or accounts you sell to or serve.', icon: 'users', order: 0 },
	{ id: 'conversations', label: 'Conversations', description: 'Chat history with customers.', icon: 'message-square', order: 1 },
	{ id: 'products', label: 'Products', description: 'Items and services you sell.', icon: 'package', order: 2 },
	{ id: 'orders', label: 'Orders', description: 'Sales and purchase orders.', icon: 'shopping-cart', order: 3 },
	{ id: 'payments', label: 'Payments', description: 'Cashflow, incoming and outgoing.', icon: 'credit-card', order: 4 },
	{ id: 'inventory', label: 'Inventory', description: 'Stock levels across locations.', icon: 'boxes', order: 5 },
	{ id: 'resources', label: 'Resources', description: 'Equipment and property you own.', icon: 'monitor', order: 6 },
	{ id: 'people', label: 'People', description: 'Staff and employees.', icon: 'user-round', order: 7 },
	{ id: 'jobs', label: 'Jobs', description: 'Tasks and workflow steps.', icon: 'briefcase', order: 8 },
	{ id: 'plans', label: 'Plans', description: 'Forecasted and realized income/expenses.', icon: 'trending-up', order: 9 },
	{ id: 'knowledge', label: 'Knowledge', description: 'Contracts, templates, rules, and playbooks.', icon: 'file-text', order: 10 },
	{ id: 'operations', label: 'Operations', description: 'Automation and process workflows.', icon: 'shuffle', order: 11 },
	{ id: 'settings', label: 'Settings', description: 'Company configuration.', icon: 'tag', order: 13 },
	{ id: 'reports', label: 'Reports', description: 'Analytics, revenue, and finance charts.', icon: 'bar-chart-3', order: 14 },
]

const ROLES = [
	{ id: 'admin', label: 'Admin', description: 'Full access to every module and setting.', modules: { 1: ['customers', 'conversations'], 2: ['orders', 'payments', 'plans'], 3: ['inventory', 'resources', 'people', 'jobs'], 4: ['knowledge', 'operations', 'settings', 'reports'] }, order: 0 },
	{ id: 'manager', label: 'Manager', description: 'Runs day-to-day operations, no billing/settings access.', modules: { 1: ['customers', 'conversations'], 2: ['orders', 'payments', 'plans'], 3: ['inventory', 'jobs'], 4: ['knowledge', 'operations', 'reports'] }, order: 1 },
	{ id: 'employee', label: 'Employee', description: 'Handles customers and daily tasks.', modules: { 1: ['customers', 'conversations'], 2: ['orders', 'jobs'] }, order: 2 },
	{ id: 'viewer', label: 'Viewer', description: 'Read-only access to reports and records.', modules: { 1: ['customers'], 2: ['orders', 'payments', 'plans'], 3: ['reports'] }, order: 3 },
]

const BUSINESS_TYPES = [
	{
		typeId: 'gym',
		type: {
			name: 'Gym / Fitness Studio',
			description: 'Memberships, classes, and personal training.',
			frontdesk: { template: 'winter', sections: ['hero', 'categories', 'products'] },
		},
	},
	{
		typeId: 'shop',
		type: {
			name: 'Retail Shop',
			description: 'Physical products across categories, with inventory tracking.',
			frontdesk: { template: 'winter', sections: ['hero', 'categories', 'products'] },
		},
	},
	{
		typeId: 'school',
		type: {
			name: 'School / Training Center',
			description: 'Courses, cohorts, and enrollments.',
			frontdesk: { template: 'empathy', sections: ['hero', 'categories', 'products'] },
		},
	},
	{
		typeId: 'generic',
		type: {
			name: 'Generic Business',
			description: 'A general-purpose model for any business without a dedicated template.',
			frontdesk: { template: 'empathy', sections: ['hero', 'categories', 'products'] },
		},
	},
]

await seedModuleDefinitions(MODULES)
await seedRoleDefinitions(ROLES)
await Promise.all(BUSINESS_TYPES.map(seedBusinessType))

console.log(`Seeded shared: ${BUSINESS_TYPES.length} business types, ${MODULES.length} module definitions, ${ROLES.length} role definitions`)
