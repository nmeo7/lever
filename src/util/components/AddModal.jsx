import { Modal, Form } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import CrudForm from '@/util/components/CrudForm'

const AddModal = ({ open, onClose, title, fields, queryKey, createFn, transformSubmit }) => {
	const { t } = useTranslation()
	const [form] = Form.useForm()
	const queryClient = useQueryClient()

	const { mutate, isPending, error } = useMutation({
		mutationFn: createFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKey] })
			onClose()
		},
	})

	const handleClose = () => {
		form.resetFields()
		onClose()
	}

	const handleFinish = (values) => mutate(transformSubmit ? transformSubmit(values) : values)

	return (
		<Modal
			title={title}
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('common.save', 'Save')}
			destroyOnHidden>
			<CrudForm form={form} fields={fields} onFinish={handleFinish} />
			{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
		</Modal>
	)
}

export default AddModal
