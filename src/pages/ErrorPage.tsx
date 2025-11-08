import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error as any)?.message || 'Something went wrong.'

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Oops, an error occurred</h1>
        <p className="text-slate-600 mb-6">{message}</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  )
}


