const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { requireAuth } = require('../util/auth')

exports.triggerWorkflowStep = onCall({ cors: true, secrets: ['JWT_SECRET'] }, async ({ data, rawRequest }) => {
  const token = rawRequest.headers.authorization?.replace('Bearer ', '')
  const caller = await requireAuth(token)

  const { jobId, outcome, notes } = data ?? {}
  if (!jobId) throw new HttpsError('invalid-argument', 'jobId required')

  const jobRef = db.collection('erp-jobs').doc(jobId)
  const jobSnap = await jobRef.get()
  if (!jobSnap.exists) throw new HttpsError('not-found', 'Job not found')

  const job = jobSnap.data()
  const workflowSnap = await db.collection('erp-workflowTemplates').doc(job.workflowId).get()
  if (!workflowSnap.exists) throw new HttpsError('not-found', 'Workflow not found')

  const workflow = workflowSnap.data()
  const currentStep = workflow.steps.find((s) => s.id === job.workflowStepId)
  if (!currentStep) throw new HttpsError('not-found', 'Workflow step not found')

  const nextTransition = currentStep.transitions?.find(
    (t) => !t.condition || t.condition === outcome
  )

  await db.runTransaction(async (tx) => {
    tx.update(jobRef, {
      status: 'completed',
      notes: notes ?? job.notes,
      updatedAt: new Date().toISOString(),
    })

    if (nextTransition?.nextStepId) {
      const nextStep = workflow.steps.find((s) => s.id === nextTransition.nextStepId)
      if (nextStep) {
        const newJobRef = db.collection('erp-jobs').doc()
        tx.set(newJobRef, {
          workflowId: job.workflowId,
          parentJobId: jobId,
          workflowStepId: nextStep.id,
          assignedPersonId: null,
          supervisorPersonId: null,
          relatedEntity: job.relatedEntity,
          relatedId: job.relatedId,
          priority: job.priority,
          dueDate: null,
          status: 'pending',
          context: job.context,
          notes: '',
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
  })

  return { success: true, hasNextStep: !!nextTransition?.nextStepId }
})
