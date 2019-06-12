import * as fs from 'fs'
import { resolve } from 'path'

import {
  getGhqRoot,
  getPackageJsonDependencyDefinitions,
  jsonStringify
} from './libs/utils'

const main = async () => {
  const githubRoot = resolve(await getGhqRoot(), 'github.com', 'github-group-name')
  const repos = fs.readdirSync(githubRoot)
  if (!repos.length) throw new Error('Repositories not found')
  const unusedRepos: string[] = require('../../data/bitbucket/meta/unused-repos.json')
  const usedRepos: string[] = repos.filter(repo => !unusedRepos.includes(repo))

  const packageJsonDependencyDefinitions = getPackageJsonDependencyDefinitions(
    githubRoot,
    usedRepos
  )

  console.log(packageJsonDependencyDefinitions)

  fs.writeFileSync(
    resolve(
      __dirname,
      '../data/package-json-dependency-definitions.json'
    ),
    jsonStringify(packageJsonDependencyDefinitions)
  )
}

main().catch(console.error)
