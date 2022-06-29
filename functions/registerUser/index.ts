import crypto from 'crypto'
import { Params } from '@based/server'
import getService from '@based/get-service'
import { ServerClient } from 'postmark'
import { buildHtmlEmail } from './email'

const generateConfirmToken = (): Promise<string> =>
  new Promise((resolve) =>
    crypto.randomBytes(48, (_, buffer) =>
      resolve('confirm:' + buffer.toString('hex'))
    )
  )

export default async ({ based, payload }: Params) => {
  const { name, email, password, redirectUrl } = payload

  const postmarkApiKey = await based.secret('hello-postmark-apikey')
  const postmarkClient = new ServerClient(postmarkApiKey)

  if (!email || !password) {
    throw new Error('email and password required')
  }

  const { existingUser } = await based.get({
    existingUser: {
      id: true,
      $find: {
        $traverse: 'children',
        $filter: [
          {
            $field: 'type',
            $operator: '=',
            $value: 'user',
          },
          {
            $operator: '=',
            $field: 'email',
            $value: email,
          },
        ],
      },
    },
  })

  // if (existingUser?.id) {
  //   throw new Error('User already exists')
  // }

  const confirmToken = await generateConfirmToken()
  const id = await based.set({
    type: 'user',
    $alias: confirmToken,
    status: 'confirmationSent',
    email,
    password,
    name,
  })

  const service = await getService({
    org: based.opts.org,
    project: based.opts.project,
    env: based.opts.env,
    name: '@based/hub',
  })

  const actionUrl = `http://${service.host}:${
    service.port
  }/call/confirmUser?q=${encodeURI(
    JSON.stringify({ c: confirmToken, r: redirectUrl })
  )}"`
  console.log({ actionUrl })

  const HtmlBody = buildHtmlEmail({ email, actionUrl })
  await postmarkClient.sendEmail({
    From: 'no-reply@based.io',
    To: email,
    Subject: `Based.io email confirmation`,
    HtmlBody,
  })

  return { id }
}
