import { useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

interface Doc {
  id: number;
  file: File;
}

const StudentDocuments = () => {
  const [docs, setDocs] = useState<Doc[]>([]);

  const uploadFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files) return;

    const uploaded = Array.from(files).map(
      (file) => ({
        id: Date.now() + Math.random(),
        file,
      })
    );

    setDocs((prev) => [...prev, ...uploaded]);
  };

  const deleteDoc = (id: number) => {
    setDocs((prev) =>
      prev.filter((d) => d.id !== id)
    );
  };

  const previewDoc = (file: File) => {
    window.open(
      URL.createObjectURL(file),
      "_blank"
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Documents
          </h2>

          <p className="text-gray-500">
            Upload and manage files
          </p>
        </div>

        <label
          htmlFor="upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Upload size={18} />
          Upload
        </label>

        <input
          id="upload"
          type="file"
          multiple
          hidden
          onChange={uploadFile}
        />
      </div>

      {docs.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-10 text-center text-gray-500">
          No documents uploaded
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <FileText className="text-blue-600" />

                <div>
                  <p className="font-medium">
                    {doc.file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(doc.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    previewDoc(doc.file)
                  }
                  className="p-2 border rounded-lg"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() =>
                    deleteDoc(doc.id)
                  }
                  className="p-2 border rounded-lg text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;