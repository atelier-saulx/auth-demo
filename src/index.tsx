import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import based from '@based/client'
import useLocalStorage from '@based/use-local-storage'
// @ts-ignore
import basedConfig from '../based.json'
import {
  Provider,
  Text,
  Login,
  RegisterButton,
  Button,
  DialogProvider,
  Register,
} from '@based/ui'

const client = based(basedConfig)

let rootEl = document.getElementById('root')

if (!rootEl) {
  rootEl = document.createElement('div')
  rootEl.id = 'root'
  document.body.appendChild(rootEl)
}

const App = () => {
  // Stores the token and refreshToken in local storage
  const [token, setToken] = useLocalStorage('token')
  const [refreshToken, setRefreshToken] = useLocalStorage('refreshToken')

  const [data, setData] = useState<string>()

  const renewHandler = ({ token: newToken }: { token: string }) => {
    setToken(newToken)
  }

  useEffect(() => {
    client.on('renewToken', renewHandler)
    return () => {
      client.removeListener('renewToken', renewHandler)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (token) {
        // Authenticates the user with the stored token and supplies the refreshToken
        await client.auth(token, { refreshToken })
      } else {
        return client.auth(false)
      }
    })()

    // Calls a data function
    client
      .call('getSomeData')
      .then((result) => {
        setData(result)
      })
      .catch((_err) => {
        setData('No access')
      })
  }, [token])

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
      }}
    >
      <Text>Auth Demo</Text>
      <p style={{ marginBottom: 16 }}>
        <strong>Data: </strong>
        {data}
      </p>
      {token ? (
        <Button
          onClick={async () => {
            await client.logout()
            setToken(null)
            setRefreshToken(null)
          }}
        >
          Logout
        </Button>
      ) : (
        <div style={{ width: 300, margin: 'auto' }}>
          <Login
            onLogin={({ token, refreshToken }) => {
              setToken(token)
              setRefreshToken(refreshToken)
            }}
            width={300}
            onRegister={async (data) => {
              const { email, password, name } = data
              const result = await client.call('registerUser', {
                email,
                password,
                name,
                redirectUrl: window.location.href,
              })
              console.log('yes register', result)
            }}
          />
        </div>
      )}
    </div>
  )
}

render(
  <Provider client={client}>
    <App />
  </Provider>,
  rootEl
)
