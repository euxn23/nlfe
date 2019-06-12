import {
  allPackageNames,
  getDepModulesRecursivelyFlatten,
  getDeps
} from './libs/utils'

export const getUnifiableChildrenModules = async (
  parentRepos: string[]
): Promise<string[]> => {
  const modulesDependedByParentRecursively = [
    ...new Set(
      parentRepos.reduce(
        (prev, parent) => [...prev, ...getDepModulesRecursivelyFlatten(parent)],
        <string[]>[]
      )
    )
  ]

  const modulesDependedByOtherRepos: string[] = allPackageNames
    .filter(name => !modulesDependedByParentRecursively.includes(name))
    .filter(name => !parentRepos.includes(name))
    .map(name => getDepModulesRecursivelyFlatten(name))
    .reduce((prev, next) => [...prev, ...next], <string[]>[])

  const maybeUnifiableChildrenModules = modulesDependedByParentRecursively
    .filter(bd => !modulesDependedByOtherRepos.includes(bd))
    .sort()

  let otherDeps: { [key: string]: string }[] = []

  const reposExcludingParent = allPackageNames.filter(
    repo => !parentRepos.includes(repo)
  )

  reposExcludingParent.forEach(repo => {
    maybeUnifiableChildrenModules.forEach(maybeUnifiableModule => {
      const modulesInOtherRepos = getDeps(repo)
      if (modulesInOtherRepos.includes(maybeUnifiableModule)) {
        if (modulesDependedByParentRecursively.includes(maybeUnifiableModule))
          return
        otherDeps = [...otherDeps, { [repo]: maybeUnifiableModule }]
      }
    })
  })

  // 上記の候補の中の、他からも依存されているモジュール。ここが 0 でないとおかしい
  if (otherDeps.length) throw new Error('logic may be wrong')

  // < parent + maybeDependedByOnlyParent > 以外のリポジトリの依存ツリーに、 maybeDependedByOnlyParent が出現しないことを確認
  const reposExcludingUnifiableFamily = reposExcludingParent.filter(
    repo => !maybeUnifiableChildrenModules.includes(repo)
  )

  otherDeps = []
  reposExcludingUnifiableFamily.forEach(repo => {
    const modulesMayNotDependOnUnifiableFamily = getDepModulesRecursivelyFlatten(
      repo
    )
    modulesMayNotDependOnUnifiableFamily.forEach(module => {
      if (maybeUnifiableChildrenModules.includes(module))
        otherDeps = [...otherDeps, { [repo]: module }]
    })
  })

  // Parent からのみ依存されているはずのモジュールに依存しているものが存在すれば出力される。ここが 0 個でないとおかしい
  if (otherDeps.length) throw new Error('logic may be wrong')

  return maybeUnifiableChildrenModules
}
