'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'
import LogoutButton from '../../components/LogoutButton'

export default function Profile() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    void getProfile()
  }, [])

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log(error)
      } else if (data) {
        setName(data.name || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || '')
      }
    }
  }

  async function updateProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name, bio })

      if (error) {
        alert(error.message)
      } else {
        alert('Profile updated successfully!')
      }
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: filePath
        })

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }

      setAvatarUrl(filePath)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar! ' + (error as Error).message)
    }
  }

  return (
    <>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl">
              Profile App
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-gray-900"
              >
                Home
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - add pt-20 to account for fixed header */}
      <div className="flex justify-center items-center min-h-screen bg-gray-100 pt-20">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <h2 className="mb-6 text-2xl text-center">Your Profile</h2>
          <div className="mb-4 flex justify-center">
            {avatarUrl ? (
              <Image 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
                alt="Avatar" 
                width={100} 
                height={100} 
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">
              Upload Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={uploadAvatar}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
              Bio
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bio"
              placeholder="A short bio about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={updateProfile}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

