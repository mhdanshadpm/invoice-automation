import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Button } from 'semantic-ui-react'
import routes from '../constants/routes';

export const Header = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const handleItemClick = (e, { name }) => {
    navigate(name)
  }

  const signOut = () => {
    localStorage.removeItem('authAccess');
    navigate('/login')
  }

  return (
    <div style={{margin: '20px 40px'}} >
      <h1>Invoice Automation</h1><br />
			<Menu size='mini'>
        <Menu.Item
          children='Home'
					name={routes.HOME}
					active={location.pathname === routes.HOME}
					onClick={handleItemClick}
				/>
        <Menu.Item
          children='Projects'
          name={routes.PROJECTS}
          active={location.pathname === routes.PROJECTS}
          onClick={handleItemClick}
        />
        {/* <Menu.Item
          children='Settings'
          name={routes.SETTINGS}
          active={location.pathname === routes.SETTINGS}
          onClick={handleItemClick}
        /> */}
				<Menu.Menu position='right'>
					{/* <Dropdown item text='Language'>
						<Dropdown.Menu>
							<Dropdown.Item>English</Dropdown.Item>
							<Dropdown.Item>Russian</Dropdown.Item>
							<Dropdown.Item>Spanish</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown> */}

					<Menu.Item>
						<span style={{ marginRight: 10 }}><b></b></span>
						<Button onClick={signOut} primary>Sign Out</Button>
					</Menu.Item>
				</Menu.Menu>
      </Menu>
    </div>
  )
}