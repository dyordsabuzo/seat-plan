
type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Yes', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-md shadow-lg max-w-md w-[90%] p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button className="text-gray-600" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <div className="text-sm text-gray-700 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-100" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
