'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Powered `}</span>
        
        <span className='text-textSecondary'>{` by `}</span>
        <Link href='https://www.byteliberty.com' target='_blank' className='text-primary uppercase'>
          Byteliberty
        </Link>
      </p>
      
    </div>
  )
}

export default FooterContent
