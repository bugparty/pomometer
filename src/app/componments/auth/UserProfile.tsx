import React, { useEffect } from 'react'
import Image from 'next/image'
import { FormattedMessage } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { logout, fetchUserProfile, clearError } from './authSlice'
import {AppDispatch } from '../store'
import { RootState } from '../rootReducer'
import './Auth.css'

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch, isAuthenticated, user])

  const handleLogout = () => {
    dispatch(logout())
  }

  // 错误处理现在通过 Toast 组件自动处理

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="user-profile loading">
        <FormattedMessage id="userProfile.loading" defaultMessage="Loading..." />
      </div>
    )
  }

  {/* 错误提示现在通过 Toast 组件显示，不再在这里显示 */}

  if (!user) {
    return null
  }

  return (
    <div className="user-profile">
      <div className="user-info">
        <Image
          src={user.picture}
          alt={user.name}
          className="user-avatar"
          width={40}
          height={40}
          style={{
            borderRadius: '50%',
            marginRight: '10px'
          }}
        />
        <div className="user-details">
          <div className="user-name">{user.name}</div>
          <div className="user-email hidden sm:block">{user.email}</div>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-button">
        <span className="hidden sm:inline">
          <FormattedMessage id="userProfile.logout" defaultMessage="Logout" />
        </span>
        <span className="sm:hidden">
          <FormattedMessage id="userProfile.logout.short" defaultMessage="Exit" />
        </span>
      </button>
    </div>
  )
}

export default UserProfile
