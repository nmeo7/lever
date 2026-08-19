import { callAuthedFunction } from '@/util/functionsClient'

export const fetchInventory = async () => {
	const { inventory } = await callAuthedFunction('inventory')
	return inventory
}

export const fetchInventoryMovements = async () => {
	const { movements } = await callAuthedFunction('inventory', { path: '/movements' })
	return movements
}

export const adjustInventory = async (adjustment) => {
	return callAuthedFunction('inventory', { method: 'POST', body: adjustment })
}
