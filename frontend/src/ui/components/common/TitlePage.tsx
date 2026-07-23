interface TitlePageProps {
  title: string
  subtitle?: string
}

export default function Title ({ title, subtitle }: TitlePageProps) {
  return (
    <div className="font-hanken mb-6 sm:mb-8 select-none">
      {/* Título principal en mayúsculas y color azul oscuro institucional */}
      <h1 className="text-2xl sm:text-3xl font-bold text-titlePage tracking-wide">
        {title}
      </h1>

      {/* Subtítulo condicional en gris suave */}
      {subtitle && (
        <p className="text-sm sm:text-base text-subtitlePage mt-1.5 sm:mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  )
}
