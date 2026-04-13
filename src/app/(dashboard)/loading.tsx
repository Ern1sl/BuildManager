export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-32 h-10 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[280px]">
        <div className="col-span-6 bg-white/5 rounded-[2.5rem] animate-pulse" />
        <div className="col-span-6 bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-9 bg-white/5 rounded-[2.5rem] animate-pulse" />
        <div className="col-span-3 bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>
      
      <div className="bg-white/5 rounded-[2.5rem] h-64 animate-pulse" />
    </div>
  );
}
