import Link from "next/link"

interface ChapterCardProps {
  chapter: number
  title: string
  imageUrl?: string
  href?: string
}

export function ChapterCard({ chapter, title, imageUrl, href }: ChapterCardProps) {
  const Card = (
    <div className="space-y-4">
      <h3 className="font-medium">Chapter {chapter}</h3>
      <div className="bg-white rounded-lg border p-6 aspect-square flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-32 h-32 object-contain" />
        ) : (
          <div className="w-32 h-32 bg-gray-100 rounded" />
        )}
      </div>
      <h4 className="font-medium text-center">{title}</h4>
    </div>
  )

  if (href) {
    return <Link href={href}>{Card}</Link>
  }

  return Card
}

