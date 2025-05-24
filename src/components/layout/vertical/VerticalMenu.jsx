'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
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
import Cookies from 'js-cookie'

import decryptDataObject from '@/@menu/utils/decrypt'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const [role, setRole] = useState('')
  // get user role
  useEffect(() => {
    const sessionToken = Cookies.get('sessionToken')
    const data = JSON.parse(decryptDataObject(sessionToken))?.role
    setRole(data)
  }, [])

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
        {
          /* superadmin part start */

          role === 'superAdmin' && (
            <MenuSection label='Super Admin'>
              <MenuItem href='/superadmin-dashboard' icon={<i className='tabler-smart-home' />}>
                Dashboard
              </MenuItem>
              <MenuItem href='/admin-management' icon={<i className='menu-icon icon-base ti tabler-building-store' />}>
                Store Management
              </MenuItem>

              <MenuItem href={`/user-management`} icon={<i className='menu-icon icon-base ti tabler-users' />}>
                User Management
              </MenuItem>
            </MenuSection>
          )
          /* superadmin part end */
        }

        {
          /* admin part start */
          role === 'admin' && (
            <MenuSection label='Admin'>
              <MenuItem href='/admin-dashboard' icon={<i className='tabler-smart-home' />}>
                Dashboard
              </MenuItem>

              <MenuItem href={`/manager-management`} icon={<i className='menu-icon icon-base ti tabler-users'></i>}>
                Manager Management
              </MenuItem>

              <MenuItem
                href='/expense-management'
                icon={<i className='menu-icon icon-base ti tabler-currency-dollar' />}
              >
                Manage Expense
              </MenuItem>
              <MenuItem href='/all-users' icon={<i className='menu-icon icon-base ti tabler-users' />}>
                All Users
              </MenuItem>
              <MenuItem href='/all-products' icon={<i className='menu-icon icon-base ti tabler-users' />}>
                All Products
              </MenuItem>
            </MenuSection>
          )
          /* admin part end */
        }
        {
          /* manager part start */
          role === 'manager' && (
            <MenuSection label='Manager'>
              <MenuItem href='/manager-dashboard' icon={<i className='tabler-smart-home' />}>
                Dashboard
              </MenuItem>

              <MenuItem
                href={`/product-management`}
                icon={<i className='menu-icon icon-base ti tabler-shopping-bag' />}
              >
                Product Management
              </MenuItem>

              <MenuItem href={`/user-management`} icon={<i className='menu-icon icon-base ti tabler-users' />}>
                User Management
              </MenuItem>

              <MenuItem
                href='/expense-management'
                icon={<i className='menu-icon icon-base ti tabler-currency-dollar' />}
              >
                Manage Expense
              </MenuItem>
              <MenuItem href='/daily-financial-entry' icon={<i className='menu-icon icon-base ti tabler-users' />}>
                Daily Financial Entry
              </MenuItem>
            </MenuSection>
          )
          /* manager part end */
        }
        {
          /* user part start */
          role === 'user' && (
            <MenuSection label='User'>
              <MenuItem href='/user-dashboard' icon={<i className='tabler-smart-home' />}>
                Dashboard
              </MenuItem>
            </MenuSection>
          )
          /* user part end */
        }
        {/* <MenuItem disabled>{dictionary['navigation'].disabledMenu}</MenuItem> */}
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

// <SubMenu icon={<i className='menu-icon icon-base ti tabler-components' />} label='Lavel 1'>
// <MenuItem>Lavel 2</MenuItem>
// <SubMenu label='Lavel 2'>
//   <MenuItem>Lavel 3</MenuItem>
//   <MenuItem>Lavel 3</MenuItem>
// </SubMenu>
// </SubMenu>
