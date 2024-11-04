import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'
import { Hurricane } from '../../types/hurricane'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'hurricanes.json')
    const jsonData = fs.readFileSync(dataPath, 'utf8')
    const hurricaneData: Hurricane[] = JSON.parse(jsonData)
    
    res.status(200).json(hurricaneData)
  } catch (error) {
    console.error('Error fetching hurricane data:', error)
    res.status(500).json({ error: 'Failed to fetch hurricane data' })
  }
} 