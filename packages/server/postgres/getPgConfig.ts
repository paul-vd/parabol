import {readFileSync} from 'fs'
import path from 'path'
import PROD from '../PROD'

const getSSL = () => {
  if (process.env.PGSSLMODE !== 'require') return undefined
  const PG_ROOT = path.join(__PROJECT_ROOT__, 'packages/server/postgres')
  const ca = readFileSync(path.join(PG_ROOT, 'root.crt'))
  const key = readFileSync(path.join(PG_ROOT, 'postgresql.key'))
  const cert = readFileSync(path.join(PG_ROOT, 'postgresql.crt'))
  return {ca, key, cert, rejectUnauthorized: true}
}

const getPgConfig = () => ({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  max: Number(process.env.POSTGRES_POOL_SIZE) || PROD ? 20 : 5,
  ssl: getSSL()
})

export default getPgConfig
