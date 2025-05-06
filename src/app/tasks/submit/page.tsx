"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/app/firebase/firebaseConfig";
import AuthWrapper from "@/app/components/AuthWrapper";

export default function SubmitTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      setLoading(false);
      return;
    }

    try {
      let attachmentUrl = "";
      if (attachment) {
        const storageRef = ref(storage, `attachments/${Date.now()}_${attachment.name}`);
        await uploadBytes(storageRef, attachment);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      const taskData = {
        title,
        description,
        attachmentUrl,
        status: "Submitted",
        userId: auth.currentUser?.uid,
        submittedAt: serverTimestamp(),
      };

      const taskRef = await addDoc(collection(db, "tasks"), taskData);
      await updateDoc(taskRef, { taskId: taskRef.id });

      router.push("/customer/dashboard");
    } catch (err) {
      console.error("Error submitting task:", err);
      setError("Failed to submit task. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthWrapper requiredRole="customer">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Submit New Task</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              rows={4}
              required
            />
          </div>
          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
              Attachment
            </label>
            <input
              type="file"
              id="attachment"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Task"}
          </button>
        </form>
      </div>
    </AuthWrapper>
  );
}