
import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'

// Existing table component
function Table({ data }) {
  const headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))

  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

// Links
function CustomLink(props) {
  const href = props.href || ''

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return (
    <a target="_blank" rel="noopener noreferrer" {...props} />
  )
}

// Explicit Next.js Image component
function RoundedImage(props) {
  return (
    <Image
      alt={props.alt || ''}
      className="rounded-xl"
      {...props}
    />
  )
}

// Standard Markdown images
function MarkdownImage({ alt = '', ...props }) {
  return (
    <img
      alt={alt}
      className="my-8 w-full rounded-xl"
      loading="lazy"
      {...props}
    />
  )
}

// Image with caption
function Figure({
  src,
  alt = '',
  caption,
  href,
  className = '',
}) {
  const image = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full rounded-xl"
    />
  )

  return (
    <figure className={`my-12 ${className}`}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {image}
        </a>
      ) : (
        image
      )}

      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-neutral-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Grid for related images
function ImageGrid({
  children,
  columns = 2,
  className = '',
}) {
  return (
    <div
      className={`my-10 grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

// Highlighted notes / milestones
function Callout({
  title,
  children,
  type = 'note',
}) {
  const styles = {
    note: 'border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900',
    warning: 'border-amber-400/60 bg-amber-50 dark:bg-amber-950/20',
    success: 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20',
  }

  return (
    <aside
      className={`my-10 rounded-xl border-l-4 p-5 ${styles[type] || styles.note}`}
    >
      {title && (
        <p className="mb-2 font-semibold">{title}</p>
      )}
      <div className="text-sm leading-relaxed">
        {children}
      </div>
    </aside>
  )
}

// Responsive Shadertoy embed
function ShaderEmbed({
  src = 'https://www.shadertoy.com/view/NXyGWd?gui=true&t=10&paused=true&muted=false',
  title = 'PENDENT fluid simulation prototype',
}) {
  return (
    <div className="my-12 w-full">
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
        <iframe
          width="640"
          height="360"
          frameBorder="0"
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      </div>

      <p className="mt-3 text-center text-sm text-neutral-500">
        <a
          href="https://www.shadertoy.com/view/NXyGWd"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Open on Shadertoy
        </a>
      </p>
    </div>
  )
}


// Syntax highlighting
function Code({ children, ...props }) {
  const codeHTML = highlight(String(children))

  return (
    <code
      {...props}
      dangerouslySetInnerHTML={{ __html: codeHTML }}
    />
  )
}

// Heading IDs
function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

function createHeading(level) {
  const Heading = ({ children }) => {
    const text = React.Children.toArray(children).join('')
    const slug = slugify(text)

    return React.createElement(
      `h${level}`,
      { id: slug },
      React.createElement('a', {
        href: `#${slug}`,
        className: 'anchor',
        'aria-hidden': true,
      }),
      children
    )
  }

  Heading.displayName = `Heading${level}`
  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  Image: RoundedImage,
  img: MarkdownImage,
  a: CustomLink,
  code: Code,
  Table,
  Figure,
  ImageGrid,
  Callout,
  ShaderEmbed,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{
        ...components,
        ...(props.components || {}),
      }}
    />
  )
}
