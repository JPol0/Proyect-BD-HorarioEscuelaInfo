import { type MateriaRepository } from '../../ports/MateriaRepository'

export class UploadPlanEstudioExcel {
  private readonly repository: MateriaRepository

  constructor (repository: MateriaRepository) {
    this.repository = repository
  }

  async execute (file: File): Promise<{ count: number, skipped: number }> {
    return await this.repository.uploadPlanEstudioExcel(file)
  }
}
