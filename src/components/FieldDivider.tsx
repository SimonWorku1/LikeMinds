import { PropsWithChildren } from 'react'

export default function FieldDivider({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="border-t border-brand-100 mb-6" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  )
}


