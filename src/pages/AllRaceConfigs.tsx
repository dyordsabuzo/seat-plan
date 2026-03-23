import { useMemo, useState } from 'react'
import { logger } from '../common/helpers/logger'
import { BoardViewProvider } from '../context/BoardViewContext'
import { useRegattaState } from '../context/RegattaContext'
import { BoatSize } from '../enums/BoatConstant'
import { BoatStructure } from '../features/boat'
import { Container, ExportRacesModal } from '../shared'
import { getItems } from '../utils/ConfigurationHelper'

const initialiseBoard = (paddlers: any[], boatType: string) => {
  const boatSize = BoatSize[boatType?.toUpperCase()] || BoatSize.STANDARD
  return [
    getItems(1, 0, 'scratch'),
    paddlers || [],
    getItems(1, 1, 'drummer'),
    getItems(boatSize, boatSize, 'left'),
    getItems(boatSize, boatSize, 'right'),
    getItems(1, 1, 'sweep')
  ]
}

export default function AllRaceConfigs() {
  const { state: regatta } = useRegattaState()
  const [showExport, setShowExport] = useState(false)

  // prepare configs for rendering
  const prepared = useMemo(() => {
    const races = regatta?.races ?? []
    return races.map(race => {
      const rawConfigs = (race.configs && race.configs.length > 0)
        ? race.configs.map((c: any) => (typeof c === 'string' ? JSON.parse(c) : c))
        : [initialiseBoard(race.paddlers || [], race.boatType || 'STANDARD')]

      // Normalize each config so every seat is an object {id, name}
      const configs = rawConfigs.map((cfg: any) => {
        if (!Array.isArray(cfg)) return cfg
        return cfg.map((group: any[], groupIndex: number) => {
          if (!Array.isArray(group)) return group
          return group.map((item: any, idx: number) => {
            // if item is a primitive id (string/number), try to find matching paddler
            if (item == null) {
              return { id: `empty-${groupIndex}-${idx}-${Date.now()}`, name: '' }
            }
            if (typeof item === 'string' || typeof item === 'number') {
              const found = (race.paddlers || []).find((p: any) => String(p.id) === String(item))
              return found ? found : { id: String(item), name: '' }
            }
            // item is object
            const id = item.id ?? item.content ?? `${groupIndex}-${idx}-${Date.now()}`
            const found = (race.paddlers || []).find((p: any) => String(p.id) === String(id))
            return found ? found : { id: id, name: item.name ?? item.content ?? '' }
          })
        })
      })

      return { race, configs }
    })
  }, [regatta])

  logger.debug("Prepared configs for regatta", {regatta}, prepared);

  if (!regatta) {
    return (
      <Container>
        <div className="p-6">No regatta selected</div>
      </Container>
    )
  }

  return (
    <BoardViewProvider>
        <Container className="py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">All Race Configs — {regatta.name}</h2>
                <div>
                  <button className="px-3 py-1 border rounded text-sm" onClick={() => setShowExport(true)}>Export PDF</button>
                </div>
            </div>
            <div className="flex flex-col gap-8">
                {prepared.map(({ race, configs }: any) => (
                  <section key={race.id} data-export-race={`race-${race.id}`} className="flex flex-col p-4 bg-white">
                        <h3 className="text-lg font-medium mb-2">{race.category} {race.type} {race.distance} {race.boatType}</h3>
                        <div className="flex gap-4">
                            {configs.map((config: any, idx: number) => (
                              <div key={`${race.id}-cfg-${idx}`} data-export={`race-config-${race.id}-${idx}`} className="bg-white p-2 rounded shadow-sm export-config">
                              <div className="text-sm font-medium mb-2">Config {idx + 1}</div>
                              <div className="boat-visual">
                              {/* <SetupProvider> */}
                                <BoatStructure key={`${race.id}-cfg-${idx}`} 
                                  viewOnly={true} race={race} boatType={race.boatType} boardSetup={config} />
                              {/* </SetupProvider> */}
                              </div>
                              </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            </Container>
            {showExport && <ExportRacesModal races={regatta.races} onClose={() => setShowExport(false)} />}
        </BoardViewProvider>
  )
}
