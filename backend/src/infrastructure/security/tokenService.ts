import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET ?? 'clave-secreta-desarrollo-2026'

export function generateToken (nombre: string, rol: string): string {
  const payload = JSON.stringify({ nombre, rol, createdAt: Date.now() })
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64')
}

export function verifyToken (token: string): { nombre: string, rol: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as { payload: string, signature: string }
    const { payload, signature } = decoded

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')
    if (signature !== expectedSignature) {
      return null
    }

    return JSON.parse(payload) as { nombre: string, rol: string }
  } catch {
    return null
  }
}
