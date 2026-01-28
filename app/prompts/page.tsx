'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export type PromptItem = {
  id: string
  text: string
  order?: number
  createdAt?: string | null
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formModal, setFormModal] = useState<{ mode: 'add' | 'edit'; prompt?: PromptItem } | null>(null)
  const [formText, setFormText] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [deleteModal, setDeleteModal] = useState<PromptItem | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const fetchPrompts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getPrompts()
      const list = res.data?.prompts ?? []
      setPrompts(list)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const openAdd = () => {
    setFormText('')
    setFormModal({ mode: 'add' })
  }

  const openEdit = (p: PromptItem) => {
    setFormText(p.text)
    setFormModal({ mode: 'edit', prompt: p })
  }

  const closeForm = () => {
    setFormModal(null)
    setFormText('')
    setFormSubmitting(false)
  }

  const handleSave = async () => {
    const t = formText.trim()
    if (!t) return
    setFormSubmitting(true)
    setError('')
    try {
      if (formModal?.mode === 'add') {
        await api.createPrompt(t)
      } else if (formModal?.prompt) {
        await api.updatePrompt(formModal.prompt.id, t)
      }
      closeForm()
      await fetchPrompts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleteSubmitting(true)
    setError('')
    try {
      await api.deletePrompt(deleteModal.id)
      setDeleteModal(null)
      await fetchPrompts()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="Prompt Management" />

      <div className="p-6">
        <p className="mb-6 text-gray-600">
          Manage prompt questions shown to users. Add, edit, or delete.
        </p>

        {error && (
          <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded border border-black bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add prompt
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">Loading prompts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">#</th>
                  <th className="border-b border-black px-4 py-3 text-left text-sm font-medium">Question</th>
                  <th className="border-b border-black px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No prompts yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  prompts.map((p, idx) => (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3">{p.text}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(p)}
                          className="mr-2 inline-flex items-center gap-1 rounded border border-gray-400 px-3 py-1 text-sm hover:bg-gray-100"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal(p)}
                          className="inline-flex items-center gap-1 rounded border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {formModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-black bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">
              {formModal.mode === 'add' ? 'Add prompt' : 'Edit prompt'}
            </h3>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Prompt question text..."
              rows={4}
              className="mb-4 w-full resize-none rounded border border-black bg-white px-4 py-2 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            />
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 rounded border border-black px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formText.trim() || formSubmitting}
                className="flex-1 rounded border border-black bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {formSubmitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-black bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">Delete prompt</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this prompt? Users who previously answered it will
              keep their answers, but it will no longer be available for new selections.
            </p>
            <p className="mb-6 rounded border border-gray-200 bg-gray-50 p-3 text-sm italic">
              &ldquo;{deleteModal.text}&rdquo;
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 rounded border border-black px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="flex-1 rounded border border-red-500 bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
