import { type Prerequito } from '../../domain/Prerequito'

export interface PrerequitoRepository {
  guardar: (prerequito: Prerequito, term: string) => Promise<void>
  eliminar: (
    codigoAsignatura: string,
    codigoAsignaturaPrerequito: string,
    term: string
  ) => Promise<void>
  obtenerPorTerm: (term: string) => Promise<Prerequito[]>
  obtenerPorMateria: (codigoAsignatura: string, term: string) => Promise<Prerequito[]>
}
