import React, { useEffect, useState } from 'react'
import { RegattaStateContext } from '../../../context/RegattaContext'
import { SetupProvider } from '../../../context/SetupContext'
import { BoatPosition, BoatSize } from '../../../enums/BoatConstant'
import { Race } from '../../../types/RegattaType'
import { BoatStructure } from '../../boat/BoatStructure'

type Props = {
  races: Race[],
  onClose: () => void,
}

function buildBlankBoardSetup() {
  // create a minimal boardSetup object expected by BoatStructure
  const left = Array.from({ length: BoatSize.STANDARD }, (_, i) => ({ id: `L-${i}` }))
  const right = Array.from({ length: BoatSize.STANDARD }, (_, i) => ({ id: `R-${i}` }))
  const drummer = [{ id: `DRUMMER-0` }]
  const sweep = [{ id: `SWEEP-0` }]
  const reserve: any[] = []
  const setup: any = []
  setup[BoatPosition.RESERVE] = reserve
  setup[BoatPosition.DRUMMER] = drummer
  setup[BoatPosition.LEFT] = left
  setup[BoatPosition.RIGHT] = right
  setup[BoatPosition.SWEEP] = sweep
  return setup
}

export default function ExportRacesModal({ races, onClose }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const initial: Record<string, boolean> = {}
    races.forEach(r => initial[r.id] = false)
    setSelected(initial)
  }, [races])

  useEffect(() => {
    // focus the modal content for accessibility
    if (contentRef.current) {
      contentRef.current.focus()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const exportSelected = async () => {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (!ids.length) return
    setLoading(true)

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const racesCaptured: Array<{ raceId: string; images: { dataUrl: string; width: number; height: number }[] }> = []

      // If the page already renders the boat structures (e.g. AllRaceConfigs), capture those DOM nodes directly.
      // Temporarily add export class and hide this modal so it doesn't obscure the page during capture.
      document.body.classList.add('exporting-a4')
      const modalRoot = contentRef.current?.parentElement as HTMLElement | null
      const overlay = modalRoot?.querySelector('.absolute.inset-0') as HTMLElement | null
      if (contentRef.current) contentRef.current.style.visibility = 'hidden'
      if (overlay) overlay.style.display = 'none'

      // small delay to allow reflow and CSS to apply
      await new Promise(res => setTimeout(res, 150))

      for (const id of ids) {
        const race = races.find(r => r.id === id)
        if (!race) continue

        const captured: { dataUrl: string; width: number; height: number }[] = []

        // find rendered config nodes for this race (try capturing per-config)
        const nodes = Array.from(document.querySelectorAll(`[data-export^="race-config-${race.id}-"]`)) as HTMLElement[]
        if (nodes.length) {
          for (const node of nodes) {
            try {
              const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
              captured.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height })
            } catch (e) {
              console.warn('html2canvas capture failed for node, will fallback to offscreen render for this race', e)
            }
          }
        }

        // if no live nodes captured, fallback to offscreen render (single full config)
        if (!captured.length) {
          const boardSetup = (race as any).configs && (race as any).configs.length ? (race as any).configs[0] : buildBlankBoardSetup()
          const wrapper = document.createElement('div')
          wrapper.style.position = 'fixed'
          wrapper.style.left = '-9999px'
          wrapper.style.top = '0'
          wrapper.style.width = '1200px'
          wrapper.style.height = '1600px'
          document.body.appendChild(wrapper)

          const ReactDOMClient = require('react-dom/client')
          const root = ReactDOMClient.createRoot(wrapper)
          await new Promise<void>(resolve => {
            const regattaState = {
              state: {
                name: race?.category || 'export-regatta',
                races: [race],
                paddlers: race?.paddlers || [],
              },
              setState: () => {},
              clubId: null,
              setClubId: () => {},
              updateRaceConfig: () => {}
            }

            root.render(
              React.createElement(SetupProvider, null,
                React.createElement(RegattaStateContext.Provider, { value: regattaState },
                  React.createElement(BoatStructure, { race, boatType: race.boatType || 'standard', boardSetup, updateConfig: () => {} })
                )
              )
            )
            setTimeout(() => resolve(), 300)
          })

          const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: '#ffffff' })
          captured.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height })

          root.unmount()
          document.body.removeChild(wrapper)
        }

        racesCaptured.push({ raceId: race.id, images: captured })
      }

      // restore modal visibility
      if (contentRef.current) contentRef.current.style.visibility = ''
      if (overlay) overlay.style.display = ''

      // assemble PDF (landscape pages) with thumbnails ~30% width per image on a single page per race
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const gap = 8
      const thumbWidth = pageWidth * 0.325

      racesCaptured.forEach((raceCap, raceIdx) => {
        if (raceIdx > 0) pdf.addPage('landscape')
        let x = margin
        let y = margin
        let rowMaxHeight = 0

        raceCap.images.forEach(img => {
          const scale = thumbWidth / img.width
          const thumbHeight = img.height * scale

          if (x + thumbWidth > pageWidth - margin) {
            x = margin
            y += rowMaxHeight + gap
            rowMaxHeight = 0
          }

          if (y + thumbHeight > pageHeight - margin) {
            // no room on this page — start a new page for remaining thumbnails
            pdf.addPage('landscape')
            x = margin
            y = margin
            rowMaxHeight = 0
          }

          pdf.addImage(img.dataUrl, 'JPEG', x, y, thumbWidth, thumbHeight)
          x += thumbWidth + gap
          rowMaxHeight = Math.max(rowMaxHeight, thumbHeight)
        })
      })

      pdf.save('boat-exports.pdf')
    } catch (e) {
      console.error('Export failed', e)
      alert('Export failed: ' + (e as any).message)
    } finally {
      // always remove exporting class if applied
      try { document.body.classList.remove('exporting-a4') } catch (_) {}
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 z-40" onClick={onClose} />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="bg-white rounded p-4 z-50 w-full max-w-lg shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-2">Export races to PDF</h3>
        <div className="max-h-64 overflow-auto mb-4">
          {races.map(r => (
            <label key={r.id} className="flex items-center gap-2 py-1">
              <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggle(r.id)} />
              <span>{`${r.category} - ${r.type} - ${r.distance} - ${r.boatType}`}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={exportSelected} disabled={loading}>{loading ? 'Exporting...' : 'Export'}</button>
        </div>
      </div>
    </div>
  )
}
