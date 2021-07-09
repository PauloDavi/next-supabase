import { GetServerSideProps } from 'next'
import Image from 'next/image'

import GithubLogo from '../../public/images/github-logo.png'
import { Button } from '../components/Button'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function Home() {
  const { login } = useAuthContext()

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 bg-opacity-80">
      <div className="flex flex-col p-8 bg-white rounded-lg">
        <h1 className="text-center text-4xl font-bold text-gray-800">
          Supabase To Do
        </h1>

        <Button className="mt-8" onClick={login}>
          <Image src={GithubLogo} width={24} height={24} alt="Github Logo" />
          Login com Github
        </Button>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await supabase.auth.api.getUserByCookie(ctx.req)

  if (!user) {
    return { props: {} }
  }

  return {
    redirect: {
      destination: '/todos',
      permanent: true,
    },
  }
}
