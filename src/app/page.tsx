export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-12 text-zinc-800 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-100">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/60 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800 text-center">
        {/* 프로필 아바타 */}
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white shadow-inner">
          백
        </div>

        {/* 이름 */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          백종천
        </h1>

        {/* 뱃지 태그 */}
        <span className="mt-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          Software Engineer
        </span>

        {/* 소개글 */}
        <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          사용자 중심의 가치를 코드로 구현하는 개발자입니다.
          <br />
          새로운 기술을 탐구하고 문제를 해결하는 과정을 즐깁니다.
        </p>
      </div>
    </main>
  );
}
