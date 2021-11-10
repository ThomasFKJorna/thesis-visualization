import type { NextApiRequest, NextApiResponse } from 'next'
import { FileDiff, getCommitDiff, getModifiedCommitDiff } from '../../../utils/getCommitDiff'
import { Change } from 'diff'
import { join } from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (slug && slug?.length < 2) {
    res.end(`Post: Error, api is like compare/commit1/commit2.`)
  }
  const cwd = process.cwd()
  const [commit1, commit2] = slug as string[]
  try {
    const diffs = await getCommitDiff(
      commit1,
      commit2,
      join(cwd, 'notes'),
      join(cwd, 'notes', 'git'),
    )
    const inFileDiffs = diffs.map((file: FileDiff) => {
      if (!file) {
        return
      }
      return {
        file: file.filepath,
        diff: file?.diff
          .map((diff: Change) => {
            const begin = diff.added
              ? '\n#+begin_addition\n'
              : diff.removed
              ? '\n#+begin_deletion\n'
              : ''
            const end = diff.added ? '\n#+end_addition\n' : diff.removed ? '\n#+end_deletion\n' : ''
            return `${begin}${diff.value}${end}`
          })
          .join(''),
      }
    })

    res.status(200).json(inFileDiffs)
  } catch (e) {
    console.error(e)
  }
}
