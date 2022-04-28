import React from 'react'
import useSWR from 'swr'
import { BaseNote, NoteProps } from './BaseNote'

export interface StackedNoteProps
  extends Omit<NoteProps, 'page' | 'source' | 'slug' | 'fileData' | 'toc' | 'commits' | 'csl'> {
  id: string
}

export const StackedNote = (props: StackedNoteProps) => {
  const { id, index, stackedNotes } = props
  const { data: file } = useSWR(`/api/file/bySlug/${id}`)
  // const { data: meta } = useSWR(`/api/meta/bySlug/${id}`)
  // if (!file || !meta) {
  //   return <ChaoticOrbit />
  // }
  // const text = file.file
  // const fileData = meta.meta
  return file ? (
    <BaseNote
      source={file?.source}
      id={id}
      // id={meta.title}
      toc={[]}
      commits={{}}
      {...{ stackedNotes, index }}
    />
  ) : null
}
