import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'
import SupabaseProvider from '../components/SupabaseProvider'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <SupabaseProvider>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl">
              Profile App
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                    Profile
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-gray-900">
                    Log In
                  </Link>
                  <Link href="/signup" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen py-2 pt-20">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-8">
            Welcome to Your Profile App
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Create and customize your profile, connect with others, and share your story with the world.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Share Your Story</h2>
              <p className="text-gray-600">Create a beautiful profile that represents who you are.</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Connect</h2>
              <p className="text-gray-600">Join our community and connect with like-minded people.</p>
            </div>
          </div>
        </main>
      </div>
    </SupabaseProvider>
  )
}

