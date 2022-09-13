import {readFileSync} from 'fs'
import path from 'path'
import PROD from '../PROD'

const getSSL = () => {
  try {
    const PG_ROOT = path.join(__PROJECT_ROOT__, 'packages/server/postgres')
    const ca = readFileSync(path.join(PG_ROOT, 'root.crt'))
    const key = readFileSync(path.join(PG_ROOT, 'postgresql.key'))
    const cert = readFileSync(path.join(PG_ROOT, 'postgresql.crt'))
    return {ca, key, cert, rejectUnauthorized: true}
  } catch (e) {
    return undefined
  }
}

const getPgConfig = () => {
  const config = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    max: Number(process.env.POSTGRES_POOL_SIZE) || PROD ? 20 : 5
  }
  const ssl = getSSL()
  // ssl value defaults to process.env.PGSSLMODE, so only set the variable here if CA is found
  if (!ssl) return config
  return {...config, ssl}
}

export default getPgConfig
