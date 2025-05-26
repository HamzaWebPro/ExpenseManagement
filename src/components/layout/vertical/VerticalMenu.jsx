'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Icon } from '@iconify/react'

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
    <Icon icon='tabler-chevron-right' />
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
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <Icon icon='tabler-circle' className='text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {role === 'superAdmin' && (
          <MenuSection label='Super Admin'>
            <MenuItem href='/superadmin-dashboard' icon={<Icon icon='tabler-dashboard' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/store-management' icon={<Icon icon='tabler-building-store' />}>
              Store Management
            </MenuItem>
            <MenuItem href='/manager-management' icon={<Icon icon='tabler-user-shield' />}>
              Manager Management
            </MenuItem>
            <MenuItem href='/user-management' icon={<Icon icon='tabler-users-group' />}>
              User Management
            </MenuItem>
            <MenuItem href='/product-management' icon={<Icon icon='tabler-packages' />}>
              Product Management
            </MenuItem>
          </MenuSection>
        )}

        {role === 'admin' && (
          <MenuSection label='Admin'>
            <MenuItem href='/admin-dashboard' icon={<Icon icon='tabler-dashboard' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/manager-management' icon={<Icon icon='tabler-user-star' />}>
              Manager Management
            </MenuItem>
            <MenuItem href='/expense-management' icon={<Icon icon='tabler-cash-banknote' />}>
              Manage Expense
            </MenuItem>
            <MenuItem href='/all-users' icon={<Icon icon='tabler-users' />}>
              All Users
            </MenuItem>
            <MenuItem href='/all-products' icon={<Icon icon='tabler-package' />}>
              All Products
            </MenuItem>
          </MenuSection>
        )}
        {role === 'manager' && (
          <MenuSection label='Manager'>
            <MenuItem href='/manager-dashboard' icon={<Icon icon='tabler-dashboard' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/product-management' icon={<Icon icon='tabler-package-export' />}>
              Product Management
            </MenuItem>
            <MenuItem href='/user-management' icon={<Icon icon='tabler-user-plus' />}>
              User Management
            </MenuItem>
            <MenuItem href='/expense-management' icon={<Icon icon='tabler-receipt' />}>
              Manage Expense
            </MenuItem>
            <MenuItem href='/daily-financial-entry' icon={<Icon icon='tabler-report-money' />}>
              Daily Financial Entry
            </MenuItem>
          </MenuSection>
        )}
        {role === 'user' && (
          <MenuSection label='User'>
            <MenuItem href='/user-dashboard' icon={<Icon icon='tabler-home' />}>
              Dashboard
            </MenuItem>
          </MenuSection>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
