This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## React Query

#### Docs
https://react-query-v3.tanstack.com/overview
The docs are brilliant.

#### Concepts
- Queries
- Mutations
- Query Invalidation


#### Keys
- React Query uses the keys you prodvide it to enable caching. These should be unique across your application.
- Query keys can be as simple as a string, or as complex as an array of many strings and nested objects.
- Query keys are conveniently passed into the Query function

#### Query Functions
You need to provide a query function that gets the data for React Query. The function must return a Promise that either resolves or throws an error.

#### Parallel Queries
Just use any number of React Query's useQuery and useInfiniteQuery hooks side-by-side and those queries will be executed in parallel.
```typescript
 function App () {
   // The following queries will execute in parallel
   const usersQuery = useQuery('users', fetchUsers)
   const teamsQuery = useQuery('teams', fetchTeams)
   const projectsQuery = useQuery('projects', fetchProjects)
   ...
 }
```
Dynamic parallel queries example (must be nested as to not violate rules of hooks):
```typescript
 function App({ users }) {
   const userQueries = useQueries(
     users.map(user => {
       return {
         queryKey: ['user', user.id],
         queryFn: () => fetchUserById(user.id),
       }
     })
   )
 }
```

#### Dependent Queries
Pass the enabled option to tell a query when it can run:
```typescript
 // Get the user
 const { data: user } = useQuery(['user', email], getUserByEmail)

 const userId = user?.id

 // Then get the user's projects
 const { isIdle, data: projects } = useQuery(
   ['projects', userId],
   getProjectsByUser,
   {
     // The query will not execute until the userId exists
     enabled: !!userId,
   }
 )

 // isIdle will be `true` until `enabled` is true and the query begins to fetch.
 // It will then go to the `isLoading` stage and hopefully the `isSuccess` stage :)
```

#### Window focus refetching
https://react-query-v3.tanstack.com/guides/window-focus-refetching
If a user leaves the application and returns React Query automatically refetches fresh data for you in the background. Note you can disable this if you need, e.g. for iframe focus events.

#### Disabling/Pausing Queries
```typescript
 function Todos() {
   const {
     isIdle,
     isLoading,
     isError,
     data,
     error,
     refetch,
     isFetching,
   } = useQuery('todos', fetchTodoList, {
     enabled: false,
   })
```

#### Retries
https://react-query-v3.tanstack.com/guides/query-retries
When useQuery fails React Query will automatically retry for you up to 3 times by default. You can change the number of retries if you need.
```typescript
 import { useQuery } from 'react-query'

 // Make a specific query retry a certain number of times
 const result = useQuery(['todos', 1], fetchTodoListPage, {
   retry: 10, // Will retry failed requests 10 times before displaying an error
 })
```
You can also adda delay if needed. See docs link above for more info.


#### Paginated/Lagged Queries
Simple example with UI issues:
```typescript
const result = useQuery(['projects', page], fetchProjects)
```
More complex example:
```typescript
 function Todos() {
   const [page, setPage] = React.useState(0)

   const fetchProjects = (page = 0) => fetch('/api/projects?page=' + page).then((res) => res.json())

   const {
     isLoading,
     isError,
     error,
     data,
     isFetching,
     isPreviousData,
   } = useQuery(['projects', page], () => fetchProjects(page), { keepPreviousData : true })

   return (
     <div>
       {isLoading ? (
         <div>Loading...</div>
       ) : isError ? (
         <div>Error: {error.message}</div>
       ) : (
         <div>
           {data.projects.map(project => (
             <p key={project.id}>{project.name}</p>
           ))}
         </div>
       )}
       <span>Current Page: {page + 1}</span>
       <button
         onClick={() => setPage(old => Math.max(old - 1, 0))}
         disabled={page === 0}
       >
         Previous Page
       </button>{' '}
       <button
         onClick={() => {
           if (!isPreviousData && data.hasMore) {
             setPage(old => old + 1)
           }
         }}
         // Disable the Next Page button until we know a next page is available
         disabled={isPreviousData || !data?.hasMore}
       >
         Next Page
       </button>
       {isFetching ? <span> Loading...</span> : null}{' '}
     </div>
   )
 }
```

#### Infinite Queries
https://react-query-v3.tanstack.com/guides/infinite-queries
`useInfiniteQuery` is for querying when you want to add more data like infinite scrolling.

#### Placeholder data
https://react-query-v3.tanstack.com/guides/placeholder-query-data
You can add placeholder data that doesn't persist in the cache. It allows the component to act like it already has data while it fetches. Might be useful if you have optimistically stored something in GSM and want to act like the request was successful already.

> Note: `initialData` is persisted to the cache so is not recommended to act as `placeholderData`

#### Prefetching
https://react-query-v3.tanstack.com/guides/prefetching
```typescript
const prefetchTodos = async () => {
  // The results of this query will be cached like a normal query
  await queryClient.prefetchQuery('todos', fetchTodos)
}
```

#### Mutations
Mutations with `useMutation` are used to create/update/delete data or perform server-side side-effects.
```typescript
function App() {
  const mutation = useMutation(newTodo => {
    return axios.post('/todos', newTodo)
  })

  return (
    <div>
      {mutation.isLoading ? (
        'Adding todo...'
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: 'Do Laundry' })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

Side effects examples:
```typescript
useMutation(addTodo, {
  onMutate: variables => {
    // A mutation is about to happen!

    // Optionally return a context containing data to use when for example rolling back
    return { id: 1 }
  },
  onError: (error, variables, context) => {
    // An error happened!
    console.log(`rolling back optimistic update with id ${context.id}`)
  },
  onSuccess: (data, variables, context) => {
    // Boom baby!
  },
  onSettled: (data, error, variables, context) => {
    // Error or success... doesn't matter!
  },
})
```
Async: when returning a promise in any of the callback functions it will first be awaited before the next callback is called:
```typescript
useMutation(addTodo, {
  onSuccess: async () => {
    console.log("I'm first!")
  },
  onSettled: async () => {
    console.log("I'm second!")
  },
})
```

#### Query invalidation
https://react-query-v3.tanstack.com/guides/query-invalidation
If you know a query's data is going to be stale you can manually invalidate the query:
```typescript
// Invalidate every query in the cache
queryClient.invalidateQueries()
// Invalidate every query with a key that starts with `todos`
queryClient.invalidateQueries('todos')
```

#### Invalidations from mutations
https://react-query-v3.tanstack.com/guides/invalidations-from-mutations
When a successful postTodo mutation happens, we likely want all todos queries to get invalidated and possibly refetched to show the new todo item. To do this, you can use useMutation's onSuccess options and the client's invalidateQueries function:
```typescript
import { useMutation, useQueryClient } from 'react-query'

const queryClient = useQueryClient()

// When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
const mutation = useMutation(addTodo, {
  onSuccess: () => {
    queryClient.invalidateQueries('todos')
    queryClient.invalidateQueries('reminders')
  },
})
```

#### Updates from Mutation responses
https://react-query-v3.tanstack.com/guides/updates-from-mutation-responses
```typescript
const queryClient = useQueryClient()

const mutation = useMutation(editTodo, {
  onSuccess: data => {
    queryClient.setQueryData(['todo', { id: 5 }], data)
  }
})

mutation.mutate({
  id: 5,
  name: 'Do the laundry',
})

// The query below will be updated with the response from the
// successful mutation
const { status, data, error } = useQuery(['todo', { id: 5 }], fetchTodoById)
```
Custom hook that handles this for us:
```typescript
const useMutateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation(editTodo, {
    // Notice the second argument is the variables object that the `mutate` function receives
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['todo', { id: variables.id }], data)
    },
  })
}
```

#### Optimistic updates
https://react-query-v3.tanstack.com/guides/optimistic-updates
It is best to pass a rollback function using onError and onSettled e.g
```typescript
const queryClient = useQueryClient()

useMutation(updateTodo, {
  // When mutate is called:
  onMutate: async newTodo => {
    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries('todos')

    // Snapshot the previous value
    const previousTodos = queryClient.getQueryData('todos')

    // Optimistically update to the new value
    queryClient.setQueryData('todos', old => [...old, newTodo])

    // Return a context object with the snapshotted value
    return { previousTodos }
  },
  // If the mutation fails, use the context returned from onMutate to roll back
  onError: (err, newTodo, context) => {
    queryClient.setQueryData('todos', context.previousTodos)
  },
  // Always refetch after error or success:
  onSettled: () => {
    queryClient.invalidateQueries('todos')
  },
})
```

#### Query cancellation
React Query provides each query function with an `AbortSignal` instance, if it's available in your runtime environment.
Example with Axios:
```typescript
import axios from 'axios'

const query = useQuery('todos', ({ signal }) =>
  axios.get('/todos', {
    // Pass the signal to `axios`
    signal,
  })
)
```
Example using graphql-request:
```typescript
const client = new GraphQLClient(endpoint)

const query = useQuery('todos', ({ signal }) => {
  client.request({ document: query, signal })
})
```
You can also cancel queries manually using `queryClient.cancelQueries(queryKey)`.

#### Scroll Restoration
https://react-query-v3.tanstack.com/guides/scroll-restoration
Scroll Restoration is supported. Default query cache time is 5 minutes so as long as your query is in the cache scroll restoration should work.

#### Filters
https://react-query-v3.tanstack.com/guides/filters
Some methods within React Query accept a `QueryFilters` or `MutationFilters` object.
E.g.
```typescript
// Cancel all queries
await queryClient.cancelQueries()

// Remove all inactive queries that begin with `posts` in the key
queryClient.removeQueries('posts', { inactive: true })

// Refetch all active queries
await queryClient.refetchQueries({ active: true })

// Refetch all active queries that begin with `posts` in the key
await queryClient.refetchQueries('posts', { active: true })
```

#### SSR & NextJS
https://react-query-v3.tanstack.com/guides/ssr
React Query supports 2 methods of prefetching data:
1. Prefetch the data yourself and pass it in as initialData
2. Prefetch the query on the server, dehydrate the cache and rehydrate it on the client
```typescript
export async function getStaticProps() {
  const posts = await getPosts()
  return { props: { posts } }
}

function Posts(props) {
  const { data } = useQuery('posts', getPosts, { initialData: props.posts })

  // ...
}
```
> Not too sure how setting `initialData` helps here as we already pass beers into the component? Maybe caching?
```typescript
// pages/posts.jsx
import { dehydrate, QueryClient, useQuery } from 'react-query';

export async function getStaticProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery('posts', getPosts)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Posts() {
  // This useQuery could just as well happen in some deeper child to
  // the "Posts"-page, data will be available immediately either way
  const { data } = useQuery('posts', getPosts)

  // This query was not prefetched on the server and will not start
  // fetching until on the client, both patterns are fine to mix
  const { data: otherData } = useQuery('posts-2', getPosts)

  // ...
}
```

#### Caching
https://react-query-v3.tanstack.com/guides/caching
- Query Instances with and without cache data
- Background Refetching
- Inactive Queries
- Garbage Collection

Default `cacheTime` of `5mins` and default `staleTime` of `0`

#### Default Query Function
https://react-query-v3.tanstack.com/guides/default-query-function
If you find yourself wishing for whatever reason that you could just share the same query function for your entire app and just use query keys to identify what it should fetch, you can do that by providing a default query function to React Query.

#### Suspense
https://react-query-v3.tanstack.com/guides/suspense
> NOTE: Suspense mode for React Query is experimental, same as Suspense for data fetching itself. These APIs WILL change and should not be used in production unless you lock both your React and React Query versions to patch-level versions that are compatible with each other.
```typescript
// Configure for all queries
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
```
```typescript
import { useQuery } from 'react-query'

// Enable for an individual query
useQuery(queryKey, queryFn, { suspense: true })
```

#### Testing
https://react-query-v3.tanstack.com/guides/testing
```shell
yarn add --dev @testing-library/react-hooks react-test-renderer
```
