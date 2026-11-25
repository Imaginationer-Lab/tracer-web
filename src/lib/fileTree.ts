import type { FileEntry } from '../api/contract'

export interface FileTreeDir {
  kind: 'dir'
  name: string
  /** 저장소 루트 기준 경로 (예: src/payments) */
  path: string
  children: FileTreeNode[]
}

export interface FileTreeFile {
  kind: 'file'
  name: string
  path: string
  entry: FileEntry
}

export type FileTreeNode = FileTreeDir | FileTreeFile

function sortNodes(nodes: FileTreeNode[]): void {
  // 폴더 먼저, 같은 종류끼리는 이름순
  nodes.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'dir' ? -1 : 1))
  for (const node of nodes) if (node.kind === 'dir') sortNodes(node.children)
}

/** result.files 의 경로 목록을 폴더 트리로 만든다. 반환값은 루트의 자식들이다. */
export function buildFileTree(entries: FileEntry[]): FileTreeNode[] {
  const root: FileTreeDir = { kind: 'dir', name: '', path: '', children: [] }
  const dirs = new Map<string, FileTreeDir>([['', root]])

  for (const entry of entries) {
    const parts = entry.path.split('/')
    let parent = root
    for (let i = 0; i < parts.length - 1; i++) {
      const path = parts.slice(0, i + 1).join('/')
      let dir = dirs.get(path)
      if (!dir) {
        dir = { kind: 'dir', name: parts[i], path, children: [] }
        dirs.set(path, dir)
        parent.children.push(dir)
      }
      parent = dir
    }
    parent.children.push({ kind: 'file', name: parts[parts.length - 1], path: entry.path, entry })
  }

  sortNodes(root.children)
  return root.children
}

/** 경로의 상위 폴더 경로들 (src/a/b.ts → src, src/a) */
export function ancestorPaths(path: string): string[] {
  const parts = path.split('/')
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'))
}
