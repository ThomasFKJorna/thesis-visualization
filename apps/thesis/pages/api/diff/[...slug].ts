import type { NextApiRequest, NextApiResponse } from 'next'
import { Change } from 'diff'
import { join } from 'path'
import { getCommitDiffForSingleFile } from '../../../utils/getCommitDiff'
import { diffToString } from '../../../services/thesis/parseDiff'
import { FileDiff } from '../../../types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (slug && slug?.length < 3) {
    res.end(`Post: Error, api is like compare/commit1/commit2/file.`)
  }
  const cwd = process.cwd()
  const [commit1, commit2, encodedFile] = slug as string[]
  const file = decodeURIComponent(encodedFile)
  try {
    const diffs = await getCommitDiffForSingleFile(
      commit1,
      commit2,
      join(cwd, 'notes'),
      join(cwd, 'notes', 'git'),
      file,
    )

    const inFileDiffs = diffs.map((file: FileDiff) => {
      if (!file) {
        return
      }
      return {
        file: file.filepath,
        additions: file.additions,
        deletions: file.deletions,
        diff: diffToString(file),
      }
    })

    res.status(200).json(inFileDiffs)
  } catch (e) {
    console.error(e)
    res.status(500)
  }
}