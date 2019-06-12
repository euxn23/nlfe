import {
  getDepModulesRecursively,
  getDepModulesRecursivelyFlatten,
  jsonStringify
} from './libs/utils'
import * as fs from 'fs'
import { resolve } from 'path'

export const listModulesDependedRecursively = (entryModuleName: string) => {
  const dependenciesRecursivelyFlatten = getDepModulesRecursivelyFlatten(
    entryModuleName
  )

  fs.writeFileSync(
    resolve(
      __dirname,
      `../../../data/bitbucket/${entryModuleName}/modules-depended-recursively-flatten.json`
    ),
    jsonStringify(dependenciesRecursivelyFlatten)
  )

  const dependenciesRecursively = getDepModulesRecursively(entryModuleName)[
    entryModuleName
    ]

  console.log(dependenciesRecursively)

  fs.writeFileSync(
    resolve(
      __dirname,
      `../../../data/bitbucket/${entryModuleName}/modules-depended-recursively.json`
    ),
    jsonStringify(dependenciesRecursively)
  )
}
