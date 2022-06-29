import { Params } from '@based/server'

const unrestrictedFunctions = ['login', 'registerUser']

export default async ({ callStack, based, user, name }: Params) => {
  console.log({ name, callStack })
  const { project, env } = based.opts
  if (callStack && unrestrictedFunctions.includes(callStack[0])) {
    return true
  }
  if (unrestrictedFunctions.includes(name)) {
    return true
  }

  if (user && user._token) {
    const token = await user.token(`users-public-key-${project}-${env}`)

    if (token.id) {
      return true
    }
  }

  return false
}
