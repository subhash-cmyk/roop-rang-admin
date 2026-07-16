import { useEffect, useState } from "react";
import {
  CKEditor
} from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  Link,
  List,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import toast from "react-hot-toast";
import { aboutAPI } from "../services/api";

type AboutForm = {
  id?: number;
  title: string;
  tagline: string;
  story: string;
  mission: string;
  vision: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
};

export default function AboutPage() {
  const [form, setForm] = useState<AboutForm>({
    title: "",
    tagline: "",
    story: "",
    mission: "",
    vision: "",
    address: "",
    phone: "",
    email: "",
    whatsapp: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAbout = async () => {
    try {
      setLoading(true);

      const res = await aboutAPI.get();
      const data = res?.data;

      if (data) {
        setForm({
          id: data.id,
          title: data.title || "",
          tagline: data.tagline || "",
          story: data.story || "",
          mission: data.mission || "",
          vision: data.vision || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          whatsapp: data.whatsapp || "",
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch About page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleChange = (key: keyof AboutForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await aboutAPI.save(form as any);

      toast.success("About page updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save About page");
    } finally {
      setSaving(false);
    }
  };

  const editorConfig = {
    licenseKey: "GPL",
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Heading,
      Link,
      List,
    ],
    toolbar: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
    ],
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">About Us</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage About Us page content
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div>
          <label className="mb-1 block text-sm font-medium">
            About Title
          </label>

          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Tagline
          </label>

          <input
            value={form.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Our Story
          </label>

          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={form.story}
            onChange={(_, editor) =>
              handleChange("story", editor.getData())
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Mission
          </label>

          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={form.mission}
            onChange={(_, editor) =>
              handleChange("mission", editor.getData())
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Vision
          </label>

          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={form.vision}
            onChange={(_, editor) =>
              handleChange("vision", editor.getData())
            }
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Store Address
            </label>

            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div className="space-y-4">

            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone
              </label>

              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email
              </label>

              <input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                WhatsApp
              </label>

              <input
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save About Us"}
          </button>
        </div>

      </div>
    </div>
  );
}