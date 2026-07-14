import { useEffect, useState } from "react";
import { Upload, Save } from "lucide-react";
import { heroAPI, uploadAPI, getImageUrl } from "../services/api";


export default function HeroBannerPage() {

  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);


  // Load existing hero
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await heroAPI.get();
        const data = res.data;

        if (data) {
          setImage(data.image || "");
          setBadgeText(data.badgeText || "");
          setTitle(data.title || "");

          if (data.image) {
            setPreview(getImageUrl(data.image));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchHero();
  }, []);
  // Image upload
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // local preview
    // Local preview
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadAPI.hero(formData);

      // Server image path save
      setImage(res.data.url);

      // Server image preview
      setPreview(getImageUrl(res.data.url));

    } catch (error) {
      console.log(error);
      alert(
        "Image upload failed"
      );
    }
  };

  // Save Hero

  const handleSave = async () => {

    //Validations
    if (!badgeText.trim()) {
      alert("Please enter badge text.");
      return;
    }
    if (!title.trim()) {
      alert("Please enter title.");
      return;
    }
    if (!image) {
      alert("Please upload a banner image.");
      return;
    }

    try {
      setLoading(true);
      await heroAPI.update({
        image,
        badgeText,
        title
      });
      const res = await heroAPI.get();
      const data = res.data;
      setImage(data.image || "");
      setBadgeText(data.badgeText || "");
      setTitle(data.title || "");

      if (data.image) {
        setPreview(getImageUrl(data.image));
      }

      alert("Hero Banner saved successfully");
    } catch (error) {
      console.log(error);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };
  return (

    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            Header Banner
          </h1>
          <p className="text-gray-500 mt-1">
            Manage homepage header section
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="
          flex items-center gap-2
          bg-yellow-600
          text-white
          px-6 py-3
          rounded-xl
          ">
          <Save size={18} />
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Form */}
        <div className="
          bg-white
          rounded-2xl
          shadow
          p-6
        ">
          <label className="font-medium">
            Badge Text
          </label>
          <input
            value={badgeText}
            onChange={
              e => setBadgeText(e.target.value)
            }
            placeholder="DIWALI GLOW SALE"
            className="
            w-full
            border
            rounded-xl
            px-4 py-3
            mt-2 mb-5
            "/>
          <label className="font-medium">
            Title
          </label>

          <input
            value={title}
            onChange={
              e => setTitle(e.target.value)
            }
            placeholder="Up to 50% OFF"
            className="
            w-full
            border
            rounded-xl
            px-4 py-3
            mt-2 mb-5
            "/>

          <label className="font-medium block mb-2">Banner Image</label>

          <label className=" border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer">

            <Upload size={30} />
            <span className="mt-2">
              Upload Image
            </span>
            <input
              type="file"

              accept="image/*"

              onChange={handleUpload}

              className="hidden"

            />
          </label>
        </div>


        {/* Preview */}
        <div className="
        bg-gray-50
        rounded-2xl
        p-6
        ">
          <h2 className="
          font-semibold
          mb-4
          ">
            Preview
          </h2>
          {preview ? (
            <div className="
            relative
            rounded-3xl
            overflow-hidden
            ">


              <img

                src={preview}

                className="
                w-full
                h-[400px]
                object-cover
                 "
              />

              <div className="
              absolute
              bottom-5
              left-5
              bg-white/90
              rounded-xl
              px-5 py-3
              ">
                <div className="
                text-xs
                text-roop-rose
                font-semibold
                ">
                  {badgeText}
                </div>
                <div className="
                text-xl
                font-semibold
                ">
                  {title}
                </div>
              </div>
            </div>
          ) : (
            <div className="
            h-[400px]
            flex
            items-center
            justify-center
            text-gray-400
            ">
              No Image
            </div>
          )}
        </div>
      </div>
    </div>

  )

}