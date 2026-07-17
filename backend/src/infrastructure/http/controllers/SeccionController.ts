import { type Request, type Response } from 'express'
import { type GetSecciones } from '../../../application/useCases/Secciones/GetSecciones.js'
import { type GetSeccion } from '../../../application/useCases/Secciones/GetSeccion.js'
import { type SaveSeccion } from '../../../application/useCases/Secciones/SaveSeccion.js'
import { type DeleteSeccion } from '../../../application/useCases/Secciones/DeleteSeccion.js'

export class SeccionController {
  private readonly getSecciones: GetSecciones
  private readonly getSeccion: GetSeccion
  private readonly saveSeccion: SaveSeccion
  private readonly deleteSeccion: DeleteSeccion

  constructor (
    getSecciones: GetSecciones,
    getSeccion: GetSeccion,
    saveSeccion: SaveSeccion,
    deleteSeccion: DeleteSeccion
  ) {
    this.getSecciones = getSecciones
    this.getSeccion = getSeccion
    this.saveSeccion = saveSeccion
    this.deleteSeccion = deleteSeccion
  }

  async getAll (req: Request, res: Response): Promise<void> {
    try {
      const term = req.query.term as string
      const materia = req.query.materia as string
      
      if (!term || !materia) {
        res.status(400).json({ error: 'term y materia son requeridos en la query' })
        return
      }

      const secciones = await this.getSecciones.execute(term, materia)
      res.json(secciones)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async getOne (req: Request, res: Response): Promise<void> {
    try {
      const nroSeccion = Number(req.params.nroSeccion)
      const term = req.query.term as string
      const materia = req.query.materia as string

      if (!term || !materia || isNaN(nroSeccion)) {
        res.status(400).json({ error: 'term, materia y nroSeccion válido son requeridos' })
        return
      }

      const seccion = await this.getSeccion.execute(term, materia, nroSeccion)
      
      if (!seccion) {
        res.status(404).json({ error: 'Sección no encontrada' })
        return
      }

      res.json(seccion)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async save (req: Request, res: Response): Promise<void> {
    try {
      const { codMateria, codTerm } = req.body

      if (!codMateria || !codTerm) {
        res.status(400).json({ error: 'Faltan campos obligatorios para guardar la sección' })
        return
      }

      await this.saveSeccion.execute({ codMateria, codTerm })
      res.status(201).json({ message: 'Sección guardada exitosamente' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async delete (req: Request, res: Response): Promise<void> {
    try {
      const nroSeccion = Number(req.params.nroSeccion)
      const term = req.query.term as string
      const materia = req.query.materia as string

      if (!term || !materia || isNaN(nroSeccion)) {
        res.status(400).json({ error: 'term, materia y nroSeccion válido son requeridos para eliminar' })
        return
      }

      await this.deleteSeccion.execute(term, materia, nroSeccion)
      res.status(204).send()
    } catch (error: any) {
      if (error.message.includes('No se encontró')) {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  }
}
