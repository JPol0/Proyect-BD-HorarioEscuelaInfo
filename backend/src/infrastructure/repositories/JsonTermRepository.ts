import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import type { Term } from '../../domain/entities/Term.js'
import type { TermRepository } from '../../domain/ports/TermRepository.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_PATH = join(__dirname, '../data/terms.json')

export class JsonTermRepository implements TermRepository {
  private async read (): Promise<Term[]> {
    const raw = await readFile(DATA_PATH, 'utf-8')
    return JSON.parse(raw) as Term[]
  }

  private async write (terms: Term[]): Promise<void> {
    await writeFile(DATA_PATH, JSON.stringify(terms, null, 2), 'utf-8')
  }

  async findAll (): Promise<Term[]> {
    return await this.read()
  }

  async findById (id: string): Promise<Term | undefined> {
    const terms = await this.read()
    return terms.find(t => t.id === id)
  }

  async save (term: Term): Promise<Term> {
    const terms = await this.read()
    const existingIndex = terms.findIndex(t => t.id === term.id)
    if (existingIndex >= 0) {
      terms[existingIndex] = term
    } else {
      terms.unshift(term)
    }
    await this.write(terms)
    return term
  }

  async delete (id: string): Promise<void> {
    const terms = await this.read()
    const filtered = terms.filter(t => t.id !== id)
    await this.write(filtered)
  }
}
