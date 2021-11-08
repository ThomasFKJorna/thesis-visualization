import { TREE, walk, WalkerEntry } from 'isomorphic-git'
import fs from 'fs'
import * as Diff from 'diff'

async function diffMap(filepath: string, trees: Array<WalkerEntry | null>) {
  const [tree1, tree2] = trees
  if (!tree1 || !tree2) {
    return
  }
  if ((await tree1.type()) === 'tree' || (await tree2.type()) === 'tree') {
    return
  }
  const t1Content = (await tree1.content())!
  const t2Content = (await tree2.content())!
  const t1Buffer = Buffer.from(t1Content)
  const t2Buffer = Buffer.from(t2Content)
  const t1String = t1Buffer.toString('utf8')
  const t2String = t2Buffer.toString('utf8')

  //  console.log(t1String)
  return {
    filepath,
    oid: await tree1.oid(),
    diff: Diff.diffWords(t1String, t2String),
  }
}

export async function getCommitDiff(
  commitHash1: string,
  commitHash2: string,
  dir: string = '.',
  gitdir: string = `${dir}/git`,
) {
  return walk({
    fs,
    dir,
    gitdir,
    trees: [TREE({ ref: commitHash1 }), TREE({ ref: commitHash2 })],
    map: diffMap,
  })
}