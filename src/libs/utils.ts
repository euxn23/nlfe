import { promisify } from 'util'
import { exec } from 'child_process'
import { resolve } from 'path'
import prettier from 'prettier'
import { readdirRecursivelySyncFlatten } from 'readdir-recursively-sync'
import { DependenciesInPackageJson, NodeModules, PackageJson } from './types'

export const execAsync = promisify(exec)

export function jsonStringify(json: any): string {
  return prettier.format(JSON.stringify(json), {
    parser: 'json',
    printWidth: 0
  })
}

export async function getGhqRoot(): Promise<string> {
  const ghqRoot =
    process.env.GHQ_ROOT ||
    process.env.CLONE_ROOT ||
    (await execAsync('ghq root').then(({ stdout }) => stdout.replace('\n', '')))
  if (!ghqRoot) throw new Error('ghq is required')
  return ghqRoot
}

export class PackageJsonNotFoundError extends Error {}

export const getPackageJsonDependencyDefinitions = (
  repoRoot: string,
  repos: string[]
): NodeModules =>
  repos.reduce((prevDeps: DependenciesInPackageJson, repo) => {
    try {
      const deps = getPackageDepsFromRepoDir(resolve(repoRoot, repo))
      const privateModulesInDevDep = Object.entries(deps)
        .filter(([name, source]) => source.match('github.com'))
        .reduce((prev, [name, source]) => ({ ...prev, [name]: source }), {})
      return { ...prevDeps, [repo]: privateModulesInDevDep }
    } catch (e) {
      if (e instanceof PackageJsonNotFoundError) return prevDeps
      console.log(repo)
      console.error(e)
      return prevDeps
    }
  }, {})

export const getPackageDepsFromRepoDir = (repoPath: string): NodeModules => {
  const packageJsonList = readdirRecursivelySyncFlatten(repoPath)
    .filter(dirPath => !dirPath.match(resolve(repoPath, 'node_modules')))
    .filter(dirPath => dirPath.match('package.json'))

  if (!packageJsonList.length) throw new PackageJsonNotFoundError(repoPath)

  return packageJsonList
    .map(dirPath => {
      try {
        const pkg: PackageJson = require(dirPath)
        return { ...pkg.dependencies, ...pkg.devDependencies }
      } catch (e) {
        return {}
      }
    })
    .reduce((prev, next) => ({ ...prev, ...next }), {})
}

const moduleDependencyList: {
  [name: string]: string[]
} = require('../../data/module-dependency-list.json')

export const getDeps = (name: string): string[] =>
  moduleDependencyList[name] || []

export const getDepModulesRecursivelyFlatten = (
  name: string,
  exclude?: string
): string[] => {
  const deps = exclude
    ? getDeps(name).filter(dep => !dep.match(exclude))
    : getDeps(name)
  if (deps && deps.length) {
    return [
      ...new Set([
        ...deps,
        ...deps.reduce(
          (prev: string[], moduleName) => [
            ...prev,
            ...getDepModulesRecursivelyFlatten(moduleName, exclude)
          ],
          []
        )
      ])
    ]
  }
  return []
}

export const getDepModulesRecursively = (
  name: string,
  exclude?: string
): { [name: string]: any } => {
  const deps = exclude
    ? getDeps(name).filter(dep => !dep.match(exclude))
    : getDeps(name)
  if (deps && deps.length) {
    return {
      [name]: {
        ...deps.reduce(
          (prev, moduleName) => ({
            ...prev,
            ...getDepModulesRecursively(moduleName, exclude)
          }),
          {}
        )
      }
    }
  }
  return { [name]: {} }
}

export const allPackageNames: string[] = require('../data/package-json-dependency-definitions.json')
















