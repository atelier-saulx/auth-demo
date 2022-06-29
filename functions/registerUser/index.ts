import crypto from 'crypto'
import { Params } from '@based/server'
import { ServerClient } from 'postmark'
import { buildHtmlEmail } from './email'

const postmarkClient = new ServerClient('ee5acc67-86e6-4d87-b6bb-1f6e1ec2aced')

const generateConfirmToken = (): Promise<string> =>
  new Promise((resolve) =>
    crypto.randomBytes(48, (_, buffer) =>
      resolve('confirm:' + buffer.toString('hex'))
    )
  )

export default async ({ based, payload }: Params) => {
  const { name, email, password, redirectUrl, actionUrl } = payload

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

  if (existingUser?.id) {
    throw new Error('User already exists')
  }

  const confirmToken = await generateConfirmToken()
  const id = await based.set({
    type: 'user',
    $alias: confirmToken,
    status: 'confirmationSent',
    email,
    password,
    name,
  })

  const HtmlBody = buildHtmlEmail({ email, actionUrl: 'http://based.io' })
  await postmarkClient.sendEmail({
    From: 'no-reply@based.io',
    To: email,
    Subject: `Based.io email confirmation`,
    HtmlBody,
  })

  return { id }
}
