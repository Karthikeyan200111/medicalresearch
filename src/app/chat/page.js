"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Function to get chat completion from Groq
const getGroqChatCompletion = async (messages) => {
  try {
    const response = await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error getting chat completion:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

const splitTextAfterPeriods = (text, maxLength = 500) => {
  const sentences = text.split(/(?<=\.)\s+/); // Split by periods followed by a space
  const paragraphs = [];
  let currentParagraph = "";

  sentences.forEach((sentence) => {
    if ((currentParagraph + sentence).length <= maxLength) {
      currentParagraph += (currentParagraph ? " " : "") + sentence;
    } else {
      if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = sentence;
    }
  });

  if (currentParagraph) {
    paragraphs.push(currentParagraph.trim());
  }

  return paragraphs;
};

function ChatFallback() {
  return <>Loading chat...</>;
}

const ChatComponent = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get("messagefromquery");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search) {
      const decodedSearch = decodeURIComponent(search);
      setMessages([{ role: "user", content: decodedSearch }]);
      sendMessage(decodedSearch);
    }
  }, [search]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(input);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    const newMessage = { role: "user", content: messageContent };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Prepare messages for Groq API
      const groqMessages = [
        {
          role: "system",
          content:
            "You are a helpful Medical Research Assistant. You should answer questions only related to medical research. You should not answer programming questions.",
        },
        ...[...messages, newMessage].map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.content,
        })),
      ];

      const botResponse = await getGroqChatCompletion(groqMessages);
      const botMessage = { role: "assistant", content: botResponse };
      setMessages((prevMessages) => [...prevMessages, newMessage, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => {
          const paragraphs = splitTextAfterPeriods(message.content);
          return (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              <span className="font-bold">
                {message.role === "user"
                  ? "User:"
                  : "Medical Research Assistant:"}
              </span>
              {paragraphs.map((para, i) => (
                <p key={i} className="mt-2">
                  {para}
                </p>
              ))}
            </div>
          );
        })}
        {loading && (
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="48"
              height="48"
              viewBox="0 0 48 48"
            >
              <linearGradient
                id="w17wr4HO9wItDezz_rq6ha_ka3InxFU3QZa_gr1"
                x1="3.842"
                x2="46.225"
                y1="4.692"
                y2="45.288"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#32de9f"></stop>
                <stop offset="1" stopColor="#0ea982"></stop>
              </linearGradient>
              <path
                fill="url(#w17wr4HO9wItDezz_rq6ha_ka3InxFU3QZa_gr1)"
                d="M40,6H8C6.895,6,6,6.895,6,8v32c0,1.105,0.895,2,2,2h32c1.105,0,2-0.895,2-2V8	C42,6.895,41.105,6,40,6z"
              ></path>
              <path
                d="M37.599,24.232c-0.314-1.173-0.922-2.245-1.765-3.12c0.647-1.78,0.48-3.782-0.466-5.422	c-0.961-1.664-2.512-2.854-4.368-3.352c-0.606-0.162-1.229-0.244-1.852-0.244c-0.584,0-1.167,0.072-1.736,0.214	C26.193,10.857,24.377,10,22.487,10c-3.222,0-6.012,2.116-6.901,5.188c-1.893,0.331-3.504,1.455-4.467,3.122	c-0.961,1.663-1.216,3.602-0.719,5.458c0.315,1.176,0.923,2.248,1.767,3.122c-0.647,1.78-0.481,3.782,0.464,5.419	c0.961,1.664,2.512,2.854,4.368,3.352c0.614,0.164,1.244,0.248,1.872,0.248c0.563,0,1.139-0.074,1.715-0.219	c1.228,1.473,3.005,2.31,4.926,2.31c3.227,0,6.019-2.121,6.905-5.198c1.889-0.328,3.503-1.448,4.463-3.112	C37.842,28.026,38.097,26.088,37.599,24.232z M28.849,23.785l1.571,0.884v6.138c0,2.706-2.202,4.908-4.908,4.908	c-0.99,0-1.938-0.354-2.683-0.986l5.524-3.189c0.357-0.207,0.576-0.591,0.571-1.002L28.849,23.785z M15.876,24.996l5.886,3.311	l-1.552,0.919l-5.315-3.069c-1.135-0.655-1.948-1.713-2.287-2.98c-0.339-1.266-0.165-2.589,0.491-3.724	c0.082-0.142,0.179-0.276,0.268-0.414v6.074C14.367,24.451,15.118,24.805,15.876,24.996z M15.41,20.508	c0.343-0.2,0.739-0.201,1.083-0.001l7.259,4.083l-1.573,0.93l-7.284-4.098C14.769,21.132,15.003,20.735,15.41,20.508z	M15.736,15.239c0.662-0.001,1.296,0.184,1.852,0.527l7.206,4.053l-1.573,0.93l-7.291-4.102c-0.979-0.551-1.335-1.783-0.784-2.762	C15.402,15.544,15.568,15.372,15.736,15.239z M28.464,14.526c1.237-0.332,2.564-0.164,3.723,0.491s1.948,1.712,2.287,2.977	c0.338,1.264,0.164,2.586-0.491,3.724c-0.083,0.142-0.179,0.276-0.268,0.414v-6.074c0-0.555-0.301-1.065-0.785-1.336	c-0.48-0.271-1.069-0.269-1.547,0.003l-5.886,3.311l-1.552-0.919L28.464,14.526z M33.247,28.74c-0.083,0.142-0.179,0.276-0.268,0.414	v-6.077c0-0.551-0.301-1.061-0.784-1.334c-0.48-0.27-1.071-0.269-1.547,0.003l-7.259,4.083l1.573,0.93l7.284-4.099	c0.655,1.137,0.828,2.46,0.49,3.724C33.736,27.029,33.473,27.907,33.247,28.74z"
                fill="#ffffff"
              ></path>
            </svg>
          </div>
        )}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border border-gray-300 p-2 rounded-lg"
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const Chat = () => {
  return (
    <Suspense fallback={<ChatFallback />}>
      <ChatComponent />
    </Suspense>
  );
};

export default Chat;
