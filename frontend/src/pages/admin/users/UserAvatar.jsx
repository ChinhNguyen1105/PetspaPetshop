import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useUserStore } from "../../../store/userStore";

const UserAvatar = ({ user, className = "w-11 h-11" }) => {
  const [imageSrc, setImageSrc] = useState("");
  const downloadAvatar = useUserStore((state) => state.downloadAvatar);

  const fileName = user?.avatarUrl || user?.avatar || "";

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    setImageSrc("");

    if (!fileName) {
      return undefined;
    }

    // Backend đã trả URL đầy đủ thì sử dụng trực tiếp.
    if (/^https?:\/\//i.test(fileName)) {
      setImageSrc(fileName);
      return undefined;
    }

    const loadAvatar = async () => {
      try {
        const result = await downloadAvatar(fileName);

        if (cancelled) return;

        // Store trả về Blob khi tải thành công.
        if (!(result instanceof Blob) || result.size === 0) {
          throw new Error(result?.message || "Dữ liệu avatar không hợp lệ.");
        }

        objectUrl = URL.createObjectURL(result);
        setImageSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(
            `Không thể tải avatar của ${user?.name || user?.id}:`,
            error,
          );
          setImageSrc("");
        }
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileName, user?.id, user?.name, downloadAvatar]);

  return (
    <div
      className={`${className} bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center mx-auto shadow-inner`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={user?.name || "User Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageSrc("")}
        />
      ) : (
        <User size={18} className="text-gray-400" />
      )}
    </div>
  );
};

export default UserAvatar;
