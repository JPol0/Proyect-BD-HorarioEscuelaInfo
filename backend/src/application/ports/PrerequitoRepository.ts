import { type Prerequito } from '../../domain/Prerequito.js'

export interface PrerequitoRepository {
  guardar: (prerequito: Prerequito, tx?: any) => Promise<void>
  eliminar: (
    codigoAsignatura: string,
    codigoTermAsignatura: string,
    codigoAsignaturaPrerequito: string,
    codigoTermPrerequito: string,
    tx?: any
  ) => Promise<void>
  eliminarPorMateria: (codigoAsignatura: string, codigoTermAsignatura: string, tx?: any) => Promise<void>
  obtenerPorTerm: (codigoTermAsignatura: string) => Promise<Prerequito[]>
  obtenerPorMateria: (codigoAsignatura: string, codigoTermAsignatura: string) => Promise<Prerequito[]>
}
