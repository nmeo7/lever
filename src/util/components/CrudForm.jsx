import { Form, Input, InputNumber, Select, Checkbox } from 'antd'

const FIELD_INPUTS = {
	text: ({ placeholder }) => <Input placeholder={placeholder} />,
	textarea: ({ placeholder }) => <Input.TextArea rows={3} placeholder={placeholder} />,
	number: () => <InputNumber min={0} step={0.01} className='w-full' />,
	date: () => <Input type='date' />,
	select: ({ options }) => <Select options={options} />,
	tags: ({ placeholder }) => <Select mode='tags' open={false} tokenSeparators={[',']} placeholder={placeholder} />,
	checkbox: () => <Checkbox />,
}

const humanizeFieldName = (name) =>
	name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase())

const toSelectOptions = (options) =>
	options?.map((option) => (typeof option === 'string' ? { value: option, label: option } : option))

const normalizeField = (field) => (typeof field === 'string' ? { name: field } : field)

const CrudForm = ({ form, fields, onFinish }) => (
	<Form form={form} layout='vertical' onFinish={onFinish} className='pt-2'>
		{fields.map(normalizeField).map(({ name, label = humanizeFieldName(name), type = 'text', required, placeholder, options, initialValue }) => (
			<Form.Item
				key={name}
				name={name}
				label={label}
				initialValue={initialValue}
				valuePropName={type === 'checkbox' ? 'checked' : 'value'}
				rules={required ? [{ required: true, message: `${label} is required` }] : undefined}>
				{FIELD_INPUTS[type]({ placeholder, options: toSelectOptions(options) })}
			</Form.Item>
		))}
	</Form>
)

export default CrudForm
