export interface BitbucketApiResponseRepositoryValue {
  name: string
  mainbranch?: { name: string }
  project?: { name: string }
  updated_on?: string
}

export interface NodeModules {
  [name: string]: string
}

export interface PackageJson {
  dependencies: NodeModules
  devDependencies: NodeModules
  peerDependencies?: NodeModules
  version: string
  name: string
  engines?: Engines
}

export interface DependenciesInPackageJson {
  [name: string]: NodeModules
}

export interface Engines {
  node?: string
  npm?: string
}
