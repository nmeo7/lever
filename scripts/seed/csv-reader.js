import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_DIR = resolve(__dirname, 'csv')

const parseValue = (value) => {
	if (value === '') return undefined
	if (value === 'true') return true
	if (value === 'false') return false
	if (/^[[{]/.test(value)) return JSON.parse(value)
	if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
	return value
}

const parseRow = (row) =>
	Object.fromEntries(
		Object.entries(row)
			.map(([key, value]) => [key, parseValue(value)])
			.filter(([, value]) => value !== undefined),
	)

export const readCsv = (filename) => {
	const raw = readFileSync(resolve(CSV_DIR, filename), 'utf-8')
	const { data } = Papa.parse(raw, { header: true, skipEmptyLines: true })
	return data.map(parseRow)
}
