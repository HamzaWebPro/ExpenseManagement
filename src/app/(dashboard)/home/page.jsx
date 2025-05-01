"use client"
import React, { useEffect, useState } from 'react'

import Cookies from 'js-cookie'

import decryptDataObject from '@/@menu/utils/decrypt'
import { useRouter } from 'next/navigation'
import { CirclesWithBar } from 'react-loader-spinner'

const page = () => {
  const router = useRouter()
  const [role, setRole] = useState('')
  // get admin role
  useEffect(() => {
    const sessionToken = Cookies.get('sessionToken')
    const data = JSON.parse(decryptDataObject(sessionToken))?.role
    setRole(data)
  }, [])
  if (role === 'admin') {
    router.push('/admin-dashboard')
  } else if (role === 'superAdmin') {
    router.push('/superadmin-dashboard')
  } else if (role === 'manager') {
    router.push('/manager-dashboard')
  } else if (role === 'user') {
    router.push('/user-dashboard')
  } 
  return <>
  <div className="flex py-[200px] justify-center items-center">
  <CirclesWithBar
  height="100"
  width="100"
  color="#fcfcfc"
  outerCircleColor="#fcfcfc"
  innerCircleColor="#fcfcfc"
  barColor="#fcfcfc"
  ariaLabel="circles-with-bar-loading"
  wrapperStyle={{}}
  wrapperClass=""
  visible={true}
  />
  </div>
  </>
}

export default page

