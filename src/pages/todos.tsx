import { FormEvent, useEffect, useState } from 'react'

import { GetServerSideProps } from 'next'
import Image from 'next/image'

import SvgTrash from '../../public/images/trash-svgrepo-com.svg'
import { Button } from '../components/Button'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

interface Todo {
  id: string
  text: string
  isCompleted: boolean
}

interface FeedProps {
  todos: Todo[]
}

interface ToggleCheckTodoProps {
  id: string
  value: boolean
}

export default function Todos(props: FeedProps) {
  const { user, logout } = useAuthContext()

  const [newTodo, setNewTodo] = useState('')
  const [todos, setTodos] = useState<Todo[]>(props.todos)

  async function toggleCheckTodo({ id, value }: ToggleCheckTodoProps) {
    await supabase.from('todos').update({ isCompleted: value }).match({ id })
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().match({ id })
  }

  useEffect(() => {
    const listerNewTodos = supabase
      .from('todos')
      .on('INSERT', (response) =>
        setTodos((oldTodos) => [...oldTodos, response.new])
      )
      .subscribe()

    const deletedTodos = supabase
      .from('todos')
      .on('DELETE', ({ old }) =>
        setTodos((oldTodos) => oldTodos.filter((todo) => todo.id !== old.id))
      )
      .subscribe()

    const updatedTodos = supabase
      .from('todos')
      .on('UPDATE', (response) =>
        setTodos((oldTodos) =>
          oldTodos.map((todo) =>
            response.new.id === todo.id
              ? { ...todo, isCompleted: response.new.isCompleted }
              : todo
          )
        )
      )
      .subscribe()

    return () => {
      listerNewTodos.unsubscribe()
      deletedTodos.unsubscribe()
      updatedTodos.unsubscribe()
    }
  }, [])

  async function sendNewTodo(event: FormEvent) {
    event.preventDefault()

    if (!newTodo.trim()) {
      return
    }

    const { error } = await supabase.from('todos').insert({
      user_id: user.id,
      text: newTodo,
    })

    if (error) {
      console.log(error)
      return
    }

    setNewTodo('')
  }

  return (
    <div className="w-full flex justify-center h-full min-h-screen bg-gray-900 bg-opacity-80">
      <div className="mt-8 w-full max-w-2xl bg-white rounded-t-lg pt-8 px-8">
        <h1 className="font-bold text-yellow-300 tracking-widest text-center text-5xl mb-8">
          TO DO
        </h1>

        <form className="flex gap-4" onSubmit={sendNewTodo}>
          <textarea
            value={newTodo}
            className="flex-1 border-2 border-gray-400 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Escreva uma tarefa"
          />

          <div className="flex flex-col gap-4">
            <Button type="submit">Salvar</Button>

            <Button onClick={logout}>Sair</Button>
          </div>
        </form>

        {!!todos && todos.length > 0 ? (
          <ul className="flex-1 mt-8">
            {todos.map(({ id, text, isCompleted }) => (
              <li
                key={id}
                className="flex items-center mb-4 w-full justify-between"
              >
                <div className="flex justify-center items-center">
                  <input
                    checked={isCompleted}
                    onChange={(e) =>
                      toggleCheckTodo({ id, value: e.target.checked })
                    }
                    type="checkbox"
                    className="form-checkbox border-2 mr-2 rounded focus:outline-none focus:ring focus:ring-blue-400 focus:ring-offset-2"
                  />
                  <span className="text-2xl">{text}</span>
                </div>

                <button
                  className="flex justify-center items-center w-10 h-10 color-white transition duration-200 bg-gray-500 hover:opacity-90 rounded-full focus:outline-none focus:ring focus:ring-gray-400 focus:ring-offset-2"
                  onClick={() => deleteTodo(id)}
                >
                  <Image width={28} height={28} src={SvgTrash} alt="deletar" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="w-full flex justify-center mt-4">
            <span className="text-center text-3xl font-semibold">
              Adicione novas tarefas
            </span>
          </div>
        )}
      </div>
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
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })

  return {
    props: {
      todos: response.body,
    },
  }
}
