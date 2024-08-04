import { Suspense } from "react";
import Chat from "./chat"; // Adjust the path as necessary

export default function Page() {
  return (
    <div>
      <h1>Chat with Medical Research Assistant</h1>
      <Suspense fallback={<>Loading...</>}>
        <Chat />
      </Suspense>
    </div>
  );
}
