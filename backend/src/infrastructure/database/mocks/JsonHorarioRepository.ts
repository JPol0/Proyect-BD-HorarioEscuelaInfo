import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { type HorarioRepository } from '../../../application/ports/HorarioRepository.js'
import { type Horario } from '../../../domain/Horario.js'

const filename = fileURLToPath(import.meta.url)
const dirName = dirname(filename)
const DATA_PATH = join(dirName, './horarios.json')

export class JsonHorarioRepository implements HorarioRepository {
  async getScheduleByTerm (term: string): Promise<Horario[] | null> {
    try {
      const raw = await readFile(DATA_PATH, 'utf-8')
      const data: Record<string, Horario[]> = JSON.parse(raw)
      return data[term] ?? null
    } catch {
      return null
    }
  }

  async saveSchedule (term: string, schedule: Horario[]): Promise<void> {
    try {
      let data: Record<string, Horario[]> = {}
      try {
        const raw = await readFile(DATA_PATH, 'utf-8')
        data = JSON.parse(raw)
      } catch {
        // file doesn't exist or is invalid, start fresh
      }
      if (schedule.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete data[term]
      } else {
        data[term] = schedule
      }
      await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      throw new Error('No se pudo guardar el horario')
    }
  }

  /**
   * Elimina todas las asignaciones horarias asociadas a un término (borrado en cascada).
   */
  async clearTerm (term: string): Promise<void> {
    try {
      let data: Record<string, Horario[]> = {}
      try {
        const raw = await readFile(DATA_PATH, 'utf-8')
        data = JSON.parse(raw)
      } catch {
        // Archivo no existe o es inválido, nada que borrar
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete data[term]
      await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      throw new Error('No se pudo limpiar el horario del término')
    }
  }
}
