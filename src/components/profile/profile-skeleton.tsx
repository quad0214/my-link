import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[520px] px-6 pb-12 pt-10" aria-label="프로필 불러오는 중">
      <div className="flex flex-col items-center">
        <Skeleton className="size-24 rounded-[26px]" />
        <Skeleton className="mt-5 h-7 w-32 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-24 rounded-lg" />
        <Skeleton className="mt-5 h-4 w-72 max-w-full rounded-lg" />
        <Skeleton className="mt-2 h-4 w-56 max-w-full rounded-lg" />
      </div>
      <div className="mt-10 space-y-3">
        <Skeleton className="h-4 w-20 rounded-lg" />
        <Skeleton className="h-[76px] w-full rounded-[20px]" />
        <Skeleton className="h-[76px] w-full rounded-[20px]" />
        <Skeleton className="mt-8 h-4 w-20 rounded-lg" />
        <Skeleton className="h-[76px] w-full rounded-[20px]" />
      </div>
    </main>
  );
}
