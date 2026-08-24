import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ReactFlow, Background, Controls,
  addEdge, useNodesState, useEdgesState,
  Handle, Position, MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import PageShell from '@/util/components/PageShell'

// ─── Node shapes ─────────────────────────────────────────────────────────────

const StartNode = () => (
  <>
    <div
      style={{ width: 40, height: 40, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
    >
      ▶
    </div>
    <Handle type="source" position={Position.Bottom} />
  </>
)

const EndNode = () => (
  <>
    <Handle type="target" position={Position.Top} />
    <div
      style={{ width: 40, height: 40, borderRadius: '50%', background: '#111827', border: '4px solid #374151', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
    />
  </>
)

const processColors = {
  manual:         { bg: '#ffffff', border: '#d1d5db', text: '#374151', badge: '#f3f4f6', badgeText: '#6b7280' },
  automation:     { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', badge: '#dbeafe', badgeText: '#1d4ed8' },
  customerAction: { bg: '#f0fdf4', border: '#86efac', text: '#166534', badge: '#dcfce7', badgeText: '#15803d' },
}

const ProcessNode = ({ data }) => {
  const c = processColors[data.stepType] ?? processColors.manual
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 12, padding: '10px 16px', width: 176, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', color: c.text, lineHeight: 1.3 }}>{data.label}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 500, background: c.badge, color: c.badgeText, borderRadius: 6, padding: '2px 6px' }}>
            {data.stepTypeLabel}
          </span>
          {data.assignedRole && (
            <span style={{ fontSize: 10, background: '#f3f4f6', color: '#9ca3af', borderRadius: 6, padding: '2px 6px', textTransform: 'capitalize' }}>
              {data.assignedRole}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}

const DecisionNode = ({ data }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <div style={{ width: 140, height: 70, position: 'relative' }}>
      <svg width="140" height="70" style={{ position: 'absolute', top: 0, left: 0 }}>
        <polygon points="70,2 138,35 70,68 2,35" fill="#fffbeb" stroke="#fcd34d" strokeWidth="2" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', color: '#92400e', lineHeight: 1.3 }}>{data.label}</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} id="approved" />
    <Handle type="source" position={Position.Right} id="rejected" style={{ top: '50%' }} />
  </>
)

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  process: ProcessNode,
  decision: DecisionNode,
}

const stepTypeLabelKeys = {
  manual:         'workflows.legend.manual',
  automation:     'workflows.legend.automation',
  customerAction: 'workflows.legend.customer',
}

const stepTypeLabel = {
  manual:         'Manual',
  automation:     'Automation',
  customerAction: 'Customer',
}

// ─── Build graph ─────────────────────────────────────────────────────────────

const ARROW = { type: MarkerType.ArrowClosed, color: '#6b7280', width: 16, height: 16 }
const EDGE_STYLE = { stroke: '#9ca3af', strokeWidth: 1.5 }

const buildNodesAndEdges = (workflow, t) => {
  const nodes = []
  const edges = []

  // Start node
  nodes.push({
    id: `${workflow.id}-start`,
    type: 'start',
    position: { x: 72, y: 0 },
    data: {},
  })

  // Step nodes
  workflow.steps.forEach((step, i) => {
    const isApproval = step.stepType === 'approval'
    nodes.push({
      id: `${workflow.id}-${step.id}`,
      type: isApproval ? 'decision' : 'process',
      position: isApproval ? { x: 52, y: 80 + i * 130 } : { x: 0, y: 80 + i * 130 },
      data: {
        label: step.name,
        stepType: step.stepType,
        stepTypeLabel: t(stepTypeLabelKeys[step.stepType] ?? step.stepType, stepTypeLabel[step.stepType] ?? step.stepType),
        assignedRole: step.assignedRole,
      },
    })
  })

  // End node
  nodes.push({
    id: `${workflow.id}-end`,
    type: 'end',
    position: { x: 72, y: 80 + workflow.steps.length * 130 },
    data: {},
  })

  // Edge from start → first step
  edges.push({
    id: `${workflow.id}-start-s1`,
    source: `${workflow.id}-start`,
    target: `${workflow.id}-${workflow.steps[0].id}`,
    type: 'smoothstep',
    markerEnd: ARROW,
    style: EDGE_STYLE,
  })

  // Edges between steps
  workflow.steps.forEach((step) => {
    step.transitions.forEach((t, i) => {
      if (!t.nextStepId) return
      const isApproval = step.stepType === 'approval'
      edges.push({
        id: `${workflow.id}-${step.id}-${t.nextStepId}-${i}`,
        source: `${workflow.id}-${step.id}`,
        sourceHandle: isApproval ? (t.condition === 'rejected' ? 'rejected' : 'approved') : undefined,
        target: `${workflow.id}-${t.nextStepId}`,
        label: t.condition || undefined,
        type: 'smoothstep',
        markerEnd: ARROW,
        style: EDGE_STYLE,
        labelStyle: { fontSize: 10, fill: '#6b7280', fontWeight: 500 },
        labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.9 },
        labelBgPadding: [4, 2],
      })
    })
  })

  // Edge from last step → end
  const lastStep = workflow.steps[workflow.steps.length - 1]
  edges.push({
    id: `${workflow.id}-${lastStep.id}-end`,
    source: `${workflow.id}-${lastStep.id}`,
    target: `${workflow.id}-end`,
    type: 'smoothstep',
    markerEnd: ARROW,
    style: EDGE_STYLE,
  })

  return { nodes, edges }
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const dummyWorkflows = [
  {
    id: 'wf-1',
    name: 'Sales Order Approval',
    status: 'active',
    steps: [
      { id: 's1', name: 'Review Order',     stepType: 'approval',       assignedRole: 'manager',  transitions: [{ condition: 'approved', nextStepId: 's2' }, { condition: 'rejected', nextStepId: '' }] },
      { id: 's2', name: 'Send Invoice',      stepType: 'automation',     action: 'sendInvoice',    transitions: [{ condition: '', nextStepId: 's3' }] },
      { id: 's3', name: 'Customer Confirms', stepType: 'customerAction', assignedRole: '',         transitions: [{ condition: '', nextStepId: 's4' }] },
      { id: 's4', name: 'Fulfill Order',     stepType: 'manual',         assignedRole: 'employee', transitions: [] },
    ],
  },
  {
    id: 'wf-2',
    name: 'New Employee Onboarding',
    status: 'active',
    steps: [
      { id: 's1', name: 'Collect Documents',   stepType: 'customerAction', assignedRole: '',        transitions: [{ condition: '', nextStepId: 's2' }] },
      { id: 's2', name: 'Verify & Approve',    stepType: 'approval',       assignedRole: 'manager', transitions: [{ condition: 'approved', nextStepId: 's3' }] },
      { id: 's3', name: 'Create Accounts',     stepType: 'automation',     action: 'createAccounts', transitions: [{ condition: '', nextStepId: 's4' }] },
      { id: 's4', name: 'Orientation Meeting', stepType: 'manual',         assignedRole: 'manager', transitions: [] },
    ],
  },
  {
    id: 'wf-3',
    name: 'Logistics',
    status: 'active',
    steps: [
      { id: 's1', name: 'Prepare Shipment', stepType: 'manual',     assignedRole: 'employee', transitions: [{ condition: '', nextStepId: 's2' }] },
      { id: 's2', name: 'Dispatch Carrier', stepType: 'automation', action: 'dispatchCarrier', transitions: [{ condition: '', nextStepId: 's3' }] },
      { id: 's3', name: 'In Transit',       stepType: 'manual',     assignedRole: 'employee', transitions: [{ condition: '', nextStepId: 's4' }] },
      { id: 's4', name: 'Delivered',        stepType: 'customerAction', assignedRole: '',     transitions: [] },
    ],
  },
]

// ─── Flow component ───────────────────────────────────────────────────────────

const WorkflowFlow = ({ workflow }) => {
  const { t } = useTranslation()
  const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdges(workflow, t)
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  return (
    <div style={{ height: 600 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#e5e7eb" />
        <Controls />
      </ReactFlow>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OperationsPage = () => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(dummyWorkflows[0].id)
  const workflow = dummyWorkflows.find((w) => w.id === selected)

  return (
    <PageShell title={t('workflows.title', 'Operations')}>
      <div className="flex gap-2 mb-4">
        {dummyWorkflows.map((wf) => (
          <button
            key={wf.id}
            onClick={() => setSelected(wf.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selected === wf.id ? '' : 'border'}`}
            style={{
              background: selected === wf.id ? 'var(--color-primary)' : 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: selected === wf.id ? '#fff' : 'var(--color-text)',
            }}
          >
            {wf.name}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        {[
          { label: t('workflows.legend.manual', 'Manual'),     bg: '#ffffff', border: '#d1d5db' },
          { label: t('workflows.legend.approval', 'Approval'),    bg: '#fffbeb', border: '#fcd34d' },
          { label: t('workflows.legend.automation', 'Automation'),  bg: '#eff6ff', border: '#93c5fd' },
          { label: t('workflows.legend.customer', 'Customer'),    bg: '#f0fdf4', border: '#86efac' },
        ].map(({ label, bg, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: bg, border: `1.5px solid ${border}` }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div
        className="neu-raised rounded-2xl overflow-hidden"
        style={{ background: '#f9fafb' }}
      >
        <WorkflowFlow key={workflow.id} workflow={workflow} />
      </div>
    </PageShell>
  )
}

export default OperationsPage
