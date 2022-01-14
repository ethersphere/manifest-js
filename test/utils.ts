import { Bee, BeeDebug } from '@ethersphere/bee-js'

const BEE_API_URL = process.env.BEE_API_URL || 'http://localhost:1633'
const BEE_DEBUG_API_URL = process.env.BEE_DEBUG_API_URL || 'http://localhost:1635'

export const bee = new Bee(BEE_API_URL)
export const beeDebug = new BeeDebug(BEE_DEBUG_API_URL)
