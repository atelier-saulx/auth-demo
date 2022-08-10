import React, { FC } from 'react'
import { render } from 'react-dom'
import { useAuth, useData } from '@based/react'
import based from '@based/client'
// @ts-ignore
import basedConfig from '../based.json'
import {
  Provider,
  Text,
  Authorize,
  Avatar,
  UserProfile,
  useContextMenu,
} from '@based/ui'

const client = based(basedConfig)

const LoggedinBody: FC = () => {
  const user = useAuth()
  const { data } = useData({
    $id: user?.id || null,
    id: true,
    name: true,
    email: true,
  })
  const onProfile = useContextMenu(
    UserProfile,
    { id: user && user.id },
    { position: 'right', offset: { x: 0, y: 28 } }
  )
  return (
    <div>
      <Text>User is logged in</Text>
      <pre>
        id: {data.id}
        <br />
        name: {data.name}
        <br />
        email: {data.email}
      </pre>
      <Avatar onClick={onProfile} label={data.name} />
    </div>
  )
}

const App: FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
      }}
    >
      <div style={{ margin: 'auto' }}>
        <Authorize
          // googleClientId="<your_google_client_id>"
          // microsoftClientId="<your_microsoft_client_id>"
          // githubClientId="<your_github_client_id>"
          app={LoggedinBody}
        />
      </div>
    </div>
  )
}

let rootEl = document.getElementById('root')
if (!rootEl) {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
}
render(
  <Provider client={client}>
    <App />
  </Provider>,
  rootEl
)
