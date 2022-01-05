import React, { useState } from 'react'
import { Button, Form, Grid, Segment } from 'semantic-ui-react'
import sha1 from 'sha-1'
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../firebase';

const LoginForm = () => {
  const { getUser } = useFirebase();
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    getUser(username).then((snapshot) => {
      const users = snapshot.docs.map(doc => doc.data())
      const user = users[0]
      const passwordFromDb = user.password;
      const passwordSha1 = sha1(password)
      if (passwordSha1 === passwordFromDb) {
        localStorage.setItem('authAccess', true)
        navigate('/')
      } else {
        alert('authentication failed')
      }
    }).catch(e=> console.log({e}))
  }
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        {/* <Header as='h2' color='teal' textAlign='center'>
          <Image src='/logo.png' /> Log-in to your account
        </Header> */}
        <Form size='large'>
          <Segment stacked>
            <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address'>
              <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
              </Form.Input>
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'

            >
              <input value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Input>

            <Button onClick={onLogin} color='teal' fluid size='large'>
              Login
            </Button>
          </Segment>
        </Form>
        {/* <Message>
          New to us? <a href='#'>Sign Up</a>
        </Message> */}
      </Grid.Column>
    </Grid>
  )
}

export { LoginForm };