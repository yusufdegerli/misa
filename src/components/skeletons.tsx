/** Quiet placeholders shown for the instant before a page's content streams in. */

export function GridPageSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-[1280px] animate-pulse px-5 pt-12 pb-28 md:px-10 md:pt-20">
      <div className="mb-16 border-b border-hairline pb-10">
        <div className="h-24 w-2/3 max-w-xl bg-hairline md:h-32" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="tile aspect-[4/5]" />
            <div className="h-6 w-1/2 bg-hairline" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-[1280px] animate-pulse px-5 pt-6 pb-28 md:px-10 md:pt-8">
      <div className="mb-10 h-4 w-48 bg-hairline" />
      <div className="flex flex-wrap items-start gap-12 lg:gap-18">
        <div className="tile aspect-[4/5] w-full max-w-[640px] min-w-0 flex-[1_1_520px]" />
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5 lg:pt-3">
          <div className="h-3 w-32 bg-hairline" />
          <div className="h-20 w-3/4 bg-hairline" />
          <div className="h-40 w-full bg-hairline/60" />
          <div className="h-14 w-full rounded-full bg-hairline" />
        </div>
      </div>
    </div>
  );
}
