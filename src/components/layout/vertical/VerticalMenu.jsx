// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='text-xs tabler-circle' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      > 
        <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
          Dashboard
        </MenuItem>

        <SubMenu label="Users" icon={<i className='menu-icon icon-base ti tabler-users' />}>
            <MenuItem href={`/table`}>All Users</MenuItem>
            <MenuItem href={`/about`}>Add User</MenuItem>
        </SubMenu>

        <MenuSection label="Others">

          <SubMenu icon={<i className='menu-icon icon-base ti tabler-components' />} label="Lavel 1">
              <MenuItem>Lavel 2</MenuItem>
              <SubMenu label="Lavel 2">
                <MenuItem>Lavel 3</MenuItem>
                <MenuItem>Lavel 3</MenuItem>
              </SubMenu>
          </SubMenu>
          
          <MenuItem href='/about' icon={<i className='menu-icon icon-base ti tabler-table' />}>
            About
          </MenuItem>

        {/* <MenuItem disabled>{dictionary['navigation'].disabledMenu}</MenuItem> */}
        </MenuSection>
 

        <SubMenu label="Admin" icon={<i className='menu-icon icon-base ti tabler-users' />}>
            <MenuItem href={`/user/list`}>All Admin</MenuItem>
            <MenuItem href={`/user/view`}>Add Admin</MenuItem>
        </SubMenu>


        
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='text-xs tabler-circle' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
