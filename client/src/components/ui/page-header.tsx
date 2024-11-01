interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-xl font-semibold lg:hidden">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground lg:hidden">{description}</p>}
    </>
  );
}
