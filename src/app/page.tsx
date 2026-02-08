export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-4">営業日報システム</h1>
        <p className="text-lg text-gray-600">
          営業担当者が日々の顧客訪問活動を記録し、上長がフィードバックを行うための業務システムです。
        </p>
      </div>
    </main>
  );
}
