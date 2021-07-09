import { FormEvent, useEffect, useState } from 'react'

import { GetServerSideProps } from 'next'

import { supabase } from '../services/supabase'

interface Post {
  id: string
  content: string
}

interface FeedProps {
  posts: Post[]
}

export default function Feed(props: FeedProps) {
  const [newPost, setNewPost] = useState('')
  const [posts, setPosts] = useState<Post[]>(props.posts)

  useEffect(() => {
    const listerNewPosts = supabase
      .from('posts')
      .on('INSERT', (response) =>
        setPosts((oldPosts) => [...oldPosts, response.new])
      )
      .subscribe()

    return () => {
      listerNewPosts.unsubscribe
    }
  }, [])

  async function sendNewPost(event: FormEvent) {
    event.preventDefault()

    if (!newPost.trim()) {
      return
    }

    const { error } = await supabase.from('posts').insert({
      content: newPost,
    })

    if (error) {
      console.log(error)
      return
    }

    setNewPost('')
  }

  return (
    <div>
      <form onSubmit={sendNewPost}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a post"
        />
        <button type="submit">Send</button>
      </form>

      {!!posts && posts.length > 0 && (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.content}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { user } = await supabase.auth.api.getUserByCookie(ctx.req)

  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const response = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: true })

  return {
    props: {
      posts: response.body,
    },
  }
}
