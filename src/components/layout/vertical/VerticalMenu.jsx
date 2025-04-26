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
        {/* superadmin part start */}
        <MenuSection label='Super Admin'>
          <MenuItem href='/superadmin_dashboard' icon={<i className='tabler-smart-home' />}>
            Dashboard
          </MenuItem>

          <SubMenu label='Admin Management' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            <MenuItem href={`/all_admins`}>All Admins</MenuItem>
            <MenuItem href={`/add_admin`}>Add Admin</MenuItem>
          </SubMenu>
          <MenuItem href='/all_managers' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            All Managers
          </MenuItem>
          <MenuItem href='/all_users' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            All Users
          </MenuItem>
        </MenuSection>
        {/* superadmin part end */}

        {/* admin part start */}
        <MenuSection label='Admin'>
          <MenuItem href='/admin_dashboard' icon={<i className='tabler-smart-home' />}>
            Dashboard
          </MenuItem>

          <SubMenu label='Manager Management' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            <MenuItem href={`/all_managers`}>All Managers</MenuItem>
            <MenuItem href={`/add_manager`}>Add Manager</MenuItem>
          </SubMenu>
          <MenuItem href='/add_expense_admin' icon={<i className='menu-icon icon-base ti tabler-currency-dollar' />}>
            Add Expense
          </MenuItem>
          <MenuItem href='/all_users' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            All Users
          </MenuItem>
        </MenuSection>
        {/* admin part end */}
        {/* manager part start */}
        <MenuSection label='Manager'>
          <MenuItem href='/manager_dashboard' icon={<i className='tabler-smart-home' />}>
            Dashboard
          </MenuItem>

          <SubMenu label='Product Management' icon={<i className='menu-icon icon-base ti tabler-shopping-bag' />}>
            <MenuItem href={`/all_products`}>All Products</MenuItem>
            <MenuItem href={`/add_product`}>Add Products</MenuItem>
          </SubMenu>
          <SubMenu label='User Management' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            <MenuItem href={`/all_users`}>All Users</MenuItem>
            <MenuItem href={`/add_user`}>Add User</MenuItem>
            <MenuItem href={`/manage_user_percentage`}>Manage User Percentage</MenuItem>
          </SubMenu>
          <MenuItem href='/add_expense_manager' icon={<i className='menu-icon icon-base ti tabler-currency-dollar' />}>
            Add Expense
          </MenuItem>
          <MenuItem href='/daily_financial_entry' icon={<i className='menu-icon icon-base ti tabler-users' />}>
            Daily Financial Entry
          </MenuItem>
        </MenuSection>
        {/* manager part end */}
        {/* user part start */}
        <MenuSection label='User'>
          <MenuItem href='/user_dashboard' icon={<i className='tabler-smart-home' />}>
            Dashboard
          </MenuItem>
        </MenuSection>
        {/* user part end */}
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
