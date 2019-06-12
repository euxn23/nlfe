import { map as promiseMap } from 'bluebird'
import { execAsync } from "./libs/utils";

export const checkGhq = async () =>
  execAsync('type ghq').then(({ stderr }) => {
    if (stderr) throw new Error('ghq is required')
  })

export const cloneByGhq = async (urlList: string[]) => {
  await checkGhq()

  await promiseMap(
    urlList,
    async url =>
      await execAsync(
        `GHQ_ROOT=${process.env.GHQ_ROOT ||
        process.env.CLONE_ROOT} ghq get -u ${url}`
      ).catch(console.error),
    { concurrency: 4 }
  )
}
