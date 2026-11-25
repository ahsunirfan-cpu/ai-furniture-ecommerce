import { RoomUpload } from "@/components/room-upload";

export default function RoomPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">AI room match</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Recommendations are tied to our live catalogue. Distances and fit inferred from your photo
          are estimates only.
        </p>
      </div>
      <RoomUpload />
    </div>
  );
}