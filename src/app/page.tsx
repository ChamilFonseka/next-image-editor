import { Editor } from "@/components/Editor";

export default function Home() {
  return (
    <main className="
      min-h-dvh
      max-w-screen-lg mx-auto
      flex flex-col items-center justify-center 
      bg-white
      p-4
      ">
      <Editor />
    </main>
  );
}
